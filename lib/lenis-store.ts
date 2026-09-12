/**
 * Sayfadaki tek Lenis örneğine erişim (ParallaxScrolling oluşturur/yok eder,
 * ScrollLoop okur). Tip Lenis'in kullandığımız alt kümesi; paket tipine
 * bağımlılık yok.
 */
export interface LenisLike {
  scroll: number;
  scrollTo(
    target: number,
    options?: {
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
      force?: boolean;
      onComplete?: () => void;
    },
  ): void;
}

let current: LenisLike | null = null;

export function setLenis(instance: LenisLike | null) {
  current = instance;
}

export function getLenis(): LenisLike | null {
  return current;
}
