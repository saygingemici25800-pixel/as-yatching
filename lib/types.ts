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
  /** Kalkış noktası — harita, yol tarifi ve JSON-LD geo tek kaynaktan okur */
  departure: {
    label: string;
    lat: number;
    lng: number;
    note?: string;
  };
}

export interface Faq {
  question: string;
  answer: string;
}

/** Google Business Profile'dan birebir alınan gerçek yorum (uydurma değil). */
export interface GoogleReview {
  author: string;
  rating: number;
  when: string; // Google'ın gösterdiği göreli tarih ("3 ay önce")
  text: string; // Kısaltılmışsa "…" ile biter
}

/**
 * Ana sayfadaki "Nereye gidiyoruz?" coverflow bölümünün koy kartı.
 * Süre/mesafe alanları işletmeden gelecek; bilinmeyen değer "—" gösterilir.
 */
export interface Bay {
  slug: string;
  name: string;
  /** Tek cümle */
  blurb: string;
  /** Limandan tekneyle süre, örn. "35 dk" — bilinmiyorsa "—" */
  distanceFromHarbor: string;
  /** Koyda kalış, örn. "1,5 saat" — bilinmiyorsa "—" */
  stayDuration: string;
  /** Hangi turların rotasında, örn. "Günübirlik · Mavi tur" — bilinmiyorsa "—" */
  tours: string;
  /** Kısa etiket, örn. "Öğle yemeği durağı" — bilinmiyorsa "—" */
  highlight: string;
  /** /public altındaki yol (uzun kenar 1600px webp). null → listede gösterilmez */
  image: string | null;
  /** Küçük varyant (uzun kenar 640px webp); image null ise null */
  imageThumb: string | null;
}

export type MapPointKind = "island" | "bay" | "town" | "harbor";
export type MapIcon = "food" | "snorkel" | "swim" | "sunset" | "photo";

/**
 * İllüstratif harita noktası. x/y 800×520 viewBox koordinatı
 * (components/ui/fethiye-coast.ts → projectLonLat ile OSM koordinatından).
 */
export interface MapPoint {
  slug: string;
  name: string;
  kind: MapPointKind;
  x: number;
  y: number;
  /** Rozet ikonu (yalnızca durak koyları/adalar) */
  icon?: MapIcon;
  /** Tahmini süre; boşsa `bays` içindeki aynı slug'dan okunur */
  minutes?: string;
  /** 1 = her boyutta görünür, 2 = mobilde gizlenir */
  priority?: 1 | 2;
  /** Etiket konumu ince ayarı (viewBox px) */
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
}

/** Haritadaki tur rotası: duraklar mapPoints slug'ları (liman dahil). */
export interface TourRoute {
  slug: string;
  name: string;
  /** İlgili ürün (products[].slug); yoksa null */
  productSlug: string | null;
  stops: string[];
}
