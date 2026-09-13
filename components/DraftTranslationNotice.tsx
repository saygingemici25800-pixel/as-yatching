import { useTranslations } from "next-intl";

/**
 * "Taslak çeviri / Draft translation" şeridi.
 * EN ve RU içerik makine çevirisidir; bu şerit yalnızca indeksleme kilidi
 * kapalıyken (NEXT_PUBLIC_ALLOW_INDEXING false) ve TR dışı dillerde görünür.
 * Kilit açıldığında (yayın) kendiliğinden kaybolur — çeviri kontrolü yayın
 * listesinin bir maddesi.
 */
export default function DraftTranslationNotice() {
  const t = useTranslations("common");

  return (
    <div className="border-b border-line bg-surface-2">
      <p className="mx-auto max-w-6xl px-4 py-2 text-xs leading-relaxed text-ink-soft sm:px-6">
        <span className="mr-2 font-medium uppercase tracking-[0.12em] text-accent">
          Draft
        </span>
        {t("draftTranslation")}
      </p>
    </div>
  );
}
