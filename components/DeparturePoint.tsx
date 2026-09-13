import { useTranslations } from "next-intl";
import IllustratedMap from "@/components/ui/illustrated-map";
import { ArrowIcon, PinIcon, WhatsappIcon } from "@/components/icons";
import { directionsUrl, whatsappUrl } from "@/lib/links";
import type { Bay, MapPoint, SiteInfo, TourRoute } from "@/lib/types";

/**
 * "Nereden kalkıyoruz?" — kalkış noktası kartı + illüstratif körfez haritası.
 * Veri `getSiteInfo().departure`, `getMapPoints()` ve `getBays()` üzerinden
 * gelir (sayfa repository'den okur, bu bileşen prop alır). "Yol tarifi al"
 * Google Haritalar'a gitmeye devam eder.
 *
 * TODO (işletmeyle teyit): buluşma saati, otopark, ulaşım satırları.
 */
export default function DeparturePoint({
  info,
  points,
  bays,
  routes,
}: {
  info: SiteInfo;
  points: MapPoint[];
  bays: Bay[];
  routes: TourRoute[];
}) {
  const t = useTranslations("departure");
  const tc = useTranslations("common");
  const tw = useTranslations("whatsapp");
  const { departure } = info;

  const details: { label: string; value: string }[] = [
    { label: t("meeting"), value: t("meetingValue") }, // TODO: teyit
    { label: t("parking"), value: "—" }, // TODO: otopark bilgisi
    { label: t("transport"), value: t("transportValue") }, // TODO: teyit
  ];

  return (
    <section
      aria-labelledby="kalkis-baslik"
      // Üst boşluk ≤ 4rem: yorum sahnesi biter bitmez bölüm görünür
      className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-8">
        {/* Sol: krem kutu */}
        <div className="min-w-0 rounded-sm border border-line bg-surface p-6 sm:p-8">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 id="kalkis-baslik" className="mt-2 text-3xl sm:text-4xl">
            {t("title")}
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
            {details.map((row) => (
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
              {t("directions")}
            </a>
            <a
              href={whatsappUrl(info.whatsapp, tw("departure"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
            >
              <WhatsappIcon className="size-4" />
              {tc("whatsappAsk")}
              <ArrowIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Sağ: illüstratif harita (Fethiye Körfezi + 12 Adalar) */}
        <IllustratedMap
          points={points}
          bays={bays}
          routes={routes}
          harborLabel={departure.label}
          className="min-w-0"
        />
      </div>
    </section>
  );
}
