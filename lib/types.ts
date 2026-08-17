export type PricingType = "per_day" | "per_person" | "per_hour";

export interface Boat {
  slug: string;
  name: string;
  type: string;
  lengthMeters: number;
  maxGuests: number;
  cabins: number | null;
  crew: number;
  yearBuilt: number | null;
  homePort: string;
  amenities: string[];
  safety: string[];
  images: string[];
  /** TODO: gerçek tekne bilgisi müşteriden alınacak */
  isPlaceholder: boolean;
}

export interface PriceIncludes {
  included: string[];
  excluded: string[];
}

export interface Product {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  boatSlug: string;
  pricingType: PricingType;
  /** per_day: gün başı | per_person: kişi başı | per_hour: saat başı — TL */
  basePrice: number;
  currency: "TRY";
  /** per_person ürünlerde geçerli minimum kişi sayısı */
  minGuests: number;
  maxGuests: number;
  durationHours: number | null;
  durationDays: number | null;
  /** Yüksek sezon çarpanı (1 = fark yok) */
  highSeasonMultiplier: number;
  route: RouteStop[];
  priceIncludes: PriceIncludes;
  images: string[];
  featured: boolean;
  /** Demo verisi olduğunu arayüzde göstermek için */
  isSamplePrice: boolean;
}

export interface RouteStop {
  time: string | null;
  name: string;
  note: string | null;
}

export interface AvailabilityBlock {
  /** ISO tarih: 2026-08-20 */
  date: string;
  boatSlug: string;
  reason: "booked" | "maintenance" | "off_season";
}

export interface BookingRequest {
  productSlug: string;
  date: string;
  guests: number;
  name: string;
  phone: string;
  note?: string;
}

export interface SiteInfo {
  brandName: string;
  legalName: string | null;
  phone: string;
  whatsapp: string;
  address: string;
  mapUrl: string;
  googleRating: number;
  googleReviewCount: number;
  googleProfileUrl: string | null;
  workingHours: string;
  instagram: string | null;
  highSeasonMonths: number[];
}

export interface Faq {
  question: string;
  answer: string;
}
