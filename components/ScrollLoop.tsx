"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { getLenis } from "@/lib/lenis-store";

/**
 * Sayfa sonunda hero'ya dönüş (yalnızca ana sayfa).
 *
 * Tetik: sayfa dipteyken (scrollY + innerHeight >= scrollHeight - 2) gelen
 * aşağı yönlü wheel (deltaY > 0) veya 40px+ aşağı swipe. Normal scroll'a
 * karışmaz; klavye (End) tetiklemez.
 * Animasyon: wheel'de Lenis varsa lenis.scrollTo(0, 1.4 sn, easeOutQuart),
 * yoksa window.scrollTo smooth. Dokunmatikte her zaman native smooth scroll
 * ve tetik touchend'de: Lenis (syncTouch kapalı) touchend'de kendi
 * animasyonunu durdurduğu için scrollTo yarıda kalıyordu. Yukarı wheel/swipe
 * animasyonu iptal eder.
 * 3 sn içinde tekrar tetiklenmez. prefers-reduced-motion'da devre dışı
 * (footer'da "Başa dön" bağlantısı kalır — ScrollLoopHint).
 */
const COOLDOWN_MS = 3000;
const DURATION_S = 1.4;
const SWIPE_PX = 40;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

export default function ScrollLoop() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastTrigger = -Infinity;
    let animating = false;
    let timer: number | undefined;

    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;

    const trigger = (native = false) => {
      const now = performance.now();
      if (now - lastTrigger < COOLDOWN_MS) return;
      lastTrigger = now;
      animating = true;
      const lenis = native ? null : getLenis();
      if (lenis) {
        lenis.scrollTo(0, {
          duration: DURATION_S,
          easing: easeOutQuart,
          onComplete: () => {
            animating = false;
          },
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        animating = false;
      }, DURATION_S * 1000 + 100);
    };

    const cancel = () => {
      if (!animating) return;
      animating = false;
      window.clearTimeout(timer);
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
      else window.scrollTo({ top: window.scrollY });
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
        cancel();
        return;
      }
      if (e.deltaY > 0 && !animating && atBottom()) trigger();
    };

    let touchStartY = 0;
    let touchDy = 0; // + = aşağı swipe (parmak yukarı)
    let armed = false; // dokunma başladığında sayfa dipte miydi
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchDy = 0;
      armed = atBottom();
    };
    const onTouchMove = (e: TouchEvent) => {
      touchDy = touchStartY - e.touches[0].clientY;
      if (touchDy < -SWIPE_PX) cancel();
    };
    const onTouchEnd = () => {
      if (armed && touchDy >= SWIPE_PX && !animating && atBottom()) trigger(true);
      armed = false;
      touchDy = 0;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pathname]);

  return null;
}
