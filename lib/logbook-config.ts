/**
 * SEYİR DEFTERİ — ortam değişkenleri ve yapılandırma
 * ------------------------------------------------------------------
 * Hiçbir değer koda gömülmez; hepsi .env üzerinden gelir (bkz. .env.example).
 * Değişkenler YOKSA özellik sessizce kapanır: pano boş render eder, yükleme
 * sayfası "yakında" der. Site hiçbir şekilde kırılmaz — demo kurulumunda
 * Supabase henüz açılmamış olabilir.
 *
 * Bu dosya yalnızca sunucuda import edilir (NEXT_PUBLIC_ dışındaki
 * değişkenler istemciye sızmasın diye).
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const LOGBOOK_NOTIFY_EMAIL = process.env.LOGBOOK_NOTIFY_EMAIL ?? "";
export const LOGBOOK_CC_EMAIL = process.env.LOGBOOK_CC_EMAIL ?? "";
export const LOGBOOK_ADMIN_SECRET = process.env.LOGBOOK_ADMIN_SECRET ?? "";
export const LOGBOOK_UPLOAD_CODE = process.env.LOGBOOK_UPLOAD_CODE ?? "";

/** Gönderen adresi — Resend'de doğrulanmış alan adı gerekir */
export const LOGBOOK_FROM_EMAIL =
  process.env.LOGBOOK_FROM_EMAIL ?? "Seyir Defteri <onboarding@resend.dev>";

/** Storage bucket adı — migration ile aynı */
export const LOGBOOK_BUCKET = "logbook";

/** İmzalı URL ömrü: 7 gün (saniye) */
export const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

/** Onay bağlantısının geçerlilik süresi: 30 gün (ms) */
export const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

/** Panoda gösterilen en yeni kayıt sayısı */
export const BOARD_LIMIT = 8;

/** IP başına günlük yükleme sınırı */
export const RATE_LIMIT_PER_DAY = 5;

/** Sunucuda kabul edilen en büyük dosya (10 MB) */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Sunucuda kabul edilen tipler (istemci webp'e çevirir, yine de doğrulanır) */
export const ACCEPTED_MIME = [
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];

export const MAX_NOTE_LENGTH = 140;
export const MAX_NAME_LENGTH = 40;

/** Uzun kenar — istemcide küçültülür, sunucuda da sınırlanır */
export const MAX_IMAGE_EDGE = 1600;

/** Veritabanı ve depolama hazır mı? */
export function isLogbookConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

/** E-posta bildirimi gönderilebilir mi? */
export function isMailConfigured(): boolean {
  return Boolean(RESEND_API_KEY && LOGBOOK_NOTIFY_EMAIL);
}

/** Yükleme sayfası açılabilir mi? (kod tanımlı olmalı) */
export function isUploadConfigured(): boolean {
  return isLogbookConfigured() && Boolean(LOGBOOK_UPLOAD_CODE);
}

/**
 * Yükleme kodu doğrulaması — sabit zamanlı değil, gizli anahtar değil;
 * amaç yalnızca sayfanın tesadüfen bulunmasını engellemek.
 */
export function isValidUploadCode(code: string | undefined): boolean {
  if (!LOGBOOK_UPLOAD_CODE) return false;
  return typeof code === "string" && code.trim() === LOGBOOK_UPLOAD_CODE;
}
