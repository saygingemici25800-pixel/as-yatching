import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Wordmark: "As Yachting" — alt çizgi yok, "Luxury" yok.
 * TODO: Faz 4'te vektörleştirilmiş logo SVG'si buraya gelecek.
 * O zamana kadar marka tipografisiyle yazılmış metin wordmark kullanılıyor.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <Link
      href="/"
      className={`wordmark font-display leading-none ${className}`}
      aria-label={t("wordmarkLabel")}
    >
      As Yachting
    </Link>
  );
}
