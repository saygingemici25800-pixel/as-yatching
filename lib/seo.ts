import type { Faq, Product, SiteInfo } from "./types";

/**
 * YAPISAL VERİ (JSON-LD) ÜRETİCİLERİ
 * ==================================================================
 *
 * ⛔ KRİTİK KURAL 1 — BURAYA `aggregateRating` VEYA `review` EKLENMEZ.
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
 *
 * ------------------------------------------------------------------
 *
 * ⛔ KRİTİK KURAL 2 — ÖRNEK FİYAT `Offer` OLARAK YAYIMLANMAZ.
 *
 * `productSchema`, ürünün `isSamplePrice` alanı `true` olduğu sürece
 * dönen objeye `offers` alanını HİÇ eklemez. Offer yalnızca fiyat
 * gerçek olduğunda (`isSamplePrice: false`) yayımlanır.
 *
 * Neden koda gömüldü: demo aşamasında bizi koruyan tek şey domainin
 * henüz alınmamış olması, yani indekslenmemek. Domain alındığı gün bu
 * koruma kendiliğinden kalkar ve o an seed'de hâlâ örnek fiyat varsa
 * Google'a yanlış fiyat gider. Yanlış fiyatlı Offer, Merchant/zengin
 * sonuç yaptırımına yol açar. Koruma "yayından önce hatırlarız"a
 * bırakılamayacak kadar kritik olduğu için kural burada, kod
 * seviyesinde duruyor.
 *
 * Fiyatları açmak için doğru yol: `data/seed.ts` içindeki gerçek
 * fiyatları girip `isSamplePrice: false` yapmak. Bu fonksiyona
 * dokunmak DEĞİL.
 * ==================================================================
 */

/** Domain alınınca .env içine NEXT_PUBLIC_SITE_URL yazılacak. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://asyachting.com";

/**
 * ⛔ KRİTİK KURAL 3 — İNDEKSLEME KİLİDİ (ayrıntı: app/robots.ts)
 *
 * Varsayılan KAPALI. Yalnızca `NEXT_PUBLIC_ALLOW_INDEXING=true` iken açılır.
 * `app/robots.ts` ve `app/layout.tsx` bu tek bayrağı okur — kontrolün iki
 * ayrı yerde kopyalanmaması bilinçli: biri güncellenip diğeri unutulursa
 * site yarı açık kalır.
 *
 * NEXT_PUBLIC_ önekli değişkenler derleme anında gömülür; bayrağı
 * değiştirdikten sonra YENİDEN BUILD almak şart.
 */
export const ALLOW_INDEXING =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/** Paylaşım görseli — 1200x630 */
export const OG_IMAGE_PATH = "/og-image.jpg";

/*
 * İşletmenin konumu `siteInfo.departure` alanında (data/seed.ts, repository
 * üzerinden okunur). JSON-LD geo, harita ve yol tarifi bağlantısı aynı
 * alandan beslenir; koordinat tek yerde değişir.
 */

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
      latitude: info.departure.lat,
      longitude: info.departure.lng,
    },
    openingHoursSpecification: [OPENING_HOURS],
    areaServed: ["Fethiye", "Ölüdeniz", "Göcek"],
    ...(sameAs.length > 0 ? { sameAs } : {}),
    // ⛔ aggregateRating YOK — dosya başındaki kurala bakın.
  };
}

/**
 * Product (+ koşullu Offer) — tur detay sayfaları için.
 *
 * `offers` alanı YALNIZCA fiyat gerçekken eklenir. Ürün hâlâ demo
 * fiyatıyla duruyorsa (`isSamplePrice: true`) Product şeması fiyatsız
 * yayımlanır — bu geçerli bir Product'tır, sadece zengin sonuçta fiyat
 * göstermez. Gerekçesi dosya başındaki KRİTİK KURAL 2'de yazılı.
 */
export function productSchema(product: Product) {
  const url = `${SITE_URL}/turlar/${product.slug}`;

  const schema: Record<string, unknown> = {
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
    // ⛔ aggregateRating / review YOK — dosya başındaki KRİTİK KURAL 1.
  };

  // ⛔ KRİTİK KURAL 2: örnek fiyat asla Offer olarak yayımlanmaz.
  if (!product.isSamplePrice) {
    schema.offers = {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url,
    };
  }

  return schema;
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
