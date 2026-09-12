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
        <div className="mx-auto max-w-xl text-center text-surface [text-shadow:0_1px_3px_rgb(0_51_87/0.7),0_2px_28px_rgb(0_51_87/0.9)] before:pointer-events-none before:absolute before:-inset-16 before:-z-10 before:rounded-full before:bg-[radial-gradient(closest-side,rgb(0_51_87/0.45),transparent)] relative [&_.text-ink-soft]:text-surface/85 [&_h2]:text-surface">
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
