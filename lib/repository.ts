import { getLocale, getTranslations } from "next-intl/server";
import { sendApprovalEmail } from "./logbook-mail";
import {
  createEntry,
  decideEntry,
  fetchApprovedEntries,
  hashIp,
  type CreateEntryInput,
  type DecisionResult,
} from "./logbook-server";
import {
  about,
  availabilityBlocks,
  bays,
  boats,
  faqs,
  giftVoucher,
  googleReviews,
  guestInfo,
  mapPoints,
  products,
  routeGuides,
  routes,
  siteInfo,
} from "@/data/seed";
import { localize } from "./localize";
import type {
  AboutInfo,
  AvailabilityBlock,
  Bay,
  Boat,
  BookingRequest,
  Faq,
  GiftVoucherInfo,
  GoogleReview,
  GuestInfo,
  Locale,
  LogbookEntry,
  LogbookStatus,
  LogbookSubmitResult,
  MapPoint,
  Product,
  RouteGuide,
  SiteInfo,
  TourRoute,
} from "./types";

/**
 * VERİ ERİŞİM KATMANI
 * ------------------------------------------------------------------
 * Sayfalar ve bileşenler `data/seed.ts`'i ASLA doğrudan import etmez.
 * Her okuma buradan geçer.
 *
 * ÇOKLU DİL: seed'deki `{ tr, en, ru }` alanları burada, isteğin aktif
 * diline göre düz string'e çevrilir. Sayfalar dili bilmez; düz tipleri
 * (Product, Bay, Faq…) alır.
 *
 * Faz 6'da Supabase'e geçilirken sadece bu dosyanın gövdesi değişir;
 * imzalar aynı kalır, hiçbir sayfa bozulmaz.
 */

const LOCALES: Locale[] = ["tr", "en", "ru"];

async function currentLocale(): Promise<Locale> {
  const locale = await getLocale();
  return (LOCALES as string[]).includes(locale) ? (locale as Locale) : "tr";
}

export async function getSiteInfo(): Promise<SiteInfo> {
  return localize<SiteInfo>(siteInfo, await currentLocale());
}

export async function getAbout(): Promise<AboutInfo> {
  return localize<AboutInfo>(about, await currentLocale());
}

export async function getGiftVoucher(): Promise<GiftVoucherInfo> {
  return localize<GiftVoucherInfo>(giftVoucher, await currentLocale());
}

export async function getGuestInfo(): Promise<GuestInfo> {
  return localize<GuestInfo>(guestInfo, await currentLocale());
}

export async function getBoats(): Promise<Boat[]> {
  const locale = await currentLocale();
  return boats.map((b) => localize<Boat>(b, locale));
}

export async function getBoat(slug: string): Promise<Boat | null> {
  const boat = boats.find((b) => b.slug === slug);
  return boat ? localize<Boat>(boat, await currentLocale()) : null;
}

export async function getProducts(): Promise<Product[]> {
  const locale = await currentLocale();
  return products.map((p) => localize<Product>(p, locale));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.featured);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const product = products.find((p) => p.slug === slug);
  return product ? localize<Product>(product, await currentLocale()) : null;
}

/** Dilden bağımsız slug listesi — sitemap ve statik parametreler için */
export async function getProductSlugs(): Promise<string[]> {
  return products.map((p) => p.slug as string);
}

export async function getBays(): Promise<Bay[]> {
  const locale = await currentLocale();
  return bays.map((b) => localize<Bay>(b, locale));
}

export async function getBaySlugs(): Promise<string[]> {
  return bays.map((b) => b.slug as string);
}

export async function getMapPoints(): Promise<MapPoint[]> {
  const locale = await currentLocale();
  return mapPoints.map((p) => localize<MapPoint>(p, locale));
}

export async function getRoutes(): Promise<TourRoute[]> {
  const locale = await currentLocale();
  return routes.map((r) => localize<TourRoute>(r, locale));
}

export async function getRouteGuides(): Promise<RouteGuide[]> {
  const locale = await currentLocale();
  return routeGuides.map((g) => localize<RouteGuide>(g, locale));
}

