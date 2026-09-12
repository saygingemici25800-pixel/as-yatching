import Link from "next/link";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import BayCoverflow from "@/components/ui/bay-coverflow";
import DemoNotice from "@/components/DemoNotice";
import DeparturePoint from "@/components/DeparturePoint";
import GoogleReviews from "@/components/GoogleReviews";
import PhotoStrip from "@/components/PhotoStrip";
import ProductCard from "@/components/ProductCard";
import VideoHero from "@/components/VideoHero";
import { ParallaxScrolling } from "@/components/ui/parallax-scrolling";
import { ArrowIcon, WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";
import {
  getAvailabilityBlocks,
  getBays,
  getBoats,
  getFaqs,
  getFeaturedProducts,
  getGoogleReviews,
  getMapPoints,
  getProducts,
  getSiteInfo,
} from "@/lib/repository";

export default async function HomePage() {
  const [info, featured, products, boats, faqs, reviews, bays, mapPoints] =
    await Promise.all([
      getSiteInfo(),
      getFeaturedProducts(),
      getProducts(),
      getBoats(),
      getFaqs(),
      getGoogleReviews(),
      getBays(),
      getMapPoints(),
    ]);

  const boat = boats[0];
  const blocks = boat ? await getAvailabilityBlocks(boat.slug) : [];

  return (
    <>
      <DemoNotice />

      {/* ---------- Hero (video) ---------- */}
      <VideoHero>
        <p className="eyebrow">Fethiye Limanı · Günübirlik ve konaklamalı</p>
        <h1 className="mt-4 max-w-3xl text-[2.375rem] leading-[1.05] sm:text-5xl lg:text-[4rem]">
          <span className="block">Fethiye&apos;de tekne kiralama</span>
          <span className="mt-2 block text-ink/75">
            Tarihi seçin, fiyatı ve müsaitliği görün
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
          Günübirlik özel kiralama, gün batımı turu, sabah kahvaltı turu ve
          konaklamalı mavi tur. Fiyatlar sitede, tarihler takvimde.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/turlar"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
          >
            Turları ve fiyatları gör
            <ArrowIcon className="size-4" />
          </Link>
          <a
            href={whatsappUrl(
              info.whatsapp,
              "Merhaba, tekne kiralama hakkında bilgi almak istiyorum.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-glow hidden items-center justify-center gap-2 rounded-sm border border-gold px-6 py-3.5 text-sm font-medium transition-colors hover:border-gold-deep md:inline-flex"
          >
            <WhatsappIcon className="size-4" />
            WhatsApp&apos;tan yazın
          </a>
        </div>
      </VideoHero>

      {/* ---------- Rota / Koylar (hero koşu alanı bitince, akışta) ---------- */}
      <section
        id="rota"
        aria-labelledby="koylar-baslik"
        className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24"
      >
        <div className="text-center">
          <p className="eyebrow">Rota</p>
          <h2 id="koylar-baslik" className="mt-2 text-3xl sm:text-4xl">
            Nereye gidiyoruz?
          </h2>
        </div>
        <div className="mt-8 sm:mt-10">
          <BayCoverflow bays={bays} />
        </div>
      </section>

      {/* ---------- Fethiye körfezi (parallax) ---------- */}
      <ParallaxScrolling
        eyebrow="Fethiye körfezi"
        title="Sabah çıkıyoruz, akşam dönüyoruz"
        caption="Kızılada, Akvaryum Koyu, Samanlık Koyu. Rotayı grubun temposuna göre birlikte belirliyoruz."
      />

      {/* ---------- Öne çıkan turlar ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Turlar</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Öne çıkanlar</h2>
          </div>
          <Link
            href="/turlar"
            className="inline-flex items-center gap-2 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {products.length} turun tamamı
            <ArrowIcon className="size-4" />
          </Link>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* ---------- Müsaitlik önizleme ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">Müsaitlik</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">
              Hangi gün boş, takvimde belli
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
              Takvimi tek yerden yönetiyoruz. Üstü çizili günler dolu ya da
              bakımda; geri kalan bütün günler müsait. Tarih seçip talep
              göndermek için tur sayfasına geçin.
            </p>
            <Link
              href="/turlar"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
            >
              Tarih seçip talep gönder
              <ArrowIcon className="size-4" />
            </Link>
          </div>

          <AvailabilityCalendar blocks={blocks} />
        </div>
      </section>

      {/* ---------- Gerçek kareler (PhotoStrip) ---------- */}
      <PhotoStrip />

      {/* ---------- Google yorumları ----------
          Galeri koşu alanına 115vh bindirilir: galeri 185vh (100 sahne +
          85 kaydırma), yorum kapsayıcısının üst kenarı galerinin 70vh
          noktasına denk gelir. Yorum sahnesi görünmez hâlde (kartlar
          opaklık 0) galerinin altına yapışır; progress galerinin 70vh
          noktasında başlar ve kartların 0→1 girişi (ilk 15vh) fotoğrafların
          son 15vh'lik solmasıyla (70–85vh) çapraz geçiş yapar. Arada boş
          ekran kalmaz; iki bölümün animasyon keyframe'leri değişmedi. */}
      <GoogleReviews
        reviews={reviews}
        info={info}
        className="relative z-10 -mt-[115vh]"
      />

      {/* ---------- Nereden kalkıyoruz? (harita) ---------- */}
      <DeparturePoint info={info} points={mapPoints} bays={bays} />

      {/* ---------- Sık sorulanlar ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <p className="eyebrow">Sık sorulanlar</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Merak edilenler</h2>

        <div className="mt-7 max-w-3xl divide-y divide-line overflow-hidden rounded-sm border border-line bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium marker:hidden">
                {faq.question}
                <span
                  className="shrink-0 text-accent transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className="size-4"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Kapanış CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl">
                Aklınızdaki tarih müsait mi?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Takvimden tarihi seçin, kişi sayısını girin; fiyatı görüp talebi
                WhatsApp&apos;tan gönderin. {info.workingHours} ulaşabilirsiniz.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/turlar"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
              >
                Turlara git
                <ArrowIcon className="size-4" />
              </Link>
              <a
                href={whatsappUrl(
                  info.whatsapp,
                  "Merhaba, müsaitlik sormak istiyorum.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
              >
                <WhatsappIcon className="size-4 text-accent" />
                Müsaitlik sor
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
