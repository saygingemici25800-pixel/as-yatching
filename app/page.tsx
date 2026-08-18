import Image from "next/image";
import Link from "next/link";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import ProductCard from "@/components/ProductCard";
import { ParallaxScrolling } from "@/components/ui/parallax-scrolling";
import { ArrowIcon, CheckIcon, WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";
import {
  getAvailabilityBlocks,
  getBoats,
  getFaqs,
  getFeaturedProducts,
  getProducts,
  getSiteInfo,
} from "@/lib/repository";

const PROMISES = [
  {
    title: "Fiyat sitede yazılı",
    body: "Her turun fiyatı ve fiyata dahil olan kalemler ürün sayfasında yazılı. Fiyat öğrenmek için kimseyi aramanız gerekmiyor.",
  },
  {
    title: "Müsaitlik takvimde açık",
    body: "Dolu tarihler takvimde kapalı görünür. Hangi günün boş olduğunu kendiniz görüyorsunuz.",
  },
  {
    title: "Sürpriz ücret yok",
    body: "Kaptan, yakıt, liman ve koy ücretleri fiyata dahil. Dahil olmayan kalemler de ayrı ayrı yazılı.",
  },
];

export default async function HomePage() {
  const [info, featured, products, boats, faqs] = await Promise.all([
    getSiteInfo(),
    getFeaturedProducts(),
    getProducts(),
    getBoats(),
    getFaqs(),
  ]);

  const boat = boats[0];
  const blocks = boat ? await getAvailabilityBlocks(boat.slug) : [];
  const heroImage = boat?.images[0] ?? "/placeholder/boat-01.jpg";

  return (
    <>
      <DemoNotice />

      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow">Fethiye Limanı · Günübirlik ve konaklamalı</p>
            <h1 className="mt-4 text-[2.125rem] leading-[1.1] sm:text-5xl lg:text-[3.5rem]">
              <span className="block">Fethiye&apos;de tekne kiralama</span>
              <span className="mt-2 block text-ink-soft">
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
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
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
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-line bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
              >
                <WhatsappIcon className="size-4 text-accent" />
                WhatsApp&apos;tan yazın
              </a>
            </div>

            <div className="mt-7">
              <GoogleRating
                rating={info.googleRating}
                reviewCount={info.googleReviewCount}
                profileUrl={info.googleProfileUrl}
              />
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line lg:aspect-[5/4]">
            <Image
              src={heroImage}
              alt="Fethiye Limanı'nda kiralanan tekne"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- Parallax ---------- */}
      <ParallaxScrolling
        eyebrow="Fethiye körfezi"
        title="Sabah çıkıyoruz, akşam dönüyoruz"
        caption="Kızılada, Akvaryum Koyu, Samanlık Koyu. Rotayı grubun temposuna göre birlikte belirliyoruz."
      />

      {/* ---------- Vaatler ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <ul className="grid gap-6 sm:grid-cols-3">
          {PROMISES.map((item) => (
            <li
              key={item.title}
              className="rounded-sm border border-line bg-surface p-5"
            >
              <CheckIcon className="size-5 text-accent" />
              <h2 className="mt-3 text-lg">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

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
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Tarih seçip talep gönder
              <ArrowIcon className="size-4" />
            </Link>
          </div>

          <AvailabilityCalendar blocks={blocks} />
        </div>
      </section>

      {/* ---------- Google puanı ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <div className="rounded-sm border border-line bg-surface px-5 py-10 text-center sm:px-10 sm:py-14">
          <p className="eyebrow">Misafirlerimiz</p>
          <p className="mx-auto mt-4 font-display text-5xl sm:text-6xl">
            {info.googleRating.toLocaleString("tr-TR", {
              minimumFractionDigits: 1,
            })}
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl">
            {info.googleReviewCount} Google yorumunda 5 üzerinden{" "}
            {info.googleRating.toLocaleString("tr-TR", {
              minimumFractionDigits: 1,
            })}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            Puanımız Google Business Profile üzerinden doğrulanabilir. Yorum
            metinleri bu demoda gösterilmiyor.
          </p>
          <div className="mt-6 flex justify-center">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
              size="sm"
            />
          </div>
        </div>
      </section>

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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="size-4">
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
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
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
