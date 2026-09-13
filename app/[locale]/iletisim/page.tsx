import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import {
  ArrowIcon,
  ClockIcon,
  PhoneIcon,
  PinIcon,
  WhatsappIcon,
} from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { directionsUrl, telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/iletisim", locale as Locale),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [info, t, tc, tw] = await Promise.all([
    getSiteInfo(),
    getTranslations("contact"),
    getTranslations("common"),
    getTranslations("whatsapp"),
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
          <h1 className="mt-4 text-[2.125rem] leading-[1.15] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {t("intro", { hours: info.workingHours.toLocaleLowerCase(locale) })}
          </p>
          <div className="mt-6">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
            />
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
          {/* ---------- Bilgiler ---------- */}
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="rounded-sm border border-line bg-surface p-5">
                <PhoneIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">{t("phone")}</h2>
                <a
                  href={telUrl(info.phone)}
                  className="mt-1 inline-block text-base hover:text-accent"
                >
                  {info.phone}
                </a>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <WhatsappIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">{t("whatsapp")}</h2>
                <a
                  href={whatsappUrl(info.whatsapp, tw("generalInquiry"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-sm bg-wa px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
                >
                  <WhatsappIcon className="size-4" />
                  {t("startChat")}
                </a>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <ClockIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">{t("hours")}</h2>
                <p className="mt-1 text-base">{info.workingHours}</p>
                <p className="mt-1 text-sm text-ink-soft">{t("hoursNote")}</p>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <PinIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">{t("address")}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {info.address}
                </p>
              </li>
            </ul>

            {/* ---------- Harita bağlantıları ---------- */}
            <div className="mt-6 rounded-sm border border-line bg-surface p-5">
              <h2 className="text-lg">{t("howToGet")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t("howToGetText")}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={directionsUrl(info.departure.lat, info.departure.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
                >
                  <PinIcon className="size-4" />
                  {t("directions")}
                </a>
                <a
                  href={info.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
                >
                  {t("viewMap")}
                  <ArrowIcon className="size-4" />
                </a>
              </div>
            </div>
          </div>

          {/* ---------- Form ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ContactForm whatsapp={info.whatsapp} />
            <p className="mt-4 text-center text-sm text-ink-soft">
              {t("formNoteBefore")}{" "}
              <Link
                href="/turlar"
                className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                {t("formNoteLink")}
              </Link>
              {t("formNoteAfter") === "." ? "." : ` ${t("formNoteAfter")}`}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
