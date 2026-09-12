import IllustratedMap from "@/components/ui/illustrated-map";
import { ArrowIcon, PinIcon, WhatsappIcon } from "@/components/icons";
import { directionsUrl, whatsappUrl } from "@/lib/links";
import type { Bay, MapPoint, SiteInfo } from "@/lib/types";

/**
 * "Nereden kalkıyoruz?" — kalkış noktası kartı + illüstratif körfez haritası.
 * Veri `getSiteInfo().departure`, `getMapPoints()` ve `getBays()` üzerinden
 * gelir (sayfa repository'den okur, bu bileşen prop alır). "Yol tarifi al"
 * Google Haritalar'a gitmeye devam eder.
 *
 * TODO (işletmeyle teyit): buluşma saati, otopark, ulaşım satırları.
 */
const DETAILS: { label: string; value: string }[] = [
  { label: "Buluşma", value: "Kalkıştan 15 dk önce" }, // TODO: teyit
  { label: "Otopark", value: "—" }, // TODO: otopark bilgisi
  { label: "Ulaşım", value: "Fethiye merkezden yürüyerek" }, // TODO: teyit
];

export default function DeparturePoint({
  info,
  points,
  bays,
}: {
  info: SiteInfo;
  points: MapPoint[];
  bays: Bay[];
}) {
  const { departure } = info;

  return (
    <section
      aria-labelledby="kalkis-baslik"
      className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-8">
        {/* Sol: krem kutu */}
        <div className="min-w-0 rounded-sm border border-line bg-surface p-6 sm:p-8">
          <p className="eyebrow">Kalkış noktası</p>
          <h2 id="kalkis-baslik" className="mt-2 text-3xl sm:text-4xl">
            Fethiye Limanı, beton iskele
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {info.address}
          </p>
          {departure.note && (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {departure.note}
            </p>
          )}

          <dl className="mt-6 border-t border-line text-sm">
            {DETAILS.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
              >
                <dt className="eyebrow">{row.label}</dt>
                <dd className="shrink-0 text-right font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>

          {/* Kutu 26rem: butonlar her boyutta alt alta (yan yana sığmıyor) */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={directionsUrl(departure.lat, departure.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
            >
              <PinIcon className="size-4" />
              Yol tarifi al
            </a>
            <a
              href={whatsappUrl(
                info.whatsapp,
                "Merhaba, kalkış noktasını sormak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <WhatsappIcon className="size-4" />
              WhatsApp&apos;tan sor
              <ArrowIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Sağ: illüstratif harita (Fethiye Körfezi + 12 Adalar) */}
        <IllustratedMap
          points={points}
          bays={bays}
          harborLabel={departure.label}
          className="min-w-0"
        />
      </div>
    </section>
  );
}
