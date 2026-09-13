"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  BLOCK_REASON_KEY,
  monthLabel,
  startOfToday,
  toISODate,
  weekdayLabels,
} from "@/lib/dates";
import type { AvailabilityBlock, Locale } from "@/lib/types";

/**
 * Cam görünümlü müsaitlik takvimi (21st.dev GlassCalendar'dan uyarlandı).
 *
 * - Yatay kaydırılan gün şeridi; ay ileri/geri.
 * - Veri modeli AvailabilityCalendar ile aynı: `blocks`, `selected`, `onSelect`,
 *   `monthsAhead`. `onSelect` yoksa salt okunur önizleme.
 * - Orijinaldeki Weekly/Monthly sekmesi, ayar dişlisi, not ve etkinlik
 *   butonları çıkarıldı (bu sitede karşılığı yok); yerine müsaitlik lejantı var.
 * - Cam görünüm: bg-navy/60 + backdrop-blur-xl, ince beyaz kenar; arkadaki
 *   dalga zemini cam gibi görünür. Metinler krem (cream), seçili gün krem
 *   zemin + navy metin + accent halka, bugün noktası accent. Sitede
 *   backdrop-blur yalnızca burada (jank olursa blur-md'ye düşür).
 */

export interface GlassCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  blocks: AvailabilityBlock[];
  selected?: string | null;
  onSelect?: (iso: string) => void;
  /** Kaç ay ileriye gidilebilir */
  monthsAhead?: number;
}

const ScrollbarHide = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4"
    aria-hidden
  >
    <path d={dir === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} />
  </svg>
);

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  (
    { className, blocks, selected = null, onSelect, monthsAhead = 11, ...props },
    ref,
  ) => {
    const t = useTranslations("calendar");
    const locale = useLocale() as Locale;
    const weekdays = React.useMemo(() => weekdayLabels(locale), [locale]);
    const reasonLabel = (reason: AvailabilityBlock["reason"] | undefined) =>
      reason ? t(BLOCK_REASON_KEY[reason]) : t("notAvailable");
    const today = React.useMemo(() => startOfToday(), []);
    const [offset, setOffset] = React.useState(0);
    const stripRef = React.useRef<HTMLDivElement>(null);

    const blockedMap = React.useMemo(() => {
      const map = new Map<string, AvailabilityBlock["reason"]>();
      for (const block of blocks) map.set(block.date, block.reason);
      return map;
    }, [blocks]);

    const year = today.getFullYear();
    const month = today.getMonth() + offset;
    const viewDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const interactive = typeof onSelect === "function";

    const days = React.useMemo(() => {
      const list: { date: Date; iso: string; day: number; weekday: string; isPast: boolean; isToday: boolean }[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        // getDay(): 0 = Pazar; weekdays Pazartesi'den başlar
        const weekday = weekdays[(date.getDay() + 6) % 7];
        list.push({
          date,
          iso: toISODate(date),
          day: i,
          weekday,
          isPast: date < today,
          isToday: date.getTime() === today.getTime(),
        });
      }
      return list;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [daysInMonth, viewDate.getFullYear(), viewDate.getMonth(), today, weekdays]);

    // Ay değişince şerit başa, bu ayda ise bugüne/seçili güne kaydır
    React.useEffect(() => {
      const strip = stripRef.current;
      if (!strip) return;
      const target =
        strip.querySelector<HTMLElement>('[data-selected="true"]') ??
        strip.querySelector<HTMLElement>('[data-today="true"]');
      if (target) {
        strip.scrollTo({ left: Math.max(0, target.offsetLeft - 24), behavior: "smooth" });
      } else {
        strip.scrollTo({ left: 0 });
      }
    }, [offset, selected]);

    return (
      <div
        ref={ref}
        className={cn(
          "w-full overflow-hidden rounded-3xl border border-white/15 p-5 shadow-2xl",
          "bg-navy/60 text-cream backdrop-blur-xl",
          className,
        )}
        {...props}
      >
        <ScrollbarHide />

        {/* Ay ve gezinme */}
        <div className="flex items-center justify-between gap-3">
          <motion.p
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
            className="font-display text-3xl tracking-tight sm:text-4xl"
          >
            {monthLabel(viewDate.getFullYear(), viewDate.getMonth(), locale)}
          </motion.p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              aria-label={t("prevMonth")}
              className="flex size-9 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => Math.min(monthsAhead, o + 1))}
              disabled={offset >= monthsAhead}
              aria-label={t("nextMonth")}
              className="flex size-9 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-white/10 hover:text-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>

        {/* Yatay gün şeridi */}
        <div ref={stripRef} className="scrollbar-hide -mx-5 mt-6 overflow-x-auto px-5">
          <div className="flex gap-3">
            {days.map((d) => {
              const reason = blockedMap.get(d.iso);
              const isBlocked = Boolean(reason);
              const isSelected = selected === d.iso;
              const disabled = d.isPast || isBlocked || !interactive;

              const label = isBlocked
                ? t("dayBlocked", { day: d.day, reason: reasonLabel(reason) })
                : d.isPast
                  ? t("dayPast", { day: d.day })
                  : t("dayAvailable", { day: d.day });

              return (
                <div key={d.iso} className="flex shrink-0 flex-col items-center gap-2">
                  <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-cream/50">
                    {d.weekday}
                  </span>
                  <button
                    type="button"
                    data-today={d.isToday || undefined}
                    data-selected={isSelected || undefined}
                    disabled={disabled}
                    aria-pressed={interactive ? isSelected : undefined}
                    aria-label={label}
                    title={isBlocked ? reasonLabel(reason) : undefined}
                    onClick={interactive && !disabled ? () => onSelect!(d.iso) : undefined}
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
                      isSelected && "bg-cream text-navy shadow-lg ring-2 ring-accent",
                      !isSelected && d.isPast && "text-cream/30",
                      !isSelected && !d.isPast && isBlocked && "text-cream/40 line-through decoration-cream/40",
                      !isSelected && !d.isPast && !isBlocked && "text-cream",
                      !isSelected && !disabled && "hover:bg-white/15",
                      disabled ? "cursor-default" : "cursor-pointer",
                    )}
                  >
                    {d.day}
                    {d.isToday && !isSelected && (
                      <span className="absolute bottom-1 size-1 rounded-full bg-accent" aria-hidden />
                    )}
                    {isBlocked && !d.isPast && !isSelected && (
                      <span className="absolute bottom-1 size-1 rounded-full bg-cream/40" aria-hidden />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 h-px bg-white/15" />

        {/* Lejant */}
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-cream/70">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-white/40" aria-hidden />
            {t("legendAvailable")}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-white/20" aria-hidden />
            {t("legendBlocked")}
          </li>
          {interactive && (
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-cream ring-2 ring-accent" aria-hidden />
              {t("legendSelected")}
            </li>
          )}
        </ul>
      </div>
    );
  },
);

GlassCalendar.displayName = "GlassCalendar";
