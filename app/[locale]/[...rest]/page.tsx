import { notFound } from "next/navigation";

/**
 * Dil segmenti altında eşleşmeyen her adres → yerelleştirilmiş 404
 * (app/[locale]/not-found.tsx). Kök düzeyde not-found yok; bütün sayfalar
 * [locale] altında olduğu için bu yakalayıcı yeterli.
 */
export default function CatchAllPage() {
  notFound();
}
