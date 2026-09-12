import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { PhoneIcon, WhatsappIcon } from "@/components/icons";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

const NAV = [
  { href: "/turlar", label: "Turlar" },
  { href: "/tekne", label: "Tekne" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];

export default async function SiteHeader() {
  const info = await getSiteInfo();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark className="text-2xl sm:text-[1.75rem]" />

        <nav className="hidden md:block" aria-label="Ana menü">
          <ul className="flex items-center gap-6 text-sm lg:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink transition-colors hover:text-accent"
                >
                  <RandomLetterSwap
                    label={item.label}
                    staggerDuration={0.025}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telUrl(info.phone)}
            className="hidden items-center gap-2 text-sm text-ink-soft transition-colors hover:text-accent lg:inline-flex"
          >
            <PhoneIcon className="size-4" />
            {info.phone}
          </a>
          <a
            href={whatsappUrl(
              info.whatsapp,
              "Merhaba, tekne kiralama hakkında bilgi almak istiyorum.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-3.5 py-2 text-sm text-deep transition-opacity hover:opacity-90"
          >
            <WhatsappIcon className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Mobil menü: hamburger yok, iki bağlantı zaten sığıyor */}
      <nav
        className="border-t border-line md:hidden"
        aria-label="Ana menü (mobil)"
      >
        <ul className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2.5 text-sm">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-ink-soft hover:text-accent"
              >
                <RandomLetterSwap label={item.label} staggerDuration={0.025} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
