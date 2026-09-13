import { useTranslations } from "next-intl";
import ImmersiveScrollGallery from "@/components/ui/immersive-scroll-gallery";

/**
 * Gerçek tekne fotoğrafları (işletmeden alındı). Profesyonel çekim gelince
 * sadece /public/foto/ değişir.
 *
 * Başlık bloğu galeri sahnesinin DIŞINDA, normal akışta; sahnede metin
 * katmanı yok (children boş). Galerinin scroll animasyonu değişmedi;
 * scrollLength=85 ile kapsayıcı fotoğrafların solduğu yerde biter.
 */
const PHOTOS = [
  { src: "/foto/tekne-kadeh.jpg", alt: "alt1" },
  { src: "/foto/cift-ogle-yemegi.jpg", alt: "alt2" },
  { src: "/foto/kaptan-dumen.jpg", alt: "alt3" },
  { src: "/foto/aile-koy.jpg", alt: "alt4" },
  { src: "/foto/aile-sofra.jpg", alt: "alt5" },
] as const;

export default function PhotoStrip() {
  const t = useTranslations("gallery");
  const images = PHOTOS.map((p) => ({ src: p.src, alt: t(p.alt) }));

  return (
    <section aria-labelledby="kareler-baslik">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 id="kareler-baslik" className="mt-2 text-3xl sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          {t("text")}
        </p>
      </div>
      {/* Başlık yok → animasyon 85vh'de biter; kapsayıcı da orada biter */}
      <ImmersiveScrollGallery images={images} scrollLength={85} />
    </section>
  );
}
