import { useTranslations } from "next-intl";

/**
 * Demo aşamasında her fiyatın yanında zorunlu.
 * Faz 6'da gerçek fiyat girildiğinde seed'de isSamplePrice=false olur ve rozet kaybolur.
 */
export default function SampleBadge({ className = "" }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <span
      title={t("sampleBadgeTitle")}
      className={`inline-flex items-center rounded-sm border border-accent/60 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-accent ${className}`}
    >
      {t("sampleBadge")}
    </span>
  );
}
