import { useLocale, useTranslations } from "next-intl";
import GoogleRating from "@/components/GoogleRating";
import ImmersiveScrollReviews from "@/components/ui/immersive-scroll-reviews";
import type { GoogleReview, SiteInfo } from "@/lib/types";

/**
 * Gerçek Google yorumları — veri `lib/repository.ts#getGoogleReviews`.
 * Metinler profilden birebir; uydurma yorum YOK (CLAUDE.md kural 1-2).
 * Yorum metinleri hiçbir dile çevrilmez; orijinal hâliyle gösterilir.
 */
export default function GoogleReviews({
  reviews,
  info,
  className = "",
}: {
  reviews: GoogleReview[];
  info: SiteInfo;
  /** Konumlandırma (ör. önceki sticky bölüme bindirme) sayfadan verilir */
  className?: string;
}) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  if (reviews.length === 0) return null;

  const rating = info.googleRating.toLocaleString(locale, {
    minimumFractionDigits: 1,
  });

  return (
    <section aria-label={t("ariaLabel")} className={className}>
      {/* Puan bloğu 88vh'de tamamlanır; kapsayıcı orada biter (boş kuyruk yok) */}
      <ImmersiveScrollReviews reviews={reviews} scrollLength={88}>
        <div className="deep-halo text-deep-shadow mx-auto max-w-xl text-center text-ink">
          <p className="eyebrow">{t("eyebrow")}</p>
          <p className="mt-3 font-display text-6xl sm:text-7xl">{rating}</p>
          <h2 className="mt-2 text-2xl sm:text-3xl">
            {t("title", { count: info.googleReviewCount, rating })}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            {t("note")}
          </p>
          <div className="mt-6 flex justify-center">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
              size="sm"
            />
          </div>
        </div>
      </ImmersiveScrollReviews>
    </section>
  );
}
