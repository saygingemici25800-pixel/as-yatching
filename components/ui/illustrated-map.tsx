"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { COAST_PATHS, MAP_VIEW } from "@/components/ui/fethiye-coast";
import type { Bay, MapIcon, MapPoint } from "@/lib/types";

/**
 * İllüstratif Fethiye Körfezi haritası — "Nereden kalkıyoruz?" bölümü.
 *
 * Katmanlar: deniz (gradient + dalga deseni) → kara (OSM kıyı çizgisi,
 * kontur ve orman dokusu) → yer adları → marina bloğu → rota (noktalı) →
 * ada/koy rozetleri → gulet (GSAP MotionPath) → pusula/not → tooltip.
 *
 * Etkileşim: rozet hover/focus → tooltip; tıklama → #koy-<slug> hash'i ve
 * Rota bölümüne kaydırma (BayCoverflow hash'i okuyup koyu aktif yapar).
 *
 * Performans: rAF yalnızca GSAP tween'inde; bölüm görünmüyorken
 * IntersectionObserver ile durur. prefers-reduced-motion'da tekne limanda
 * sabit. Renkler globals.css @theme token'larından (sea/land/forest/deep…).
 */

gsap.registerPlugin(MotionPathPlugin);

const TOUR_SECONDS = 18;

/** Ana rota — liman → Şövalye → Kızılada → Yassıca → Tersane → Domuz → Göcek yönü (viewBox px, suda) */
const MAIN_ROUTE =
  "M548 262 L528 240 L526 224 L480 214 L446 206 L400 168 L300 122 L272 150 L266 190 L232 202 L232 150 L262 96 L286 52";
/** İkinci hat — Kızılada'dan ayrılıp İblis Burnu'nu dolaşarak Akvaryum → Gemiler → Ölüdeniz */
const SOUTH_ROUTE =
  "M446 206 L404 270 L392 340 L376 420 L410 432 L455 432 L492 428 L520 428 L552 420";

/** Karada hafif tepe konturları (merkez, yarıçap) */
const CONTOURS: [number, number, number][] = [
  [470, 330, 26],
  [640, 120, 34],
  [700, 320, 30],
  [120, 230, 28],
  [380, 40, 22],
  [560, 470, 24],
];
/** Orman lekeleri (açık zeytin yeşili) — merkez, rx, ry, döndürme */
const FORESTS: [number, number, number, number, number][] = [
  [455, 350, 30, 16, -20],
  [520, 330, 22, 12, 15],
  [620, 150, 40, 18, 10],
  [700, 250, 26, 14, -30],
  [130, 200, 34, 16, 25],
  [200, 300, 24, 12, 0],
  [420, 60, 28, 12, -10],
  [660, 440, 30, 14, 20],
];

const ICON_PATHS: Record<MapIcon, string> = {
  food: "M5 3v6a3 3 0 0 0 6 0V3M8 3v18M17 3c-2 0-3 3-3 6v2h3v10",
  snorkel:
    "M3 10a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM18 6v10a3 3 0 0 1-3 3",
  swim: "M3 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M5 12l5-5 4 3M17 9a1.5 1.5 0 1 0 0-.1",
  sunset: "M4 18h16M6 15a6 6 0 0 1 12 0M12 4v3M5 8l2 2M19 8l-2 2",
  photo: "M4 8h3l2-2h6l2 2h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
};
const ICON_MEANING: Record<MapIcon, string> = {
  food: "Yemek molası",
  snorkel: "Şnorkel / maske",
  swim: "Yüzme molası",
  sunset: "Gün batımı",
  photo: "Fotoğraf durağı",
};

