import type { Faq, Product, SiteInfo } from "./types";

/**
 * YAPISAL VERİ (JSON-LD) ÜRETİCİLERİ
 * ==================================================================
 *
 * ⛔ KRİTİK KURAL — BURAYA `aggregateRating` VEYA `review` EKLENMEZ.
 *
 * Google, bir işletmenin KENDİ sitesinde KENDİ puanını yapısal veriyle
 * işaretlemesini "self-serving review" (kendi lehine yorum) sayar ve
 * zengin sonuçlardan (rich result) tamamen eleyebilir. Bu, LocalBusiness
 * ve Product şemalarının ikisi için de geçerlidir.
 *
 * 5.0 / 34 yorum puanımız GERÇEKTİR, ama sitede yalnızca:
 *   1) görsel olarak (yıldız rozeti) ve
 *   2) Google Business Profile bağlantısıyla
 * gösterilir. Yapısal veriye ASLA girmez.
 *
 * Sonradan "puanı schema'ya da ekleyelim" diye düşünülürse: EKLEME.
 * Kazancı yok, tüm zengin sonuçları kaybettirme riski var.
 * ==================================================================
 */

/** Domain alınınca .env içine NEXT_PUBLIC_SITE_URL yazılacak. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://asyachting.com";

/** Paylaşım görseli — 1200x630 */
export const OG_IMAGE_PATH = "/og-image.jpg";

/**
 * İşletmenin konumu — hem JSON-LD hem yol tarifi bağlantısı buradan okur,
 * böylece ikisi birbirinden ayrışamaz.
 */
export const BUSINESS_GEO = { latitude: 36.6213, longitude: 29.1156 };

/** Göreli yolu mutlak adrese çevirir (JSON-LD mutlak adres ister) */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * JSON-LD'yi `dangerouslySetInnerHTML` için hazırlar.
 * `<` kaçırılıyor: içerikte `</script>` geçerse etiketin erken kapanmasını
 * ve XSS'i engeller.
 */
export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

/** Haftanın yedi günü, 00:00–23:59 açık (GBP'deki "24 saat" bilgisi) */
const OPENING_HOURS = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  opens: "00:00",
  closes: "23:59",
};

/**
 * LocalBusiness — sitenin kimlik kartı.
 * Yerel aramada ("Fethiye tekne kiralama") en çok işe yarayan şema.
 */
export function localBusinessSchema(info: SiteInfo) {
  // Boş olan sosyal hesaplar şemaya girmez — null bir sameAs değeri
  // doğrulama hatası verir.
  const sameAs = [info.googleProfileUrl, info.instagram].filter(
    (value): value is string => Boolean(value),
  );

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: info.brandName,
    url: SITE_URL,
    image: absoluteUrl(OG_IMAGE_PATH),
    telephone: info.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Fethiye Limanı beton iskele",
      addressLocality: "Fethiye",
      addressRegion: "Muğla",
      postalCode: "48300",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    openingHoursSpecification: [OPENING_HOURS],
    areaServed: ["Fethiye", "Ölüdeniz", "Göcek"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
    // ⛔ aggregateRating YOK — dosya başındaki kurala bakın.
  };
}

/**
 * Product + Offer — tur detay sayfaları için.
 *
 * ⚠️ Fiyatlar `data/seed.ts`'ten geliyor ve demo aşamasında ÖRNEK verisidir.
 * Site yayına alınmadan önce (Faz 7) gerçek fiyatlar girilmiş olmalı;
 * yapısal veride yanlış fiyat yayımlamak Google tarafından cezalandırılır.
 */
export function productSchema(product: Product) {
  const url = `${SITE_URL}/turlar/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    url,
    ...(product.images[0]
      ? { image: absoluteUrl(product.images[0]) }
      : {}),
    brand: {
      "@type": "Brand",
      name: "As Yachting",
    },
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url,
    },
    // ⛔ aggregateRating / review YOK — dosya başındaki kurala bakın.
  };
}

/** FAQPage — /sss sayfası için */
export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
