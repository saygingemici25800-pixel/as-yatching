import Image from "next/image";

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
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Tekneden kareler</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">
            Gerçek tekne, gerçek koylar
          </h2>
        </div>
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Instagram: @as_yachting
          </a>
        )}
      </div>

      <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {PHOTOS.map((p, i) => (
          <li
            key={p.src}
            className={`relative overflow-hidden rounded-sm border border-line ${
              i === 0
                ? "col-span-2 aspect-[4/3] sm:col-span-1 sm:aspect-square"
                : "aspect-square"
            }`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.04]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
