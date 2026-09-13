import { useLocale, useTranslations } from "next-intl";
import { StarIcon } from "@/components/icons";

/**
 * Sitedeki TEK gerçek sosyal kanıt: Google 5.0 / 33 yorum.
 * Puan ve yorum sayısı seed'den gelir (`siteInfo`), uydurulmaz.
 */
export default function GoogleRating({
  rating,
  reviewCount,
  profileUrl,
  size = "md",
}: {
  rating: number;
  reviewCount: number;
  profileUrl: string | null;
  size?: "sm" | "md";
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const starSize = size === "sm" ? "size-3.5" : "size-4";
  const ratingText = rating.toLocaleString(locale, { minimumFractionDigits: 1 });

  const inner = (
    <>
      <span className="keep-accent flex gap-0.5 text-accent" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} className={starSize} />
        ))}
      </span>
      <span className={size === "sm" ? "text-sm" : "text-base"}>
        <strong className="font-semibold">{ratingText}</strong>
        <span className="text-ink-soft"> · {t("badge", { count: reviewCount })}</span>
      </span>
    </>
  );

  const classes =
    "inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5";

  return (
    <div>
      {profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classes} transition-colors hover:border-accent`}
        >
          {inner}
        </a>
      ) : (
        // seed'de googleProfileUrl boşsa rozet tıklanamaz hâlde gösterilir
        <div className={classes}>{inner}</div>
      )}
      <span className="sr-only">
        {t("srText", { count: reviewCount, rating: ratingText })}
      </span>
    </div>
  );
}
