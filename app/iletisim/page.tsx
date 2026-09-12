import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import DemoNotice from "@/components/DemoNotice";
import GoogleRating from "@/components/GoogleRating";
import {
  ArrowIcon,
  ClockIcon,
  PhoneIcon,
  PinIcon,
  WhatsappIcon,
} from "@/components/icons";
import { directionsUrl, telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

export const metadata: Metadata = {
  title: "İletişim | Fethiye Tekne Kiralama",
  description:
    "As Yachting'e ulaşın: telefon, WhatsApp ve Fethiye Limanı beton iskeledeki konumumuz. Her gün 24 saat açığız.",
  alternates: { canonical: "/iletisim" },
};

export default async function ContactPage() {
  const info = await getSiteInfo();

  return (
    <>
      <DemoNotice />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
        <nav aria-label="Sayfa yolu" className="text-xs text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-accent">Ana sayfa</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">İletişim</li>
          </ol>
        </nav>

        <header className="mt-6">
          <p className="eyebrow">İletişim</p>
          <h1 className="mt-4 text-[2.125rem] leading-[1.15] sm:text-5xl">
            Bize ulaşın
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            En hızlı yol WhatsApp. Telefonla da arayabilirsiniz —{" "}
            {info.workingHours.toLocaleLowerCase("tr-TR")} açığız.
          </p>
          <div className="mt-6">
            <GoogleRating
              rating={info.googleRating}
              reviewCount={info.googleReviewCount}
              profileUrl={info.googleProfileUrl}
            />
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
          {/* ---------- Bilgiler ---------- */}
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="rounded-sm border border-line bg-surface p-5">
                <PhoneIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">Telefon</h2>
                <a
                  href={telUrl(info.phone)}
                  className="mt-1 inline-block text-base hover:text-accent"
                >
                  {info.phone}
                </a>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <WhatsappIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">WhatsApp</h2>
                <a
                  href={whatsappUrl(
                    info.whatsapp,
                    "Merhaba, tekne kiralama hakkında bilgi almak istiyorum.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-base hover:text-accent"
                >
                  Sohbeti başlatın
                </a>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <ClockIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">Çalışma saati</h2>
                <p className="mt-1 text-base">{info.workingHours}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Gece geç saatte de yazabilirsiniz.
                </p>
              </li>

              <li className="rounded-sm border border-line bg-surface p-5">
                <PinIcon className="size-5 text-accent" />
                <h2 className="mt-3 text-lg">Adres</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {info.address}
                </p>
              </li>
            </ul>

            {/* ---------- Harita bağlantıları ---------- */}
            <div className="mt-6 rounded-sm border border-line bg-surface p-5">
              <h2 className="text-lg">Nasıl gelinir?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Fethiye Limanı içindeki beton iskeledeyiz. Yol tarifi için
                aşağıdaki bağlantıyı açın; telefonunuzun navigasyonu doğrudan
                iskeleye yönlendirir.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={directionsUrl(
                    info.departure.lat,
                    info.departure.lng,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3.5 text-sm font-medium text-deep transition-opacity hover:opacity-90"
                >
                  <PinIcon className="size-4" />
                  Yol tarifi al
                </a>
                <a
                  href={info.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-line px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
                >
                  Haritada görün
                  <ArrowIcon className="size-4" />
                </a>
              </div>
            </div>

            {/* TODO: Instagram hesabı doğrulanınca buraya bağlantı eklenecek
                (seed'de instagram alanı hâlâ null). */}
          </div>

          {/* ---------- Form ---------- */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ContactForm whatsapp={info.whatsapp} />
            <p className="mt-4 text-center text-sm text-ink-soft">
              Tarih ve fiyat için{" "}
              <Link
                href="/turlar"
                className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                turlar sayfasına
              </Link>{" "}
              göz atabilirsiniz.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
