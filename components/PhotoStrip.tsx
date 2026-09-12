import ImmersiveScrollGallery from "@/components/ui/immersive-scroll-gallery";

/**
 * Gerçek tekne fotoğrafları (işletmeden alındı). Profesyonel çekim gelince
 * sadece /public/foto/ değişir.
 *
 * Başlık bloğu galeri sahnesinin DIŞINDA, normal akışta; sahnede metin
 * katmanı yok (children boş). Galerinin scroll animasyonu değişmedi.
 */
const PHOTOS = [
  { src: "/foto/tekne-kadeh.jpg", alt: "Güvertede kadeh kaldıran misafirler" },
  { src: "/foto/cift-ogle-yemegi.jpg", alt: "Koyda öğle yemeği" },
  { src: "/foto/kaptan-dumen.jpg", alt: "Kaptan ve küçük misafir dümende" },
  { src: "/foto/aile-koy.jpg", alt: "Aile sofrası, turkuaz koy" },
  { src: "/foto/aile-sofra.jpg", alt: "Teknede balık sofrası" },
];

export default function PhotoStrip() {
  return (
    <section aria-labelledby="kareler-baslik">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <p className="eyebrow">Tekneden kareler</p>
        <h2 id="kareler-baslik" className="mt-2 text-3xl sm:text-4xl">
          Gerçek tekne, gerçek koylar
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Fotoğraflar misafirlerimizin turlarından. Koyu, sofrayı ve dümeni
          kendiniz görün.
        </p>
      </div>
      <ImmersiveScrollGallery images={PHOTOS} />
    </section>
  );
}
