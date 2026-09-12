import ImmersiveScrollGallery from "@/components/ui/immersive-scroll-gallery";

/**
 * Gerçek tekne fotoğrafları (işletmeden alındı). Profesyonel çekim gelince
 * sadece /public/foto/ değişir.
 */
const PHOTOS = [
  { src: "/foto/tekne-kadeh.jpg", alt: "Güvertede kadeh kaldıran misafirler" },
  { src: "/foto/cift-ogle-yemegi.jpg", alt: "Koyda öğle yemeği" },
  { src: "/foto/kaptan-dumen.jpg", alt: "Kaptan ve küçük misafir dümende" },
  { src: "/foto/aile-koy.jpg", alt: "Aile sofrası, turkuaz koy" },
  { src: "/foto/aile-sofra.jpg", alt: "Teknede balık sofrası" },
];

export default function PhotoStrip({
  instagram,
}: {
  instagram: string | null;
}) {
  return (
    <section aria-label="Tekneden kareler">
      <ImmersiveScrollGallery images={PHOTOS}>
        <div className="mx-auto max-w-xl rounded-sm border border-line bg-surface/90 px-6 py-8 text-center backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="eyebrow">Tekneden kareler</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">
          Gerçek tekne, gerçek koylar
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Fotoğraflar misafirlerimizin turlarından. Koyu, sofrayı ve dümeni
          kendiniz görün.
        </p>
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Instagram: @as_yachting
          </a>
        )}
      </div>
      </ImmersiveScrollGallery>
    </section>
  );
}
