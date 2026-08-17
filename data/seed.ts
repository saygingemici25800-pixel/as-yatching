import type {
  AvailabilityBlock,
  Boat,
  Faq,
  Product,
  SiteInfo,
} from "@/lib/types";

/**
 * DEMO VERİSİ
 * ------------------------------------------------------------------
 * Buradaki tekne özellikleri ve fiyatlar YER TUTUCUDUR.
 * Gerçek bilgi müşteriden alındığında SADECE bu dosya değişecek.
 * Arayüzde fiyatlar `ÖRNEK` rozetiyle gösterilir (isSamplePrice: true).
 *
 * GERÇEK OLAN VERİLER: telefon, adres, çalışma saati, Google puanı.
 */

export const siteInfo: SiteInfo = {
  brandName: "As Yachting",
  legalName: null, // TODO: ticari unvan
  phone: "+90 544 450 70 13",
  whatsapp: "905444507013",
  address: "Fethiye Limanı beton iskele, 48300 Fethiye / Muğla",
  mapUrl: "https://maps.google.com/?q=Fethiye+Limanı+beton+iskele",
  googleRating: 5.0,
  googleReviewCount: 34,
  googleProfileUrl: null, // TODO: GBP kısa linki
  workingHours: "Her gün 24 saat",
  instagram: null, // TODO
  highSeasonMonths: [6, 7, 8, 9],
};

export const boats: Boat[] = [
  {
    slug: "as-yachting-1",
    name: "TODO: Tekne adı",
    type: "TODO: gulet / motoryat / sürat teknesi",
    lengthMeters: 0, // TODO
    maxGuests: 12, // TODO
    cabins: null, // TODO
    crew: 2, // TODO
    yearBuilt: null, // TODO
    homePort: "Fethiye Limanı",
    amenities: [
      "Gölgelik alan",
      "Güneşlenme minderleri",
      "Duş",
      "Tuvalet",
      "Müzik sistemi",
      "Şnorkel ekipmanı",
      "Yüzme merdiveni",
    ],
    safety: [
      "Can yeleği (tüm misafirler için)",
      "Çocuk boy can yeleği",
      "İlk yardım çantası",
      "Yangın söndürücü",
      // TODO: sigorta ve turizm belgesi bilgisi eklenecek
    ],
    images: [
      "/placeholder/boat-01.jpg",
      "/placeholder/boat-02.jpg",
      "/placeholder/boat-03.jpg",
    ],
    isPlaceholder: true,
  },
];

const standardIncludes = {
  included: [
    "Kaptan ve mürettebat",
    "Yakıt",
    "Liman ve koy giriş ücretleri",
    "Şnorkel ekipmanı",
    "Buzlu su",
    "Sigorta",
  ],
  excluded: [
    "Öğle yemeği (talep üzerine eklenir)",
    "İçecekler",
    "Ekstra su sporları",
  ],
};

