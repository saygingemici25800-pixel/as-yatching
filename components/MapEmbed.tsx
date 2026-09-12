"use client";

import { useState } from "react";

/**
 * Google Haritalar gömme (API anahtarı gerektirmeyen `output=embed`).
 *
 * Dokunmatikte harita sayfa kaydırmasını kilitlemesin diye iframe
 * `pointer-events-none` ile başlar; "Haritayı etkinleştir" düğmesi
 * etkileşimi açar. Veri (koordinat, etiket) prop olarak gelir; bileşen
 * hiçbir kaynağı doğrudan okumaz.
 */
export default function MapEmbed({
  lat,
  lng,
  label,
  className = "",
}: {
  lat: number;
  lng: number;
  label: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-line bg-deep/30 ${className}`}
    >
      <iframe
        src={src}
        title="Kalkış noktası haritası"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className={`absolute inset-0 h-full w-full border-0 ${
          active ? "" : "pointer-events-none"
        }`}
      />

      {!active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-sm border border-line bg-surface/95 px-3 py-2 text-xs font-medium text-deep backdrop-blur-sm transition-colors hover:border-accent"
        >
          <span className="keep-accent size-1.5 rounded-full bg-accent" aria-hidden />
          Haritayı etkinleştir
        </button>
      )}

      <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-sm border border-line bg-surface/95 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-deep backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
