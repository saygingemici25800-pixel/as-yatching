import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import {
  ClockIcon,
  InstagramIcon,
  PhoneIcon,
  PinIcon,
  WhatsappIcon,
} from "@/components/icons";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

export default async function SiteFooter() {
  const info = await getSiteInfo();

  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Fethiye Limanı&apos;ndan kalkan günübirlik ve konaklamalı tekne
            turları. Fiyatlar sitede yazılı, tarihler takvimde açık.
          </p>
        </div>

        <div>
          <p className="eyebrow">İletişim</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a
                href={telUrl(info.phone)}
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <PhoneIcon className="size-4 text-accent" />
                {info.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl(info.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <WhatsappIcon className="size-4 text-accent" />
                WhatsApp&apos;tan yazın
              </a>
            </li>
            {info.instagram && (
              <li>
                <a
                  href={info.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-accent"
                >
                  <InstagramIcon className="size-4 text-accent" />
                  Instagram: @as_yachting
                </a>
              </li>
            )}
            <li className="flex items-start gap-2 text-ink-soft">
              <ClockIcon className="mt-0.5 size-4 shrink-0 text-accent" />
              {info.workingHours}
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Adres</p>
          <a
            href={info.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-start gap-2 text-sm leading-relaxed hover:text-accent"
          >
            <PinIcon className="mt-0.5 size-4 shrink-0 text-accent" />
            {info.address}
          </a>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <Link href="/turlar" className="text-ink-soft hover:text-accent">
                Turlar ve fiyatlar
              </Link>
            </li>
            <li>
              <Link href="/tekne" className="text-ink-soft hover:text-accent">
                Tekne
              </Link>
            </li>
            <li>
              <Link href="/sss" className="text-ink-soft hover:text-accent">
                Sık sorulan sorular
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className="text-ink-soft hover:text-accent">
                İletişim
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {info.brandName}</p>
          <p>
            Demo sürüm — fiyatlar ve tekne bilgileri örnektir.
          </p>
        </div>
      </div>
    </footer>
  );
}