export const products: Product[] = [
  {
    slug: "gunubirlik-ozel-kiralama",
    name: "Günübirlik Özel Kiralama",
    shortDescription:
      "Tekne bir gün boyunca yalnızca size ait. Rotayı birlikte belirliyoruz.",
    description:
      "Sabah Fethiye Limanı'ndan kalkıp gün boyunca körfezin koylarını geziyoruz. Başka grup yok, sabit program yok. Nerede ne kadar kalacağınıza siz karar veriyorsunuz.",
    boatSlug: "as-yachting-1",
    pricingType: "per_day",
    basePrice: 18000, // TODO: gerçek fiyat
    currency: "TRY",
    minGuests: 1,
    maxGuests: 12,
    durationHours: 8,
    durationDays: null,
    highSeasonMultiplier: 1.25,
    route: [
      { time: "10:00", name: "Fethiye Limanı'ndan hareket", note: null },
      { time: "11:00", name: "Kızılada", note: "Yüzme molası" },
      { time: "13:00", name: "Akvaryum Koyu", note: "Öğle molası" },
      { time: "15:00", name: "Samanlık Koyu", note: "Şnorkel" },
      { time: "18:00", name: "Limana dönüş", note: null },
    ],
    priceIncludes: standardIncludes,
    images: ["/placeholder/product-private-01.jpg"],
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "gun-batimi-turu",
    name: "Gün Batımı Turu",
    shortDescription:
      "Üç saatlik kısa kaçamak. Akşamüstü kalkış, körfezde gün batımı.",
    description:
      "Günün en sakin saatinde körfeze açılıyoruz. Kalabalık dağılmış, deniz durulmuş oluyor. Çift ya da küçük gruplar için ideal.",
    boatSlug: "as-yachting-1",
    pricingType: "per_hour",
    basePrice: 2500, // TODO
    currency: "TRY",
    minGuests: 1,
    maxGuests: 12,
    durationHours: 3,
    durationDays: null,
    highSeasonMultiplier: 1.15,
    route: [
      { time: "17:30", name: "Limandan hareket", note: null },
      { time: "18:15", name: "Körfez turu", note: "Yüzme molası" },
      { time: "20:30", name: "Limana dönüş", note: null },
    ],
    priceIncludes: standardIncludes,
    images: ["/placeholder/product-sunset-01.jpg"],
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "sabah-kahvalti-turu",
    name: "Sabah Kahvaltı Turu",
    shortDescription:
      "Erken kalkış, sakin deniz, teknede kahvaltı. Kişi başı fiyat.",
    description:
      "Sabah yedide kalkıyoruz. Koylar boş, su cam gibi. Kahvaltı teknede hazırlanıyor. Günü erken bitirip kalan zamanınız size kalıyor.",
    boatSlug: "as-yachting-1",
    pricingType: "per_person",
    basePrice: 1200, // TODO
    currency: "TRY",
    minGuests: 4,
    maxGuests: 12,
    durationHours: 4,
    durationDays: null,
    highSeasonMultiplier: 1.1,
    route: [
      { time: "07:00", name: "Limandan hareket", note: null },
      { time: "08:00", name: "Sakin koy", note: "Kahvaltı" },
      { time: "11:00", name: "Limana dönüş", note: null },
    ],
    priceIncludes: {
      included: [...standardIncludes.included, "Serpme kahvaltı"],
      excluded: ["Alkollü içecekler", "Ekstra su sporları"],
    },
    images: ["/placeholder/product-breakfast-01.jpg"],
    featured: false,
    isSamplePrice: true,
  },
  {
    slug: "evlilik-teklifi",
    name: "Evlilik Teklifi Kurgusu",
    shortDescription:
      "Süsleme, müzik ve zamanlama bizde. Siz sadece soruyu sorun.",
    description:
      "Tekne sizin için hazırlanıyor: çiçek düzeni, müzik, doğru koy ve doğru saat. İsterseniz fotoğrafçı ekleniyor. Her adımı önceden konuşup planlıyoruz.",
    boatSlug: "as-yachting-1",
    pricingType: "per_day",
    basePrice: 24000, // TODO
    currency: "TRY",
    minGuests: 2,
    maxGuests: 8,
    durationHours: 4,
    durationDays: null,
    highSeasonMultiplier: 1.2,
    route: [
      { time: null, name: "Saat ve rota size göre planlanır", note: null },
    ],
    priceIncludes: {
      included: [...standardIncludes.included, "Çiçek düzeni", "Müzik sistemi"],
      excluded: ["Fotoğrafçı (ek paket)", "Pasta ve ikram", "Havai fişek"],
    },
    images: ["/placeholder/product-proposal-01.jpg"],
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "mavi-tur",
    name: "Mavi Tur (Konaklamalı)",
    shortDescription:
      "Birkaç gün denizde. Fethiye'den çıkıp körfezin koylarında konaklama.",
    description:
      "Gündüz yüzme ve koy gezisi, gece koyda demirleyip teknede uyuma. Rota hava durumuna ve grubun temposuna göre birlikte belirleniyor.",
    boatSlug: "as-yachting-1",
    pricingType: "per_day",
    basePrice: 32000, // TODO
    currency: "TRY",
    minGuests: 2,
    maxGuests: 12,
    durationHours: null,
    durationDays: 3,
    highSeasonMultiplier: 1.3,
    route: [
      { time: null, name: "1. gün — Fethiye körfezi koyları", note: null },
      { time: null, name: "2. gün — Göcek 12 Adalar", note: null },
      { time: null, name: "3. gün — Ölüdeniz yönü ve dönüş", note: null },
    ],
    priceIncludes: {
      included: [...standardIncludes.included, "Konaklama", "Yatak takımı"],
      excluded: ["Yemekler", "İçecekler", "Ekstra su sporları"],
    },
    images: ["/placeholder/product-bluecruise-01.jpg"],
    featured: false,
    isSamplePrice: true,
  },
];

/** Demo takvimi: önümüzdeki dönemde dolu görünen örnek tarihler */
export const availabilityBlocks: AvailabilityBlock[] = [
  { date: "2026-08-22", boatSlug: "as-yachting-1", reason: "booked" },
  { date: "2026-08-23", boatSlug: "as-yachting-1", reason: "booked" },
  { date: "2026-08-29", boatSlug: "as-yachting-1", reason: "booked" },
  { date: "2026-09-05", boatSlug: "as-yachting-1", reason: "maintenance" },
  { date: "2026-09-12", boatSlug: "as-yachting-1", reason: "booked" },
];

export const faqs: Faq[] = [
  {
    question: "Fiyata neler dahil?",
    answer:
      "Kaptan, yakıt, liman ve koy ücretleri, sigorta ve şnorkel ekipmanı dahildir. Yemek ve içecekler ayrıdır; talep ederseniz ekleyebiliyoruz. Her turun sayfasında dahil olan ve olmayan kalemler ayrı ayrı yazılıdır.",
  },
  {
    question: "Yüzme bilmiyorum, katılabilir miyim?",
    answer:
      "Katılabilirsiniz. Teknede her misafir için can yeleği bulunuyor ve yüzme molalarında mürettebat sizinle ilgileniyor.",
  },
  {
    question: "Çocuklarla gelebilir miyiz?",
    answer:
      "Evet. Çocuk boy can yeleğimiz mevcut. Küçük çocuklarla geliyorsanız rezervasyon sırasında belirtin, rotayı buna göre planlayalım.",
  },
  {
    question: "Hava kötü olursa ne oluyor?",
    answer:
      "Hava koşulları güvenli değilse tur yapılmaz. Bu durumda tarihi ücretsiz olarak değiştiriyoruz.",
  },
  {
    question: "Rezervasyon nasıl yapılıyor?",
    answer:
      "Takvimden istediğiniz tarihi seçip talep gönderiyorsunuz. Size dönüş yapıp detayları netleştiriyoruz.",
  },
  // TODO: iptal ve iade koşulları müşteriden alınacak
];
