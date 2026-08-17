import type { Product } from "./types";

const HIGH_SEASON_MONTHS = [6, 7, 8, 9];

export function isHighSeason(date: Date): boolean {
  return HIGH_SEASON_MONTHS.includes(date.getMonth() + 1);
}

export interface PriceResult {
  total: number;
  unitLabel: string;
  breakdown: string;
  isSample: boolean;
}

/**
 * Karma fiyatlandırma: per_day, per_person, per_hour tek fonksiyonda.
 * Ürüne yeni bir tip eklenirse TypeScript burada hata verir — bilerek.
 */
export function calculatePrice(
  product: Product,
  guests: number,
  date: Date | null,
): PriceResult {
  const seasonMultiplier =
    date && isHighSeason(date) ? product.highSeasonMultiplier : 1;

  let base: number;
  let unitLabel: string;
  let breakdown: string;

  switch (product.pricingType) {
    case "per_day": {
      const days = product.durationDays ?? 1;
      base = product.basePrice * days;
      unitLabel = days > 1 ? `${days} gün` : "tekne / gün";
      breakdown =
        days > 1
          ? `${formatTRY(product.basePrice)} × ${days} gün`
          : `Tekne günlük fiyatı — ${product.maxGuests} kişiye kadar`;
      break;
    }
    case "per_person": {
      const effectiveGuests = Math.max(guests, product.minGuests);
      base = product.basePrice * effectiveGuests;
      unitLabel = "kişi başı";
      breakdown = `${formatTRY(product.basePrice)} × ${effectiveGuests} kişi (en az ${product.minGuests} kişi)`;
      break;
    }
    case "per_hour": {
      const hours = product.durationHours ?? 1;
      base = product.basePrice * hours;
      unitLabel = `${hours} saat`;
      breakdown = `${formatTRY(product.basePrice)} × ${hours} saat`;
      break;
    }
  }

  const total = Math.round(base * seasonMultiplier);

  return {
    total,
    unitLabel,
    breakdown:
      seasonMultiplier > 1
        ? `${breakdown} · yüksek sezon`
        : breakdown,
    isSample: product.isSamplePrice,
  };
}

export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Kart üzerinde gösterilecek "şu fiyattan başlıyor" ifadesi */
export function startingFromLabel(product: Product): string {
  switch (product.pricingType) {
    case "per_day":
      return `${formatTRY(product.basePrice)} / gün`;
    case "per_person":
      return `${formatTRY(product.basePrice)} / kişi`;
    case "per_hour":
      return `${formatTRY(product.basePrice)} / saat`;
  }
}
