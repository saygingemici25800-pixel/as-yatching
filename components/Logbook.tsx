import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { LogbookEntry } from "@/lib/types";

/**
 * SEYİR DEFTERİ PANOSU
 * ------------------------------------------------------------------
 * Mantar pano dokusu (CSS gradient + SVG noise, kahve-krem) üzerinde
 * polaroid kartlar: krem çerçeve, fotoğraf, altında el yazısı fontla
 * (Caveat — app/[locale]/layout.tsx'te next/font/google ile yükleniyor)
 * not ve tarih. Sağ üstte raptiye.
 *
 * Kartlar -6°…+6° arasında SABİT açılarla eğik (slug'a göre deterministik;
 * Math.random() hidrasyon uyuşmazlığı yaratırdı). Hover'da düzleşip öne gelir.
 * Mobilde 2 sütun, masaüstünde 4.
 *
 * Notlar DÜZ METİN olarak basılır (dangerouslySetInnerHTML YOK).
 * Veri `lib/repository.ts#getApprovedLogbookEntries` üzerinden gelir;
 * bu bileşen prop alır, hiçbir yerden veri okumaz.
 */

/** Kart eğimi: id'den türetilen deterministik açı (-6…+6 derece) */
function tiltOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return ((hash % 121) - 60) / 10;
}

/** Raptiye rengi — kırmızı ve turuncu arasında dönüşümlü */
const PIN_COLORS = ["#d94f3d", "#e8833a", "#c9432f", "#f0a04b"];

function pinOf(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 997;
  return PIN_COLORS[hash % PIN_COLORS.length];
}

export default function Logbook({
  entries,
  className = "",
}: {
  entries: LogbookEntry[];
  className?: string;
}) {
  const t = useTranslations("logbook");
  const locale = useLocale();

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  };

  return (
    <section
      aria-labelledby="seyir-defteri-baslik"
      className={`mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24 ${className}`}
    >
      <div className="max-w-2xl">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 id="seyir-defteri-baslik" className="mt-2 text-3xl sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t("text")}</p>
      </div>

      {/* ---------- Mantar pano ---------- */}
      <div className="logbook-board mt-8 rounded-sm border border-line p-4 sm:mt-10 sm:p-8">
        {entries.length === 0 ? (
          <div className="mx-auto max-w-md py-10 text-center sm:py-16">
            <p className="font-display text-2xl text-[#4a3520] sm:text-3xl">
              {t("emptyTitle")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6b5138]">
              {t("emptyText")}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {entries.map((entry) => {
              const name = entry.name.trim() || t("anonymous");
              const tilt = tiltOf(entry.id);
              return (
                <li
                  key={entry.id}
                  className="logbook-card group relative"
                  style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
                >
                  <figure className="relative rounded-[2px] bg-cream p-2 pb-0 shadow-[0_10px_22px_-10px_rgba(45,28,10,0.65)] sm:p-2.5">
                    {/* Raptiye */}
                    <span
                      aria-label={t("pinLabel")}
                      className="absolute -top-2 right-3 z-10 block size-3.5 rounded-full shadow-[0_2px_4px_rgba(45,28,10,0.5)] sm:size-4"
                      style={{
                        background: `radial-gradient(circle at 35% 30%, #fff6, transparent 55%), ${pinOf(entry.id)}`,
                      }}
                    />
                    <div className="relative aspect-square overflow-hidden bg-[#e8ddcc]">
                      <Image
                        src={entry.photoUrl}
                        alt={t("photoAlt", {
                          name,
                          date: formatDate(entry.tripDate),
                        })}
                        fill
                        sizes="(min-width: 1024px) 260px, 45vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="px-1 pb-3 pt-2 text-center sm:pb-4">
                      {entry.note && (
                        <p className="logbook-hand text-[0.9375rem] leading-snug text-[#33302c] sm:text-base">
                          {entry.note}
                        </p>
                      )}
                      <p className="logbook-hand mt-1 text-xs text-[#6b5138] sm:text-sm">
                        {name} · {formatDate(entry.tripDate)}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
