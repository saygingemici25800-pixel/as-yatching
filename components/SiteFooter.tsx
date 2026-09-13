import { getTranslations } from "next-intl/server";
import ScrollLoopHint from "@/components/ScrollLoopHint";
import Wordmark from "@/components/Wordmark";
import {
  ClockIcon,
  InstagramIcon,
  PhoneIcon,
  PinIcon,
  WhatsappIcon,
} from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

const LINKS: { href: StaticPathname; key: string; ns: "nav" | "common" | "footer" }[] = [
  { href: "/turlar", key: "toursAndPrices", ns: "common" },
  { href: "/tekne", key: "boat", ns: "nav" },
  { href: "/sss", key: "faqLong", ns: "footer" },
  { href: "/iletisim", key: "contact", ns: "nav" },
];

export default async function SiteFooter() {
  const [info, t, tn, tc] = await Promise.all([
    getSiteInfo(),
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("common"),
  ]);
  const label = (item: (typeof LINKS)[number]) =>
    item.ns === "nav" ? tn(item.key) : item.ns === "common" ? tc(item.key) : t(item.key);

  return (
    <footer className="mt-20 border-t border-line/60 bg-canvas/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            {t("text")}
          </p>
        </div>

        <div>
          <p className="eyebrow">{t("contactEyebrow")}</p>
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
                className="inline-flex items-center gap-2 rounded-sm bg-wa px-3 py-1.5 text-white transition-colors hover:bg-wa-deep"
              >
                <WhatsappIcon className="size-4" />
                {tc("whatsappWrite")}
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
                  {t("instagram")}
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
          <p className="eyebrow">{t("addressEyebrow")}</p>
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
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-accent">
                  {label(item)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {info.brandName}</p>
          <p>{t("demo")}</p>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-4 text-center sm:px-6">
          <ScrollLoopHint />
        </div>
      </div>
    </footer>
  );
}
