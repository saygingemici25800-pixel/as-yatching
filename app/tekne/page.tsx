import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { MISSING_LABEL, isMissing, splitSpecs } from "@/lib/placeholder";
import {
  getAvailabilityBlocks,
  getBoats,
  getProducts,
  getSiteInfo,
} from "@/lib/repository";

export const metadata: Metadata = {
  title: "Tekne",
  description:
    "Fethiye Limanı'ndan kalkan teknemizin kapasitesi, donanımı ve güvenlik ekipmanları.",
};

export default async function BoatPage() {
  const [boats, info, products] = await Promise.all([
    getBoats(),
    getSiteInfo(),
    getProducts(),
  ]);

  const boat = boats[0];
  if (!boat) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h1 className="text-3xl">Tekne bilgisi henüz girilmedi</h1>
      </div>
    );
  }

  const blocks = await getAvailabilityBlocks(boat.slug);

  // Tekne adı henüz bilinmiyor — ham "TODO:" metni sayfaya basılmaz
  const boatName = isMissing(boat.name) ? "Teknemiz" : boat.name;

  const { known, missing } = splitSpecs([
    { label: "Tekne tipi", value: isMissing(boat.type) ? null : boat.type },
    {
      label: "Boy",
      value: isMissing(boat.lengthMeters) ? null : `${boat.lengthMeters} m`,
    },
    {
      label: "Kapasite",
      value: isMissing(boat.maxGuests) ? null : `${boat.maxGuests} kişi`,
    },
    {
      label: "Kabin",
      value: isMissing(boat.cabins) ? null : `${boat.cabins}`,
    },
    {
      label: "Mürettebat",
      value: isMissing(boat.crew) ? null : `${boat.crew} kişi`,
    },
    {
      label: "Yapım yılı",
      value: isMissing(boat.yearBuilt) ? null : `${boat.yearBuilt}`,
    },
    {
      label: "Bağlama limanı",
      value: isMissing(boat.homePort) ? null : boat.homePort,
    },
  ]);

  return (
    <>
      <DemoNotice />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        {/* ---------- Kırıntı yolu ---------- */}
        <nav aria-label="Sayfa yolu" className="text-xs text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-accent">Ana sayfa</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">Tekne</li>
          </ol>
        </nav>

        {/* ---------- Başlık ---------- */}
        <header className="mt-6">
          <p className="eyebrow">{boat.homePort}</p>
          <h1 className="mt-4 text-[2.125rem] leading-[1.15] sm:text-5xl">
            {boatName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            Bütün turlar {boat.maxGuests} kişiye kadar kapasiteli bu tekneyle
            yapılıyor. Donanımı ve güvenlik ekipmanlarını aşağıda olduğu gibi
            listeliyoruz.
          </p>
          <div className="mt-6">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
            />
          </div>
        </header>

        {/* ---------- Galeri ---------- */}
        <section className="mt-8" aria-label="Tekne fotoğrafları">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line sm:col-span-2 sm:aspect-[2/1]">
              <Image
                src={boat.images[0]}
                alt={`${boatName} — genel görünüm`}
                fill
                sizes="(min-width: 1280px) 1152px, 100vw"
                priority
                className="object-cover"
              />
            </div>
            {boat.images.slice(1).map((src, index) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line"
              >
                <Image
                  src={src}
                  alt={`${boatName} — fotoğraf ${index + 2}`}
                  fill
                  sizes="(min-width: 640px) 570px, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          {boat.isPlaceholder && (
            <p className="mt-3 text-xs text-ink-soft">
              Fotoğraflar yer tutucudur. Profesyonel çekim yapıldığında
              yalnızca görseller değişecek, sayfa aynı kalacak.
            </p>
          )}
        </section>

        {/* ---------- Özellikler ---------- */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <div>
            <section>
              <h2 className="text-2xl sm:text-3xl">Teknik bilgiler</h2>
              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
                {known.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
                  >
                    <dt className="text-ink-soft">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
                {missing.map((label) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-4 px-5 py-3.5 text-sm"
                  >
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="text-right text-ink-soft/70">
                      {MISSING_LABEL}
                    </dd>
                  </div>
                ))}
              </dl>

              {missing.length > 0 && (
                <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                  {missing.length} alan henüz doldurulmadı. Demo aşamasında
                  bilinmeyen bilgi uydurulmuyor; gerçek değerler girildiğinde bu
                  tablo kendiliğinden tamamlanacak.
                </p>
              )}
            </section>

            {/* Donanım */}
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl">Teknede neler var?</h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {boat.amenities.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Güvenlik */}
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl">Güvenlik</h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {boat.safety.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              {/* TODO: Sigorta poliçesi ve turizm işletme belgesi bilgisi
                  müşteriden alınınca seed'e eklenip burada gösterilecek. */}
              <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                Sigorta ve belge bilgileri müşteriden alındıktan sonra bu
                bölüme eklenecek.
              </p>
            </section>
          </div>

          {/* ---------- Sağ kolon ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-line bg-surface p-5">
              <p className="eyebrow">Müsaitlik</p>
              <h2 className="mt-2 text-xl">Hangi günler boş?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Üstü çizili günler dolu ya da bakımda. Tarih seçip talep
                göndermek için bir tur seçin.
              </p>
              <div className="mt-4">
                <AvailabilityCalendar blocks={blocks} />
              </div>
              <Link
                href="/turlar"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
              >
                {products.length} tura göz atın
                <ArrowIcon className="size-4" />
              </Link>
            </div>
          </aside>
        </div>

        {/* ---------- CTA ---------- */}
        <section className="mt-16">
          <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl">
              Tekneyi hangi tur için istiyorsunuz?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Günübirlik özel kiralamadan konaklamalı mavi tura kadar{" "}
              {products.length} seçenek var. Hepsinin fiyatı yazılı.
            </p>
            <Link
              href="/turlar"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Turlar ve fiyatlar
              <ArrowIcon className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
