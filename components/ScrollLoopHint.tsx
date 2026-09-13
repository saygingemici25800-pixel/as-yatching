"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

/**
 * Footer'ın en altındaki ipucu — yalnızca ana sayfada (her dilde).
 * Hareket azaltma tercihinde ScrollLoop kapalı; yerine "Başa dön" bağlantısı.
 */
export default function ScrollLoopHint() {
  const pathname = usePathname();
  const t = useTranslations("footer");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (pathname !== "/") return null;

  return reduced ? (
    <a href="#" className="text-xs text-ink-soft hover:text-accent">
      {t("backToTop")}
    </a>
  ) : (
    <p className="text-xs text-ink-soft" aria-hidden>
      {t("scrollHint")}
    </p>
  );
}
