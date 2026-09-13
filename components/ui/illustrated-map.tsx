"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { COAST_PATHS, MAP_VIEW } from "@/components/ui/fethiye-coast";
import type { Bay, MapIcon, MapPoint, TourRoute } from "@/lib/types";

/**
 * İllüstratif Fethiye Körfezi haritası — "Nereden kalkıyoruz?" bölümü.
 *
 * İki SVG katmanı, aynı viewBox:
 *  - Taban (statik): iki tonlu deniz (kıyı bandı + açık deniz, blur'lu geçiş),
 *    lagün, kara (OSM kıyı çizgisi, <defs>'te bir kez, <use> ile üç yerde),
 *    kontur/orman dokusu, yer adları ve kara ikonları (Babadağ, Kayaköy
 *    harabesi, amfitiyatro, Çalış plajı), rotalar (seçili vurgulu), numaralı
 *    duraklar, segment süreleri, şamandıra/demir, dekor tekneler ve martılar.
 *  - Üst (animasyonlu, pointer-events yok): gulet (GSAP MotionPath, seçili
 *    rota), köpük izi, yamaç paraşütü. Statik katman böylece her karede
 *    yeniden rasterize edilmez.
 *
 * Etkileşim: durak/ada rozetine hover → HTML kart (thumb, ad, süre, ikon
 * anlamı, "Bu turda"); tıklama/Enter kartı açar; karttaki "Rota'da göster"
 * #koy-<slug> hash'i ile BayCoverflow'a gider. Tur seçici (3 sekme) rotayı
 * vurgular ve guletin hedef rotasını değiştirir. Lejant mobilde
 * açılır-kapanır. Görünmüyorken animasyon durur; reduced-motion'da sabit.
 */

gsap.registerPlugin(MotionPathPlugin);

const TOUR_SECONDS = 18;
const HARBOR = "fethiye-limani";

/** Rota bacakları için sudaki ara noktalar (viewBox px). Ters yön otomatik. */
const LEGS: Record<string, [number, number][]> = {
  "fethiye-limani>sovalye": [[528, 240], [532, 226]],
  "fethiye-limani>kizilada": [[528, 240], [526, 224], [480, 214]],
  "sovalye>kizilada": [[500, 214], [480, 214]],
  "kizilada>akvaryum-koyu": [[404, 270], [392, 340], [376, 420], [410, 432]],
  "akvaryum-koyu>yassica": [[410, 432], [376, 420], [392, 340], [404, 270], [400, 168], [300, 122]],
  "fethiye-limani>yassica": [[528, 240], [526, 224], [480, 214], [446, 206], [400, 168], [300, 122]],
  "yassica>oludeniz": [[300, 122], [400, 168], [446, 206], [404, 270], [392, 340], [376, 420], [410, 432], [455, 432], [492, 428], [520, 428]],
  "oludeniz>kelebekler-vadisi": [[562, 440], [568, 470]],
};
/** Rozet noktasından su tarafına kaydırma (tekne durağı) */
const DOCK: Record<string, [number, number]> = {
  "fethiye-limani": [0, 3],
  kizilada: [0, 12],
  sovalye: [-2, 12],
  yassica: [8, 8],
  "akvaryum-koyu": [0, 16],
  oludeniz: [-10, 18],
  "kelebekler-vadisi": [0, 10],
};

