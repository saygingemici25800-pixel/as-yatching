import type { Metadata } from "next";
import Link from "next/link";
import DemoNotice from "@/components/DemoNotice";
import ProductCard, {
  durationLabel,
  guestsLabel,
} from "@/components/ProductCard";
import SampleBadge from "@/components/SampleBadge";
import { ArrowIcon, WhatsappIcon } from "@/components/icons";
import { whatsappUrl } from "@/lib/links";
import { startingFromLabel } from "@/lib/pricing";
import { getProducts, getSiteInfo } from "@/lib/repository";
import type { PricingType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Turlar ve Fiyatlar | Fethiye Tekne Kiralama",
  description:
    "Fethiye'den kalkan günübirlik özel kiralama, gün batımı turu, sabah kahvaltı turu, evlilik teklifi kurgusu ve konaklamalı mavi tur. Bütün fiyatlar yazılı.",
  alternates: { canonical: "/turlar" },
};

/** Üç fiyat tipinin ne anlama geldiğini açıkça yazıyoruz — şeffaflık konumlandırması */
const PRICING_EXPLAINER: Record<PricingType, string> = {
  per_day: "Tekne günlüğü — kapasiteye kadar kişi sayısı fiyatı değiştirmez.",
  per_person: "Kişi başı — toplam, katılan kişi sayısıyla çarpılır.",
  per_hour: "Saat başı — toplam, turun saat sayısıyla çarpılır.",
};

const PRICING_LABEL: Record<PricingType, string> = {
  per_day: "Günlük",
  per_person: "Kişi başı",
  per_hour: "Saatlik",
};

export default async function ToursPage() {
  const [products, info] = await Promise.all([getProducts(), getSiteInfo()]);

  // Sayfada hangi fiyat tiplerinin geçtiğini veriden çıkarıyoruz
  const usedPricingTypes = Array.from(
    new Set(products.map((p) => p.pricingType)),
  );

  return (
    <>
      <DemoNotice />

      {/* ---------- Başlık ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className="eyebrow">Turlar</p>
        <h1 className="mt-4 max-w-2xl text-[2.125rem] leading-[1.15] sm:text-5xl">
          Turlar ve fiyatlar
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
          {products.length} farklı tur var. Hepsinin fiyatı aşağıda yazılı.
          Fiyatlara kaptan, yakıt, liman ve koy ücretleri dahil; dahil olmayan
          kalemleri her turun kendi sayfasında ayrı ayrı listeliyoruz.
        </p>
      </section>

      {/* ---------- Fiyat tipi açıklaması ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="rounded-sm border border-line bg-surface p-5">
          <p className="eyebrow">Fiyat nasıl hesaplanır</p>
          <dl className="mt-3 grid gap-4 sm:grid-cols-3">
            {usedPricingTypes.map((type) => (
              <div key={type}>
                <dt className="text-sm font-medium">{PRICING_LABEL[type]}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {PRICING_EXPLAINER[type]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Fiyat tablosu ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">Fiyat listesi</h2>
          <p className="flex items-center gap-2 text-xs text-ink-soft">
            <SampleBadge />
            işaretli fiyatlar demo verisidir
          </p>
        </div>

        {/*
          Mobilde fiyat kolonu ASLA ekran dışında kalmamalı — sitenin tek işi
          fiyatı göstermek. Bu yüzden yatay kaydırma yerine düşük öncelikli
          kolonlar (kapasite, fiyat tipi) küçük ekranda gizleniyor.
        */}
        <div className="mt-5 overflow-x-auto rounded-sm border border-line bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Turların süresi, kapasitesi ve fiyatı
            </caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                <th scope="col" className="px-3 py-3 font-medium sm:px-4">Tur</th>
                <th scope="col" className="px-3 py-3 font-medium sm:px-4">Süre</th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">
                  Kapasite
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Fiyat tipi
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium sm:px-4">
                  Fiyat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => (
                <tr key={product.slug}>
                  <th scope="row" className="px-3 py-3.5 font-normal sm:px-4">
                    <Link
                      href={`/turlar/${product.slug}`}
                      className="hover:text-accent"
                    >
                      {product.name}
                    </Link>
                  </th>
                  <td className="whitespace-nowrap px-3 py-3.5 text-ink-soft sm:px-4">
                    {durationLabel(product) ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-ink-soft sm:table-cell">
                    {guestsLabel(product)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-ink-soft md:table-cell">
                    {PRICING_LABEL[product.pricingType]}
                  </td>
                  <td className="px-3 py-3.5 text-right sm:px-4">
                    <span className="block whitespace-nowrap font-semibold tracking-tight">
                      {startingFromLabel(product)}
                    </span>
                    {product.isSamplePrice && (
                      <SampleBadge className="mt-1 sm:mt-0.5" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Tur kartları ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
        <h2 className="text-2xl sm:text-3xl">Turların tamamı</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="rounded-sm border border-line bg-surface p-6 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl">
                Hangisinin size uyduğundan emin değil misiniz?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
                Kişi sayınızı ve aklınızdaki tarihi yazın; hangi turun uygun
                olduğunu söyleyelim. {info.workingHours} ulaşabilirsiniz.
              </p>
            </div>
            <a
              href={whatsappUrl(
                info.whatsapp,
                "Merhaba, hangi turun bize uygun olduğunu sormak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-wa px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
            >
              <WhatsappIcon className="size-4" />
              WhatsApp&apos;tan sorun
              <ArrowIcon className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