export default function IllustratedMap({
  points,
  bays,
  harborLabel,
  className = "",
}: {
  points: MapPoint[];
  bays: Bay[];
  harborLabel: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const minutesOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of bays) map.set(b.slug, b.distanceFromHarbor);
    return (p: MapPoint) => {
      const m = p.minutes ?? map.get(p.slug);
      return m && m !== "—" && m !== "Kalkış noktası" ? m : "—";
    };
  }, [bays]);

  // --- Ölçü: dar kutuda etiketler küçülür, düşük öncelikliler gizlenir ---
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width < 520));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // --- Gulet: rota boyunca tur; görünmüyorken durur; reduced-motion'da sabit ---
  useEffect(() => {
    const boat = boatRef.current;
    const route = routeRef.current;
    const root = rootRef.current;
    if (!boat || !route || !root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Limanda sabit, rotanın ilk yönüne dönük
      gsap.set(boat, {
        motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 0.001 },
      });
      return;
    }

    const tween = gsap.to(boat, {
      duration: TOUR_SECONDS,
      ease: "none",
      repeat: -1,
      yoyo: true,
      motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], autoRotate: true },
      paused: true,
    });

    let inView = false;
    const sync = () => {
      if (inView && !document.hidden) tween.play();
      else tween.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      tween.kill();
    };
  }, []);

  const goToBay = (slug: string) => {
    window.location.hash = `#koy-${slug}`;
    document.getElementById("rota")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const visible = points.filter((p) => !compact || (p.priority ?? 1) === 1);
  const towns = visible.filter((p) => p.kind === "town");
  const harbor = points.find((p) => p.kind === "harbor");
  const badges = visible.filter((p) => p.icon);
  const dots = visible.filter((p) => !p.icon && (p.kind === "island" || p.kind === "bay"));
  const hovered = hover ? points.find((p) => p.slug === hover) : null;
  const labelSize = compact ? 10 : 11;

  return (
    <div
      ref={rootRef}
      className={`relative aspect-[4/3] overflow-hidden rounded-sm border border-line sm:aspect-[16/10] ${className}`}
    >
      <svg
        viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full select-none"
        role="img"
        aria-label="Fethiye Körfezi illüstratif haritası: liman, 12 Adalar ve tur durakları"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <defs>
          <linearGradient id="imap-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-sea)" />
            <stop offset="1" stopColor="var(--color-sea-deep)" />
          </linearGradient>
          <pattern id="imap-waves" width="28" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 8 Q3.5 4 7 8 T14 8" fill="none" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.45" />
          </pattern>
          <linearGradient id="imap-foam" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deniz */}
        <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#imap-sea)" />
        <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#imap-waves)" />

        {/* Kara (OSM kıyı çizgisi) */}
        <g fill="var(--color-land)" stroke="var(--color-land-edge)" strokeWidth="1" strokeLinejoin="round">
          {COAST_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* Orman lekeleri ve tepe konturları */}
        <g fill="var(--color-forest)" opacity="0.45">
          {FORESTS.map(([cx, cy, rx, ry, rot], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} />
          ))}
        </g>
        <g fill="none" stroke="var(--color-land-edge)" strokeWidth="0.8" opacity="0.7">
          {CONTOURS.map(([cx, cy, r], i) => (
            <g key={i}>
              <path d={`M${cx - r} ${cy + r * 0.3} Q${cx} ${cy - r * 0.9} ${cx + r} ${cy + r * 0.3}`} />
              <path d={`M${cx - r * 0.6} ${cy + r * 0.45} Q${cx} ${cy - r * 0.35} ${cx + r * 0.6} ${cy + r * 0.45}`} />
            </g>
          ))}
        </g>

        {/* Yer adları (kara) */}
        <g fill="var(--color-deep)" fontSize={labelSize} fontWeight={500}>
          {towns.map((p) => (
            <g key={p.slug} data-priority={p.priority ?? 1}>
              <rect x={p.x - 2} y={p.y - 2} width="4" height="4" fill="var(--color-deep)" opacity="0.7" />
              <text
                x={p.x + (p.labelDx ?? 8)}
                y={p.y + (p.labelDy ?? 4)}
                textAnchor={p.labelAnchor ?? "start"}
                paintOrder="stroke"
                stroke="var(--color-land)"
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {p.name}
              </text>
            </g>
          ))}
        </g>

        {/* Rotalar */}
        <path
          ref={routeRef}
          d={MAIN_ROUTE}
          fill="none"
          stroke="var(--color-deep)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d={SOUTH_ROUTE}
          fill="none"
          stroke="var(--color-deep)"
          strokeWidth="1.4"
          strokeDasharray="3 5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Marina bloğu: iskele + direk dizisi + etiket + altın bayrak */}
        {harbor && (
          <g>
            <rect x={harbor.x - 2} y={harbor.y - 1} width="26" height="3" rx="1" fill="var(--color-land-edge)" stroke="var(--color-deep)" strokeWidth="0.6" />
            {[4, 10, 16].map((dx) => (
              <g key={dx}>
                <line x1={harbor.x + dx} y1={harbor.y + 1} x2={harbor.x + dx} y2={harbor.y - 9} stroke="var(--color-deep)" strokeWidth="0.9" />
                <circle cx={harbor.x + dx} cy={harbor.y + 5} r="2.2" fill="none" stroke="var(--color-deep)" strokeWidth="0.8" />
              </g>
            ))}
            <line x1={harbor.x + 22} y1={harbor.y + 1} x2={harbor.x + 22} y2={harbor.y - 13} stroke="var(--color-deep)" strokeWidth="1" />
            <path d={`M${harbor.x + 22} ${harbor.y - 13} l8 2.5 -8 2.5z`} fill="var(--color-gold)" stroke="var(--color-gold-deep)" strokeWidth="0.5" />
            <text
              x={harbor.x + (harbor.labelDx ?? 8)}
              y={harbor.y + (harbor.labelDy ?? -14)}
              textAnchor={harbor.labelAnchor ?? "start"}
              fontSize={labelSize}
              fontWeight={600}
              fill="var(--color-deep)"
              paintOrder="stroke"
              stroke="var(--color-land)"
              strokeWidth="3"
              strokeLinejoin="round"
            >
              beton iskele · kalkış
            </text>
          </g>
        )}

        {/* Küçük noktalı ada/koy etiketleri */}
        <g fontSize={labelSize - 1} fill="var(--color-deep)">
          {dots.map((p) => (
            <g key={p.slug} data-priority={p.priority ?? 1}>
              <circle cx={p.x} cy={p.y} r="2.4" fill="var(--color-deep)" opacity="0.75" />
              <text
                x={p.x + (p.labelDx ?? 6)}
                y={p.y + (p.labelDy ?? 4)}
                textAnchor={p.labelAnchor ?? "start"}
                paintOrder="stroke"
                stroke="var(--color-sea)"
                strokeWidth="3"
                strokeLinejoin="round"
                opacity="0.9"
              >
                {p.name}
              </text>
            </g>
          ))}
        </g>

        {/* Gulet: iki direk, indirilmiş yelkenler, ahşap gövde, üst güverte + köpük izi */}
        <g ref={boatRef} aria-hidden>
          <path d="M-30 1 Q-22 5 -16 3 M-30 -1 Q-22 -6 -16 -3" fill="none" stroke="url(#imap-foam)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M-14 2 Q-11 7 -5 7 L9 7 Q14 7 14 2 L12 0 L-13 0 Z" fill="var(--color-deep)" />
          <rect x="-11" y="-1.6" width="22" height="2" rx="0.6" fill="var(--color-land)" />
          <rect x="-6" y="-3.4" width="9" height="2" rx="0.6" fill="var(--color-land-edge)" />
          <line x1="-3" y1="-1" x2="-3" y2="-14" stroke="var(--color-deep)" strokeWidth="1" />
          <line x1="6" y1="-1" x2="6" y2="-11" stroke="var(--color-deep)" strokeWidth="1" />
          <line x1="-3" y1="-13.5" x2="-13" y2="-1" stroke="var(--color-deep)" strokeWidth="0.5" />
          <rect x="-9" y="-4.6" width="10" height="1.8" rx="0.9" fill="#fff" stroke="var(--color-deep)" strokeWidth="0.4" />
          <rect x="2" y="-4.2" width="8" height="1.6" rx="0.8" fill="#fff" stroke="var(--color-deep)" strokeWidth="0.4" />
          <path d="M-3 -14 l5 1.5 -5 1.5z" fill="var(--color-gold)" />
        </g>

        {/* Rozetler: ada/koy durakları (ikon + ad + tahmini süre) */}
        {badges.map((p) => {
          const active = hover === p.slug;
          const lx = p.x + (p.labelDx ?? 0);
          const ly = p.y + (p.labelDy ?? 26);
          return (
            <g
              key={p.slug}
              data-priority={p.priority ?? 1}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} — ${ICON_MEANING[p.icon!]}, limandan ${minutesOf(p)}. Rota bölümünde göster.`}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setHover(p.slug)}
              onMouseLeave={() => setHover((h) => (h === p.slug ? null : h))}
              onFocus={() => setHover(p.slug)}
              onBlur={() => setHover((h) => (h === p.slug ? null : h))}
              onClick={() => goToBay(p.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goToBay(p.slug);
                }
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 12 : 10}
                fill="var(--color-surface)"
                stroke={active ? "var(--color-gold-deep)" : "var(--color-deep)"}
                strokeWidth={active ? 1.6 : 1}
              />
              <path
                d={ICON_PATHS[p.icon!]}
                transform={`translate(${p.x - 8} ${p.y - 8}) scale(0.6667)`}
                fill="none"
                stroke="var(--color-deep)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={lx}
                y={ly}
                textAnchor={p.labelAnchor ?? "middle"}
                fontSize={labelSize}
                fontWeight={600}
                fill="var(--color-deep)"
                paintOrder="stroke"
                stroke="var(--color-sea)"
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {p.name}
              </text>
              <text
                x={lx}
                y={ly + labelSize + 1}
                textAnchor={p.labelAnchor ?? "middle"}
                fontSize={labelSize - 1.5}
                fill="var(--color-deep)"
                opacity="0.8"
                paintOrder="stroke"
                stroke="var(--color-sea)"
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {minutesOf(p)}
              </text>
            </g>
          );
        })}

        {/* Pusula ve not */}
        <g transform={`translate(${MAP_VIEW.width - 34} ${MAP_VIEW.height - 34})`} fill="var(--color-deep)">
          <circle r="16" fill="var(--color-surface)" stroke="var(--color-deep)" strokeWidth="0.8" opacity="0.95" />
          <path d="M0 -12 L4 2 L0 0 L-4 2 Z" />
          <path d="M0 12 L4 -2 L0 0 L-4 -2 Z" opacity="0.3" />
          <text y="-3" x="0" fontSize="8" fontWeight={700} textAnchor="middle" dy="-10">
            K
          </text>
        </g>
        <text
          x="12"
          y={MAP_VIEW.height - 12}
          fontSize={compact ? 9 : 10}
          fill="var(--color-deep)"
          opacity="0.8"
          paintOrder="stroke"
          stroke="var(--color-sea)"
          strokeWidth="3"
        >
          Tahmini süreler · kıyı çizgisi © OpenStreetMap
        </text>

        {/* Tooltip */}
        {hovered && hovered.icon && (
          <g pointerEvents="none" transform={`translate(${Math.min(hovered.x + 14, MAP_VIEW.width - 160)} ${Math.max(hovered.y - 58, 8)})`}>
            <rect width="150" height="46" rx="4" fill="var(--color-surface)" stroke="var(--color-deep)" strokeWidth="0.8" />
            <text x="10" y="17" fontSize="11" fontWeight={600} fill="var(--color-deep)">
              {hovered.name}
            </text>
            <text x="10" y="31" fontSize="10" fill="var(--color-deep)" opacity="0.85">
              {ICON_MEANING[hovered.icon]} · limandan {minutesOf(hovered)}
            </text>
            <text x="10" y="41" fontSize="8.5" fill="var(--color-deep)" opacity="0.6">
              Tıkla: Rota bölümünde göster
            </text>
          </g>
        )}
      </svg>

      {/* Krem liman etiketi — sağ üstte (sağ alt pusula ve güney rozetleri için boş kalır) */}
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-sm border border-line bg-surface/95 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-deep backdrop-blur-sm">
        {harborLabel}
      </span>
    </div>
  );
}