export async function getRouteGuide(slug: string): Promise<RouteGuide | null> {
  const guide = routeGuides.find((g) => g.slug === slug);
  return guide ? localize<RouteGuide>(guide, await currentLocale()) : null;
}

export async function getRouteGuideSlugs(): Promise<string[]> {
  return routeGuides.map((g) => g.slug as string);
}

export async function getFaqs(): Promise<Faq[]> {
  const locale = await currentLocale();
  return faqs.map((f) => localize<Faq>(f, locale));
}

export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const locale = await currentLocale();
  return googleReviews.map((r) => localize<GoogleReview>(r, locale));
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
 * "2026-08-30" → "30 Ağustos 2026" (aktif dilde)
 *
 * Tarih parçalanarak yerel `Date` kuruluyor; `new Date("2026-08-30")` UTC
 * gece yarısı olarak yorumlandığı için negatif saat dilimlerinde günü bir
 * geri kaydırırdı. Biçim tanınmazsa ham değer döner.
 */
function formatDate(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/**
 * Demo aşamasında talep kaydedilmez; WhatsApp'a yönlendirilir.
 * Mesaj misafirin dilinde hazırlanır (göndermeden önce görür, düzenleyebilir).
 * Faz 6'da burası veritabanına yazacak.
 */
export async function createBookingRequest(
  request: BookingRequest,
): Promise<{ ok: true; whatsappUrl: string }> {
  const locale = await currentLocale();
  const [product, info, t] = await Promise.all([
    getProduct(request.productSlug),
    getSiteInfo(),
    getTranslations({ locale, namespace: "whatsapp" }),
  ]);

  const message = [
    t("bookingIntro", { product: product?.name ?? t("genericTour") }),
    t("bookingDate", { date: formatDate(request.date, locale) }),
    t("bookingGuests", { count: request.guests }),
    request.note ? t("bookingNote", { note: request.note }) : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    whatsappUrl: `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(message)}`,
  };
}

/* ==================================================================
 * SEYİR DEFTERİ
 * ------------------------------------------------------------------
 * Supabase'e yalnızca `lib/logbook-server.ts` dokunur; sayfalar ve API
 * route'ları buradan geçer (CLAUDE.md kural 4).
 *
 * Supabase yapılandırılmamışsa: okuma boş dizi, yazma "yapılandırılmadı"
 * hatası döner. Site hiçbir durumda kırılmaz.
 * ================================================================== */

/** Panoda gösterilecek onaylı kayıtlar (en yeni önce, imzalı URL'lerle) */
export async function getApprovedLogbookEntries(
  limit?: number,
): Promise<LogbookEntry[]> {
  return fetchApprovedEntries(limit);
}

export interface LogbookRequest {
  bytes: Buffer;
  mime: string;
  note: string;
  name: string;
  tripDate: string;
  /** Ham IP — burada özete çevrilir, asla saklanmaz */
  ip: string;
}

/**
 * Yeni kayıt: doğrula, EXIF'siz webp olarak depola, `pending` yaz ve
 * kaptana onay e-postası gönder. E-posta gönderilemese bile kayıt durur;
 * kaptan sonradan onaylayabilir.
 *
 * Hata metinleri çağıran tarafa anahtar olarak döner (çeviri sayfada).
 */
export async function createLogbookEntry(
  request: LogbookRequest,
): Promise<LogbookSubmitResult> {
  const input: CreateEntryInput = {
    bytes: request.bytes,
    mime: request.mime,
    note: request.note,
    name: request.name,
    tripDate: request.tripDate,
    ipHash: hashIp(request.ip),
  };

  const result = await createEntry(input);
  if (!result.ok) return { ok: false, error: result.reason };

  await sendApprovalEmail({
    token: result.token,
    name: result.entry.name,
    note: result.entry.note,
    tripDate: result.entry.tripDate,
    photo: result.photo,
  });

  return { ok: true };
}

/** E-postadaki onay/ret bağlantısının işlediği yer */
export async function setLogbookStatus(
  token: string,
  status: Extract<LogbookStatus, "approved" | "rejected">,
): Promise<DecisionResult> {
  return decideEntry(token, status);
}