/** Karada tepe konturları (merkez, yarıçap, seviye sayısı) */
const CONTOURS: [number, number, number, number][] = [
  [470, 330, 28, 3],
  [640, 120, 36, 4],
  [700, 320, 32, 3],
  [120, 230, 30, 3],
  [380, 40, 24, 3],
  [560, 470, 26, 3],
  [668, 417, 34, 4], // Babadağ
  [200, 300, 22, 2],
  [720, 200, 24, 3],
];
/** Orman lekeleri — merkez, rx, ry, döndürme */
const FORESTS: [number, number, number, number, number][] = [
  [455, 350, 30, 16, -20],
  [520, 330, 22, 12, 15],
  [620, 150, 40, 18, 10],
  [700, 250, 26, 14, -30],
  [130, 200, 34, 16, 25],
  [200, 300, 24, 12, 0],
  [420, 60, 28, 12, -10],
  [660, 440, 30, 14, 20],
  [600, 80, 24, 10, 30],
  [740, 380, 22, 12, -15],
  [80, 280, 20, 10, 10],
  [560, 340, 18, 9, -25],
  [640, 470, 26, 10, 12],
];
/** Dekor: uzakta sabit yelkenliler ve martılar (hepsi suda) */
const DECOR_BOATS: [number, number][] = [[140, 430], [330, 300], [420, 470]];
const GULLS: [number, number][] = [[360, 240], [255, 62]];
const BABADAG: [number, number] = [668, 417];
const CALIS_BEACH = "M546 158 Q542 178 540 200";
const LAGOON: [number, number, number, number] = [548, 398, 13, 7];

const ICON_PATHS: Record<MapIcon, string> = {
  food: "M5 3v6a3 3 0 0 0 6 0V3M8 3v18M17 3c-2 0-3 3-3 6v2h3v10",
  snorkel: "M3 10a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM18 6v10a3 3 0 0 1-3 3",
  swim: "M3 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M5 12l5-5 4 3M17 9a1.5 1.5 0 1 0 0-.1",
  sunset: "M4 18h16M6 15a6 6 0 0 1 12 0M12 4v3M5 8l2 2M19 8l-2 2",
  photo: "M4 8h3l2-2h6l2 2h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
};
/** Rozet anlamı → messages/*.json `map` anahtarı */
const ICON_KEY: Record<MapIcon, string> = {
  food: "iconFood",
  snorkel: "iconSnorkel",
  swim: "iconSwim",
  sunset: "iconSunset",
  photo: "iconPhoto",
};
const ICON_ORDER: MapIcon[] = ["food", "snorkel", "swim", "sunset", "photo"];

const parseMinutes = (v?: string) => {
  const m = v ? /(\d+)/.exec(v) : null;
  return m ? Number(m[1]) : null;
};

