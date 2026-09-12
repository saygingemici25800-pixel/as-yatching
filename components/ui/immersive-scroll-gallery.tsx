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
 * Bölüm 200vh yüksekliğinde bir koşu alanı; içindeki sahne sticky. Kaydırdıkça
 * fotoğraflar 1x → 4x büyüyüp solar, ortadan başlık belirir.
 */

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ImmersiveScrollGalleryProps {
  images: GalleryImage[];
  className?: string;
  children?: ReactNode;
}

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
}: ImmersiveScrollGalleryProps) {
  const container = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  // Tek scale: bütün kareler eşit hızda büyür
  const scale = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const opacityImage = useTransform(scrollYProgress, [0.55, 0.85], [1, 0]);
  const opacityText = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const scaleText = useTransform(scrollYProgress, [0.6, 0.8], [0.9, 1]);

  return (
    <div ref={container} className={`relative h-[200vh] ${className}`}>
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
