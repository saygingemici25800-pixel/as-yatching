import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookingPanel from "@/components/BookingPanel";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import ProductCard, {
  durationLabel,
  guestsLabel,
} from "@/components/ProductCard";
import SampleBadge from "@/components/SampleBadge";
import {
  CheckIcon,
  ClockIcon,
  CrossIcon,
  UsersIcon,
} from "@/components/icons";
import { startingFromLabel } from "@/lib/pricing";
import {
  getAvailabilityBlocks,
  getBoat,
  getProduct,
  getProducts,
  getSiteInfo,
} from "@/lib/repository";
import { SITE_URL, jsonLdScript, productSchema } from "@/lib/seo";

type PageProps = { params: Promise<{ urun: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ urun: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { urun } = await params;
  const product = await getProduct(urun);
  if (!product) return { title: "Tur bulunamadı" };

  const description = `${product.shortDescription} ${startingFromLabel(product)} — fiyata dahil olanlar sayfada yazılı.`;

  return {
    title: `${product.name} | Fethiye Tekne Kiralama`,
    description,
    alternates: { canonical: `/turlar/${product.slug}` },
    openGraph: {
      title: `${product.name} | Fethiye Tekne Kiralama | As Yachting`,
      description,
      type: "website",
      locale: "tr_TR",
      url: `${SITE_URL}/turlar/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { urun } = await params;
  const product = await getProduct(urun);
  if (!product) notFound();

  const [info, boat, allProducts] = await Promise.all([
    getSiteInfo(),
    getBoat(product.boatSlug),
    getProducts(),
  ]);

  const blocks = await getAvailabilityBlocks(product.boatSlug);
  const others = allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);
  const duration = durationLabel(product);

  return (
    <>
      {/* Product + Offer yapısal verisi — aggregateRating içermez (bkz. lib/seo.ts) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(productSchema(product))}
      />

      <DemoNotice />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        {/* ---------- Kırıntı yolu ---------- */}
        <nav aria-label="Sayfa yolu" className="text-xs text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-accent">Ana sayfa</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/turlar" className="hover:text-accent">Turlar</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>

        {/* ---------- Başlık ---------- */}
        <header className="mt-6">
          <h1 className="max-w-3xl text-[2.125rem] leading-[1.15] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {product.shortDescription}
          </p>

          <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-soft">
            {duration && (
              <li className="flex items-center gap-2">
                <ClockIcon className="size-4 text-accent" />
                {duration}
              </li>
            )}
            <li className="flex items-center gap-2">
              <UsersIcon className="size-4 text-accent" />
              {guestsLabel(product)}
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-ink">
                {startingFromLabel(product)}
              </span>
              {product.isSamplePrice && <SampleBadge />}
            </li>
          </ul>
        </header>

        {/* ---------- Görsel ---------- */}
        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-sm border border-line sm:aspect-[2/1]">
          <Image
            src={product.images[0]}
            alt={`${product.name} — tekne görseli`}
            fill
            sizes="(min-width: 1280px) 1152px, 100vw"
            priority
            className="object-cover"
          />
        </div>

        {/* ---------- İçerik + talep paneli ---------- */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div className="min-w-0">
            {/* Açıklama */}
            <section>
              <h2 className="text-2xl sm:text-3xl">Bu turda ne oluyor?</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </section>

            {/* Rota / saat planı */}
            {product.route.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl sm:text-3xl">
                  {product.durationDays && product.durationDays > 1
                    ? "Gün planı"
                    : "Saat planı"}
                </h2>
                <ol className="mt-5 space-y-0">
                  {product.route.map((stop, index) => (
                    <li
                      key={`${stop.name}-${index}`}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {/* Zaman çizgisi — ince altın çizgi ve nokta */}
                      <div className="flex flex-col items-center">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                        {index < product.route.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-line" aria-hidden />
                        )}
                      </div>
                      <div className="pb-1">
                        {stop.time && (
                          <p className="text-sm font-medium tabular-nums">
                            {stop.time}
                          </p>
                        )}
                        <p className={stop.time ? "mt-0.5" : ""}>{stop.name}</p>
                        {stop.note && (
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {stop.note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-ink-soft">
                  Saatler ve rota hava koşullarına göre değişebilir.
                </p>
              </section>
            )}

            {/* Fiyata dahil / dahil değil */}
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl">Fiyata dahil olanlar</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                Sürpriz ücret çıkmasın diye ikisini de yazıyoruz.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-sm border border-line bg-surface p-5">
                  <h3 className="text-base font-medium">Dahil</h3>
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {product.priceIncludes.included.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-sm border border-line bg-surface p-5">
                  <h3 className="text-base font-medium">Dahil değil</h3>
                  <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
                    {product.priceIncludes.excluded.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <CrossIcon className="mt-0.5 size-4 shrink-0 text-ink-soft/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Tekne özeti */}
            {boat && (
              <section className="mt-12">
                <h2 className="text-2xl sm:text-3xl">Tekne</h2>
                <div className="mt-5 flex flex-col gap-5 rounded-sm border border-line bg-surface p-5 sm:flex-row sm:items-center">
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-sm sm:size-32 sm:aspect-auto">
                    <Image
                      src={boat.images[0]}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Tur, {boat.maxGuests} kişiye kadar kapasiteli teknemizle{" "}
                      {boat.homePort}&apos;ndan yapılıyor. Donanım ve güvenlik
                      ekipmanlarının tamamı tekne sayfasında listeli.
                    </p>
                    <Link
                      href="/tekne"
                      className="mt-3 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                    >
                      Tekneyi inceleyin
                    </Link>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ---------- Sağ kolon: talep paneli ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <BookingPanel product={product} blocks={blocks} />
            <div className="mt-5 flex justify-center">
              <GoogleRating
                rating={info.googleRating}
                reviewCount={info.googleReviewCount}
                profileUrl={info.googleProfileUrl}
                size="sm"
              />
            </div>
          </aside>
        </div>

        {/* ---------- Diğer turlar ---------- */}
        {others.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl sm:text-3xl">Diğer turlar</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
