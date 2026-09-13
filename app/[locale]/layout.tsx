import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import DraftTranslationNotice from "@/components/DraftTranslationNotice";
import MobileContactBar from "@/components/MobileContactBar";
import ScrollLoop from "@/components/ScrollLoop";
import SiteFooter from "@/components/SiteFooter";
import SiteAudioProvider from "@/components/SiteAudioProvider";
import SiteHeader from "@/components/SiteHeader";
import { WavyBackground } from "@/components/ui/wavy";
import { routing } from "@/i18n/routing";
import { getSiteInfo } from "@/lib/repository";
import {
  ALLOW_INDEXING,
  OG_IMAGE_PATH,
  OG_LOCALE,
  SITE_URL,
  jsonLdScript,
  localBusinessSchema,
} from "@/lib/seo";
import type { Locale } from "@/lib/types";

// latin-ext alt kümesi Türkçe karakterleri (ş ğ ı İ ç ö ü) kapsar;
// cyrillic alt kümesi Rusça için.
// Başlık fontu: Caviar Dreams (app/fonts/). Tek kesim (Regular).
// Zodiak Black dosyaları da app/fonts/ altında duruyor; istenirse geri alınır.
const caviar = localFont({
  src: "../fonts/CaviarDreams.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-caviar",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

// El yazısı — yalnızca Seyir Defteri panosundaki not ve tarihlerde
// (components/Logbook.tsx → .logbook-hand). Kiril alt kümesi RU için.
const caveat = Caveat({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-hand",
  display: "swap",
});

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * ⛔ KRİTİK KURAL 3: Site demo fiyatlarla ve yer tutucu içerikle çalışıyor.
 * Yayın kontrol listesi (AS_YACHTING_PROJE.md → Bölüm 6, "Faz Tanımı — Faz 7
 * — SEO & Yayın") tamamlanmadan NEXT_PUBLIC_ALLOW_INDEXING true yapılmaz.
 * Aksi halde Google'a gerçek olmayan fiyat ve eksik tekne bilgisi indekslenir,
 * sonradan temizlemesi haftalar sürer.
 *
 * robots.txt tek başına yetmez: dış bir bağlantı üzerinden bulunan sayfa
 * yine de indekslenebilir. Sayfa düzeyinde `noindex` bunu da kapatır.
 * Bayrak açıkken `robots` alanı hiç üretilmez (varsayılan davranış = indeksle).
 */
const INDEXING_METADATA: Metadata = ALLOW_INDEXING
  ? {}
  : { robots: { index: false, follow: false } };

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    ...INDEXING_METADATA,
    // Domain kesinleşince .env içine NEXT_PUBLIC_SITE_URL yazılacak (lib/seo.ts)
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("siteTitle"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    openGraph: {
      siteName: "As Yachting",
      title: t("siteTitle"),
      description: t("description"),
      locale: OG_LOCALE[locale as Locale],
      type: "website",
      url: SITE_URL,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("description"),
      images: [OG_IMAGE_PATH],
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Statik üretim için: bundan sonraki tüm okuma (repository, çeviri) bu dili kullanır
  setRequestLocale(locale);

  const [info, t] = await Promise.all([
    getSiteInfo(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  // Makine çevirisi şeridi: yalnızca TR dışı dillerde ve indeksleme kilitliyken
  const showDraft = locale !== routing.defaultLocale && !ALLOW_INDEXING;

  return (
    <html lang={locale} className={`${caviar.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="antialiased">
        {/*
          LocalBusiness yapısal verisi — her sayfada bulunur.
          aggregateRating BİLEREK yok; gerekçe lib/seo.ts başında yazılı.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(localBusinessSchema(info))}
        />
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-surface focus:px-4 focus:py-2"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          {/*
            Site geneli dalga zemini: viewport'a sabit, içeriğin altında.
            Hero (video) opak olduğu için dalgalar hero bittikten sonra görünür.
            Parlaklık/opaklık burada ayarlanır — mevcut değerler soluk tutuldu.
          */}
          <WavyBackground fixed brightness={0.85} opacity={0.45} />
          <SiteAudioProvider>
            <div className="relative z-10">
              <SiteHeader />
              <main id="icerik">
                {showDraft && <DraftTranslationNotice />}
                {children}
              </main>
              <SiteFooter />
              <MobileContactBar />
              <ScrollLoop />
            </div>
          </SiteAudioProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
