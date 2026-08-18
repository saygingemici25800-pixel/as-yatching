import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/seo";

/**
 * ⛔ KRİTİK KURAL 3: Site demo fiyatlarla ve yer tutucu içerikle çalışıyor.
 * Yayın kontrol listesi (AS_YACHTING_PROJE.md → Bölüm 6, "Faz Tanımı — Faz 7
 * — SEO & Yayın") tamamlanmadan NEXT_PUBLIC_ALLOW_INDEXING true yapılmaz.
 * Aksi halde Google'a gerçek olmayan fiyat ve eksik tekne bilgisi indekslenir,
 * sonradan temizlemesi haftalar sürer.
 *
 * Bayrak yokken tüm site kapalı: `Disallow: /` ve site haritası HİÇ
 * bildirilmez — kapalı bir siteye sitemap vermek çelişkili sinyal olur.
 */
export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
