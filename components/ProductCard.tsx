import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import SampleBadge from "@/components/SampleBadge";
import { ClockIcon, UsersIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { durationLabel, guestsLabel, startingFromLabel } from "@/lib/pricing";
import type { Locale, Product } from "@/lib/types";

export { durationLabel, guestsLabel } from "@/lib/pricing";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const tp = useTranslations("pricing");
  const locale = useLocale() as Locale;
  const duration = durationLabel(product, tp);
  const href = { pathname: "/turlar/[urun]", params: { urun: product.slug } } as const;

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-accent/50">
      <Link
        href={href}
        className="relative block aspect-[3/2] overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={product.images[0]}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          priority={priority}
          className="object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl">
          <Link href={href} className="transition-colors hover:text-accent">
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {product.shortDescription}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
          {duration && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">{t("duration")}</dt>
              <ClockIcon className="keep-accent size-3.5 text-accent" />
              <dd>{duration}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t("capacity")}</dt>
            <UsersIcon className="keep-accent size-3.5 text-accent" />
            <dd>{guestsLabel(product, tp)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xs text-ink-soft">{t("startingPrice")}</p>
            <p className="mt-0.5 flex items-center gap-2">
              {/* Fiyatlar gövde fontunda: başlık fontunun eski usul rakamları
                  fiyat okunurluğunu düşürüyor. */}
              <span className="text-lg font-semibold tracking-tight">
                {startingFromLabel(product, tp, locale)}
              </span>
              {product.isSamplePrice && <SampleBadge />}
            </p>
          </div>
          <Link
            href={href}
            className="shrink-0 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {t("detail")}
          </Link>
        </div>
      </div>
    </article>
  );
}
