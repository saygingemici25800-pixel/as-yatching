import type {
  GoogleReview,
  AvailabilityBlock,
  Bay,
  Boat,
  MapPoint,
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
  googleReviewCount: 33, // Google profili, 2026-09-12
  googleProfileUrl: "https://www.google.com/maps?cid=4934811779244890993",
  workingHours: "Her gün 24 saat",
  instagram: "https://www.instagram.com/as_yachting/",
  highSeasonMonths: [6, 7, 8, 9],
  departure: {
    label: "Fethiye Limanı · beton iskele",
    // TODO: gerçek iskele pini — şimdilik liman kordonu, yaklaşık.
    // (Önceki 36.6213/29.1156 değeri Atatürk Cd. üzerine, limandan ~300 m
    // içeriye düşüyordu.)
    lat: 36.6242,
    lng: 29.1128,
    note: "Beton iskele, liman yürüyüş yolunun üzerinde.",
  },
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
      "/foto/tekne-kadeh.jpg",
      "/foto/aile-koy.jpg",
      "/foto/cift-ogle-yemegi.jpg",
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
    images: ["/foto/tekne-kadeh.jpg"],
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
    images: ["/koylar/oludeniz-gunbatimi.webp"], // Ölüdeniz gün batımı, Kumburnu
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
    images: ["/foto/cift-ogle-yemegi.jpg"],
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
    images: ["/foto/gunbatimi-cift.jpg"],
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
    images: ["/foto/aile-koy.jpg"],
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

/**
 * GERÇEK Google yorumları — https://www.google.com/maps?cid=4934811779244890993
 * 2026-09-12'de profilden birebir alındı. Metin değiştirilmez, uydurulmaz.
 * Uzun yorumlar site için kısaltıldı; kısaltma "…" ile işaretli.
 */
export const googleReviews: GoogleReview[] = [
  {
    author: "Mehtap Candaş",
    rating: 5,
    when: "3 ay önce",
    text: "Göcek koylarında geçirdiğimiz 5 gün gerçekten unutulmazdı. Baştan sona her detay özenle düşünülmüş, huzurlu ve keyifli bir deneyim yaşadık. Özellikle kaptanlarımızın profesyonelliği, güler yüzü ve misafirperverliği tatili çok daha özel hale getirdi…",
  },
  {
    author: "mustafa ünal",
    rating: 5,
    when: "4 yıl önce",
    text: "Bu teknede müşteri değil, misafirsiniz. Serkan ve Ayşe kaptanlar sanki ailemizden birileri gibiydiler. Yemekler,diğer hizmetler, ödediğimiz ücretin kat be kat üzerindeydi,mükemmeldi…",
  },
  {
    author: "Eda Nilüfer Özer",
    rating: 5,
    when: "2 yıl önce",
    text: "Kaptan Serkan bey ile çıktığımız Göcek tekne tatilinden çok memnun kaldık bizlere çok misafirperver davrandı ve her anımızın tadını çıkartmamız için elinden geleni yaptı…",
  },
  {
    author: "ÖMER ÖZMEN",
    rating: 5,
    when: "2 yıl önce",
    text: "Mükemmel bir tatil tekne tatili kaptan serkan ve yardımcı kaptan çayan güzel bir tatil geçirmeniz için gerçekten ellerinden geleni yapıyor harika bir yelkenli deneyimi",
  },
  {
    author: "Nuray Tınmaz",
    rating: 5,
    when: "4 yıl önce",
    text: "Serkan Abi ve Ayşe Abla çok tatlı insanlar çok güleryüzlü iki insan ile çok güzel koylara gittik bilgileriyle her geçtiğimiz yerleri anlattılar bize yemekler çok lezzetliydi başka yer aramayın kesinlikle pişman olmazsınız…",
  },
];

/**
 * KOYLAR — ana sayfa "Nereye gidiyoruz?" coverflow'u.
 *
 * Görseller işletmeden alınan gerçek fotoğraflar; ham halleri
 * public/koylar/raw/ (gitignore), optimize webp'ler public/koylar/ altında
 * (<slug>.webp uzun kenar 1600px, <slug>-thumb.webp 640px).
 *
 * `image: null` olan koylar arayüzde GÖSTERİLMEZ (fotoğraf gelince yol
 * yazılır, başka değişiklik gerekmez).
 *
 * distanceFromHarbor: limandan TAHMİNİ tekne süresi ("~20 dk" biçiminde,
 * arayüzde etiket "Limandan (tahmini)"). TODO: teyit — değerler kaptanla
 * teyit edilecek, teyit gelince "~" kalkabilir.
 *
 * TODO: stayDuration / tours / highlight işletmeden alınacak. Bilinmeyen
 * her değer "—" olarak gösterilir; UYDURULMAZ.
 * Dolu olan tours/highlight değerleri yukarıdaki `products[].route`
 * duraklarından alındı (Günübirlik Özel Kiralama rotası).
 */
export const bays: Bay[] = [
  {
    slug: "fethiye-limani",
    name: "Fethiye Limanı",
    blurb: "Kalkış noktamız: Fethiye Limanı beton iskele. Bütün turlar buradan başlar.",
    distanceFromHarbor: "Kalkış noktası",
    stayDuration: "—", // TODO: buluşma / kalkış saati düzeni
    tours: "Tüm turlar",
    highlight: "Buradan çıkıyoruz",
    image: "/koylar/fethiye-limani.webp",
    imageThumb: "/koylar/fethiye-limani-thumb.webp",
  },
  {
    slug: "kizilada",
    name: "Kızılada",
    blurb: "Limandan çıkınca ilk durak; günübirlik rotanın yüzme molası.",
    distanceFromHarbor: "~20 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "Günübirlik özel kiralama", // products[].route → 11:00 Kızılada
    highlight: "Yüzme molası", // products[].route notu
    image: null, // TODO: Kızılada fotoğrafı gelince /koylar/kizilada.webp
    imageThumb: null,
  },
  {
    slug: "akvaryum-koyu",
    name: "Akvaryum Koyu",
    blurb: "Adını berrak suyundan alan koy; günübirlik rotada öğle molası.",
    distanceFromHarbor: "~35 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "Günübirlik özel kiralama", // products[].route → 13:00 Akvaryum Koyu
    highlight: "Öğle yemeği durağı", // products[].route notu: Öğle molası
    image: "/koylar/akvaryum-koyu.webp",
    imageThumb: "/koylar/akvaryum-koyu-thumb.webp",
  },
  {
    slug: "samanlik-koyu",
    name: "Samanlık Koyu",
    blurb: "Korunaklı ve sığ koy; günübirlik rotada şnorkel durağı.",
    distanceFromHarbor: "~40 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "Günübirlik özel kiralama", // products[].route → 15:00 Samanlık Koyu
    highlight: "Şnorkel", // products[].route notu
    image: null, // TODO: Samanlık Koyu fotoğrafı gelince /koylar/samanlik-koyu.webp
    imageThumb: null,
  },
  {
    slug: "oludeniz",
    name: "Ölüdeniz",
    blurb: "Fethiye'nin en bilinen koyu; lagün ve uzun plaj.",
    distanceFromHarbor: "~75 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "—", // TODO: hangi turların rotasında
    highlight: "—", // TODO: öne çıkan özellik
    image: "/koylar/oludeniz.webp", // kuş bakışı lagün
    imageThumb: "/koylar/oludeniz-thumb.webp",
  },
  {
    slug: "gemiler-adasi",
    name: "Gemiler Adası",
    blurb: "Bizans dönemi kalıntılarının bulunduğu ada ve korunaklı demir yeri.",
    distanceFromHarbor: "~60 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "—", // TODO: hangi turların rotasında
    highlight: "—", // TODO: öne çıkan özellik
    image: "/koylar/gemiler-adasi.webp",
    imageThumb: "/koylar/gemiler-adasi-thumb.webp",
  },
  {
    slug: "kelebekler-vadisi",
    name: "Kelebekler Vadisi",
    blurb: "Dik kayalıklar arasında plaj; karadan ulaşımı zor, tekneyle kolay.",
    distanceFromHarbor: "~90 dk", // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "—", // TODO: hangi turların rotasında
    highlight: "—", // TODO: öne çıkan özellik
    image: "/koylar/kelebekler-vadisi.webp",
    imageThumb: "/koylar/kelebekler-vadisi-thumb.webp",
  },
];

/**
 * HARİTA NOKTALARI — "Nereden kalkıyoruz?" illüstratif haritası.
 * x/y: 800×520 viewBox; OSM koordinatlarından projectLonLat ile üretildi
 * (components/ui/fethiye-coast.ts). Konumlar OSM'den; "TODO: yaklaşık"
 * notlular elle konuldu. Tahmini süreler `bays[].distanceFromHarbor`dan okunur.
 */
export const mapPoints: MapPoint[] = [
  { slug: "fethiye-limani", name: "Fethiye Limanı", kind: "harbor", x: 547.6, y: 258.7, labelDx: 8, labelDy: -14, labelAnchor: "start" }, // pin: siteInfo.departure (TODO gerçek iskele)
  { slug: "fethiye", name: "Fethiye", kind: "town", x: 551.4, y: 262.6, labelDx: 10, labelDy: 14, labelAnchor: "start" },
  { slug: "karagozler", name: "Karagözler", kind: "town", x: 531.6, y: 262.8, priority: 2, labelDx: -6, labelDy: 12, labelAnchor: "end" },
  { slug: "calis", name: "Çalış", kind: "town", x: 543.5, y: 176.5, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "oludeniz", name: "Ölüdeniz", kind: "bay", x: 566.3, y: 397.6, icon: "sunset", labelDx: 0, labelDy: 26, labelAnchor: "middle" },
  { slug: "kayakoy", name: "Kayaköy", kind: "town", x: 509.4, y: 345.2, priority: 2, labelDx: 0, labelDy: -8, labelAnchor: "middle" },
  { slug: "hisaronu", name: "Hisarönü", kind: "town", x: 580.7, y: 356.9, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" },
  { slug: "gocek", name: "Göcek", kind: "town", x: 290.3, y: 15.6, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "faralya", name: "Faralya", kind: "town", x: 590.0, y: 500.0, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" }, // TODO: yaklaşık konum
  { slug: "kelebekler-vadisi", name: "Kelebekler Vadisi", kind: "bay", x: 566.0, y: 488.0, icon: "photo", labelDx: -16, labelDy: 4, labelAnchor: "end" }, // TODO: yaklaşık konum (alt kenardan içeri alındı)
  { slug: "sovalye", name: "Şövalye Adası", kind: "island", x: 531.9, y: 210.8, priority: 2, labelDx: 8, labelDy: -8, labelAnchor: "start" },
  { slug: "kizilada", name: "Kızılada", kind: "island", x: 449.1, y: 194.3, icon: "snorkel", labelDx: 0, labelDy: -16, labelAnchor: "middle" },
  { slug: "yassica", name: "Yassıca Adaları", kind: "island", x: 277.4, y: 107.8, icon: "food", labelDx: -16, labelDy: -2, labelAnchor: "end" },
  { slug: "tersane", name: "Tersane Adası", kind: "island", x: 263.2, y: 175.7, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" },
  { slug: "domuz", name: "Domuz Adası", kind: "island", x: 223.1, y: 189.6, icon: "swim", labelDx: -16, labelDy: 4, labelAnchor: "end" },
  { slug: "zeytin", name: "Zeytin Adası", kind: "island", x: 266.9, y: 122.8, priority: 2, labelDx: -8, labelDy: 12, labelAnchor: "end" },
  { slug: "delikli", name: "Delikli Ada", kind: "island", x: 230.9, y: 157.7, priority: 2, labelDx: -8, labelDy: -6, labelAnchor: "end" }, // TODO: yaklaşık konum (OSM'de bulunamadı)
  { slug: "katranci", name: "Katrancı Adası", kind: "island", x: 390.5, y: 125.0, priority: 2, labelDx: 8, labelDy: -6, labelAnchor: "start" },
  { slug: "gocek-adasi", name: "Göcek Adası", kind: "island", x: 289.8, y: 65.3, priority: 2, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "akvaryum-koyu", name: "Akvaryum Koyu", kind: "bay", x: 458.0, y: 413.0, icon: "snorkel", labelDx: 0, labelDy: 28, labelAnchor: "middle" },
  { slug: "samanlik-koyu", name: "Samanlık Koyu", kind: "bay", x: 508.2, y: 223.4, priority: 2, labelDx: -10, labelDy: 4, labelAnchor: "end" },
  { slug: "gemiler-adasi", name: "Gemiler Adası", kind: "island", x: 482.9, y: 391.8, priority: 2, labelDx: 8, labelDy: -6, labelAnchor: "start" },
];
