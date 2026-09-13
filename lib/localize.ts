import type { Locale, Localized, Seed } from "./types";

/**
 * Seed nesnesindeki `{ tr, en, ru }` alanlarını aktif dilin string'ine
 * çevirir (derin). Saf fonksiyon; veri erişimi yok.
 * Boş çeviri (""), Türkçe metne düşer — eksik çeviri yüzünden boş alan
 * basılmaz.
 */
export function isLocalized(value: unknown): value is Localized {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Localized).tr === "string" &&
    typeof (value as Localized).en === "string" &&
    typeof (value as Localized).ru === "string"
  );
}

function walk(value: unknown, locale: Locale): unknown {
  if (isLocalized(value)) return value[locale] || value.tr;
  if (Array.isArray(value)) return value.map((item) => walk(item, locale));
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = walk(item, locale);
    }
    return out;
  }
  return value;
}

export function localize<T>(value: Seed<T>, locale: Locale): T {
  return walk(value, locale) as T;
}

/** Seed yazımı için kısa yardımcı */
export function l(tr: string, en: string, ru: string): Localized {
  return { tr, en, ru };
}
