import { StarIcon } from "@/components/icons";

/**
 * Sitedeki TEK gerçek sosyal kanıt: Google 5.0 / 34 yorum.
 * Yorum metinleri elimizde olmadığı için alıntı gösterilmez — uydurulmaz.
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
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  const inner = (
    <>
      <span className="keep-accent flex gap-0.5 text-accent" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} className={starSize} />
        ))}
      </span>
      <span className={size === "sm" ? "text-sm" : "text-base"}>
        <strong className="font-semibold">
          {rating.toLocaleString("tr-TR", { minimumFractionDigits: 1 })}
        </strong>
        <span className="text-ink-soft"> · {reviewCount} Google yorumu</span>
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
        Google üzerinde {reviewCount} değerlendirmede {rating} üzerinden 5 puan.
      </span>
    </div>
  );
}
