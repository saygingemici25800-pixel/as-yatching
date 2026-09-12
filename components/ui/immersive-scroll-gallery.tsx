"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Kaydırmaya bağlı "içine dalma" galerisi.
 *
 * Kaynak: 21st.dev ImmersiveScrollGallery — yapısı korundu, AS Yachting'e
 * uyarlandı: tüm fotoğraflar AYNI hızda büyür (tek scale), lorem metin yerine
 * children basılır, renkler globals.css @theme'den gelir.
 *
 * Kapsayıcı = 100vh (sahne) + `scrollLength`vh (kaydırma mesafesi); sahne
 * sticky. Animasyon keyframe'leri kaydırma mesafesi cinsinden SABİTTİR
 * (vh): fotoğraflar 100vh'de 4x'e büyür, 55–85vh arasında solar, başlık
 * 60–80vh'de belirir. `scrollLength` kısaltılınca animasyon değişmez,
 * kapsayıcı animasyonun bittiği yerde biter (boş kaydırma alanı kalmaz).
 * Varsayılan 100 (eski 200vh davranışı); başlıksız kullanımda 85 yeterli.
 */

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ImmersiveScrollGalleryProps {
  images: GalleryImage[];
  className?: string;
  children?: ReactNode;
  /** Kaydırma mesafesi, vh. Kapsayıcı yüksekliği = 100vh + scrollLength vh. */
  scrollLength?: number;
}

// Keyframe'ler kaydırma mesafesi cinsinden (vh)
const SCALE_END_VH = 100; // scale 4'e ulaştığı nokta
const FADE_VH: [number, number] = [55, 85];
const TEXT_VH: [number, number] = [60, 80];

// 5 fotoğraf için konumlar: ortadaki en büyük, diğerleri etrafında
const IMAGE_STYLES = [
  "w-[46vw] h-[30vh] sm:w-[26vw] sm:h-[34vh]",
  "w-[36vw] h-[22vh] -top-[28vh] -left-[28vw] sm:w-[22vw] sm:h-[28vh] sm:-top-[32vh] sm:-left-[28vw]",
  "w-[36vw] h-[22vh] -top-[28vh] left-[28vw] sm:w-[24vw] sm:h-[26vh] sm:-top-[30vh] sm:left-[30vw]",
  "w-[36vw] h-[22vh] top-[28vh] -left-[28vw] sm:w-[22vw] sm:h-[26vh] sm:top-[32vh] sm:-left-[30vw]",
  "w-[36vw] h-[22vh] top-[28vh] left-[28vw] sm:w-[26vw] sm:h-[28vh] sm:top-[30vh] sm:left-[28vw]",
];

export default function ImmersiveScrollGallery({
  images,
  className = "",
  children,
  scrollLength = 100,
}: ImmersiveScrollGalleryProps) {
  const container = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // vh → progress (0–1) dönüşümü; keyframe'ler kaydırma pikseline göre sabit
  const L = scrollLength;
  const at = (vh: number) => Math.min(vh / L, 1);

  // Tek scale: bütün kareler eşit hızda büyür (100vh'de 4x)
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + 3 * (L / SCALE_END_VH)]);
  const opacityImage = useTransform(scrollYProgress, [at(FADE_VH[0]), at(FADE_VH[1])], [1, 0]);
  const opacityText = useTransform(scrollYProgress, [at(TEXT_VH[0]), at(TEXT_VH[1])], [0, 1]);
  const scaleText = useTransform(scrollYProgress, [at(TEXT_VH[0]), at(TEXT_VH[1])], [0.9, 1]);

  return (
    <div
      ref={container}
      className={`relative ${className}`}
      style={{ height: `calc(100vh + ${L}vh)` }}
    >
      <div className="sticky top-[6.5625rem] h-[calc(100svh-6.5625rem)] overflow-hidden md:top-16 md:h-[calc(100svh-4rem)]">
        {images.slice(0, IMAGE_STYLES.length).map(({ src, alt }, index) => (
          <motion.div
            key={src}
            style={{ scale, opacity: opacityImage }}
            className="absolute top-0 flex h-full w-full items-center justify-center"
          >
            <div
              className={`relative overflow-hidden rounded-sm ${IMAGE_STYLES[index]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        ))}

        {children != null && children !== false && (
          <motion.div
            style={{ opacity: opacityText, scale: scaleText }}
            className="relative mx-auto flex h-full w-full max-w-3xl items-center justify-center p-8 text-center"
          >
            <div>{children}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
