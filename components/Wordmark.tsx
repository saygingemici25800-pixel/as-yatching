import Link from "next/link";

/**
 * Wordmark: "As Yachting" — alt çizgi yok, "Luxury" yok.
 * TODO: Faz 4'te vektörleştirilmiş logo SVG'si buraya gelecek.
 * O zamana kadar marka tipografisiyle yazılmış metin wordmark kullanılıyor.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`wordmark font-display leading-none ${className}`}
      aria-label="As Yachting — ana sayfa"
    >
      As Yachting
    </Link>
  );
}
