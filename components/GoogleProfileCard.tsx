import { useLocale, useTranslations } from "next-intl";
import { ArrowIcon, StarIcon } from "@/components/icons";
import type { SiteInfo } from "@/lib/types";

/**
 * Google Business Profile'a yönlendiren kart: puan + yorum sayısı + bağlantı.
 * Sitedeki tek gerçek sosyal kanıt (CLAUDE.md kural 2); sayı ve puan
 * `siteInfo`'dan gelir, yorum metni içermez → uydurma riski yok.
 * `googleProfileUrl` boşsa kart tıklanamaz hâlde gösterilir.
 */
export default function GoogleProfileCard({
  info,
  className = "",
}: {
  info: SiteInfo;
  className?: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const rating = info.googleRating.toLocaleString(locale, { minimumFractionDigits: 1 });

  const inner = (
    <>
      <div className="flex items-center gap-4">
        <span className="font-display text-4xl leading-none text-deep">{rating}</span>
        <div className="min-w-0">
          <span className="keep-accent flex gap-0.5 text-accent" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} className="size-4" />
            ))}
          </span>
          <p className="mt-1 text-sm font-medium">
            {t("badge", { count: info.googleReviewCount })}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("profileCardText")}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        {t("profileCardCta")}
        <ArrowIcon className="size-4" />
      </span>
    </>
  );

  const classes = `block rounded-sm border border-line bg-surface p-5 text-left text-deep sm:p-6 ${className}`;

  return info.googleProfileUrl ? (
    <a
      href={info.googleProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${classes} transition-colors hover:border-accent`}
    >
      {inner}
    </a>
  ) : (
    <div className={classes}>{inner}</div>
  );
}
