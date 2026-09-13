import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowIcon } from "@/components/icons";

/**
 * Not: `not-found.tsx` metadata export'unu DESTEKLEMEZ — buraya yazılan
 * `robots` alanı sessizce yok sayılır, o yüzden hiç yazılmıyor.
 * Zaten gerek de yok: sayfa HTTP 404 döndüğü için arama motorları
 * meta etiketine bakmadan indekslemez. 404 durum kodu asıl sinyaldir.
 */
export default function NotFound() {
  const t = useTranslations("notFound");
  const tc = useTranslations("common");

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 max-w-xl text-[2.125rem] leading-[1.15] sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
        {t("text")}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
        >
          {t("home")}
          <ArrowIcon className="size-4" />
        </Link>
        <Link
          href="/turlar"
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-line bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
        >
          {tc("toursAndPrices")}
        </Link>
      </div>
    </div>
  );
}
