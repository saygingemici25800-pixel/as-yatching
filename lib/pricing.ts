import type { Locale, Product } from "./types";

const HIGH_SEASON_MONTHS = [6, 7, 8, 9];

export function isHighSeason(date: Date): boolean {
  return HIGH_SEASON_MONTHS.includes(date.getMonth() + 1);
}

/**
 * Çeviri fonksiyonu — next-intl'in `useTranslations("pricing")` /
 * `getTranslations("pricing")` çıktısıyla uyumlu. Fiyat yardımcıları metin
 * üretmez; etiketleri bu fonksiyondan alır (metinler messages/*.json'da).
 */
export type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

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
  t: Translate,
  locale: Locale,
): PriceResult {
  const seasonMultiplier =
    date && isHighSeason(date) ? product.highSeasonMultiplier : 1;

  let base: number;
  let unitLabel: string;
  let breakdown: string;
  const price = formatTRY(product.basePrice, locale);

  switch (product.pricingType) {
    case "per_day": {
      const days = product.durationDays ?? 1;
      base = product.basePrice * days;
      unitLabel = days > 1 ? t("unitDays", { days }) : t("unitDayOne");
      breakdown =
        days > 1
          ? t("breakdownDays", { price, days })
          : t("breakdownDayOne", { max: product.maxGuests });
      break;
    }
    case "per_person": {
      const effectiveGuests = Math.max(guests, product.minGuests);
      base = product.basePrice * effectiveGuests;
      unitLabel = t("unitPerson");
      breakdown = t("breakdownPerson", {
        price,
        guests: effectiveGuests,
        min: product.minGuests,
      });
      break;
    }
    case "per_hour": {
      const hours = product.durationHours ?? 1;
      base = product.basePrice * hours;
      unitLabel = t("unitHours", { hours });
      breakdown = t("breakdownHours", { price, hours });
      break;
    }
  }

  const total = Math.round(base * seasonMultiplier);

  return {
    total,
    unitLabel,
    breakdown:
      seasonMultiplier > 1
        ? `${breakdown} · ${t("highSeason")}`
        : breakdown,
    isSample: product.isSamplePrice,
  };
}

/** ₺ simgesiyle, dilin sayı biçiminde (tr: ₺18.000 · en: ₺18,000 · ru: 18 000 ₺) */
export function formatTRY(amount: number, locale: Locale = "tr"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "TRY",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Kart üzerinde gösterilecek "şu fiyattan başlıyor" ifadesi */
export function startingFromLabel(
  product: Product,
  t: Translate,
  locale: Locale,
): string {
  const price = formatTRY(product.basePrice, locale);
  switch (product.pricingType) {
    case "per_day":
      return t("perDay", { price });
    case "per_person":
      return t("perPerson", { price });
    case "per_hour":
      return t("perHour", { price });
  }
}

/** Süre etiketi: saatlik, günlük ve konaklamalı ürünlerin hepsini karşılar */
export function durationLabel(product: Product, t: Translate): string | null {
  if (product.durationDays && product.durationDays > 1) {
    return t("durationDays", { days: product.durationDays });
  }
  if (product.durationHours) {
    return t("durationHours", { hours: product.durationHours });
  }
  return null;
}

export function guestsLabel(product: Product, t: Translate): string {
  return product.minGuests > 1
    ? t("guestsRange", { min: product.minGuests, max: product.maxGuests })
    : t("guestsUpTo", { max: product.maxGuests });
}
