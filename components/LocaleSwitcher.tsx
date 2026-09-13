"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Sade dil seçici: TR / EN / RU. Aynı sayfanın diğer dildeki adresine
 * gider (yerelleştirilmiş yol + aynı parametreler). Seçim next-intl
 * çerezine yazılır; aktif dil vurgulu ve aria-current ile işaretli.
 */
export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <ul
      aria-label={t("language")}
      className={`flex items-center gap-1.5 text-xs tracking-wide ${className}`}
    >
      {routing.locales.map((item, index) => {
        const active = item === locale;
        return (
          <li key={item} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-gold/40">
                /
              </span>
            )}
            <Link
              // @ts-expect-error -- pathname ve params aynı rotadan geliyor; uyum garantili
              href={{ pathname, params }}
              locale={item}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "nav-shadow font-semibold text-gold underline decoration-gold/60 underline-offset-4"
                  : "nav-shadow text-gold/70 transition-colors hover:text-gold"
              }
            >
              {item.toUpperCase()}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
