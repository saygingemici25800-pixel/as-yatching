"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import type { Bay } from "@/lib/types";

/**
 * Koylar coverflow'u — ana sayfa "Nereye gidiyoruz?" bölümü.
 *
 * Kaynak: sng-destek reposu `components/ui/hero-gallery.tsx` (billboard 3D
 * kart çemberi). Korunanlar: kartların çember üzerinde sin/cos ile konumu,
 * yüzün her zaman kameraya bakması (billboard), kameraya göre sapmaya bağlı
 * ölçek / opaklık / blur sönümlemesi, ResizeObserver ile ölçü.
 *
 * Çıkarılanlar: next-intl, three.js intro ve logo filigranı, lucide, cn,
 * sanal wheel/touch scroll (sayfa kaydırmasını yakalıyordu), boştaki otomatik
 * dönüş ve onun rAF döngüsü. Dönüş yalnızca etkileşimde çalışır.
 *
 * Gezinme: sağ/sol ok butonları, yatay sürükleme / swipe (framer-motion
 * drag, eşik ~40px, bırakınca en yakın karta snap), klavye ok tuşları,
 * alttaki gösterge ve kart tıklaması. Otomatik geçiş yok. `drag="x"` +
 * `dragDirectionLock` + `touch-action: pan-y`: dikey hareket baskınsa
 * sürükleme başlamaz, sayfa kaydırması tarayıcıda kalır.
 *
 * Scroll yapısı: normal akışta bir blok. sticky yok, pin yok, Lenis'e
 * bağlanmıyor, sabit viewport yüksekliği yok.
 *
 * prefers-reduced-motion: perspektif ve derinlik kapalı, kartlar düz yatay
 * sırada; geçişler kısa ve doğrusal. Tercih mount SONRASI okunur: sunucu ve
 * ilk istemci render'ı aynı (3D) çıktıyı üretir, hidrasyon uyuşmazlığı olmaz.
 *
 * Fotoğrafı olmayan koylar (`image: null`) listeye alınmaz.
 */

const PERSPECTIVE = 1200;
const SPRING = {
  type: "spring",
  stiffness: 170,
  damping: 26,
  restDelta: 0.001,
} as const;
const FLAT_TWEEN = { duration: 0.25, ease: "easeOut" } as const;
/** Bu kadar px'in altındaki sürükleme kart değiştirmez */
const DRAG_THRESHOLD = 40;
/** Hızlı fırlatma eşiği (px/sn) */
const FLING_VELOCITY = 350;

type BayWithImage = Bay & { image: string };

const ARROW_CLASS =
  "absolute top-1/2 z-20 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-deep/40 text-ink backdrop-blur-sm transition-colors hover:border-accent focus-visible:border-accent sm:size-11";

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const rad = (deg: number) => (deg * Math.PI) / 180;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Kartın aktif konuma göre en kısa yönlü uzaklığı: [-n/2, n/2) */
const wrapOffset = (delta: number, total: number) =>
  mod(delta + total / 2, total) - total / 2;

/** Kartın kameraya göre sapması: 0° = tam önde, 180° = tam arkada */
const facingAngle = (deg: number) => {
  const a = mod(deg, 360);
  return a > 180 ? 360 - a : a;
};

// ---------------------------------------------------------------------------
// BayCard — çemberdeki tek kart
// ---------------------------------------------------------------------------
interface BayCardProps {
  bay: BayWithImage;
  index: number;
  total: number;
  radius: number;
  width: number;
  height: number;
  /** Sürekli kart konumu (tam sayı = o kart önde) */
  position: MotionValue<number>;
  flat: boolean;
  active: boolean;
  onSelect: (index: number) => void;
}

