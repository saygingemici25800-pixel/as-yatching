import type { DecisionResult } from "@/lib/logbook-server";

/**
 * Onay/ret bağlantısına tıklayınca görünen sade sonuç sayfası.
 * Bilerek bağımsız HTML: kaptan bunu e-posta uygulamasının tarayıcısında
 * açıyor, sitenin JS'i ve fontları yüklenmesin. Marka renkleri satır içi.
 */

const MESSAGES = {
  approved: {
    title: "Yayınlandı",
    body: "Fotoğraf ana sayfadaki Seyir Defteri panosunda görünüyor.",
  },
  rejected: {
    title: "Reddedildi",
    body: "Fotoğraf yayınlanmadı ve depodan silindi.",
  },
  alreadyApproved: {
    title: "Zaten onaylanmış",
    body: "Bu fotoğraf daha önce onaylanmıştı; panoda görünüyor.",
  },
  alreadyRejected: {
    title: "Zaten reddedilmiş",
    body: "Bu fotoğraf daha önce reddedilmişti.",
  },
  token: {
    title: "Bağlantı geçersiz",
    body: "Bu onay bağlantısı tanınmadı. E-postadaki bağlantıyı olduğu gibi açtığınızdan emin olun.",
  },
  expired: {
    title: "Bağlantının süresi dolmuş",
    body: "Onay bağlantıları 30 gün geçerlidir. Bu kayıt için yeni bir bağlantı gerekiyor.",
  },
  config: {
    title: "Sistem hazır değil",
    body: "Seyir Defteri veritabanı bağlantısı yapılandırılmamış.",
  },
  write: {
    title: "Kaydedilemedi",
    body: "Karar yazılamadı. Lütfen biraz sonra tekrar deneyin.",
  },
} as const;

function pick(result: DecisionResult, intent: "approved" | "rejected") {
  if (result.ok) {
    if (!result.alreadyDecided) return MESSAGES[intent];
    return result.status === "approved"
      ? MESSAGES.alreadyApproved
      : MESSAGES.alreadyRejected;
  }
  return MESSAGES[result.reason];
}

export function decisionPage(
  result: DecisionResult,
  intent: "approved" | "rejected",
): string {
  const { title, body } = pick(result, intent);
  const good = result.ok;

  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${title} — Seyir Defteri</title>
  </head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1741a1;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:24px">
    <main style="max-width:420px;width:100%;background:#fff4e0;border-radius:4px;padding:32px;text-align:center;color:#1741a1">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b08d3f">Seyir Defteri</p>
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:600">${good ? "" : "⚠️ "}${title}</h1>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#3f5f7a">${body}</p>
      <p style="margin:24px 0 0;font-size:13px">
        <a href="/" style="color:#b08d3f">As Yachting ana sayfası</a>
      </p>
    </main>
  </body>
</html>`;
}
