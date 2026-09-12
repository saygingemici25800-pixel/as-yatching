"use client";

import { GlassCalendar } from "@/components/ui/glass-calendar";
import type { AvailabilityBlock } from "@/lib/types";

/**
 * Müsaitlik takvimi — görünüm `components/ui/glass-calendar.tsx`.
 * Mantık: varsayılan "müsait", istisnalar bloklanır (Bölüm 5.3).
 * Bloklu tarihler `lib/repository.ts` üzerinden gelir; bu bileşen veriyi
 * prop olarak alır, kendisi hiçbir yerden veri okumaz.
 *
 * `onSelect` verilmezse takvim salt okunur önizleme olarak çalışır.
 */
export default function AvailabilityCalendar(props: {
  blocks: AvailabilityBlock[];
  selected?: string | null;
  onSelect?: (iso: string) => void;
  /** Kaç ay ileriye gidilebilir */
  monthsAhead?: number;
}) {
  return <GlassCalendar {...props} />;
}
