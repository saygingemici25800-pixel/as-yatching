/**
 * Sadece bağlantı biçimlendirme yardımcıları — veri erişimi yok.
 * Veri her zaman `lib/repository.ts`'ten gelir, buraya parametre olarak geçirilir.
 */

/** wa.me bağlantısı. `whatsapp` alanı ülke koduyla, işaretsiz: 905444507013 */
export function whatsappUrl(whatsapp: string, text?: string): string {
  const base = `https://wa.me/${whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** tel: bağlantısı — boşluk ve parantezler temizlenir */
export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
