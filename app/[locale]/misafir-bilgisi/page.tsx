import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import { ArrowIcon, CheckIcon, PinIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { directionsUrl, whatsappUrl } from "@/lib/links";
import { isMissing } from "@/lib/placeholder";
import { getGuestInfo, getSiteInfo } from "@/lib/repository";
import { localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guest" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/misafir-bilgisi", locale as Locale),
  };
}

/** Bilinmeyen alan → "Bilgi bekleniyor" satırı */
function Row({ label, value, missing }: { label: string; value: string; missing: string }) {
  const empty = isMissing(value);
  return (
    <div className="flex flex-col gap-1 px-5 py-3.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={empty ? "text-ink-soft/70 sm:text-right" : "font-medium sm:text-right"}>
        {empty ? missing : value}
      </dd>
    </div>
  );
}

/**
 * Misafir bilgisi. İçerik `getGuestInfo()`: yalnızca seed'de bilinen
 * gerçekler (adres, can yeleği, fiyata dahil kalemler, hava kuralı) ve genel
 * öneriler. İptal/iade, otopark, yaşlı misafir koşulları vb. TODO →
 * "Bilgi bekleniyor". SSS'deki hava kuralı dışında politika yazılmaz.
 */
export default async function GuestInfoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [guest, info, t, tc, td, tw] = await Promise.all([
    getGuestInfo(),
    getSiteInfo(),
    getTranslations("guest"),
    getTranslations("common"),
    getTranslations("departure"),
    getTranslations("whatsapp"),
  ]);
  const missing = tc("missing");

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
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="min-w-0 space-y-12">
            {/* ---------- Buluşma noktası ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("meetingTitle")}</h2>
              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
                <Row label={t("meetingAddress")} value={info.address} missing={missing} />
                <Row label={t("meetingArrival")} value={guest.meeting.arrival} missing={missing} />
                <Row label={t("meetingParking")} value={guest.meeting.parking} missing={missing} />
                <Row label={t("meetingTransport")} value={guest.meeting.transport} missing={missing} />
              </dl>
              {info.departure.note && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{info.departure.note}</p>
              )}
              <a
                href={directionsUrl(info.departure.lat, info.departure.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
              >
                <PinIcon className="size-4" />
                {td("directions")}
              </a>
            </section>

            {/* ---------- Ne getirmeli ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("bringTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("bringText")}</p>
              <ul className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {guest.bring.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 text-lg">{t("providedTitle")}</h3>
              <ul className="mt-3 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {guest.provided.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {isMissing(guest.providedNote) ? t("providedNote") : guest.providedNote}
              </p>
            </section>

            {/* ---------- Çocuk ve yaşlı ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("childrenTitle")}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                {guest.children.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <dl className="mt-5 overflow-hidden rounded-sm border border-line bg-surface">
                <Row label={t("elderlyLabel")} value={guest.elderly} missing={missing} />
              </dl>
            </section>

            {/* ---------- Yemek ve içecek ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("foodTitle")}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                {guest.food.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                {isMissing(guest.foodNote) ? t("foodNote") : guest.foodNote}
              </p>
            </section>

            {/* ---------- Hava ve iptal ---------- */}
            <section>
              <h2 className="text-2xl sm:text-3xl">{t("policyTitle")}</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-sm border border-line bg-surface p-5">
                  <h3 className="text-base font-medium">{t("weatherLabel")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guest.weather}</p>
                </div>
                {/* TODO: iptal ve iade koşulları müşteriden alınacak (seed: guestInfo.cancellation) */}
                <div className="rounded-sm border border-dashed border-line bg-surface p-5">
                  <h3 className="text-base font-medium">{t("cancellationLabel")}</h3>
                  {isMissing(guest.cancellation) ? (
                    <>
                      <p className="eyebrow mt-2">{missing}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {t("cancellationPending")}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guest.cancellation}</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ---------- Sağ kolon ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-xl">{t("ctaTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t("ctaText", { hours: info.workingHours })}
              </p>
              <a
                href={whatsappUrl(info.whatsapp, tw("question"))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
              >
                <WhatsappIcon className="size-4" />
                {tc("whatsappAsk")}
              </a>
              <Link
                href="/sss"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
              >
                {t("faqLink")}
                <ArrowIcon className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
