"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Footer'ın en altındaki ipucu — yalnızca ana sayfada.
 * Hareket azaltma tercihinde ScrollLoop kapalı; yerine "Başa dön" bağlantısı.
 */
export default function ScrollLoopHint() {
  const pathname = usePathname();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (pathname !== "/") return null;

  return reduced ? (
    <a href="#" className="text-xs text-ink-soft hover:text-accent">
      ↑ Başa dön
    </a>
  ) : (
    <p className="text-xs text-ink-soft" aria-hidden>
      ↓ kaydırmaya devam et — başa dön
    </p>
  );
}
