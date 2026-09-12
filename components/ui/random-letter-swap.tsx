"use client";

import { useMemo, useState } from "react";
import { motion, type Transition } from "framer-motion";

/**
 * Hover'da harflerin rastgele sırayla yukarı kayıp yerine aynı harfin
 * alttan geldiği metin efekti (fancy/21st.dev "random letter swap").
 * Menü bağlantıları için; hareket azaltma tercihinde animasyon kapalı.
 */
interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
}

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
}: RandomLetterSwapProps) {
  const [hovered, setHovered] = useState(false);
  const letters = useMemo(() => label.split(""), [label]);

  // Her harfe rastgele bir sıra; harf sayısına göre bir kez hesaplanır
  const order = useMemo(() => {
    const idx = letters.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [letters]);

  return (
    <span
      className={`relative inline-flex overflow-hidden whitespace-nowrap ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
    >
      {letters.map((ch, i) => {
        const delay = order[i] * staggerDuration;
        return (
          <span key={i} className="relative inline-block" aria-hidden>
            <motion.span
              className="inline-block"
              animate={{ y: hovered ? "-100%" : "0%" }}
              transition={{ ...transition, delay }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 inline-block"
              animate={{ y: hovered ? "0%" : "100%" }}
              transition={{ ...transition, delay }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
