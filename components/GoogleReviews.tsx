import GoogleRating from "@/components/GoogleRating";
import ImmersiveScrollReviews from "@/components/ui/immersive-scroll-reviews";
import type { GoogleReview, SiteInfo } from "@/lib/types";

/**
 * Gerçek Google yorumları — veri `lib/repository.ts#getGoogleReviews`.
 * Metinler profilden birebir; uydurma yorum YOK (CLAUDE.md kural 1-2).
 */
export default function GoogleReviews({
  reviews,
  info,
}: {
  reviews: GoogleReview[];
  info: SiteInfo;
}) {
  if (reviews.length === 0) return null;

  return (
    <section aria-label="Google yorumları">
      <ImmersiveScrollReviews reviews={reviews}>
        <p className="eyebrow">Misafirlerimiz</p>
        <p className="mt-3 font-display text-6xl sm:text-7xl">
          {info.googleRating.toLocaleString("tr-TR", {
            minimumFractionDigits: 1,
          })}
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl">
          {info.googleReviewCount} Google yorumunda 5 üzerinden{" "}
          {info.googleRating.toLocaleString("tr-TR", {
            minimumFractionDigits: 1,
          })}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Yorumlar Google Business Profile&apos;dan birebir alındı; tamamını
          orada okuyabilirsiniz.
        </p>
        <div className="mt-6 flex justify-center">
          <GoogleRating
            rating={info.googleRating}
            reviewCount={info.googleReviewCount}
            profileUrl={info.googleProfileUrl}
            size="sm"
          />
        </div>
      </ImmersiveScrollReviews>
    </section>
  );
}
