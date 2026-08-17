"use client";

import { useMemo, useState, useTransition } from "react";
import { requestBooking } from "@/app/actions";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import SampleBadge from "@/components/SampleBadge";
import { WhatsappIcon } from "@/components/icons";
import { formatLongDate, fromISODate } from "@/lib/dates";
import { calculatePrice, formatTRY } from "@/lib/pricing";
import type { AvailabilityBlock, Product } from "@/lib/types";

/**
 * Talep formu: tarih + kişi sayısı + ürün → WhatsApp mesajı (Faz 2 DoD).
 * Üç alan, fazlası yok. Fiyat seçim değiştikçe canlı hesaplanıyor.
 *
 * Veri: `blocks` ve `product` sunucudan prop olarak geliyor.
 * Mesaj üretimi sunucu eylemi üzerinden `lib/repository.ts`'e devrediliyor.
 */
export default function BookingPanel({
  product,
  blocks,
}: {
  product: Product;
  blocks: AvailabilityBlock[];
}) {
  const [date, setDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(Math.max(2, product.minGuests));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const price = useMemo(
    () => calculatePrice(product, guests, date ? fromISODate(date) : null),
    [product, guests, date],
  );

  function clampGuests(next: number) {
    setGuests(Math.min(product.maxGuests, Math.max(product.minGuests, next)));
  }

  function handleSubmit() {
    if (!date) {
      setError("Önce takvimden bir tarih seçin.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await requestBooking({
        productSlug: product.slug,
        date,
        guests,
      });
      if (result.ok) {
        // Yeni sekme yerine aynı sekme: mobilde WhatsApp uygulamasını doğrudan açar
        // ve pop-up engelleyicilere yakalanmaz.
        window.location.href = result.whatsappUrl;
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <p className="eyebrow">Tarih seçin, fiyatı görün</p>

      {/* ---- Fiyat ---- */}
      <div className="mt-4 border-b border-line pb-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-3xl font-semibold tracking-tight">
            {formatTRY(price.total)}
          </span>
          <span className="text-sm text-ink-soft">/ {price.unitLabel}</span>
          {price.isSample && <SampleBadge className="ml-auto" />}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          {price.breakdown}
        </p>
        {!date && (
          <p className="mt-2 text-xs text-ink-soft">
            Yüksek sezon farkı tarih seçilince hesaba katılır.
          </p>
        )}
      </div>

      {/* ---- Kişi sayısı ---- */}
      <div className="mt-5">
        <label
          htmlFor="guests"
          className="block text-sm font-medium"
        >
          Kişi sayısı
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {product.minGuests > 1
            ? `En az ${product.minGuests}, en fazla ${product.maxGuests} kişi`
            : `En fazla ${product.maxGuests} kişi`}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => clampGuests(guests - 1)}
            disabled={guests <= product.minGuests}
            aria-label="Kişi sayısını azalt"
            className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line text-lg transition-colors hover:border-accent disabled:opacity-35 disabled:hover:border-line"
          >
            −
          </button>
          <input
            id="guests"
            name="guests"
            type="number"
            inputMode="numeric"
            min={product.minGuests}
            max={product.maxGuests}
            value={guests}
            onChange={(e) => clampGuests(Number(e.target.value))}
            className="h-11 w-full rounded-sm border border-line bg-canvas text-center text-base [appearance:textfield] focus:border-accent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => clampGuests(guests + 1)}
            disabled={guests >= product.maxGuests}
            aria-label="Kişi sayısını artır"
            className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line text-lg transition-colors hover:border-accent disabled:opacity-35 disabled:hover:border-line"
          >
            +
          </button>
        </div>
      </div>

      {/* ---- Takvim ---- */}
      <div className="mt-6">
        <p className="text-sm font-medium">Tarih</p>
        <div className="mt-2">
          <AvailabilityCalendar
            blocks={blocks}
            selected={date}
            onSelect={(iso) => {
              setDate(iso);
              setError(null);
            }}
          />
        </div>
        <p aria-live="polite" className="mt-3 text-sm">
          {date ? (
            <span className="text-ink">
              Seçilen tarih: <strong className="font-medium">{formatLongDate(date)}</strong>
            </span>
          ) : (
            <span className="text-ink-soft">Henüz tarih seçilmedi.</span>
          )}
        </p>
      </div>

      {/* ---- Gönder ---- */}
      <div className="mt-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <WhatsappIcon className="size-4" />
          {pending ? "Hazırlanıyor…" : "WhatsApp'tan talep gönder"}
        </button>

        {error && (
          <p role="alert" className="mt-3 text-sm text-ink">
            {error}
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Buton, seçtiğiniz tarih ve kişi sayısıyla hazır bir WhatsApp mesajı
          açar. Mesajı göndermeden önce görebilirsiniz — otomatik rezervasyon
          yapılmaz.
        </p>
      </div>
    </div>
  );
}
