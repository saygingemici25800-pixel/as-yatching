"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import SampleBadge from "@/components/SampleBadge";
import { WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";
import { formatTRY } from "@/lib/pricing";
import type { GiftVoucherInfo, Locale } from "@/lib/types";

/**
 * Hediye çeki paneli: hazır tutar ya da serbest tutar → WhatsApp mesajı.
 * Satın alma / ödeme YOK; talep WhatsApp'a devredilir (Faz 2 kararıyla aynı).
 * Veri (`voucher`, `whatsapp`) sunucudan prop olarak gelir.
 */
export default function GiftVoucherPanel({
  voucher,
  whatsapp,
}: {
  voucher: GiftVoucherInfo;
  whatsapp: string;
}) {
  const t = useTranslations("gift");
  const locale = useLocale() as Locale;
  const [preset, setPreset] = useState<number | null>(voucher.amounts[0] ?? null);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const customValue = custom.trim() === "" ? null : Number(custom);
  const amount = customValue ?? preset;
  const fmt = (n: number) => formatTRY(n, locale);

  function handleSubmit() {
    if (
      amount === null ||
      !Number.isFinite(amount) ||
      amount < voucher.minAmount ||
      amount > voucher.maxAmount
    ) {
      setError(
        t("errorAmount", { min: fmt(voucher.minAmount), max: fmt(voucher.maxAmount) }),
      );
      return;
    }
    setError(null);
    window.location.href = whatsappUrl(
      whatsapp,
      t("whatsappMessage", { amount: fmt(Math.round(amount)) }),
    );
  }

  return (
    <div className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{t("chooseAmount")}</p>
        {voucher.isSamplePrice && <SampleBadge />}
      </div>

      {/* ---- Hazır tutarlar ---- */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {voucher.amounts.map((value) => {
          const active = customValue === null && preset === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPreset(value);
                setCustom("");
                setError(null);
              }}
              aria-pressed={active}
              className={`rounded-sm border px-2 py-3 text-sm font-semibold tracking-tight transition-colors ${
                active
                  ? "border-navy bg-navy text-cream"
                  : "border-line hover:border-accent"
              }`}
            >
              {fmt(value)}
            </button>
          );
        })}
      </div>

      {/* ---- Serbest tutar ---- */}
      <div className="mt-5">
        <label htmlFor="gift-amount" className="block text-sm font-medium">
          {t("customAmount")}
        </label>
        <p className="mt-1 text-xs text-ink-soft">
          {t("customHint", { min: fmt(voucher.minAmount), max: fmt(voucher.maxAmount) })}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-semibold" aria-hidden>
            ₺
          </span>
          <input
            id="gift-amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={voucher.minAmount}
            max={voucher.maxAmount}
            step={100}
            value={custom}
            placeholder={t("customPlaceholder")}
            onChange={(e) => {
              setCustom(e.target.value);
              setError(null);
            }}
            className="h-11 w-full rounded-sm border border-line bg-surface-2 px-3 text-base text-deep placeholder:text-deep/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* ---- Özet + gönder ---- */}
      <div className="mt-5 border-t border-line pt-5">
        <p aria-live="polite" className="text-sm">
          {amount !== null && Number.isFinite(amount) ? (
            <span className="text-ink">
              {t("selected")}:{" "}
              <strong className="font-semibold">{fmt(Math.round(amount))}</strong>
            </span>
          ) : (
            <span className="text-ink-soft">{t("noAmount")}</span>
          )}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wa px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
        >
          <WhatsappIcon className="size-4" />
          {t("submit")}
        </button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-ink">
            {error}
          </p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("submitNote")}</p>
      </div>
    </div>
  );
}
