import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { getRouteGuides } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "routes" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/rotalar", locale as Locale),
  };
}

/**
 * Rotalar dizini: koy rehber kartları. Veri `getRouteGuides()`.
 * Süreler tahmini (TODO teyit); vaat/süslü dil yok.
 */
export default async function RoutesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [guides, t, tc] = await Promise.all([
    getRouteGuides(),
    getTranslations("routes"),
    getTranslations("common"),
  ]);

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
          <Link
            href={{ pathname: "/", hash: "kalkis-baslik" }}
            className="mt-5 inline-flex items-center gap-2 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            <PinIcon className="size-4" />
            {t("mapLink")}
          </Link>
        </header>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const href = { pathname: "/rotalar/[koy]", params: { koy: guide.slug } } as const;
            return (
              <li
                key={guide.slug}
                className="group flex flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-accent/50"
              >
                <Link href={href} className="relative block aspect-[3/2] overflow-hidden" tabIndex={-1} aria-hidden>
                  {guide.image ? (
                    <Image
                      src={guide.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-2">
                      <span className="eyebrow">{t("noImage")}</span>
                    </div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-xl">
                    <Link href={href} className="transition-colors hover:text-accent">
                      {guide.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guide.summary}</p>
                  <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
                    <div className="flex items-center gap-1.5">
                      <dt>{t("fromHarbour")}:</dt>
                      <dd className="font-medium">{guide.distanceFromHarbor}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 border-t border-line pt-4">
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                      {t("detail")}
                      <ArrowIcon className="size-4" />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-ink-soft">{t("estimateNote")}</p>
      </div>
    </>
  );
}
