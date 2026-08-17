import Image from "next/image";
import Link from "next/link";
import SampleBadge from "@/components/SampleBadge";
import { ClockIcon, UsersIcon } from "@/components/icons";
import { startingFromLabel } from "@/lib/pricing";
import type { Product } from "@/lib/types";

/** Süre etiketi: saatlik, günlük ve konaklamalı ürünlerin hepsini karşılar */
export function durationLabel(product: Product): string | null {
  if (product.durationDays && product.durationDays > 1) {
    return `${product.durationDays} gün`;
  }
  if (product.durationHours) {
    return `${product.durationHours} saat`;
  }
  return null;
}

export function guestsLabel(product: Product): string {
  return product.minGuests > 1
    ? `${product.minGuests}–${product.maxGuests} kişi`
    : `${product.maxGuests} kişiye kadar`;
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const duration = durationLabel(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors hover:border-accent/50">
      <Link
        href={`/turlar/${product.slug}`}
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
          <Link
            href={`/turlar/${product.slug}`}
            className="transition-colors hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {product.shortDescription}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
          {duration && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Süre</dt>
              <ClockIcon className="size-3.5 text-accent" />
              <dd>{duration}</dd>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Kapasite</dt>
            <UsersIcon className="size-3.5 text-accent" />
            <dd>{guestsLabel(product)}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xs text-ink-soft">Başlangıç fiyatı</p>
            <p className="mt-0.5 flex items-center gap-2">
              {/* Fiyatlar gövde fontunda: Cormorant'ın eski usul rakamları
                  (küçük harf görünümlü) fiyat okunurluğunu düşürüyor. */}
              <span className="text-lg font-semibold tracking-tight">
                {startingFromLabel(product)}
              </span>
              {product.isSamplePrice && <SampleBadge />}
            </p>
          </div>
          <Link
            href={`/turlar/${product.slug}`}
            className="shrink-0 text-sm text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            Detay
          </Link>
        </div>
      </div>
    </article>
  );
}
