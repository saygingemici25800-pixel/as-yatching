import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import MobileContactBar from "@/components/MobileContactBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

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

export const metadata: Metadata = {
  // TODO: domain seçilince metadataBase ve canonical adresler eklenecek
  title: {
    default: "As Yachting — Fethiye tekne kiralama",
    template: "%s · As Yachting",
  },
  description:
    "Fethiye Limanı'ndan günübirlik ve konaklamalı tekne turları. Fiyatlar sitede yazılı, müsait tarihler takvimde açık.",
  openGraph: {
    title: "As Yachting — Fethiye tekne kiralama",
    description:
      "Fethiye Limanı'ndan günübirlik ve konaklamalı tekne turları. Fiyatlar sitede yazılı, müsait tarihler takvimde açık.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
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
