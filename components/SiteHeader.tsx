import { getTranslations } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import Wordmark from "@/components/Wordmark";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { PhoneIcon, WhatsappIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

/** Menü en fazla 6 öğe; hediye çeki ve misafir bilgisi footer'da */
const NAV: {
  href: StaticPathname;
  key: "tours" | "boat" | "about" | "faq" | "contact";
}[] = [
  { href: "/turlar", key: "tours" },
  { href: "/tekne", key: "boat" },
  { href: "/hakkimizda", key: "about" },
  { href: "/sss", key: "faq" },
  { href: "/iletisim", key: "contact" },
];

export default async function SiteHeader() {
  const [info, t, tw] = await Promise.all([
    getSiteInfo(),
    getTranslations("nav"),
    getTranslations("whatsapp"),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-cream/20 bg-navy">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark className="text-[1.75rem] sm:text-[2.125rem]" />

        <nav className="hidden md:block" aria-label={t("mainMenu")}>
          <ul className="flex items-center gap-6 text-sm lg:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-shadow text-gold transition-colors hover:text-gold-deep"
                >
                  <RandomLetterSwap
                    label={t(item.key)}
                    staggerDuration={0.025}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher className="hidden md:flex" />
          <a
            href={telUrl(info.phone)}
            className="hidden items-center gap-2 text-sm text-ink-soft transition-colors hover:text-accent lg:inline-flex"
          >
            <PhoneIcon className="size-4" />
            {info.phone}
          </a>
          <a
            href={whatsappUrl(info.whatsapp, tw("generalInquiry"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-wa px-3.5 py-2 text-sm text-white transition-colors hover:bg-wa-deep"
          >
            <WhatsappIcon className="size-4" />
            {t("whatsapp")}
          </a>
        </div>
      </div>

      {/* Mobil menü: hamburger yok; bağlantı satırı yatay kayar (375px'te
          hepsi sığmıyor), dil seçici sağda sabit */}
      <nav
        className="border-t border-cream/20 md:hidden"
        aria-label={t("mobileMenu")}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 text-sm">
          <ul className="scrollbar-hide -my-1 flex min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap py-1">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="nav-shadow text-gold hover:text-gold-deep"
                >
                  <RandomLetterSwap label={t(item.key)} staggerDuration={0.025} />
                </Link>
              </li>
            ))}
          </ul>
          <LocaleSwitcher className="shrink-0" />
        </div>
      </nav>
    </header>
  );
}
