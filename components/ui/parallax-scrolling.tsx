"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import "./parallax-scrolling.css";

/**
 * Kaydırmaya bağlı katmanlı parallax bölümü.
 *
 * Kaynak: Osmo (osmo.supply) parallax bileşeni — yapısı korundu, görselleri
 * ve metni AS Yachting markasına uyarlandı. Katman görselleri
 * `/public/placeholder/` altında; gerçek çekim gelince sadece o klasör değişir.
 *
 * Katmanlar CSS'te kendi yPercent değerleri kadar yukarıdan başlar; kaydırma
 * bittiğinde hepsi 0'a oturur ve sahne birleşir.
 */

export interface ParallaxScrollingProps {
  eyebrow?: string;
  title: string;
  caption?: string;
}

const LAYER_MOTION = [
  { layer: "1", yPercent: 70 },
  { layer: "2", yPercent: 55 },
  { layer: "3", yPercent: 40 },
  { layer: "4", yPercent: 10 },
];

export function ParallaxScrolling({
  eyebrow,
  title,
  caption,
}: ParallaxScrollingProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hareket azaltma tercihi varsa hiçbir şey kurulmuyor: ne GSAP, ne Lenis.
    // Katmanlar CSS tarafından son konumlarında duruyor.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector(
      "[data-parallax-layers]",
    );
    if (!triggerElement) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      LAYER_MOTION.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(
            `[data-parallax-layer="${layerObj.layer}"]`,
          ),
          { yPercent: layerObj.yPercent, ease: "none" },
          idx === 0 ? undefined : "<",
        );
      });
    }, parallaxRef);

    // Lenis yumuşak kaydırma. GSAP'in ticker'ına bağlanıyor ki iki ayrı
    // requestAnimationFrame döngüsü birbiriyle yarışmasın.
    const lenis = new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Ticker geri alınmazsa yok edilmiş Lenis örneği her karede
      // çağrılmaya devam eder — bileşen kaldırıldıktan sonra bile.
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP varsayılanı
      lenis.off("scroll", onScroll);
      lenis.destroy();
      // Yalnızca bu bileşenin oluşturdukları temizleniyor; sayfadaki başka
      // ScrollTrigger'lara dokunulmuyor.
      ctx.revert();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header" aria-label={title}>
        <div className="parallax__visuals">
          <div data-parallax-layers className="parallax__layers">
            <img
              src="/placeholder/parallax-layer-1.svg"
              loading="lazy"
              decoding="async"
              width={1600}
              height={900}
              data-parallax-layer="1"
              alt=""
              className="parallax__layer-img"
            />
            <img
              src="/placeholder/parallax-layer-2.svg"
              loading="lazy"
              decoding="async"
              width={1600}
              height={900}
              data-parallax-layer="2"
              alt=""
              className="parallax__layer-img"
            />
            <div data-parallax-layer="3" className="parallax__layer-title">
              <div className="parallax__card">
                {eyebrow && <p className="parallax__eyebrow">{eyebrow}</p>}
                <h2 className="parallax__title">{title}</h2>
                <span className="parallax__rule" aria-hidden />
                {caption && <p className="parallax__caption">{caption}</p>}
              </div>
            </div>
            <img
              src="/placeholder/parallax-layer-4.svg"
              loading="lazy"
              decoding="async"
              width={1600}
              height={900}
              data-parallax-layer="4"
              alt=""
              className="parallax__layer-img"
            />
          </div>
          <div className="parallax__fade" />
        </div>
      </section>
    </div>
  );
}
