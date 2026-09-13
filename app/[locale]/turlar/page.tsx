import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import ProductCard from "@/components/ProductCard";
import SampleBadge from "@/components/SampleBadge";
import { ArrowIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/links";
import { durationLabel, guestsLabel, startingFromLabel } from "@/lib/pricing";
import { getProducts, getSiteInfo } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale, PricingType } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tours" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/turlar", locale as Locale),
  };
}

/** Üç fiyat tipinin ne anlama geldiğini açıkça yazıyoruz — şeffaflık konumlandırması */
const PRICING_KEY: Record<PricingType, { label: string; explainer: string }> = {
  per_day: { label: "typeDay", explainer: "explainDay" },
  per_person: { label: "typePerson", explainer: "explainPerson" },
  per_hour: { label: "typeHour", explainer: "explainHour" },
};

export default async function ToursPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, info, t, tp, tc, tw] = await Promise.all([
    getProducts(),
    getSiteInfo(),
    getTranslations("tours"),
    getTranslations("pricing"),
    getTranslations("common"),
    getTranslations("whatsapp"),
  ]);

  // Sayfada hangi fiyat tiplerinin geçtiğini veriden çıkarıyoruz
  const usedPricingTypes = Array.from(
    new Set(products.map((p) => p.pricingType)),
  );

  return (
    <>
      <DemoNotice />

      {/* ---------- Başlık ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-4 max-w-2xl text-[2.125rem] leading-[1.15] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
          {t("intro", { count: products.length })}
        </p>
      </section>

      {/* ---------- Fiyat tipi açıklaması ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="rounded-sm border border-line bg-surface p-5">
          <p className="eyebrow">{t("howPriced")}</p>
          <dl className="mt-3 grid gap-4 sm:grid-cols-3">
            {usedPricingTypes.map((type) => (
              <div key={type}>
                <dt className="text-sm font-medium">{tp(PRICING_KEY[type].label)}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {tp(PRICING_KEY[type].explainer)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Fiyat tablosu ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">{t("priceList")}</h2>
          <p className="flex items-center gap-2 text-xs text-ink-soft">
            <SampleBadge />
            {t("sampleNote")}
          </p>
        </div>

        {/*
          Mobilde fiyat kolonu ASLA ekran dışında kalmamalı — sitenin tek işi
          fiyatı göstermek. Bu yüzden yatay kaydırma yerine düşük öncelikli
          kolonlar (kapasite, fiyat tipi) küçük ekranda gizleniyor.
        */}
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                <th scope="col" className="px-3 py-3 font-medium sm:px-4">{t("colTour")}</th>
                <th scope="col" className="px-3 py-3 font-medium sm:px-4">{t("colDuration")}</th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  {t("colCapacity")}
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  {t("colType")}
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">
                  {t("colPrice")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.slug}>
                  <th scope="row" className="px-3 py-3.5 font-normal sm:px-4">
                    <Link
                      href={{ pathname: "/turlar/[urun]", params: { urun: product.slug } }}
                      className="hover:text-accent"
                    >
                      {product.name}
                    </Link>
                  </th>
                  <td className="whitespace-nowrap px-3 py-3.5 text-ink-soft sm:px-4">
                    {durationLabel(product, tp) ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-ink-soft sm:table-cell">
                    {guestsLabel(product, tp)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-ink-soft md:table-cell">
                    {tp(PRICING_KEY[product.pricingType].label)}
                  </td>
                  <td className="px-3 py-3.5 text-right sm:px-4">
                    <span className="block whitespace-nowrap font-semibold tracking-tight">
                      {startingFromLabel(product, tp, locale as Locale)}
                    </span>
                    {product.isSamplePrice && (
                      <SampleBadge className="mt-1 sm:mt-0.5" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Tur kartları ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
        <h2 className="text-2xl sm:text-3xl">{t("allTours")}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl">{t("ctaTitle")}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                {t("ctaText", { hours: info.workingHours })}
              </p>
            </div>
            <a
              href={whatsappUrl(info.whatsapp, tw("whichTour"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
            >
              <WhatsappIcon className="size-4" />
              {tc("whatsappAsk")}
              <ArrowIcon className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
