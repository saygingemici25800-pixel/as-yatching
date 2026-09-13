import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import {
  ACCEPTED_MIME,
  BOARD_LIMIT,
  LOGBOOK_ADMIN_SECRET,
  LOGBOOK_BUCKET,
  MAX_IMAGE_EDGE,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_UPLOAD_BYTES,
  RATE_LIMIT_PER_DAY,
  SIGNED_URL_TTL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  TOKEN_TTL_MS,
  isLogbookConfigured,
} from "./logbook-config";
import type { LogbookEntry, LogbookStatus } from "./types";

/**
 * SEYİR DEFTERİ — SUNUCU KATMANI
 * ------------------------------------------------------------------
 * Supabase'e yalnızca burada dokunulur. Sayfalar ve bileşenler bu dosyayı
 * DEĞİL, `lib/repository.ts`'i çağırır (CLAUDE.md kural 4 ile aynı mantık:
 * veri erişimi tek kapıdan).
 *
 * Service role anahtarı kullanılıyor — bu dosya `server-only`; istemciye
 * sızarsa derleme hatası verir.
 *
 * Supabase yapılandırılmamışsa her fonksiyon güvenli bir boş değer döner;
 * site kırılmaz (demo kurulumunda Supabase henüz açılmamış olabilir).
 */

let cached: SupabaseClient | null = null;

