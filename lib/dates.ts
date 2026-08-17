/**
 * Tarih yardımcıları — saf fonksiyonlar, veri erişimi yok.
 * Hepsi YEREL saat diliminde çalışır. `toISODate` UTC'ye çevirmez;
 * `toISOString()` kullanılırsa Türkiye saatinde tarih bir gün kayar.
 */

export const WEEKDAY_LABELS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

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

export function monthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** "22 Ağustos 2026, Cumartesi" */
export function formatLongDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString("tr-TR", {
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

export const BLOCK_REASON_LABEL: Record<string, string> = {
  booked: "Dolu",
  maintenance: "Bakım",
  off_season: "Sezon dışı",
};
