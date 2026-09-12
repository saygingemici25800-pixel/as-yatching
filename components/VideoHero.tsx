"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
 *  - Video sessiz ve otomatik oynar (tarayıcı kuralı). Seyir sesi (motor +
 *    pruva suyu + rüzgar, sentetik) ayrı bir
 *    <audio>; kullanıcı butonla açar. Hero ekrandan çıkınca ses kendiliğinden
 *    kısılır, geri gelince açılır.
 *  - Hareket azaltma tercihi ya da veri tasarrufu açıksa video hiç yüklenmez,
 *    poster görseli kalır.
 *
 * Dosyalar: /public/hero/hero.mp4, hero-poster.jpg, sea.mp3
 */

const VIDEO_SRC = "/hero/hero.mp4";
const POSTER_SRC = "/hero/hero-poster.jpg";
const AUDIO_SRC = "/hero/sea.mp3";
const AUDIO_VOLUME = 0.45;

export default function VideoHero({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTween = useRef<gsap.core.Tween | null>(null);

  const [motionOk, setMotionOk] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);
  const inViewRef = useRef(true);

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
          scrub: 0.6,
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

  // Ses: yumuşak aç/kapa
  const fadeAudio = (to: number) => {
    const el = audioRef.current;
    if (!el) return;
    fadeTween.current?.kill();
    if (to > 0 && el.paused) {
      el.volume = 0;
      void el.play().catch(() => undefined);
    }
    fadeTween.current = gsap.to(el, {
      volume: to,
      duration: 0.9,
      ease: "sine.inOut",
      onComplete: () => {
        if (to === 0) el.pause();
      },
    });
  };

  const toggleSound = () => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    fadeAudio(next && inViewRef.current ? AUDIO_VOLUME : 0);
  };

  // Hero görünümden çıkınca ses kısılır, dönünce açılır
  useEffect(() => {
    if (!rootRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (soundOnRef.current) {
          fadeAudio(entry.isIntersecting ? AUDIO_VOLUME : 0);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

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

        <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

        <div className="vhero__hint" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  );
}
