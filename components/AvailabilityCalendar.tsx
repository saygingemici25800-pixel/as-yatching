"use client";

import { useMemo, useState } from "react";
import {
  BLOCK_REASON_LABEL,
  WEEKDAY_LABELS,
  buildMonthGrid,
  monthLabel,
  startOfToday,
} from "@/lib/dates";
import type { AvailabilityBlock } from "@/lib/types";

/**
 * Müsaitlik takvimi.
 * Mantık: varsayılan "müsait", istisnalar bloklanır (Bölüm 5.3).
 * Bloklu tarihler seed'den `lib/repository.ts` üzerinden gelir; bu bileşen
 * veriyi prop olarak alır, kendisi hiçbir yerden veri okumaz.
 *
 * `onSelect` verilmezse takvim salt okunur önizleme olarak çalışır.
 */
export default function AvailabilityCalendar({
  blocks,
  selected = null,
  onSelect,
  monthsAhead = 11,
}: {
  blocks: AvailabilityBlock[];
  selected?: string | null;
  onSelect?: (iso: string) => void;
  /** Kaç ay ileriye gidilebilir */
  monthsAhead?: number;
}) {
  const today = useMemo(() => startOfToday(), []);
  const [offset, setOffset] = useState(0);

  const blockedMap = useMemo(() => {
    const map = new Map<string, AvailabilityBlock["reason"]>();
    for (const block of blocks) map.set(block.date, block.reason);
    return map;
  }, [blocks]);

  const viewDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = buildMonthGrid(year, month, today);

  const interactive = typeof onSelect === "function";

  return (
    <div className="rounded-sm border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Önceki ay"
          className="flex size-9 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            <path d="M14 6l-6 6 6 6" />
          </svg>
        </button>

        <p aria-live="polite" className="font-display text-lg">
          {monthLabel(year, month)}
        </p>

        <button
          type="button"
          onClick={() => setOffset((o) => Math.min(monthsAhead, o + 1))}
          disabled={offset >= monthsAhead}
          aria-label="Sonraki ay"
          className="flex size-9 items-center justify-center rounded-sm border border-line text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
            <path d="M10 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.6875rem] uppercase tracking-wider text-ink-soft">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`empty-${index}`} />;

          const reason = blockedMap.get(cell.iso);
          const isBlocked = Boolean(reason);
          const isSelected = selected === cell.iso;
          const disabled = cell.isPast || isBlocked || !interactive;

          const base =
            "relative flex aspect-square w-full items-center justify-center rounded-sm text-sm transition-colors";

          let tone: string;
          if (cell.isPast) {
            tone = "text-ink-soft/35";
          } else if (isBlocked) {
            tone = "text-ink-soft/50 line-through decoration-ink-soft/40";
          } else if (isSelected) {
            tone = "border border-accent bg-canvas font-medium text-ink";
          } else if (interactive) {
            tone = "border border-line text-ink hover:border-accent";
          } else {
            tone = "border border-line text-ink";
          }

          const label = isBlocked
            ? `${cell.day} — ${BLOCK_REASON_LABEL[reason!] ?? "müsait değil"}`
            : cell.isPast
              ? `${cell.day} — geçmiş tarih`
              : `${cell.day} — müsait`;

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              aria-pressed={interactive ? isSelected : undefined}
              aria-label={label}
              title={isBlocked ? BLOCK_REASON_LABEL[reason!] : undefined}
              onClick={interactive && !disabled ? () => onSelect!(cell.iso) : undefined}
              className={`${base} ${tone} ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              {cell.day}
              {isBlocked && !cell.isPast && (
                <span className="absolute bottom-1 size-1 rounded-full bg-ink-soft/50" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-line bg-surface" aria-hidden />
          Müsait
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-ink-soft/20" aria-hidden />
          Dolu / bakım
        </li>
        {interactive && (
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-sm border border-accent bg-canvas" aria-hidden />
            Seçtiğiniz tarih
          </li>
        )}
      </ul>
    </div>
  );
}