function BayCard({
  bay,
  index,
  total,
  radius,
  width,
  height,
  position,
  flat,
  active,
  onSelect,
}: BayCardProps) {
  const step = 360 / total;

  // Aktif karta göre uzaklık (kart sayısı kadar döngüsel)
  const offset = useTransform(position, (p: number) =>
    wrapOffset(index - p, total),
  );
  const facing = useTransform(offset, (o: number) => facingAngle(o * step));

  // translate3d(x,y,z) · rotateY(0) — kart çemberde döner, yüzü kameraya
  // bakar (billboard). Öndeki kart z=0'da: CSS ölçüsü birebir korunur,
  // yanlar perspektif gereği küçülür.
  const x = useTransform(offset, (o: number) =>
    flat ? o * width * 1.06 : Math.sin(rad(o * step)) * radius,
  );
  const z = useTransform(offset, (o: number) =>
    flat ? 0 : (Math.cos(rad(o * step)) - 1) * radius,
  );

  // Derinliğe göre sönümleme: yandakiler küçük ve soluk, arkadakiler görünmez
  const scale = useTransform(facing, (f: number) =>
    flat ? 1 : lerp(1, 0.55, clamp(f / 180, 0, 1)),
  );
  const opacity = useTransform([facing, offset], (values: number[]) => {
    const [f, o] = values;
    if (flat) return clamp(1.6 - Math.abs(o) * 0.9, 0, 1);
    return f <= 60
      ? lerp(1, 0.78, f / 60)
      : clamp(lerp(0.78, 0, (f - 60) / 55), 0, 0.78);
  });
  // Blur her karede yeniden rasterleşmesin diye 0.5px adımlara yuvarlanır
  const filter = useTransform(facing, (f: number) => {
    if (flat) return "none";
    const px = Math.round(clamp((f - 70) / 50, 0, 1) * 2 * 2) / 2;
    return px > 0 ? `blur(${px}px)` : "none";
  });
  const zIndex = useTransform(facing, (f: number) => Math.round(200 - f));

  // Yalnızca görünür kartlar tıklanabilir (aynı değerde setState → re-render yok)
  const [interactive, setInteractive] = useState(index === 0);
  useMotionValueEvent(facing, "change", (f) => setInteractive(f < 100));

  return (
    <motion.div
      aria-hidden={!active}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        x,
        z,
        scale,
        opacity,
        filter,
        zIndex,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onSelect(index)}
        aria-label={active ? bay.name : `${bay.name} kartına geç`}
        className="group block h-full w-full cursor-pointer rounded-2xl text-left"
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--color-deep)_45%,transparent)] transition-shadow duration-300 group-hover:shadow-[0_22px_48px_-18px_color-mix(in_srgb,var(--color-deep)_55%,transparent)]">
          <Image
            src={bay.image}
            alt={bay.name}
            fill
            draggable={false}
            priority={false}
            // Öndeki kart 3D ölçekle büyümüyor (z=0): masaüstünde 300px,
            // mobilde sahnenin %78'i (~78vw). Yanlar daha küçük çizilir.
            sizes="(min-width: 640px) 300px, 78vw"
            className="object-cover"
          />
          {/* Kart içi ad: yanlardaki kartlar altyazısız kalmasın */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/70 to-transparent p-3 pt-10 sm:p-4">
            <p className="font-display text-base text-ink sm:text-lg">
              {bay.name}
            </p>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// BayCoverflow
// ---------------------------------------------------------------------------
export default function BayCoverflow({ bays }: { bays: Bay[] }) {
  const items = bays.filter((b): b is BayWithImage => b.image !== null);
  const flat = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const total = items.length;
  const position = useMotionValue(0);
  const targetRef = useRef(0);
  const [active, setActive] = useState(0);

  // --- Ölçü ---
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setStageWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setStageWidth(el.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const isMobile = stageWidth > 0 && stageWidth < 640;
  // Mobil: orta kart ~72vw (kapsayıcı 16px kenar boşluklu → %78).
  const width = isMobile ? Math.round(stageWidth * 0.78) : 300;
  const height = Math.round((width * 4) / 3);
  const radius = isMobile
    ? width * 0.92
    : clamp((stageWidth || 1152) * 0.3, 330, 380);
  const stageHeight = height + 40;

  // Aktif kart: konum yuvarlanır, kart sayısına göre döngüsel
  useMotionValueEvent(position, "change", (p) => {
    const next = mod(Math.round(p), total);
    setActive((prev) => (prev === next ? prev : next));
  });

  const goTo = useCallback(
    (target: number) => {
      targetRef.current = target;
      animate(position, target, flat ? FLAT_TWEEN : SPRING);
    },
    [position, flat],
  );
  const stepBy = useCallback(
    (dir: 1 | -1) => goTo(targetRef.current + dir),
    [goTo],
  );
  const select = useCallback(
    (index: number) => {
      const d = wrapOffset(index - targetRef.current, total);
      if (d !== 0) goTo(targetRef.current + d);
    },
    [goTo, total],
  );

  // --- Sürükleme (framer-motion drag; sahne yerinde kalır, kartlar konumu izler) ---
  const dragStartPos = useRef(0);
  const suppressClick = useRef(false);

  const onDragStart = () => {
    position.stop();
    dragStartPos.current = position.get();
    suppressClick.current = true;
  };
  const onDrag = (_: unknown, info: PanInfo) => {
    // Bir kart genişliği kadar sürükleme ≈ bir kart ilerleme; parmağı izler
    position.set(dragStartPos.current - info.offset.x / (width * 0.9));
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    // Kart tıklaması sürükleme sonunda tetiklenmesin
    setTimeout(() => (suppressClick.current = false), 0);

    const start = Math.round(dragStartPos.current);
    const dx = info.offset.x;
    if (Math.abs(dx) < DRAG_THRESHOLD) {
      goTo(start);
      return;
    }
    let target = Math.round(position.get());
    // Eşiği geçen ama yarım kartı bulmayan hızlı fırlatma bir kart taşır
    if (target === start && Math.abs(info.velocity.x) > FLING_VELOCITY) {
      target = start + (dx < 0 ? 1 : -1);
    } else if (target === start) {
      target = start + (dx < 0 ? 1 : -1);
    }
    goTo(target);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepBy(-1);
    }
  };

  const handleSelect = useCallback(
    (index: number) => {
      if (suppressClick.current) return;
      select(index);
    },
    [select],
  );

  if (total === 0) return null;
  const current = items[active];

  return (
    <div className="relative">
      {/* Sahne: yatay taşma burada kesilir, sayfa yana kaymaz.
          drag="x" + dragConstraints 0/0 + dragElastic 0 → sahne yerinden
          oynamaz, yalnızca info.offset okunur. */}
      <motion.div
        ref={stageRef}
        role="group"
        aria-roledescription="kaydırmalı galeri"
        aria-label="Koylar"
        tabIndex={0}
        onKeyDown={onKeyDown}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        className="relative w-full cursor-grab select-none overflow-hidden rounded-2xl [touch-action:pan-y] active:cursor-grabbing"
        style={{ height: stageHeight }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: flat ? undefined : `${PERSPECTIVE}px` }}
        >
          <div
            className="relative h-0 w-0"
            style={{ transformStyle: flat ? "flat" : "preserve-3d" }}
          >
            {items.map((bay, i) => (
              <BayCard
                key={bay.slug}
                bay={bay}
                index={i}
                total={total}
                radius={radius}
                width={width}
                height={height}
                position={position}
                flat={flat}
                active={i === active}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Fotoğraf → metin geçişini yumuşatan gradient */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-gradient-to-b from-transparent to-deep/35"
        />

        {/* Oklar: yuvarlak, ince kenarlık, surface ikon; hover'da altın kenarlık */}
        <button
          type="button"
          onClick={() => stepBy(-1)}
          aria-label="Önceki koy"
          className={ARROW_CLASS + " left-2 sm:left-3"}
        >
          <ChevronIcon className="size-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => stepBy(1)}
          aria-label="Sonraki koy"
          className={ARROW_CLASS + " right-2 sm:right-3"}
        >
          <ChevronIcon className="size-4" />
        </button>
      </motion.div>

      {/* Gösterge: her koy için ince çizgi, aktif olan altın ve uzun */}
      <div
        className="mt-4 flex justify-center gap-2"
        role="tablist"
        aria-label="Koy seç"
      >
        {items.map((bay, i) => (
          <button
            key={bay.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={bay.name}
            onClick={() => select(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === active
                ? "w-7 bg-accent"
                : "w-2.5 bg-ink-soft/40 hover:bg-ink-soft/70"
            }`}
          />
        ))}
      </div>

      {/* Aktif koy bilgisi — parallax/yorum başlık reçetesi:
          ink metin + deep text-shadow + arkada kenarsız radyal karartma.
          Sahnenin overflow-hidden'ı DIŞINDA; hiçbir sarmalayıcı kırpmaz
          (text-shadow parlaması ve kenar harfleri kesilmesin). Karartma
          px-6 içindeki iç kutuya -2rem ile bağlı: 375px'te kutu 295px,
          halo 359px → viewport'u aşmaz, yatay kaydırma oluşmaz. */}
      <div className="mx-auto mt-6 max-w-md px-6 sm:mt-8 sm:px-8">
        <div
          className="deep-halo text-deep-shadow isolate text-center text-ink [--halo-inset:-2rem]"
          aria-live="polite"
          aria-atomic="true"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: flat ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: flat ? 0 : -6 }}
              transition={{ duration: flat ? 0.15 : 0.28, ease: "easeOut" }}
            >
              <p className="eyebrow text-balance">{current.highlight}</p>
              <h3 className="mt-2 text-balance text-2xl text-ink sm:text-3xl">
                {current.name}
              </h3>
              <p className="mt-2 text-balance text-sm leading-relaxed text-ink-soft">
                {current.blurb}
              </p>
              <dl className="mt-5 border-t border-line text-sm">
                <InfoRow label="Limandan (tahmini)" value={current.distanceFromHarbor} />
                <InfoRow label="Kalış süresi" value={current.stayDuration} />
                <InfoRow label="Hangi tur" value={current.tours} />
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Mount sonrası okunan, canlı güncellenen hareket azaltma tercihi */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
      <dt className="eyebrow min-w-0 text-left">{label}</dt>
      <dd className="shrink-0 text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
