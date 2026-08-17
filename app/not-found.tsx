import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 max-w-xl text-[2.125rem] leading-[1.15] sm:text-5xl">
        Aradığınız sayfa yok
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
        Bağlantı eskimiş ya da adres yanlış yazılmış olabilir. Buradan devam
        edebilirsiniz.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Ana sayfaya dönün
          <ArrowIcon className="size-4" />
        </Link>
        <Link
          href="/turlar"
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-line bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-accent"
        >
          Turlar ve fiyatlar
        </Link>
      </div>
    </div>
  );
}
