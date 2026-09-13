import { useTranslations } from "next-intl";

/**
 * Demo aşamasında dürüstlük şeridi.
 * Faz 6'da gerçek veriye geçilince bu bileşen kaldırılacak.
 */
export default function DemoNotice() {
  const t = useTranslations("common");

  return (
    <div className="border-y border-line bg-surface">
      <p className="mx-auto max-w-6xl px-4 py-3 text-xs leading-relaxed text-ink-soft sm:px-6">
        <span className="mr-2 font-medium uppercase tracking-[0.12em] text-accent">
          {t("demoLabel")}
        </span>
        {t("demoText")}
      </p>
    </div>
  );
}
