import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import {
  ArrowIcon,
  CalendarIcon,
  PinIcon,
  StarIcon,
  TagIcon,
  WhatsappIcon,
} from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/links";
import { isMissing, splitSpecs } from "@/lib/placeholder";
import { getAbout, getGoogleReviews, getSiteInfo } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/hakkimizda", locale as Locale),
  };
}

/**
 * Hakkımızda / Kaptan. İÇERİK UYDURULMAZ: kaptan adı, deneyim, belgeler,
 * diller ve hikâye `getAbout()` üzerinden gelir; boş/TODO alanlar
 * "Bilgi bekleniyor" olarak gösterilir. Yorumlar Google'dan birebir.
 */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [about, info, reviews, t, tc, tw] = await Promise.all([
    getAbout(),
    getSiteInfo(),
    getGoogleReviews(),
    getTranslations("about"),
    getTranslations("common"),
    getTranslations("whatsapp"),
  ]);

  const captainName = isMissing(about.captainName)
    ? t("captainFallback")
    : about.captainName;

  const { known, missing } = splitSpecs([
    { label: t("specName"), value: isMissing(about.captainName) ? null : about.captainName },
    {
      label: t("specExperience"),
      value: about.experienceSince
        ? t("experienceSince", { year: about.experienceSince })
        : null,
    },
    {
      label: t("specLicenses"),
      value: about.licenses.length > 0 ? about.licenses.join(", ") : null,
    },
    {
      label: t("specLanguages"),
      value: about.languages.length > 0 ? about.languages.join(", ") : null,
    },
    { label: t("specCrew"), value: isMissing(about.crewNote) ? null : about.crewNote },
  ]);

  const how = [
    { icon: TagIcon, title: t("how1Title"), text: t("how1Text") },
    { icon: CalendarIcon, title: t("how2Title"), text: t("how2Text") },
    { icon: PinIcon, title: t("how3Title"), text: t("how3Text") },
  ];

  const quotes = reviews.slice(0, 2);

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
          <div className="mt-6">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
            />
          </div>
        </header>

        {/* ---------- Kaptan kartı ---------- */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-10">
          <div className="min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm border border-line">
              <Image
                src={about.image}
                alt={captainName}
                fill
                sizes="(min-width: 1024px) 352px, 100vw"
                priority
                className="object-cover"
              />
            </div>
            {about.isPlaceholder && (
              <p className="mt-3 text-xs text-ink-soft">{t("photoNote")}</p>
            )}
          </div>

          <div className="min-w-0">
            <p className="eyebrow">{t("captainEyebrow")}</p>
            <h2 className="mt-2 text-2xl sm:text-3xl">{captainName}</h2>
            <dl className="mt-5 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
              {known.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
                >
                  <dt className="text-ink-soft">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
              {missing.map((label) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
                >
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="text-right text-ink-soft/70">{tc("missing")}</dd>
                </div>
              ))}
            </dl>
            {missing.length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {t("missingNote", { count: missing.length })}
              </p>
            )}

            {/* Hikâye — TODO: işletmeden alınacak (seed: about.story) */}
            <h2 className="mt-10 text-2xl sm:text-3xl">{t("storyTitle")}</h2>
            {isMissing(about.story) ? (
              <div className="mt-4 rounded-sm border border-dashed border-line bg-surface p-5">
                <p className="eyebrow">{tc("missing")}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t("storyPending")}
                </p>
              </div>
            ) : (
              <div className="mt-4 max-w-2xl space-y-4 text-base leading-relaxed text-ink-soft">
                {about.story.split("\n\n").map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- Nasıl çalışıyoruz ---------- */}
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl">{t("howTitle")}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {how.map((item) => (
              <li key={item.title} className="rounded-sm border border-line bg-surface p-5">
                <item.icon className="size-5 text-accent" />
                <h3 className="mt-3 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Misafirler (gerçek Google yorumları, birebir) ---------- */}
        {quotes.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl sm:text-3xl">{t("guestsTitle")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {t("guestsText")}
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {quotes.map((review) => (
                <li key={review.author} className="rounded-sm border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="keep-accent flex gap-0.5 text-accent" aria-hidden>
                      {Array.from({ length: review.rating }, (_, i) => (
                        <StarIcon key={i} className="size-3.5" />
                      ))}
                    </span>
                    <span className="text-xs text-ink-soft">{review.when}</span>
                  </div>
                  <blockquote lang="tr" className="mt-3 text-sm leading-relaxed">
                    {review.text}
                  </blockquote>
                  <p className="mt-3 text-xs font-medium text-ink-soft">
                    {review.author} · Google
                  </p>
                </li>
              ))}
            </ul>
            {info.googleProfileUrl && (
              <a
                href={info.googleProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                {t("moreReviews")}
                <ArrowIcon className="size-4" />
              </a>
            )}
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
                  {tc("whatsappWrite")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
