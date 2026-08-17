import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import MobileContactBar from "@/components/MobileContactBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getSiteInfo } from "@/lib/repository";
import {
  OG_IMAGE_PATH,
  SITE_URL,
  jsonLdScript,
  localBusinessSchema,
} from "@/lib/seo";

// latin-ext alt kümesi Türkçe karakterleri (ş ğ ı İ ç ö ü) kapsar.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION =
  "Fethiye Limanı'ndan günübirlik ve konaklamalı tekne turları. Fiyatlar sitede yazılı, müsait tarihler takvimde açık.";

export const metadata: Metadata = {
  // Domain kesinleşince .env içine NEXT_PUBLIC_SITE_URL yazılacak (lib/seo.ts)
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fethiye Tekne Kiralama | As Yachting",
    template: "%s | As Yachting",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "As Yachting",
    title: "Fethiye Tekne Kiralama | As Yachting",
    description: DESCRIPTION,
    locale: "tr_TR",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "As Yachting — Fethiye'de tekne kiralama",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fethiye Tekne Kiralama | As Yachting",
    description: DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const info = await getSiteInfo();

  return (
    <html lang="tr" className={`${cormorant.variable} ${inter.variable}`}>
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
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik">{children}</main>
        <SiteFooter />
        <MobileContactBar />
      </body>
    </html>
  );
}
