import {
  availabilityBlocks,
  boats,
  faqs,
  products,
  siteInfo,
} from "@/data/seed";
import type {
  AvailabilityBlock,
  Boat,
  BookingRequest,
  Faq,
  Product,
  SiteInfo,
} from "./types";

/**
 * VERİ ERİŞİM KATMANI
 * ------------------------------------------------------------------
 * Sayfalar ve bileşenler `data/seed.ts`'i ASLA doğrudan import etmez.
 * Her okuma buradan geçer.
 *
 * Faz 6'da Supabase'e geçilirken sadece bu dosyanın gövdesi değişir;
 * imzalar aynı kalır, hiçbir sayfa bozulmaz.
 */

export async function getSiteInfo(): Promise<SiteInfo> {
  return siteInfo;
}

export async function getBoats(): Promise<Boat[]> {
  return boats;
}

export async function getBoat(slug: string): Promise<Boat | null> {
  return boats.find((b) => b.slug === slug) ?? null;
}

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((p) => p.featured);
}

export async function getProduct(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getFaqs(): Promise<Faq[]> {
  return faqs;
}

export async function getAvailabilityBlocks(
  boatSlug: string,
): Promise<AvailabilityBlock[]> {
  return availabilityBlocks.filter((b) => b.boatSlug === boatSlug);
}

export async function isDateAvailable(
  boatSlug: string,
  date: string,
): Promise<boolean> {
  const blocks = await getAvailabilityBlocks(boatSlug);
  return !blocks.some((b) => b.date === date);
}

/**
 * "2026-08-30" → "30 Ağustos 2026"
 *
 * Tarih parçalanarak yerel `Date` kuruluyor; `new Date("2026-08-30")` UTC
 * gece yarısı olarak yorumlandığı için negatif saat dilimlerinde günü bir
 * geri kaydırırdı. Biçim tanınmazsa ham değer döner.
 */
function formatDateTR(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/**
 * Demo aşamasında talep kaydedilmez; WhatsApp'a yönlendirilir.
 * Faz 6'da burası veritabanına yazacak.
 */
export async function createBookingRequest(
  request: BookingRequest,
): Promise<{ ok: true; whatsappUrl: string }> {
  const product = await getProduct(request.productSlug);
  const info = await getSiteInfo();

  const message = [
    `Merhaba, ${product?.name ?? "tur"} için bilgi almak istiyorum.`,
    `Tarih: ${formatDateTR(request.date)}`,
    `Kişi sayısı: ${request.guests}`,
    request.note ? `Not: ${request.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    whatsappUrl: `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(message)}`,
  };
}
