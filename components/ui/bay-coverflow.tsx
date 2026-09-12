"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
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
 * dönüş ve onun rAF döngüsü. Dönüş artık framer-motion `animate` ile yalnızca
 * etkileşimde çalışır; boşta hiçbir döngü yok.
 *
 * Etkileşim: sağ/sol ok, yatay sürükleme (pointer events, touch-action
 * pan-y: dikey sayfa kaydırması tarayıcıda kalır), klavye ok tuşları, kart
 * ve nokta tıklaması. Bırakınca en yakın karta oturur (snap).
 *
 * Scroll yapısı: normal akışta bir blok. sticky yok, pin yok, Lenis'e
 * bağlanmıyor, sabit viewport yüksekliği yok.
 *
 * prefers-reduced-motion: perspektif ve derinlik kapalı, kartlar düz yatay
 * sırada; geçişler kısa ve doğrusal. Tercih mount SONRASI okunur: sunucu ve
 * ilk istemci render'ı aynı (3D) çıktıyı üretir, hidrasyon uyuşmazlığı olmaz
 * (framer'ın useReducedMotion'ı ilk render'da istemcide farklı değer veriyordu).
 */

const PERSPECTIVE = 1200;
const SPRING = {
  type: "spring",
  stiffness: 170,
  damping: 26,
  restDelta: 0.001,
} as const;
const FLAT_TWEEN = { duration: 0.25, ease: "easeOut" } as const;

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
  bay: Bay;
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
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-18px_rgb(0_51_87/0.45)] transition-shadow duration-300 group-hover:shadow-[0_22px_48px_-18px_rgb(0_51_87/0.55)]">
          <Image
            src={bay.image}
            alt={bay.name}
            fill
            draggable={false}
            // Öndeki kart 3D ölçekle büyümüyor (z=0), CSS ölçüsü yeterli.
            sizes="(min-width: 640px) 320px, 80vw"
            className="object-cover"
          />
          {/* Kart içi ad: yanlardaki kartlar altyazısız kalmasın */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-3 pt-10 sm:p-4">
            <p className="font-display text-base text-surface sm:text-lg">
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
  const flat = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);

  const total = bays.length;
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

  // --- Sürükleme (pointer events) ---
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0, // px/ms
  });
  const suppressClick = useRef(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    position.stop();
    const d = drag.current;
    d.active = true;
    d.moved = false;
    d.startX = e.clientX;
    d.startPos = position.get();
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    d.velocity = 0;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 4) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.velocity = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    // Bir kart genişliği kadar sürükleme ≈ bir kart ilerleme
    position.set(d.startPos - dx / (width * 0.9));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    // Kart tıklaması sürükleme sonunda tetiklenmesin
    suppressClick.current = true;
    setTimeout(() => (suppressClick.current = false), 0);

    const current = position.get();
    const nearest = Math.round(current);
    // Hızlı fırlatma bir sonraki karta taşır; en fazla bir kart ileri/geri
    const fling = Math.abs(d.velocity) > 0.35 ? (d.velocity > 0 ? -1 : 1) : 0;
    const target = clamp(
      fling !== 0 && Math.sign(current - nearest) === fling
        ? nearest + fling
        : nearest,
      Math.floor(d.startPos) - 1,
      Math.ceil(d.startPos) + 1,
    );
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
  const current = bays[active];

  return (
    <div className="relative">
      {/* Sahne: yatay taşma burada kesilir, sayfa yana kaymaz */}
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="kaydırmalı galeri"
        aria-label="Koylar"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
            {bays.map((bay, i) => (
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

        {/* Oklar */}
        <button
          type="button"
          onClick={() => stepBy(-1)}
          aria-label="Önceki koy"
          className="absolute left-2 top-1/2 z-50 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/85 text-ink backdrop-blur-sm transition-colors hover:border-accent sm:left-3 sm:size-11"
        >
          <ChevronIcon className="size-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => stepBy(1)}
          aria-label="Sonraki koy"
          className="absolute right-2 top-1/2 z-50 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/85 text-ink backdrop-blur-sm transition-colors hover:border-accent sm:right-3 sm:size-11"
        >
          <ChevronIcon className="size-4" />
        </button>
      </div>

      {/* Aktif koy bilgisi */}
      <div
        className="mx-auto mt-6 max-w-md sm:mt-8"
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
            <p className="eyebrow text-center">{current.highlight}</p>
            <h3 className="mt-2 text-center text-2xl sm:text-3xl">
              {current.name}
            </h3>
            <p className="mt-2 text-center text-sm leading-relaxed text-ink-soft">
              {current.blurb}
            </p>
            <dl className="mt-5 border-t border-line text-sm">
              <InfoRow label="Limandan uzaklık" value={current.distanceFromHarbor} />
              <InfoRow label="Koyda kalış" value={current.stayDuration} />
              <InfoRow label="Hangi turlarda" value={current.tours} />
            </dl>
          </motion.div>
        </AnimatePresence>

        {/* Noktalar */}
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Koy seç">
          {bays.map((bay, i) => (
            <button
              key={bay.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={bay.name}
              onClick={() => select(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-line hover:bg-ink-soft/50"
              }`}
            />
          ))}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
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
