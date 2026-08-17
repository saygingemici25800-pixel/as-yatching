"use server";

import {
  createBookingRequest,
  getProduct,
  isDateAvailable,
} from "@/lib/repository";

export interface BookingActionInput {
  productSlug: string;
  date: string;
  guests: number;
}

export type BookingActionResult =
  | { ok: true; whatsappUrl: string }
  | { ok: false; error: string };

/**
 * Talep formunun sunucu tarafı.
 * WhatsApp mesajı `lib/repository.ts` içinde üretiliyor — istemci seed'e veya
 * mesaj biçimine hiç dokunmuyor. Faz 6'da repository veritabanına yazmaya
 * başladığında bu dosya değişmeyecek.
 *
 * Tarayıcıdaki kontrollere güvenilmez; müsaitlik ve kişi sayısı burada
 * yeniden doğrulanıyor.
 */
export async function requestBooking(
  input: BookingActionInput,
): Promise<BookingActionResult> {
  const product = await getProduct(input.productSlug);
  if (!product) {
    return { ok: false, error: "Tur bulunamadı." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false, error: "Lütfen takvimden bir tarih seçin." };
  }

  const available = await isDateAvailable(product.boatSlug, input.date);
  if (!available) {
    return {
      ok: false,
      error: "Seçtiğiniz tarih dolu görünüyor. Başka bir tarih seçin.",
    };
  }

  const guests = Math.round(input.guests);
  if (
    !Number.isFinite(guests) ||
    guests < product.minGuests ||
    guests > product.maxGuests
  ) {
    return {
      ok: false,
      error: `Kişi sayısı ${product.minGuests} ile ${product.maxGuests} arasında olmalı.`,
    };
  }

  // name/phone alanları boş geçiliyor: talep WhatsApp'a devredildiği için
  // kimlik bilgisi WhatsApp hesabından geliyor, formda 3 alandan fazlası yok.
  // TODO: Faz 6'da talepler veritabanına yazılacağı zaman bu iki alan forma eklenecek.
  return createBookingRequest({
    productSlug: product.slug,
    date: input.date,
    guests,
    name: "",
    phone: "",
  });
}
