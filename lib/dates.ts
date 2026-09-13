import type { Locale } from "./types";

/**
 * Tarih yardımcıları — saf fonksiyonlar, veri erişimi yok.
 * Hepsi YEREL saat diliminde çalışır. `toISODate` UTC'ye çevirmez;
 * `toISOString()` kullanılırsa Türkiye saatinde tarih bir gün kayar.
 * Ay ve gün adları `Intl` ile aktif dilde üretilir.
 */

/** Pazartesi başlangıçlı kısa gün adları ("Pzt", "Mon", "пн") */
export function weekdayLabels(locale: Locale): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2024-01-01 Pazartesi
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2024, 0, 1 + i)).replace(/\.$/, ""),
  );
}

/** Date -> "2026-08-22" (yerel) */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "2026-08-22" -> Date (yerel gece yarısı) */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Ağustos 2026" / "August 2026" / "август 2026" */
export function monthLabel(year: number, month: number, locale: Locale): string {
  const name = new Intl.DateTimeFormat(locale, { month: "long" }).format(
    new Date(year, month, 1),
  );
  const capitalized = name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  return `${capitalized} ${year}`;
}

/** "22 Ağustos 2026, Cumartesi" */
export function formatLongDate(iso: string, locale: Locale): string {
  return fromISODate(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

/** Bugünün yerel gece yarısı — geçmiş gün karşılaştırmaları için */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export interface CalendarCell {
  iso: string;
  day: number;
  isPast: boolean;
}

/**
 * Bir ayın hücrelerini pazartesi başlangıçlı olarak üretir.
 * Baştaki boşluklar `null` döner.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  today: Date,
): (CalendarCell | null)[] {
  const first = new Date(year, month, 1);
  // getDay(): 0=Pazar. Pazartesi başlangıcına çevir.
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (CalendarCell | null)[] = Array.from(
    { length: leading },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      iso: toISODate(date),
      day,
      isPast: date < today,
    });
  }

  return cells;
}

/** Blok gerekçesi → messages/*.json `calendar` anahtarı */
export const BLOCK_REASON_KEY: Record<string, string> = {
  booked: "booked",
  maintenance: "maintenance",
  off_season: "offSeason",
};
