import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import GiftVoucherPanel from "@/components/GiftVoucherPanel";
import ProductCard from "@/components/ProductCard";
import SampleBadge from "@/components/SampleBadge";
import { Link } from "@/i18n/navigation";
import { isMissing } from "@/lib/placeholder";
import { getGiftVoucher, getProducts, getSiteInfo } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gift" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/hediye-ceki", locale as Locale),
  };
}

/**
 * Hediye çeki. Satın alma yok; tutar seçilir, talep WhatsApp'a gider.
 * Tutarlar ÖRNEK (isSamplePrice). Geçerlilik ve teslim biçimi TODO →
 * "Bilgi bekleniyor". Veri `getGiftVoucher()`.
 */
export default async function GiftVoucherPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [voucher, info, products, t, tc] = await Promise.all([
    getGiftVoucher(),
    getSiteInfo(),
    getProducts(),
    getTranslations("gift"),
    getTranslations("common"),
  ]);

  const details: { label: string; value: string | null }[] = [
    {
      label: t("validity"),
      value: voucher.validityMonths
        ? t("validityValue", { months: voucher.validityMonths })
        : null, // TODO: geçerlilik süresi
    },
    {
      label: t("delivery"),
      value: isMissing(voucher.deliveryNote) ? null : voucher.deliveryNote, // TODO
    },
    { label: t("usage"), value: t("usageValue") },
  ];
  const hasMissing = details.some((d) => d.value === null);

  const steps = [
    { title: t("step1Title"), text: t("step1Text") },
    { title: t("step2Title"), text: t("step2Text") },
    { title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <>
      <DemoNotice />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label={tc("breadcrumb")} className="text-xs text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-accent">{tc("home")}</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{t("breadcrumb")}</li>
          </ol>
        </nav>

        <header className="mt-6">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-2xl text-[2.125rem] leading-[1.15] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {t("intro")}
          </p>
          {voucher.isSamplePrice && (
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <SampleBadge />
              {t("sampleNote")}
            </p>
          )}
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="min-w-0">
            {/* ---------- Nasıl çalışır ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("howTitle")}</h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="rounded-sm border border-line bg-surface p-5">
                    <span className="font-display text-3xl text-accent" aria-hidden>
                      {index + 1}
                    </span>
                    <h3 className="mt-2 text-lg">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* ---------- Geçerlilik ve teslim ---------- */}
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl">{t("detailsTitle")}</h2>
              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
                {details.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
                  >
                    <dt className="text-ink-soft">{row.label}</dt>
                    <dd
                      className={
                        row.value === null
                          ? "text-right text-ink-soft/70"
                          : "text-right font-medium"
                      }
                    >
                      {row.value ?? tc("missing")}
                    </dd>
                  </div>
                ))}
              </dl>
              {hasMissing && (
                <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("detailsNote")}</p>
              )}
            </section>
          </div>

          {/* ---------- Sağ kolon: tutar paneli ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <GiftVoucherPanel voucher={voucher} whatsapp={info.whatsapp} />
          </aside>
        </div>

        {/* ---------- Turlar ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl">{t("toursTitle")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <Link
            href="/turlar"
            className="mt-5 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {tc("toursAndPrices")}
          </Link>
        </section>
      </div>
    </>
  );
}
