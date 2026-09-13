import { getTranslations } from "next-intl/server";
import { PhoneIcon, WhatsappIcon } from "@/components/icons";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

/**
 * Mobilde her ekranda görünen sabit dönüşüm barı (Bölüm 5.4).
 * Pop-up veya çıkış niyeti kullanılmıyor — güveni bozar.
 */
export default async function MobileContactBar() {
  const [info, t, tw] = await Promise.all([
    getSiteInfo(),
    getTranslations("nav"),
    getTranslations("whatsapp"),
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-cream/20 bg-navy md:hidden">
      <div className="grid grid-cols-2 gap-2 p-3">
        <a
          href={telUrl(info.phone)}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-cream px-3 py-3 text-sm font-medium text-navy transition-colors hover:bg-surface"
        >
          <PhoneIcon className="size-4" />
          {t("call")}
        </a>
        <a
          href={whatsappUrl(info.whatsapp, tw("generalInquiry"))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-wa px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-wa-deep"
        >
          <WhatsappIcon className="size-4" />
          {t("whatsapp")}
        </a>
      </div>
    </div>
  );
}