function client(): SupabaseClient | null {
  if (!isLogbookConfigured()) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

interface EntryRow {
  id: string;
  created_at: string;
  photo_path: string;
  note: string;
  name: string;
  trip_date: string;
  status: LogbookStatus;
}

/* ------------------------------------------------------------------ */
/* Okuma                                                               */
/* ------------------------------------------------------------------ */

/**
 * Panoda gösterilecek onaylı kayıtlar (en yeni önce).
 * Fotoğraflar imzalı URL ile sunulur (7 gün); Storage yolu dışarı çıkmaz.
 */
export async function fetchApprovedEntries(
  limit = BOARD_LIMIT,
): Promise<LogbookEntry[]> {
  const db = client();
  if (!db) return [];

  const { data, error } = await db
    .from("logbook_entries")
    .select("id, created_at, photo_path, note, name, trip_date, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const rows = data as EntryRow[];
  if (rows.length === 0) return [];

  const { data: signed } = await db.storage
    .from(LOGBOOK_BUCKET)
    .createSignedUrls(
      rows.map((r) => r.photo_path),
      SIGNED_URL_TTL,
    );

  const urlByPath = new Map<string, string>();
  for (const item of signed ?? []) {
    if (item.signedUrl && item.path) urlByPath.set(item.path, item.signedUrl);
  }

  return rows
    .map((row) => {
      const photoUrl = urlByPath.get(row.photo_path);
      if (!photoUrl) return null; // dosya silinmişse kart hiç basılmaz
      return {
        id: row.id,
        photoUrl,
        note: row.note,
        name: row.name,
        tripDate: row.trip_date,
        createdAt: row.created_at,
      } satisfies LogbookEntry;
    })
    .filter((e): e is LogbookEntry => e !== null);
}

/* ------------------------------------------------------------------ */
/* Yazma                                                               */
/* ------------------------------------------------------------------ */

/** Ham IP saklanmaz; tuzlu özet tutulur (KVKK) */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}|${LOGBOOK_ADMIN_SECRET}`)
    .digest("hex")
    .slice(0, 32);
}

/** Aynı IP bugün kaç kez yükledi? */
async function countToday(ipHash: string): Promise<number> {
  const db = client();
  if (!db || !ipHash) return 0;

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { count } = await db
    .from("logbook_entries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  return count ?? 0;
}

export interface CreateEntryInput {
  /** Ham dosya — sunucuda tip/boyut doğrulanır ve yeniden encode edilir */
  bytes: Buffer;
  mime: string;
  note: string;
  name: string;
  tripDate: string;
  ipHash: string;
}

export type CreateEntryResult =
  | { ok: true; id: string; token: string; photo: Buffer; entry: LogbookEntry }
  | { ok: false; reason: "config" | "type" | "size" | "rate" | "date" | "store" };

/**
 * Yeni kayıt: doğrula → yeniden encode et (EXIF silinir) → Storage'a yaz →
 * satırı `pending` olarak ekle. E-posta çağıran tarafın işi.
 *
 * GÜVENLİK: istemcideki küçültmeye/tipe GÜVENİLMEZ. Dosya burada sharp ile
 * yeniden encode edilir; bu hem EXIF'i (konum, cihaz) siler hem de
 * "resim gibi görünen" dosyaların geçmesini engeller.
 */
export async function createEntry(
  input: CreateEntryInput,
): Promise<CreateEntryResult> {
  const db = client();
  if (!db) return { ok: false, reason: "config" };

  if (!ACCEPTED_MIME.includes(input.mime)) return { ok: false, reason: "type" };
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, reason: "size" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.tripDate)) {
    return { ok: false, reason: "date" };
  }

  if ((await countToday(input.ipHash)) >= RATE_LIMIT_PER_DAY) {
    return { ok: false, reason: "rate" };
  }

  // Yeniden encode: EXIF ve tüm metadata düşer, uzun kenar sınırlanır.
  let photo: Buffer;
  try {
    photo = await sharp(input.bytes, { failOn: "error" })
      .rotate() // EXIF yönünü piksellere uygula, sonra metadata'yı at
      .resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return { ok: false, reason: "type" };
  }

  const id = crypto.randomUUID();
  const photoPath = `${id}.webp`;
  const token = randomBytes(32).toString("base64url");

  const { error: uploadError } = await db.storage
    .from(LOGBOOK_BUCKET)
    .upload(photoPath, photo, { contentType: "image/webp", upsert: false });

  if (uploadError) return { ok: false, reason: "store" };

  const note = input.note.slice(0, MAX_NOTE_LENGTH);
  const name = input.name.slice(0, MAX_NAME_LENGTH);

  const { error: insertError } = await db.from("logbook_entries").insert({
    id,
    photo_path: photoPath,
    note,
    name,
    trip_date: input.tripDate,
    status: "pending",
    approve_token: token,
    ip_hash: input.ipHash,
  });

  if (insertError) {
    // Satır yazılamadıysa yüklenen dosyayı bırakma
    await db.storage.from(LOGBOOK_BUCKET).remove([photoPath]);
    return { ok: false, reason: "store" };
  }

  return {
    ok: true,
    id,
    token,
    photo,
    entry: {
      id,
      photoUrl: "",
      note,
      name,
      tripDate: input.tripDate,
      createdAt: new Date().toISOString(),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Onay / ret                                                          */
/* ------------------------------------------------------------------ */

export type DecisionResult =
  | { ok: true; status: LogbookStatus; alreadyDecided: boolean }
  | { ok: false; reason: "config" | "token" | "expired" | "write" };

/**
 * E-postadaki bağlantının işlediği yer. Token tek kullanımlık: kayıt
 * `pending` değilse karar tekrar uygulanmaz (`alreadyDecided`).
 * 30 günden eski kayıtların token'ı geçersizdir.
 */
export async function decideEntry(
  token: string,
  status: Extract<LogbookStatus, "approved" | "rejected">,
): Promise<DecisionResult> {
  const db = client();
  if (!db) return { ok: false, reason: "config" };
  if (!token || token.length < 20) return { ok: false, reason: "token" };

  const { data, error } = await db
    .from("logbook_entries")
    .select("id, created_at, status, photo_path")
    .eq("approve_token", token)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "token" };

  const row = data as Pick<EntryRow, "id" | "created_at" | "status" | "photo_path">;

  if (Date.now() - new Date(row.created_at).getTime() > TOKEN_TTL_MS) {
    return { ok: false, reason: "expired" };
  }

  if (row.status !== "pending") {
    return { ok: true, status: row.status, alreadyDecided: true };
  }

  const { error: updateError } = await db
    .from("logbook_entries")
    .update({ status, decided_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "pending"); // yarış durumunda ikinci tıklama boşa düşer

  if (updateError) return { ok: false, reason: "write" };

  // Reddedilen fotoğraf depoda tutulmaz
  if (status === "rejected") {
    await db.storage.from(LOGBOOK_BUCKET).remove([row.photo_path]);
  }

  return { ok: true, status, alreadyDecided: false };
}

/**
 * Admin gizli anahtarı doğrulaması (sabit zamanlı).
 * `/api/logbook/*` yollarında token yoksa istek buradan geçemez.
 */
export function isAdminSecret(value: string | null): boolean {
  if (!LOGBOOK_ADMIN_SECRET || !value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(LOGBOOK_ADMIN_SECRET);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
