import { useLocale, useTranslations } from "next-intl";
import GoogleProfileCard from "@/components/GoogleProfileCard";
import GoogleRating from "@/components/GoogleRating";
import ImmersiveScrollReviews from "@/components/ui/immersive-scroll-reviews";
import type { GoogleReview, SiteInfo } from "@/lib/types";

/**
 * Yorumlar bölümü — veri `lib/repository.ts#getGoogleReviews`.
 * Metinler profilden birebir; uydurma yorum YOK (CLAUDE.md kural 1-2).
 * Yorum metinleri hiçbir dile çevrilmez; orijinal hâliyle gösterilir.
 *
 * İki durum:
 *  - `reviews` doluysa: kaydırmalı yorum kartları + puan bloğu + profil kartı.
 *  - `reviews` boşsa (seed'deki dizi boşaltılırsa): yalnızca puan bloğu ve
 *    Google profiline yönlendiren kart. Metin uydurulmaz, bölüm kaybolmaz.
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

  const rating = info.googleRating.toLocaleString(locale, {
    minimumFractionDigits: 1,
  });

  const block = (
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
  );

  if (reviews.length === 0) {
    return (
      <section aria-label={t("ariaLabel")} className={`overflow-x-clip ${className}`}>
        {/* overflow-x-clip: puan bloğunun halo'su (deep-halo, -inset-8) 375px'te taşmasın */}
        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6">
          {block}
          <GoogleProfileCard info={info} className="w-full max-w-md" />
        </div>
      </section>
    );
  }

  return (
    <section aria-label={t("ariaLabel")} className={className}>
      {/* Puan bloğu 88vh'de tamamlanır; kapsayıcı orada biter (boş kuyruk yok) */}
      <ImmersiveScrollReviews reviews={reviews} scrollLength={88}>
        {block}
      </ImmersiveScrollReviews>
      {/* Google profil kartı: kaydırma sahnesinin altında, normal akışta */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <GoogleProfileCard info={info} className="mx-auto max-w-md" />
      </div>
    </section>
  );
}
