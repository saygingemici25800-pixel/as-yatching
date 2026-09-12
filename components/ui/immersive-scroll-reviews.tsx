"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { StarIcon } from "@/components/icons";
import type { GoogleReview } from "@/lib/types";

/**
 * Foto galerisinin kardeşi: Google yorum kartları kaydırdıkça ortadan
 * dışarı doğru açılır (galeri gibi tek hız), sonra solar ve ortada puan
 * bloğu belirir. Metin okunabilirliği için scale değil, konum (x/y)
 * animasyonu kullanılır.
 *
 * Kapsayıcı = 100vh (sahne) + `scrollLength`vh; sahne sticky. Keyframe'ler
 * kaydırma mesafesi cinsinden SABİT (vh): kartlar 0–50vh'de açılır, 62–85vh
 * arasında solar, puan bloğu 70–88vh'de belirir. scrollLength=88 ile
 * kapsayıcı animasyonun bittiği yerde biter; varsayılan 100 (eski 200vh).
 */

interface ImmersiveScrollReviewsProps {
  reviews: GoogleReview[];
  children?: ReactNode;
  /** Kaydırma mesafesi, vh. Kapsayıcı yüksekliği = 100vh + scrollLength vh. */
  scrollLength?: number;
}

// Keyframe'ler kaydırma mesafesi cinsinden (vh)
const OPEN_END_VH = 50;
const HOLD_END_VH = 62;
const FADE_END_VH = 85;
const FADE_IN_VH = 15;
const TEXT_VH: [number, number] = [70, 88];

// Her kartın son konumu (sahne merkezine göre, vw/vh)
const TARGETS = [
  { x: -30, y: -28 },
  { x: 30, y: -28 },
  { x: -32, y: 24 },
  { x: 32, y: 24 },
  { x: 0, y: 0 },
];
// Mobilde iki sütun: kartlar üst üste gelmesin diye daha dar dağılım
const TARGETS_MOBILE = [
  { x: -17, y: -30 },
  { x: 17, y: -10 },
  { x: -17, y: 10 },
  { x: 17, y: 30 },
  { x: 0, y: 0 }, // mobilde gösterilmez
];

function ReviewCard({
  review,
  progress,
  target,
  targetMobile,
  hideOnMobile = false,
  at,
}: {
  review: GoogleReview;
  hideOnMobile?: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  target: { x: number; y: number };
  targetMobile: { x: number; y: number };
  /** vh → progress dönüşümü */
  at: (vh: number) => number;
}) {
  // 0 → 50vh: merkezden hedef konuma açıl; 50 → 62vh: hedefte kal; sonra sol
  const x = useTransform(progress, [0, at(OPEN_END_VH)], ["0vw", `${target.x}vw`]);
  const y = useTransform(progress, [0, at(OPEN_END_VH)], ["0vh", `${target.y}vh`]);
  const xm = useTransform(progress, [0, at(OPEN_END_VH)], ["0vw", `${targetMobile.x}vw`]);
  const ym = useTransform(progress, [0, at(OPEN_END_VH)], ["0vh", `${targetMobile.y}vh`]);
  const scale = useTransform(progress, [0, at(OPEN_END_VH), at(FADE_END_VH)], [0.6, 1, 1.15]);
  const opacity = useTransform(
    progress,
    [0, at(FADE_IN_VH), at(HOLD_END_VH), at(FADE_END_VH)],
    [0, 1, 1, 0],
  );

  const inner = (
    <div className="w-[62vw] rounded-sm border border-line bg-surface p-4 shadow-sm sm:w-[22rem] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="keep-accent flex gap-0.5 text-accent" aria-hidden>
          {Array.from({ length: review.rating }, (_, i) => (
            <StarIcon key={i} className="size-3.5" />
          ))}
        </span>
        <span className="text-xs text-ink-soft">{review.when}</span>
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink sm:line-clamp-6">
        {review.text}
      </p>
      <p className="mt-3 text-xs font-medium text-ink-soft">
        {review.author} · Google
      </p>
    </div>
  );

  return (
    <>
      <motion.div
        style={{ x, y, scale, opacity, willChange: "transform, opacity" }}
        className="absolute inset-0 hidden items-center justify-center sm:flex"
      >
        {inner}
      </motion.div>
      {!hideOnMobile && (
        <motion.div
          style={{ x: xm, y: ym, scale, opacity, willChange: "transform, opacity" }}
          className="absolute inset-0 flex items-center justify-center sm:hidden"
        >
          {inner}
        </motion.div>
      )}
    </>
  );
}

export default function ImmersiveScrollReviews({
  reviews,
  children,
  scrollLength = 100,
}: ImmersiveScrollReviewsProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const L = scrollLength;
  const at = (vh: number) => Math.min(vh / L, 1);
  const opacityText = useTransform(scrollYProgress, [at(TEXT_VH[0]), at(TEXT_VH[1])], [0, 1]);
  const scaleText = useTransform(scrollYProgress, [at(TEXT_VH[0]), at(TEXT_VH[1])], [0.9, 1]);

  return (
    <div
      ref={container}
      className="relative"
      style={{ height: `calc(100vh + ${L}vh)` }}
    >
      <div className="sticky top-[6.5625rem] h-[calc(100svh-6.5625rem)] overflow-hidden md:top-16 md:h-[calc(100svh-4rem)]">
        {reviews.slice(0, TARGETS.length).map((review, i) => (
          <ReviewCard
            key={review.author + review.when}
            review={review}
            progress={scrollYProgress}
            target={TARGETS[i]}
            targetMobile={TARGETS_MOBILE[i]}
            hideOnMobile={i === 4}
            at={at}
          />
        ))}

        <motion.div
          style={{ opacity: opacityText, scale: scaleText }}
          className="relative mx-auto flex h-full w-full max-w-3xl items-center justify-center p-8 text-center"
        >
          <div>{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
