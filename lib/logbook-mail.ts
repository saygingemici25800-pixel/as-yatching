import "server-only";

import { Resend } from "resend";
import {
  LOGBOOK_CC_EMAIL,
  LOGBOOK_FROM_EMAIL,
  LOGBOOK_NOTIFY_EMAIL,
  RESEND_API_KEY,
  isMailConfigured,
} from "./logbook-config";
import { SITE_URL } from "./seo";

/**
 * SEYİR DEFTERİ — ONAY E-POSTASI
 * ------------------------------------------------------------------
 * Yeni yükleme geldiğinde kaptana (LOGBOOK_NOTIFY_EMAIL) gider, kopyası
 * LOGBOOK_CC_EMAIL'e. İçinde fotoğraf inline (cid) ve iki bağlantı:
 * Onayla / Reddet. Bağlantılar tek kullanımlık token taşır.
 *
 * Resend yapılandırılmamışsa sessizce atlanır — yükleme yine kaydedilir,
 * kayıt `pending` bekler. Site kırılmaz.
 */

/** HTML enjeksiyonu olmasın: e-posta gövdesine giren her şey kaçırılır */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export interface NotifyInput {
  token: string;
  name: string;
  note: string;
  tripDate: string;
  /** Yeniden encode edilmiş webp — e-postaya inline eklenir */
  photo: Buffer;
}

/** Gönderilemezse `false` döner; çağıran taraf akışı kesmez. */
export async function sendApprovalEmail(input: NotifyInput): Promise<boolean> {
  if (!isMailConfigured()) return false;

  const approveUrl = `${SITE_URL}/api/logbook/approve?token=${encodeURIComponent(input.token)}`;
  const rejectUrl = `${SITE_URL}/api/logbook/reject?token=${encodeURIComponent(input.token)}`;

  const name = input.name.trim() || "Misafirimiz";
  const date = formatDate(input.tripDate);
  const note = input.note.trim();

  const html = `<!doctype html>
<html lang="tr">
  <body style="margin:0;padding:24px;background:#fff4e0;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#1741a1">
    <div style="max-width:520px;margin:0 auto;background:#fffbf3;border:1px solid #e5d9c8;border-radius:4px;padding:24px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b08d3f">Seyir Defteri</p>
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:600">Yeni fotoğraf onay bekliyor</h1>

      <img src="cid:logbook-photo" alt="" width="472" style="display:block;width:100%;max-width:472px;height:auto;border-radius:4px;border:1px solid #e5d9c8" />

      <table style="width:100%;margin-top:16px;font-size:14px;border-collapse:collapse">
        <tr>
          <td style="padding:6px 0;color:#3f5f7a;width:96px">Gönderen</td>
          <td style="padding:6px 0;font-weight:600">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#3f5f7a">Tur tarihi</td>
          <td style="padding:6px 0;font-weight:600">${escapeHtml(date)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#3f5f7a;vertical-align:top">Not</td>
          <td style="padding:6px 0">${note ? escapeHtml(note) : "<em style='color:#3f5f7a'>Not yazılmamış</em>"}</td>
        </tr>
      </table>

      <div style="margin-top:24px">
        <a href="${approveUrl}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:600;font-size:14px">Onayla ve yayınla</a>
        <a href="${rejectUrl}" style="display:inline-block;margin-left:8px;background:#fffbf3;color:#1741a1;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:600;font-size:14px;border:1px solid #d9c2ad">Reddet</a>
      </div>

      <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#3f5f7a">
        Onaylarsanız fotoğraf ana sayfadaki panoda görünür. Reddederseniz fotoğraf
        depodan silinir. Bu bağlantılar tek kullanımlıktır ve 30 gün geçerlidir.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    "Seyir Defteri — yeni fotoğraf onay bekliyor",
    "",
    `Gönderen: ${name}`,
    `Tur tarihi: ${date}`,
    `Not: ${note || "(yok)"}`,
    "",
    `Onayla: ${approveUrl}`,
    `Reddet: ${rejectUrl}`,
    "",
    "Bağlantılar tek kullanımlıktır, 30 gün geçerlidir.",
  ].join("\n");

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: LOGBOOK_FROM_EMAIL,
      to: LOGBOOK_NOTIFY_EMAIL,
      ...(LOGBOOK_CC_EMAIL ? { cc: LOGBOOK_CC_EMAIL } : {}),
      subject: `Seyir Defteri: yeni fotoğraf — ${name}, ${date}`,
      html,
      text,
      attachments: [
        {
          filename: "seyir-defteri.webp",
          content: input.photo,
          contentId: "logbook-photo",
          contentType: "image/webp",
        },
      ],
    });
    return !error;
  } catch {
    return false;
  }
}
