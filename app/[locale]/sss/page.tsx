import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import { ArrowIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { whatsappUrl } from "@/lib/links";
import { getFaqs, getSiteInfo } from "@/lib/repository";
import { faqSchema, jsonLdScript, localizedAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/types";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: localizedAlternates("/sss", locale as Locale),
  };
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [faqs, info, t, tc, tw] = await Promise.all([
    getFaqs(),
    getSiteInfo(),
    getTranslations("faq"),
    getTranslations("common"),
    getTranslations("whatsapp"),
  ]);

  return (
    <>
      {/* FAQPage yapısal verisi — aggregateRating içermez (bkz. lib/seo.ts) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(faqs))}
      />

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

        {/* Açılır kapanır bölümler <details> ile — JavaScript gerekmiyor */}
        <div className="mt-8 max-w-3xl divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-5 py-4 open:bg-surface-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium marker:hidden">
                {faq.question}
                <span
                  className="shrink-0 text-accent transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        {/* TODO: İptal ve iade koşulları müşteriden alınınca seed'e eklenecek
            (data/seed.ts içinde açık TODO olarak duruyor). */}

        <section className="mt-14">
          <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl">{t("ctaTitle")}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                  {t("ctaText", { hours: info.workingHours })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappUrl(info.whatsapp, tw("question"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
                >
                  <WhatsappIcon className="size-4" />
                  {tc("whatsappAsk")}
                </a>
                <Link
                  href="/turlar"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
                >
                  {tc("browseTours")}
                  <ArrowIcon className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
