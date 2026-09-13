import { defineRouting } from "next-intl/routing";

/**
 * ÇOKLU DİL YÖNLENDİRMESİ
 * ------------------------------------------------------------------
 * tr varsayılan ve ÖNEKSİZ (/turlar); en ve ru önekli (/en/tours, /ru/tury).
 * Klasör yapısı Türkçe kalır (app/[locale]/turlar); yerelleştirilmiş adres
 * middleware tarafından iç yola çevrilir.
 *
 * localeDetection kapalı: tarayıcı diline göre otomatik yönlendirme yok.
 * Dil yalnızca seçiciden değişir; seçim çerezle hatırlanır.
 */
export const routing = defineRouting({
  locales: ["tr", "en", "ru"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/turlar": { tr: "/turlar", en: "/tours", ru: "/tury" },
    "/turlar/[urun]": {
      tr: "/turlar/[urun]",
      en: "/tours/[urun]",
      ru: "/tury/[urun]",
    },
    "/tekne": { tr: "/tekne", en: "/boat", ru: "/yakhta" },
    "/sss": { tr: "/sss", en: "/faq", ru: "/faq" },
    "/iletisim": { tr: "/iletisim", en: "/contact", ru: "/kontakty" },
    "/hakkimizda": { tr: "/hakkimizda", en: "/about", ru: "/o-nas" },
    "/rotalar": { tr: "/rotalar", en: "/routes", ru: "/marshruty" },
    "/rotalar/[koy]": {
      tr: "/rotalar/[koy]",
      en: "/routes/[koy]",
      ru: "/marshruty/[koy]",
    },
    "/hediye-ceki": {
      tr: "/hediye-ceki",
      en: "/gift-voucher",
      ru: "/podarochnyy-sertifikat",
    },
    "/misafir-bilgisi": {
      tr: "/misafir-bilgisi",
      en: "/guest-info",
      ru: "/dlya-gostey",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
/** Parametresiz (statik) yollar — menü ve footer bağlantıları için */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;
