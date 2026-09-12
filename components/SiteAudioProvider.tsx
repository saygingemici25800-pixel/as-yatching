"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";

/**
 * Site geneli ses.
 *
 * Tek <audio> layout'ta yaşar; sayfalar arasında (App Router client
 * geçişi) kesilmez. Kullanıcı bir kez açınca tercih sessionStorage'a
 * yazılır: tam sayfa yenilemede tarayıcı otomatik çalmaya izin vermezse
 * ilk dokunuşta/tıklamada kaldığı yerden devam eder.
 *
 * Hero'daki buton ve diğer sayfalardaki küçük rozet aynı context'i kullanır.
 */

const AUDIO_SRC = "/hero/sea.mp3";
const VOLUME = 0.35;
const STORAGE_KEY = "as-audio";

interface SiteAudioContextValue {
  on: boolean;
  toggle: () => void;
  /** Hero görünürken layout rozeti gizlenir (buton zaten hero'da). */
  setHeroVisible: (v: boolean) => void;
}

const SiteAudioContext = createContext<SiteAudioContextValue | null>(null);

export function useSiteAudio() {
  const ctx = useContext(SiteAudioContext);
  if (!ctx)
    throw new Error("useSiteAudio, SiteAudioProvider içinde kullanılmalı");
  return ctx;
}

export default function SiteAudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [on, setOn] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const pendingRef = useRef(false); // autoplay engellendi, ilk etkileşimi bekliyor

  const fade = useCallback((to: number) => {
    const el = audioRef.current;
    if (!el) return;
    tween.current?.kill();
    if (to > 0 && el.paused) {
      el.volume = 0;
      el.play().then(
        () => {
          pendingRef.current = false;
        },
        () => {
          pendingRef.current = true;
        },
      );
    }
    tween.current = gsap.to(el, {
      volume: to,
      duration: 0.9,
      ease: "sine.inOut",
      onComplete: () => {
        if (to === 0) el.pause();
      },
    });
  }, []);

  // Kayıtlı tercih: açıksa çalmayı dene
  useEffect(() => {
    let saved = false;
    try {
      saved = sessionStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      /* private mode vb. */
    }
    if (saved) {
      setOn(true);
      fade(VOLUME);
    }
  }, [fade]);

  // Autoplay engellendiyse ilk etkileşimde başlat
  useEffect(() => {
    const resume = () => {
      if (pendingRef.current) fade(VOLUME);
    };
    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume);
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [fade]);

  const onRef = useRef(false);
  onRef.current = on;
  const toggle = useCallback(() => {
    const next = !onRef.current;
    try {
      sessionStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* yoksay */
    }
    setOn(next);
    fade(next ? VOLUME : 0);
  }, [fade]);

  return (
    <SiteAudioContext.Provider value={{ on, toggle, setHeroVisible }}>
      {children}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />
      {on && !heroVisible && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed
          className="fixed bottom-[5.5rem] left-4 z-40 inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-xs text-ink shadow-sm backdrop-blur-sm transition-colors hover:border-accent md:bottom-6 md:left-6"
        >
          <span
            className="size-2 rounded-full bg-accent shadow-[0_0_0_3px_rgb(176_141_63_/_0.3)]"
            aria-hidden
          />
          Ses açık
        </button>
      )}
    </SiteAudioContext.Provider>
  );
}
