import { NextResponse, type NextRequest } from "next/server";
import {
  ACCEPTED_MIME,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_UPLOAD_BYTES,
  isUploadConfigured,
  isValidUploadCode,
} from "@/lib/logbook-config";
import { createLogbookEntry } from "@/lib/repository";

/**
 * Misafir yüklemesi. multipart/form-data.
 *
 * GÜVENLİK — istemcideki hiçbir kontrole güvenilmiyor:
 *  - yükleme kodu burada yeniden doğrulanır (yanlışsa 403),
 *  - dosya tipi ve boyutu burada yeniden doğrulanır,
 *  - dosya sharp ile yeniden encode edilir (EXIF silinir),
 *  - IP başına günlük sınır repository katmanında uygulanır.
 *
 * Hata mesajı olarak anahtar döner; metni istemci çevirir (messages/*.json).
 */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isUploadConfigured()) {
    return NextResponse.json({ ok: false, error: "config" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "form" }, { status: 400 });
  }

  // 1) Yükleme kodu — sayfada kontrol edildi, burada TEKRAR kontrol edilir
  if (!isValidUploadCode(String(form.get("code") ?? ""))) {
    return NextResponse.json({ ok: false, error: "code" }, { status: 403 });
  }

  // 2) Açık rıza onayı olmadan kayıt açılmaz
  if (String(form.get("consent") ?? "") !== "true") {
    return NextResponse.json({ ok: false, error: "consent" }, { status: 400 });
  }

  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "photo" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "size" }, { status: 400 });
  }
  if (!ACCEPTED_MIME.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "type" }, { status: 400 });
  }

  const tripDate = String(form.get("tripDate") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tripDate)) {
    return NextResponse.json({ ok: false, error: "date" }, { status: 400 });
  }

  const note = String(form.get("note") ?? "").trim().slice(0, MAX_NOTE_LENGTH);
  const name = String(form.get("name") ?? "").trim().slice(0, MAX_NAME_LENGTH);

  // Vercel'de gerçek istemci IP'si x-forwarded-for'un ilk değeri
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const bytes = Buffer.from(await file.arrayBuffer());

  const result = await createLogbookEntry({
    bytes,
    mime: file.type,
    note,
    name,
    tripDate,
    ip,
  });

  if (!result.ok) {
    const status = result.error === "rate" ? 429 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
