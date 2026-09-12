import { PhoneIcon, WhatsappIcon } from "@/components/icons";
import { telUrl, whatsappUrl } from "@/lib/links";
import { getSiteInfo } from "@/lib/repository";

/**
 * Mobilde her ekranda görünen sabit dönüşüm barı (Bölüm 5.4).
 * Pop-up veya çıkış niyeti kullanılmıyor — güveni bozar.
 */
export default async function MobileContactBar() {
  const info = await getSiteInfo();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-sky md:hidden">
      <div className="grid grid-cols-2 gap-2 p-3">
        <a
          href={telUrl(info.phone)}
          className="text-gold-glow inline-flex items-center justify-center gap-2 rounded-sm border border-gold px-3 py-3 text-sm font-medium"
        >
          <PhoneIcon className="size-4" />
          Ara
        </a>
        <a
          href={whatsappUrl(
            info.whatsapp,
            "Merhaba, tekne kiralama hakkında bilgi almak istiyorum.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold-deep bg-gold px-3 py-3 text-sm font-medium text-deep transition-colors hover:bg-gold-deep"
        >
          <WhatsappIcon className="size-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
