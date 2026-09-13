import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoNotice from "@/components/DemoNotice";
import LogbookUploadForm from "@/components/LogbookUploadForm";
import { WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";
import {
  LOGBOOK_UPLOAD_CODE,
  isUploadConfigured,
  isValidUploadCode,
} from "@/lib/logbook-config";
import { getSiteInfo } from "@/lib/repository";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ k?: string }>;
};

/**
 * SEYİR DEFTERİ — MİSAFİR YÜKLEME SAYFASI
 * ------------------------------------------------------------------
 * Yalnızca bağlantıyla ulaşılır: /seyir-defteri/yukle?k=<kod>
 * Kod `LOGBOOK_UPLOAD_CODE` ile karşılaştırılır; yanlışsa form açılmaz.
 *
 * Sayfa HER ZAMAN noindex (indeksleme kilidinden bağımsız) ve sitemap'te yok.
 * Kod bir güvenlik sırrı değil; amaç sayfanın tesadüfen bulunmaması.
 * Asıl doğrulama yükleme API'sinde tekrar yapılır.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "logbookUpload" });
  return {
    title: t("metaTitle"),
    // Kilit açılsa bile bu sayfa indekslenmez
    robots: { index: false, follow: false },
  };
}

export default async function LogbookUploadPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const [info, t, tc, tw] = await Promise.all([
    getSiteInfo(),
    getTranslations("logbookUpload"),
    getTranslations("common"),
    getTranslations("whatsapp"),
  ]);

  const configured = isUploadConfigured();
  const unlocked = configured && isValidUploadCode(query.k);

  return (
    <>
      <DemoNotice />

      <div className="mx-auto max-w-xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <header>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 text-[2.125rem] leading-[1.15] sm:text-4xl">
            {unlocked
              ? t("title")
              : configured
                ? t("lockedTitle")
                : t("soonTitle")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            {unlocked
              ? t("intro")
              : configured
                ? t("lockedText")
                : t("soonText")}
          </p>
        </header>

        <div className="mt-8">
          {unlocked ? (
            <LogbookUploadForm code={LOGBOOK_UPLOAD_CODE} />
          ) : (
            <a
              href={whatsappUrl(info.whatsapp, tw("question"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
            >
              <WhatsappIcon className="size-4" />
              {tc("whatsappAsk")}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
