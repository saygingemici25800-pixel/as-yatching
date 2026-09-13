import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BookingPanel from "@/components/BookingPanel";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import ProductCard from "@/components/ProductCard";
import SampleBadge from "@/components/SampleBadge";
import {
  CheckIcon,
  ClockIcon,
  CrossIcon,
  UsersIcon,
} from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { durationLabel, guestsLabel, startingFromLabel } from "@/lib/pricing";
import {
  getAvailabilityBlocks,
  getBoat,
  getProduct,
  getProductSlugs,
  getProducts,
  getSiteInfo,
} from "@/lib/repository";
import {
  OG_LOCALE,
  jsonLdScript,
  localizedAlternates,
  localizedUrl,
  productSchema,
} from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string; urun: string }> };

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((urun) => ({ urun }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, urun } = await params;
  setRequestLocale(locale);
  const [product, t, tp] = await Promise.all([
    getProduct(urun),
    getTranslations({ locale, namespace: "product" }),
    getTranslations({ locale, namespace: "pricing" }),
  ]);
  if (!product) return { title: t("notFound") };

  const href = { pathname: "/turlar/[urun]", params: { urun: product.slug } } as const;
  const description = t("metaDescription", {
    short: product.shortDescription,
    price: startingFromLabel(product, tp, locale as Locale),
  });

  return {
    title: t("metaTitle", { name: product.name }),
    description,
    alternates: localizedAlternates(href, locale as Locale),
    openGraph: {
      title: `${t("metaTitle", { name: product.name })} | As Yachting`,
      description,
      type: "website",
      locale: OG_LOCALE[locale as Locale],
      url: localizedUrl(href, locale as Locale),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, urun } = await params;
  setRequestLocale(locale);

  const product = await getProduct(urun);
  if (!product) notFound();

  const [info, boat, allProducts, t, tp, tc] = await Promise.all([
    getSiteInfo(),
    getBoat(product.boatSlug),
    getProducts(),
    getTranslations("product"),
    getTranslations("pricing"),
    getTranslations("common"),
  ]);

  const blocks = await getAvailabilityBlocks(product.boatSlug);
  const others = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);
  const duration = durationLabel(product, tp);
  const href = { pathname: "/turlar/[urun]", params: { urun: product.slug } } as const;

  return (
    <>
      {/* Product + Offer yapısal verisi — aggregateRating içermez (bkz. lib/seo.ts) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          productSchema(product, localizedUrl(href, locale as Locale)),
        )}
      />

      <DemoNotice />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        {/* ---------- Kırıntı yolu ---------- */}
        <nav aria-label={tc("breadcrumb")} className="text-xs text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-accent">{tc("home")}</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/turlar" className="hover:text-accent">{tc("toursAndPrices")}</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>

        {/* ---------- Başlık ---------- */}
        <header className="mt-6">
          <h1 className="max-w-3xl text-[2.125rem] leading-[1.15] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>

          <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
            {duration && (
              <li className="flex items-center gap-2">
                <ClockIcon className="size-4 text-accent" />
                {duration}
              </li>
            )}
            <li className="flex items-center gap-2">
              <UsersIcon className="size-4 text-accent" />
              {guestsLabel(product, tp)}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-ink">
                {startingFromLabel(product, tp, locale as Locale)}
              </span>
              {product.isSamplePrice && <SampleBadge />}
            </li>
          </ul>
        </header>

        {/* ---------- Görsel ---------- */}
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-sm border border-line sm:aspect-[2/1]">
          <Image
            src={product.images[0]}
            alt={t("imageAlt", { name: product.name })}
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            priority
            className="object-cover"
          />
        </div>

        {/* ---------- İçerik + talep paneli ---------- */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="min-w-0">
            {/* Açıklama */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("whatHappens")}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </section>

            {/* Rota / saat planı */}
            {product.route.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl sm:text-3xl">
                  {product.durationDays && product.durationDays > 1
                    ? t("dayPlan")
                    : t("hourPlan")}
                </h2>
                <ol className="mt-5 space-y-0">
                  {product.route.map((stop, index) => (
                    <li
                      key={`${stop.name}-${index}`}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {/* Zaman çizgisi — ince altın çizgi ve nokta */}
                      <div className="flex flex-col items-center">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                        {index < product.route.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-line" aria-hidden />
                        )}
                      </div>
                      <div className="pb-1">
                        {stop.time && (
                          <p className="text-sm font-medium tabular-nums">
                            {stop.time}
                          </p>
                        )}
                        <p className={stop.time ? "mt-0.5" : ""}>{stop.name}</p>
                        {stop.note && (
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {stop.note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-ink-soft">{t("scheduleNote")}</p>
              </section>
            )}

            {/* Fiyata dahil / dahil değil */}
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl">{t("includedTitle")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                {t("includedText")}
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-sm border border-line bg-surface p-5">
                  <h3 className="text-base font-medium">{t("included")}</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {product.priceIncludes.included.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-sm border border-line bg-surface p-5">
                  <h3 className="text-base font-medium">{t("excluded")}</h3>
                  <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
                    {product.priceIncludes.excluded.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <CrossIcon className="mt-0.5 size-4 shrink-0 text-ink-soft/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Tekne özeti */}
            {boat && (
              <section className="mt-12">
                <h2 className="text-2xl sm:text-3xl">{t("boatTitle")}</h2>
                <div className="mt-5 flex flex-col gap-5 rounded-sm border border-line bg-surface p-5 sm:flex-row sm:items-center">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm sm:size-32 sm:aspect-auto">
                    <Image
                      src={boat.images[0]}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {t("boatText", { max: boat.maxGuests, port: boat.homePort })}
                    </p>
                    <Link
                      href="/tekne"
                      className="mt-3 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                      {t("boatLink")}
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ---------- Sağ kolon: talep paneli ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <BookingPanel product={product} blocks={blocks} />
            <div className="mt-5 flex justify-center">
              <GoogleRating
                rating={info.googleRating}
                reviewCount={info.googleReviewCount}
                profileUrl={info.googleProfileUrl}
                size="sm"
              />
            </div>
          </aside>
        </div>

        {/* ---------- Diğer turlar ---------- */}
        {others.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl sm:text-3xl">{t("otherTours")}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
