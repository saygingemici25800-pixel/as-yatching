import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import ProductCard from "@/components/ProductCard";
import { ArrowIcon, CheckIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/links";
import {
  getMapPoints,
  getProducts,
  getRouteGuide,
  getRouteGuideSlugs,
  getRouteGuides,
  getSiteInfo,
} from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string; koy: string }> };

export async function generateStaticParams() {
  const slugs = await getRouteGuideSlugs();
  return slugs.map((koy) => ({ koy }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, koy } = await params;
  setRequestLocale(locale);
  const [guide, t] = await Promise.all([
    getRouteGuide(koy),
    getTranslations({ locale, namespace: "routes" }),
  ]);
  if (!guide) return {};
  return {
    title: t("guideMetaTitle", { name: guide.name }),
    description: t("guideMetaDescription", {
      summary: guide.summary,
      distance: guide.distanceFromHarbor,
    }),
    alternates: localizedAlternates(
      { pathname: "/rotalar/[koy]", params: { koy: guide.slug } },
      locale as Locale,
    ),
  };
}

/**
 * Koy rehber sayfası. Veri `getRouteGuide()`; ilgili turlar
 * `guide.tourSlugs` → `getProducts()`. Süreler tahmini; bilinmeyen "—".
 */
export default async function RouteGuidePage({ params }: PageProps) {
  const { locale, koy } = await params;
  setRequestLocale(locale);

  const guide = await getRouteGuide(koy);
  if (!guide) notFound();

  const [info, products, points, guides, t, tc, tw] = await Promise.all([
    getSiteInfo(),
    getProducts(),
    getMapPoints(),
    getRouteGuides(),
    getTranslations("routes"),
    getTranslations("common"),
    getTranslations("whatsapp"),
  ]);

  const tours = guide.tourSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const nearby = guide.mapPointSlugs
    .map((slug) => points.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const others = guides.filter((g) => g.slug !== guide.slug);

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
            <li>
              <Link href="/rotalar" className="hover:text-accent">{t("breadcrumb")}</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{guide.name}</li>
          </ol>
        </nav>

        <header className="mt-6">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-[2.125rem] leading-[1.15] sm:text-5xl">
            {guide.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {guide.summary}
          </p>
        </header>

        {guide.image && (
          <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-sm border border-line sm:aspect-[2/1]">
            <Image
              src={guide.image}
              alt={guide.name}
              fill
              sizes="(min-width: 1280px) 1152px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <div className="min-w-0">
            <div className="max-w-2xl space-y-4 text-base leading-relaxed text-ink-soft">
              {guide.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>

            {guide.highlights.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl sm:text-3xl">{t("highlights")}</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  {guide.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {nearby.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl sm:text-3xl">{t("nearby")}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {nearby.map((p) => (
                    <li
                      key={p.slug}
                      className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-line bg-surface p-5">
              <dl className="divide-y divide-line text-sm">
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="eyebrow">{t("fromHarbour")}</dt>
                  <dd className="shrink-0 text-right font-medium">{guide.distanceFromHarbor}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="eyebrow">{t("stay")}</dt>
                  <dd className="shrink-0 text-right font-medium">{guide.stayDuration}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("estimateNote")}</p>
              {guide.baySlug && (
                <Link
                  href={{ pathname: "/", hash: `koy-${guide.baySlug}` }}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                >
                  {t("mapLink")}
                  <ArrowIcon className="size-4" />
                </Link>
              )}
            </div>
          </aside>
        </div>

        {/* ---------- İlgili turlar ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl">{t("toursTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {tours.length > 0 ? t("toursText") : t("toursPending")}
          </p>
          {tours.length > 0 && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ---------- Diğer koylar ---------- */}
        {others.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl sm:text-3xl">{t("otherBays")}</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={{ pathname: "/rotalar/[koy]", params: { koy: g.slug } }}
                    className="inline-flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2 text-sm transition-colors hover:border-accent"
                  >
                    {g.name}
                    <ArrowIcon className="size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- CTA ---------- */}
        <section className="mt-16">
          <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl">{t("ctaTitle")}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                  {t("ctaText", { hours: info.workingHours })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/turlar"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
                >
                  {tc("toursAndPrices")}
                  <ArrowIcon className="size-4" />
                </Link>
                <a
                  href={whatsappUrl(info.whatsapp, tw("generalInquiry"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
                >
                  <WhatsappIcon className="size-4" />
                  {tc("whatsappAsk")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