function IconPath({ icon, x, y, size = 16, color = "var(--color-deep)" }: { icon: MapIcon; x: number; y: number; size?: number; color?: string }) {
  const s = size / 24;
  return (
    <path
      d={ICON_PATHS[icon]}
      transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

interface LegGeom {
  from: string;
  to: string;
  mid: [number, number];
  minutes: number | null;
}

export default function IllustratedMap({
  points,
  bays,
  routes,
  harborLabel,
  className = "",
}: {
  points: MapPoint[];
  bays: Bay[];
  routes: TourRoute[];
  harborLabel: string;
  className?: string;
}) {
  const t = useTranslations("map");
  const meaning = (icon: MapIcon) => t(ICON_KEY[icon]);
  const rootRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<SVGGElement>(null);
  const gliderRef = useRef<SVGGElement>(null);
  const routeRefs = useRef<Record<string, SVGPathElement | null>>({});
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const inViewRef = useRef(false);
  const reducedRef = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [activeRoute, setActiveRoute] = useState(routes[0]?.slug ?? "");
  const [card, setCard] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const compact = size.w > 0 && size.w < 520;

  const byId = useMemo(() => new Map(points.map((p) => [p.slug, p])), [points]);
  const minutes = useMemo(() => {
    const m = new Map<string, number>();
    m.set(HARBOR, 0);
    for (const b of bays) {
      const v = parseMinutes(b.distanceFromHarbor);
      if (v !== null) m.set(b.slug, v);
    }
    return m;
  }, [bays]);
  const minutesLabel = (slug: string) => (minutes.has(slug) && slug !== HARBOR ? t("minutes", { n: minutes.get(slug)! }) : "—");
  const toursOf = (slug: string) => routes.filter((r) => r.stops.includes(slug)).map((r) => r.name);

  // --- Rota geometrisi: durak → durak, sudaki ara noktalarla ---
  const routeGeometry = useMemo(() => {
    const dockOf = (slug: string): [number, number] | null => {
      const p = byId.get(slug);
      if (!p) return null;
      const [dx, dy] = DOCK[slug] ?? [0, 0];
      return [p.x + dx, p.y + dy];
    };
    const legPoints = (a: string, b: string): [number, number][] => {
      const pa = dockOf(a);
      const pb = dockOf(b);
      if (!pa || !pb) return [];
      const fwd = LEGS[`${a}>${b}`];
      const rev = LEGS[`${b}>${a}`];
      const mid = fwd ?? (rev ? [...rev].reverse() : []);
      return [pa, ...mid, pb];
    };
    return routes.map((r) => {
      const pts: [number, number][] = [];
      const legs: LegGeom[] = [];
      for (let i = 0; i < r.stops.length - 1; i++) {
        const lp = legPoints(r.stops[i], r.stops[i + 1]);
        if (lp.length < 2) continue;
        if (pts.length === 0) pts.push(lp[0]);
        pts.push(...lp.slice(1));
        // Bacak orta noktası (polyline uzunluğuna göre)
        let total = 0;
        const seg: number[] = [];
        for (let k = 0; k < lp.length - 1; k++) {
          const d = Math.hypot(lp[k + 1][0] - lp[k][0], lp[k + 1][1] - lp[k][1]);
          seg.push(d);
          total += d;
        }
        let acc = 0;
        let mid: [number, number] = lp[0];
        for (let k = 0; k < seg.length; k++) {
          if (acc + seg[k] >= total / 2) {
            const t = (total / 2 - acc) / (seg[k] || 1);
            mid = [lp[k][0] + (lp[k + 1][0] - lp[k][0]) * t, lp[k][1] + (lp[k + 1][1] - lp[k][1]) * t];
            break;
          }
          acc += seg[k];
        }
        const ma = minutes.get(r.stops[i]);
        const mb = minutes.get(r.stops[i + 1]);
        legs.push({ from: r.stops[i], to: r.stops[i + 1], mid, minutes: ma !== undefined && mb !== undefined ? Math.abs(mb - ma) : null });
      }
      const d = pts.length ? `M${pts.map(([x, y]) => `${x} ${y}`).join(" L")}` : "";
      const numbered = r.stops.filter((s) => s !== HARBOR);
      return { route: r, d, legs, numbered };
    });
  }, [routes, byId, minutes]);
  const active = routeGeometry.find((g) => g.route.slug === activeRoute) ?? routeGeometry[0];

  // --- Ölçü ---
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // viewBox → kutu px (preserveAspectRatio: xMidYMid slice)
  const toPx = useCallback(
    (x: number, y: number) => {
      const scale = Math.max(size.w / MAP_VIEW.width, size.h / MAP_VIEW.height) || 1;
      const ox = (size.w - MAP_VIEW.width * scale) / 2;
      const oy = (size.h - MAP_VIEW.height * scale) / 2;
      return { left: x * scale + ox, top: y * scale + oy };
    },
    [size],
  );

  // --- Görünürlük: görünmüyorken / sekme gizliyken animasyon durur ---
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;
    if (!root) return;
    const sync = () => {
      const t = tweenRef.current;
      if (!t) return;
      if (inViewRef.current && !document.hidden) t.play();
      else t.pause();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // --- Gulet: seçili rotayı izler; rota değişince mevcut konumdan yumuşak geçiş ---
  useEffect(() => {
    const boat = boatRef.current;
    const path = routeRefs.current[activeRoute];
    if (!boat || !path) return;
    tweenRef.current?.kill();
    tweenRef.current = null;
    const mp = { path, align: path, alignOrigin: [0.5, 0.5] as [number, number], autoRotate: true };
    if (reducedRef.current) {
      gsap.set(boat, { motionPath: { ...mp, start: 0, end: 0.001 } });
      return;
    }
    const intro = gsap.to(boat, { duration: 0.8, ease: "power2.inOut", motionPath: { ...mp, start: 0, end: 0.001 } });
    intro.then(() => {
      const tween = gsap.to(boat, { duration: TOUR_SECONDS, ease: "none", repeat: -1, yoyo: true, motionPath: mp, paused: true });
      tweenRef.current = tween;
      if (inViewRef.current && !document.hidden) tween.play();
    });
    return () => {
      intro.kill();
    };
  }, [activeRoute]);

  // --- Yamaç paraşütü: çok yavaş sağa-sola (20 sn'lik gidiş-dönüş) ---
  useEffect(() => {
    const g = gliderRef.current;
    if (!g || reducedRef.current) return;
    const t = gsap.to(g, { x: 26, duration: 10, ease: "sine.inOut", repeat: -1, yoyo: true });
    return () => {
      t.kill();
    };
  }, []);

  const goToBay = (slug: string) => {
    window.location.hash = `#koy-${slug}`;
    document.getElementById("rota")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Kart dışına dokununca kapan
  useEffect(() => {
    if (!card) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setCard(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [card]);

  const visible = points.filter((p) => !compact || (p.priority ?? 1) === 1);
  const towns = visible.filter((p) => p.kind === "town");
  const harbor = byId.get(HARBOR);
  const badges = visible.filter((p) => p.icon);
  const dots = visible.filter((p) => !p.icon && (p.kind === "island" || p.kind === "bay"));
  const labelSize = compact ? 10 : 11;
  const kayakoy = byId.get("kayakoy");
  const fethiye = byId.get("fethiye");
  const kelebekler = byId.get("kelebekler-vadisi");

  const cardPoint = card ? byId.get(card) : null;
  const cardBay = card ? bays.find((b) => b.slug === card) : null;
  const cardPos = cardPoint ? toPx(cardPoint.x, cardPoint.y) : null;
  const cardW = 224;
  const cardLeft = cardPos ? Math.min(Math.max(cardPos.left - cardW / 2, 8), Math.max(8, size.w - cardW - 8)) : 0;
  const cardAbove = cardPos ? cardPos.top > size.h * 0.55 : false;

  return (
    <div className={`relative ${className}`}>
      {/* Tur seçici */}
      <div role="tablist" aria-label={t("tabsLabel")} className="mb-3 inline-flex rounded-sm border border-line bg-surface p-1">
        {routes.map((r) => (
          <button
            key={r.slug}
            type="button"
            role="tab"
            aria-selected={r.slug === activeRoute}
            onClick={() => setActiveRoute(r.slug)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              r.slug === activeRoute ? "bg-navy text-cream" : "text-deep hover:bg-surface-2"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div ref={rootRef} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line sm:aspect-[16/10]">
        {/* ---------- Taban SVG (statik) ---------- */}
        <svg
          viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full select-none"
          role="img"
          aria-label={t("ariaLabel")}
          style={{ fontFamily: "var(--font-body)" }}
        >
          <defs>
            {COAST_PATHS.map((d, i) => (
              <path key={i} id={`coast-${i}`} d={d} />
            ))}
            <pattern id="imap-waves" width="28" height="14" patternUnits="userSpaceOnUse">
              <path d="M0 8 Q3.5 4 7 8 T14 8" fill="none" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.35" />
            </pattern>
            <filter id="imap-soft" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            {/* Su maskesi: kara siyah → yalnızca suda görünür */}
            <mask id="imap-water">
              <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="#fff" />
              <g fill="#000">
                {COAST_PATHS.map((_, i) => (
                  <use key={i} href={`#coast-${i}`} />
                ))}
              </g>
            </mask>
          </defs>

          {/* Deniz: açık deniz + kıyı bandı (~1.2 km, blur'lu geçiş) + lagün */}
          <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="#7fbfdb" />
          <g mask="url(#imap-water)">
            <g filter="url(#imap-soft)" fill="none" stroke="#cfe9f2" strokeWidth="40" strokeLinejoin="round">
              {COAST_PATHS.map((_, i) => (
                <use key={i} href={`#coast-${i}`} />
              ))}
            </g>
            <ellipse cx={LAGOON[0]} cy={LAGOON[1]} rx={LAGOON[2]} ry={LAGOON[3]} fill="var(--color-sky)" />
          </g>
          <rect width={MAP_VIEW.width} height={MAP_VIEW.height} fill="url(#imap-waves)" />

          {/* Kara */}
          <g fill="var(--color-land)" stroke="var(--color-land-edge)" strokeWidth="1" strokeLinejoin="round">
            {COAST_PATHS.map((_, i) => (
              <use key={i} href={`#coast-${i}`} />
            ))}
          </g>
          {/* Çalış plaj şeridi */}
          <path d={CALIS_BEACH} fill="none" stroke="#f3dfb0" strokeWidth="3" strokeLinecap="round" />
          {/* Orman lekeleri ve konturlar */}
          <g fill="var(--color-forest)" opacity="0.5">
            {FORESTS.map(([cx, cy, rx, ry, rot], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} />
            ))}
          </g>
          <g fill="none" stroke="var(--color-land-edge)" strokeWidth="0.8" opacity="0.4">
            {CONTOURS.map(([cx, cy, r, n], i) => (
              <g key={i}>
                {Array.from({ length: n }, (_, k) => {
                  const rr = r * (1 - k * 0.28);
                  return <path key={k} d={`M${cx - rr} ${cy + rr * 0.35} Q${cx} ${cy - rr * 0.9} ${cx + rr} ${cy + rr * 0.35}`} />;
                })}
              </g>
            ))}
          </g>

          {/* Kara ikonları */}
          <g fill="none" stroke="var(--color-deep)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d={`M${BABADAG[0] - 9} ${BABADAG[1] + 4} L${BABADAG[0]} ${BABADAG[1] - 8} L${BABADAG[0] + 9} ${BABADAG[1] + 4} Z`} fill="var(--color-land-edge)" />
            <path d={`M${BABADAG[0] - 3} ${BABADAG[1] - 4} L${BABADAG[0]} ${BABADAG[1] - 8} L${BABADAG[0] + 3} ${BABADAG[1] - 4}`} stroke="#fff" />
            {kayakoy && (
              <g transform={`translate(${kayakoy.x - 14} ${kayakoy.y - 4})`}>
                <path d="M0 8 V2 h5 V8 M9 8 V0 h6 v3 h-3 v5" />
                <path d="M-2 8 h19" />
              </g>
            )}
            {fethiye && (
              <g transform={`translate(${fethiye.x - 22} ${fethiye.y + 4})`}>
                <path d="M0 8 A8 8 0 0 1 16 8 M2 8 A6 6 0 0 1 14 8 M4 8 A4 4 0 0 1 12 8 M0 8 h16" />
              </g>
            )}
            {kelebekler && (
              <g transform={`translate(${kelebekler.x + 14} ${kelebekler.y - 12})`} stroke="var(--color-sea-deep)">
                <path d="M2 0 v10 M5 0 v12 M8 0 v10 M0 12 q2.5 -2 5 0 t5 0" />
              </g>
            )}
          </g>
          <text x={BABADAG[0] + 12} y={BABADAG[1] + 2} fontSize={labelSize - 1} fill="var(--color-deep)" paintOrder="stroke" stroke="var(--color-land)" strokeWidth="3" strokeLinejoin="round" data-priority="1">
            Babadağ · 1969 m
          </text>

          {/* Yer adları */}
          <g fill="var(--color-deep)" fontSize={labelSize} fontWeight={500}>
            {towns.map((p) => (
              <g key={p.slug} data-priority={p.priority ?? 1}>
                <rect x={p.x - 2} y={p.y - 2} width="4" height="4" fill="var(--color-deep)" opacity="0.7" />
                <text x={p.x + (p.labelDx ?? 8)} y={p.y + (p.labelDy ?? 4)} textAnchor={p.labelAnchor ?? "start"} paintOrder="stroke" stroke="var(--color-land)" strokeWidth="3" strokeLinejoin="round">
                  {p.name}
                </text>
              </g>
            ))}
            {!compact && (
              <text x={LAGOON[0]} y={LAGOON[1] - 10} textAnchor="middle" fontSize={labelSize - 2} fontStyle="italic" paintOrder="stroke" stroke="var(--color-sky)" strokeWidth="3" data-priority="2">
                Mavi Lagün
              </text>
            )}
          </g>

          {/* Dekor: uzak yelkenliler ve martılar */}
          <g opacity="0.6" fill="var(--color-deep)">
            {DECOR_BOATS.map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(0.8)`}>
                <path d="M-7 3 h14 l-2 3 h-10 z" />
                <path d="M0 -10 L0 2 L6 2 Z" opacity="0.9" />
                <path d="M-1 -7 L-1 2 L-6 2 Z" opacity="0.7" />
              </g>
            ))}
          </g>
          <g fill="none" stroke="var(--color-deep)" strokeWidth="1" strokeLinecap="round" opacity="0.7">
            {GULLS.map(([x, y], i) => (
              <path key={i} d={`M${x - 5} ${y} q2.5 -3 5 0 q2.5 -3 5 0`} />
            ))}
          </g>

          {/* Rotalar: seçili vurgulu, diğerleri soluk */}
          {routeGeometry.map((g) => (
            <path
              key={g.route.slug}
              d={g.d}
              fill="none"
              stroke="var(--color-deep)"
              strokeWidth={g.route.slug === activeRoute ? 1.8 : 1.2}
              strokeDasharray="3 5"
              strokeLinecap="round"
              opacity={g.route.slug === activeRoute ? 0.7 : 0.25}
              style={{ transition: "opacity 0.3s" }}
            />
          ))}
          {/* Segment süreleri (seçili rota; veri yoksa gösterilmez) */}
          {!compact &&
            active?.legs.map((leg, i) =>
              leg.minutes !== null && leg.minutes > 0 ? (
                <g key={i} data-priority="2">
                  <rect x={leg.mid[0] - 17} y={leg.mid[1] - 7} width="34" height="12" rx="6" fill="var(--color-surface)" stroke="var(--color-deep)" strokeWidth="0.5" opacity="0.95" />
                  <text x={leg.mid[0]} y={leg.mid[1] + 2.5} textAnchor="middle" fontSize="8" fontWeight={600} fill="var(--color-deep)">
                    {t("minutes", { n: leg.minutes })}
                  </text>
                </g>
              ) : null,
            )}

          {/* Marina bloğu */}
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
              <text x={harbor.x + (harbor.labelDx ?? 8)} y={harbor.y + (harbor.labelDy ?? -14)} textAnchor={harbor.labelAnchor ?? "start"} fontSize={labelSize} fontWeight={600} fill="var(--color-deep)" paintOrder="stroke" stroke="var(--color-land)" strokeWidth="3" strokeLinejoin="round">
                beton iskele · kalkış
              </text>
            </g>
          )}

          {/* Noktalı ada/koy etiketleri */}
          <g fontSize={labelSize - 1} fill="var(--color-deep)">
            {dots.map((p) => (
              <g key={p.slug} data-priority={p.priority ?? 1}>
                <circle cx={p.x} cy={p.y} r="2.4" fill="var(--color-deep)" opacity="0.75" />
                <text x={p.x + (p.labelDx ?? 6)} y={p.y + (p.labelDy ?? 4)} textAnchor={p.labelAnchor ?? "start"} paintOrder="stroke" stroke="var(--color-sea)" strokeWidth="3" strokeLinejoin="round" opacity="0.9">
                  {p.name}
                </text>
              </g>
            ))}
          </g>

          {/* Rozetler: durak/ada (ikon + ad + süre + durak numarası + şamandıra/demir) */}
          {badges.map((p) => {
            const isCard = card === p.slug;
            const lx = p.x + (p.labelDx ?? 0);
            const ly = p.y + (p.labelDy ?? 26);
            const stopNo = active ? active.numbered.indexOf(p.slug) : -1;
            const anchorSpot = p.icon === "swim" || p.icon === "food" || p.icon === "snorkel";
            return (
              <g
                key={p.slug}
                data-priority={p.priority ?? 1}
                role="button"
                tabIndex={0}
                aria-label={t("pointAria", { name: p.name, meaning: meaning(p.icon!), minutes: minutesLabel(p.slug) })}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setCard(p.slug)}
                onMouseLeave={() => setCard((c) => (c === p.slug ? null : c))}
                onFocus={() => setCard(p.slug)}
                onClick={(e) => {
                  e.stopPropagation();
                  setCard(p.slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCard(p.slug);
                  }
                }}
              >
                {anchorSpot && (
                  <g>
                    <circle cx={p.x + 15} cy={p.y + 9} r="3" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="1" />
                    <line x1={p.x + 15} y1={p.y + 6} x2={p.x + 15} y2={p.y + 2} stroke="var(--color-deep)" strokeWidth="0.8" />
                    <g transform={`translate(${p.x - 18} ${p.y + 6})`} fill="none" stroke="var(--color-deep)" strokeWidth="1" strokeLinecap="round">
                      <circle cx="0" cy="-3" r="1.2" />
                      <path d="M0 -1.8 v7 M-3 0 h6 M-4 3 q4 4 8 0" />
                    </g>
                  </g>
                )}
                <circle cx={p.x} cy={p.y} r={isCard ? 12 : 10} fill="var(--color-surface)" stroke={isCard ? "var(--color-gold-deep)" : "var(--color-deep)"} strokeWidth={isCard ? 1.6 : 1} />
                <IconPath icon={p.icon!} x={p.x} y={p.y} />
                {stopNo >= 0 && (
                  <g>
                    <circle cx={p.x + 10} cy={p.y - 10} r="7" fill="var(--color-surface)" stroke="var(--color-navy)" strokeWidth="1" />
                    <text x={p.x + 10} y={p.y - 6.5} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--color-navy)">
                      {stopNo + 1}
                    </text>
                  </g>
                )}
                <text x={lx} y={ly} textAnchor={p.labelAnchor ?? "middle"} fontSize={labelSize} fontWeight={600} fill="var(--color-deep)" paintOrder="stroke" stroke="var(--color-sea)" strokeWidth="3" strokeLinejoin="round">
                  {p.name}
                </text>
                <text x={lx} y={ly + labelSize + 1} textAnchor={p.labelAnchor ?? "middle"} fontSize={labelSize - 1.5} fill="var(--color-deep)" opacity="0.8" paintOrder="stroke" stroke="var(--color-sea)" strokeWidth="3" strokeLinejoin="round">
                  {minutesLabel(p.slug)}
                </text>
              </g>
            );
          })}

          {/* Pusula ve not */}
          <g transform={`translate(${MAP_VIEW.width - 34} ${MAP_VIEW.height - 34})`} fill="var(--color-deep)">
            <circle r="16" fill="var(--color-surface)" stroke="var(--color-deep)" strokeWidth="0.8" opacity="0.95" />
            <path d="M0 -12 L4 2 L0 0 L-4 2 Z" />
            <path d="M0 12 L4 -2 L0 0 L-4 -2 Z" opacity="0.3" />
            <text x="0" y="-13" fontSize="8" fontWeight={700} textAnchor="middle">
              {t("compassNorth")}
            </text>
          </g>
          <text x="12" y={MAP_VIEW.height - 12} fontSize={compact ? 9 : 10} fill="var(--color-deep)" opacity="0.8" paintOrder="stroke" stroke="var(--color-sea)" strokeWidth="3">
            {t("credit")}
          </text>
        </svg>

        {/* ---------- Üst SVG (animasyon; dokunmayı geçirir) ---------- */}
        <svg viewBox={`0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`} preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="imap-foam" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Hizalama için görünmez rota kopyaları */}
          {routeGeometry.map((g) => (
            <path
              key={g.route.slug}
              ref={(el) => {
                routeRefs.current[g.route.slug] = el;
              }}
              d={g.d}
              fill="none"
              stroke="none"
            />
          ))}
          {/* Yamaç paraşütü: Ölüdeniz üstünde */}
          <g ref={gliderRef}>
            <g transform="translate(600 372)" fill="none" stroke="var(--color-deep)" strokeWidth="1" strokeLinecap="round">
              <path d="M-10 0 Q0 -7 10 0" stroke="var(--color-accent)" strokeWidth="2.2" />
              <path d="M-8 0 L0 8 L8 0" strokeWidth="0.6" />
              <circle cx="0" cy="9" r="1.6" fill="var(--color-deep)" stroke="none" />
            </g>
          </g>
          {/* Gulet + köpük izi */}
          <g ref={boatRef} data-boat>
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
        </svg>

        {/* Krem liman etiketi */}
        <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-sm border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-deep">
          {harborLabel}
        </span>

        {/* Lejant (mobilde açılır-kapanır) */}
        <div className="absolute bottom-3 left-3 z-10">
          {compact && (
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              aria-expanded={legendOpen}
              className="rounded-sm border border-line bg-surface px-2.5 py-1 text-[0.6875rem] font-medium text-deep"
            >
              {legendOpen ? t("legendClose") : t("legend")}
            </button>
          )}
          {(!compact || legendOpen) && (
            <ul className="mt-1 rounded-sm border border-line bg-surface/95 px-2.5 py-2 text-[0.6875rem] text-deep">
              {ICON_ORDER.map((icon) => (
                <li key={icon} className="flex items-center gap-2 py-0.5">
                  <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden>
                    <IconPath icon={icon} x={8} y={8} size={14} />
                  </svg>
                  {meaning(icon)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hover/tıklama kartı (HTML, SVG dışında; kutu içinde kalır) */}
        {cardPoint && cardPos && (
          <div
            role="dialog"
            aria-label={cardPoint.name}
            className="absolute z-20 rounded-sm border border-line bg-surface p-2 text-deep shadow-sm"
            style={{
              width: cardW,
              left: cardLeft,
              top: cardAbove ? Math.max(8, cardPos.top - 16) : Math.min(cardPos.top + 16, size.h - 8),
              transform: cardAbove ? "translateY(-100%)" : undefined,
            }}
            onMouseEnter={() => setCard(cardPoint.slug)}
            onMouseLeave={() => setCard(null)}
          >
            <div className="flex gap-2">
              {cardBay?.imageThumb && <Image src={cardBay.imageThumb} alt={cardPoint.name} width={96} height={64} className="h-16 w-24 shrink-0 rounded-sm object-cover" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{cardPoint.name}</p>
                <p className="text-xs opacity-80">
                  {cardPoint.icon ? meaning(cardPoint.icon) : ""} · {t("fromHarbour", { value: minutesLabel(cardPoint.slug) })}
                </p>
                {toursOf(cardPoint.slug).length > 0 && <p className="mt-0.5 text-xs opacity-80">{t("inThisTour", { tours: toursOf(cardPoint.slug).join(" · ") })}</p>}
              </div>
            </div>
            {cardBay && (
              <button type="button" onClick={() => goToBay(cardPoint.slug)} className="mt-2 w-full rounded-sm bg-navy px-2 py-1.5 text-xs font-medium text-cream hover:opacity-90">
                {t("showInRoute")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
