"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteAudio } from "@/components/SiteAudioProvider";
import "./VideoHero.css";

/**
 * Tam ekran video hero.
 *
 * Davranış:
 *  - Bölüm 175svh yüksekliğinde bir "koşu alanı"; içindeki sahne `sticky`
 *    olduğu için video ilk ekranda sabit durur.
 *  - Kaydırma ilerledikçe (GSAP ScrollTrigger, scrub) video hafifçe yaklaşır,
 *    karartma artar, metin yukarı süzülüp kaybolur; en sonda sahne kenarlardan
 *    daralıp çerçeveye oturur ve bir sonraki bölüm üstüne akar.
 *  - Video sessiz ve otomatik oynar (tarayıcı kuralı). Ses site geneli
 *    (SiteAudioProvider); buradaki buton onu açar, sayfa değişse de çalar.
 *  - Hareket azaltma tercihi ya da veri tasarrufu açıksa video hiç yüklenmez,
 *    poster görseli kalır.
 *
 * Dosyalar: /public/hero/hero.mp4, hero-poster.jpg, sea.mp3
 */

const VIDEO_SRC = "/hero/hero.mp4";
const POSTER_SRC = "/hero/hero-poster.jpg";

export default function VideoHero({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  const [motionOk, setMotionOk] = useState(false);
  const { on: soundOn, toggle: toggleSound, setHeroVisible } = useSiteAudio();

  // Video yalnızca istemcide, tercihler okunduktan sonra yükleniyor.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    const saveData = nav.connection?.saveData === true;
    setMotionOk(!reduced && !saveData);
  }, []);

  // Kaydırma animasyonu
  useEffect(() => {
    if (!motionOk || !rootRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          fastScrollEnd: true,
        },
      });

      tl.to(".vhero__media", { scale: 1.12, ease: "none" }, 0)
        .to(".vhero__shade", { opacity: 1, ease: "none" }, 0)
        .to(
          ".vhero__content",
          { yPercent: -18, opacity: 0, ease: "power1.in", duration: 0.55 },
          0,
        )
        .to(".vhero__hint", { opacity: 0, duration: 0.2 }, 0)
        .to(
          ".vhero__frame",
          {
            clipPath: "inset(6% 4% 10% 4% round 4px)",
            ease: "power1.inOut",
            duration: 0.45,
          },
          0.55,
        );
    }, rootRef);

    return () => ctx.revert();
  }, [motionOk]);

  // Hero görünürken layout'taki ses rozeti gizlenir; dalga zemini de
  // (components/ui/wavy.tsx) aynı sinyalle duraklar — hero video opak,
  // altındaki canvas boşuna çizmesin.
  useEffect(() => {
    if (!rootRef.current) return;
    const emit = (visible: boolean) => {
      setHeroVisible(visible);
      window.dispatchEvent(new CustomEvent("as:hero-visible", { detail: visible }));
    };
    const io = new IntersectionObserver(
      ([entry]) => emit(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      emit(false);
    };
  }, [setHeroVisible]);

  return (
    <section ref={rootRef} className="vhero" aria-label="Tanıtım">
      <div className="vhero__stage">
        <div className="vhero__frame">
          {motionOk ? (
            <video
              className="vhero__media"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="vhero__media"
              src={POSTER_SRC}
              alt=""
              width={720}
              height={1440}
              fetchPriority="high"
            />
          )}
          <div className="vhero__veil" aria-hidden />
          <div className="vhero__shade" aria-hidden />
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="vhero__sound"
          >
            <span className="vhero__sound-dot" aria-hidden />
            {soundOn ? "Ses açık" : "Sesi aç"}
          </button>
        </div>

        <div className="vhero__content">{children}</div>

        <div className="vhero__hint" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  );
}
