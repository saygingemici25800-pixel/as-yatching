import { l } from "@/lib/localize";
import type {
  AboutInfo,
  GoogleReview,
  AvailabilityBlock,
  Bay,
  Boat,
  MapPoint,
  TourRoute,
  Faq,
  Product,
  RouteGuide,
  Seed,
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
 *
 * ÇOKLU DİL: metin alanları `l(tr, en, ru)` ile yazılır; repository aktif
 * dile göre çözer. EN ve RU metinleri MAKİNE ÇEVİRİSİDİR — yayından önce
 * ana dili konuşan biri kontrol edecek (TODO: RU/EN çeviri kontrolü).
 * Google yorumları çevrilmez; profilden birebir, orijinal dilde kalır.
 */

export const siteInfo: Seed<SiteInfo> = {
  brandName: "As Yachting",
  legalName: null, // TODO: ticari unvan
  phone: "+90 544 450 70 13",
  whatsapp: "905444507013",
  address: l(
    "Fethiye Limanı beton iskele, 48300 Fethiye / Muğla",
    "Fethiye Harbour concrete pier, 48300 Fethiye / Muğla",
    "Бетонный причал порта Фетхие, 48300 Фетхие / Мугла",
  ),
  mapUrl: "https://maps.google.com/?q=Fethiye+Limanı+beton+iskele",
  googleRating: 5.0,
  googleReviewCount: 33, // Google profili, 2026-09-12
  googleProfileUrl: "https://www.google.com/maps?cid=4934811779244890993",
  workingHours: l("Her gün 24 saat", "Every day, 24 hours", "Ежедневно, 24 часа"),
  instagram: "https://www.instagram.com/as_yachting/",
  highSeasonMonths: [6, 7, 8, 9],
  departure: {
    label: l(
      "Fethiye Limanı · beton iskele",
      "Fethiye Harbour · concrete pier",
      "Порт Фетхие · бетонный причал",
    ),
    // TODO: gerçek iskele pini — şimdilik liman kordonu, yaklaşık.
    // (Önceki 36.6213/29.1156 değeri Atatürk Cd. üzerine, limandan ~300 m
    // içeriye düşüyordu.)
    lat: 36.6242,
    lng: 29.1128,
    note: l(
      "Beton iskele, liman yürüyüş yolunun üzerinde.",
      "The concrete pier is on the harbour promenade.",
      "Бетонный причал находится на набережной порта.",
    ),
  },
};

/**
 * HAKKIMIZDA / KAPTAN — tamamı işletmeden alınacak (Bölüm 10, soru 11).
 * Hiçbir alan uydurulmadı; boş/TODO değerler arayüzde "Bilgi bekleniyor".
 * Google yorumlarında geçen isimler buraya TAŞINMAZ; teyit gelince yazılır.
 */
export const about: Seed<AboutInfo> = {
  captainName: l("TODO: Kaptan adı", "TODO: Captain's name", "TODO: Имя капитана"),
  experienceSince: null, // TODO: kaç yıldır / hangi yıldan beri
  licenses: [], // TODO: ehliyet ve belgeler
  languages: [], // TODO: konuşulan diller
  story: "", // TODO: kaptanın / işletmenin hikâyesi
  crewNote: "", // TODO: mürettebat
  image: "/placeholder/kaptan.jpg",
  isPlaceholder: true,
};

export const boats: Seed<Boat>[] = [
  {
    slug: "as-yachting-1",
    name: l("TODO: Tekne adı", "TODO: Boat name", "TODO: Название яхты"),
    type: l(
      "TODO: gulet / motoryat / sürat teknesi",
      "TODO: gulet / motor yacht / speedboat",
      "TODO: гулет / моторная яхта / катер",
    ),
    lengthMeters: 0, // TODO
    maxGuests: 12, // TODO
    cabins: null, // TODO
    crew: 2, // TODO
    yearBuilt: null, // TODO
    homePort: l("Fethiye Limanı", "Fethiye Harbour", "Порт Фетхие"),
    amenities: [
      l("Gölgelik alan", "Shaded area", "Тент от солнца"),
      l("Güneşlenme minderleri", "Sunbathing cushions", "Матрасы для загара"),
      l("Duş", "Shower", "Душ"),
      l("Tuvalet", "Toilet", "Туалет"),
      l("Müzik sistemi", "Sound system", "Музыкальная система"),
      l("Şnorkel ekipmanı", "Snorkelling gear", "Снаряжение для снорклинга"),
      l("Yüzme merdiveni", "Swim ladder", "Трап для купания"),
    ],
    safety: [
      l(
        "Can yeleği (tüm misafirler için)",
        "Life jackets (for every guest)",
        "Спасательные жилеты (для всех гостей)",
      ),
      l("Çocuk boy can yeleği", "Child-size life jackets", "Детские спасательные жилеты"),
      l("İlk yardım çantası", "First-aid kit", "Аптечка первой помощи"),
      l("Yangın söndürücü", "Fire extinguisher", "Огнетушитель"),
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
    l("Kaptan ve mürettebat", "Captain and crew", "Капитан и экипаж"),
    l("Yakıt", "Fuel", "Топливо"),
    l(
      "Liman ve koy giriş ücretleri",
      "Harbour and bay entrance fees",
      "Портовые сборы и плата за вход в бухты",
    ),
    l("Şnorkel ekipmanı", "Snorkelling gear", "Снаряжение для снорклинга"),
    l("Buzlu su", "Iced water", "Вода со льдом"),
    l("Sigorta", "Insurance", "Страховка"),
  ],
  excluded: [
    l(
      "Öğle yemeği (talep üzerine eklenir)",
      "Lunch (added on request)",
      "Обед (добавляется по запросу)",
    ),
    l("İçecekler", "Drinks", "Напитки"),
    l("Ekstra su sporları", "Extra water sports", "Дополнительные водные развлечения"),
  ],
};

export const products: Seed<Product>[] = [
  {
    slug: "gunubirlik-ozel-kiralama",
    name: l("Günübirlik Özel Kiralama", "Private Day Charter", "Частная аренда на день"),
    shortDescription: l(
      "Tekne bir gün boyunca yalnızca size ait. Rotayı birlikte belirliyoruz.",
      "The boat is yours alone for a whole day. We plan the route together.",
      "Яхта на целый день только для вас. Маршрут выбираем вместе.",
    ),
    description: l(
      "Sabah Fethiye Limanı'ndan kalkıp gün boyunca körfezin koylarını geziyoruz. Başka grup yok, sabit program yok. Nerede ne kadar kalacağınıza siz karar veriyorsunuz.",
      "We leave Fethiye Harbour in the morning and spend the day exploring the bays of the gulf. No other groups, no fixed programme. You decide where to stop and for how long.",
      "Утром выходим из порта Фетхие и весь день ходим по бухтам залива. Без других групп и жёсткой программы. Где и сколько стоять, решаете вы.",
    ),
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
      {
        time: "10:00",
        name: l("Fethiye Limanı'ndan hareket", "Departure from Fethiye Harbour", "Выход из порта Фетхие"),
        note: null,
      },
      {
        time: "11:00",
        name: l("Kızılada", "Kızılada", "Кызылада"),
        note: l("Yüzme molası", "Swimming stop", "Остановка для купания"),
      },
      {
        time: "13:00",
        name: l("Akvaryum Koyu", "Aquarium Bay", "Бухта Аквариум"),
        note: l("Öğle molası", "Lunch stop", "Обеденная остановка"),
      },
      {
        time: "15:00",
        name: l("Samanlık Koyu", "Samanlık Bay", "Бухта Саманлык"),
        note: l("Şnorkel", "Snorkelling", "Снорклинг"),
      },
      {
        time: "18:00",
        name: l("Limana dönüş", "Return to harbour", "Возвращение в порт"),
        note: null,
      },
    ],
    priceIncludes: standardIncludes,
    images: ["/foto/tekne-kadeh.jpg"],
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "gun-batimi-turu",
    name: l("Gün Batımı Turu", "Sunset Cruise", "Тур на закате"),
    shortDescription: l(
      "Üç saatlik kısa kaçamak. Akşamüstü kalkış, körfezde gün batımı.",
      "A short three-hour escape. Late-afternoon departure, sunset in the gulf.",
      "Короткая трёхчасовая прогулка. Выход ближе к вечеру, закат в заливе.",
    ),
    description: l(
      "Günün en sakin saatinde körfeze açılıyoruz. Kalabalık dağılmış, deniz durulmuş oluyor. Çift ya da küçük gruplar için ideal.",
      "We head out into the gulf at the calmest hour of the day. The crowds have gone and the sea has settled. Ideal for couples or small groups.",
      "Выходим в залив в самый спокойный час дня. Толпы уже разошлись, море успокоилось. Идеально для пар и небольших компаний.",
    ),
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
      {
        time: "17:30",
        name: l("Limandan hareket", "Departure from the harbour", "Выход из порта"),
        note: null,
      },
      {
        time: "18:15",
        name: l("Körfez turu", "Gulf cruise", "Прогулка по заливу"),
        note: l("Yüzme molası", "Swimming stop", "Остановка для купания"),
      },
      {
        time: "20:30",
        name: l("Limana dönüş", "Return to harbour", "Возвращение в порт"),
        note: null,
      },
    ],
    priceIncludes: standardIncludes,
    images: ["/koylar/oludeniz-gunbatimi.webp"], // Ölüdeniz gün batımı, Kumburnu
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "sabah-kahvalti-turu",
    name: l("Sabah Kahvaltı Turu", "Morning Breakfast Cruise", "Утренний тур с завтраком"),
    shortDescription: l(
      "Erken kalkış, sakin deniz, teknede kahvaltı. Kişi başı fiyat.",
      "Early departure, calm sea, breakfast on board. Priced per person.",
      "Ранний выход, спокойное море, завтрак на борту. Цена за человека.",
    ),
    description: l(
      "Sabah yedide kalkıyoruz. Koylar boş, su cam gibi. Kahvaltı teknede hazırlanıyor. Günü erken bitirip kalan zamanınız size kalıyor.",
      "We leave at seven in the morning. The bays are empty and the water is like glass. Breakfast is prepared on board. We finish early, and the rest of the day is yours.",
      "Выходим в семь утра. Бухты пусты, вода как стекло. Завтрак готовится на борту. Заканчиваем рано, остаток дня в вашем распоряжении.",
    ),
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
      {
        time: "07:00",
        name: l("Limandan hareket", "Departure from the harbour", "Выход из порта"),
        note: null,
      },
      {
        time: "08:00",
        name: l("Sakin koy", "Quiet bay", "Тихая бухта"),
        note: l("Kahvaltı", "Breakfast", "Завтрак"),
      },
      {
        time: "11:00",
        name: l("Limana dönüş", "Return to harbour", "Возвращение в порт"),
        note: null,
      },
    ],
    priceIncludes: {
      included: [
        ...standardIncludes.included,
        l("Serpme kahvaltı", "Turkish spread breakfast", "Турецкий завтрак"),
      ],
      excluded: [
        l("Alkollü içecekler", "Alcoholic drinks", "Алкогольные напитки"),
        l("Ekstra su sporları", "Extra water sports", "Дополнительные водные развлечения"),
      ],
    },
    images: ["/foto/cift-ogle-yemegi.jpg"],
    featured: false,
    isSamplePrice: true,
  },
  {
    slug: "evlilik-teklifi",
    name: l("Evlilik Teklifi Kurgusu", "Marriage Proposal Setup", "Организация предложения руки и сердца"),
    shortDescription: l(
      "Süsleme, müzik ve zamanlama bizde. Siz sadece soruyu sorun.",
      "Decoration, music and timing are on us. You just ask the question.",
      "Украшение, музыка и тайминг на нас. Вам остаётся только задать вопрос.",
    ),
    description: l(
      "Tekne sizin için hazırlanıyor: çiçek düzeni, müzik, doğru koy ve doğru saat. İsterseniz fotoğrafçı ekleniyor. Her adımı önceden konuşup planlıyoruz.",
      "The boat is prepared for you: flower arrangement, music, the right bay and the right hour. A photographer can be added if you wish. We talk through and plan every step in advance.",
      "Яхту готовим для вас: цветы, музыка, правильная бухта и правильный час. По желанию добавим фотографа. Каждый шаг обсуждаем и планируем заранее.",
    ),
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
      {
        time: null,
        name: l(
          "Saat ve rota size göre planlanır",
          "Time and route are planned around you",
          "Время и маршрут планируются под вас",
        ),
        note: null,
      },
    ],
    priceIncludes: {
      included: [
        ...standardIncludes.included,
        l("Çiçek düzeni", "Flower arrangement", "Цветочное оформление"),
        l("Müzik sistemi", "Sound system", "Музыкальная система"),
      ],
      excluded: [
        l("Fotoğrafçı (ek paket)", "Photographer (add-on)", "Фотограф (дополнительно)"),
        l("Pasta ve ikram", "Cake and refreshments", "Торт и угощения"),
        l("Havai fişek", "Fireworks", "Фейерверк"),
      ],
    },
    images: ["/foto/gunbatimi-cift.jpg"],
    featured: true,
    isSamplePrice: true,
  },
  {
    slug: "mavi-tur",
    name: l("Mavi Tur (Konaklamalı)", "Blue Cruise (Overnight)", "Голубой круиз (с ночёвкой)"),
    shortDescription: l(
      "Birkaç gün denizde. Fethiye'den çıkıp körfezin koylarında konaklama.",
      "A few days at sea. Leaving Fethiye and sleeping in the bays of the gulf.",
      "Несколько дней в море. Выход из Фетхие и ночёвки в бухтах залива.",
    ),
    description: l(
      "Gündüz yüzme ve koy gezisi, gece koyda demirleyip teknede uyuma. Rota hava durumuna ve grubun temposuna göre birlikte belirleniyor.",
      "Swimming and bay-hopping by day, anchoring in a bay and sleeping on board at night. The route is decided together, according to the weather and the group's pace.",
      "Днём купание и прогулки по бухтам, ночью стоянка на якоре и сон на борту. Маршрут выбираем вместе, с учётом погоды и темпа группы.",
    ),
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
      {
        time: null,
        name: l("1. gün — Fethiye körfezi koyları", "Day 1 — Bays of the Gulf of Fethiye", "День 1 — бухты залива Фетхие"),
        note: null,
      },
      {
        time: null,
        name: l("2. gün — Göcek 12 Adalar", "Day 2 — Göcek 12 Islands", "День 2 — 12 островов Гёчека"),
        note: null,
      },
      {
        time: null,
        name: l("3. gün — Ölüdeniz yönü ve dönüş", "Day 3 — Towards Ölüdeniz and return", "День 3 — в сторону Олюдениза и возвращение"),
        note: null,
      },
    ],
    priceIncludes: {
      included: [
        ...standardIncludes.included,
        l("Konaklama", "Accommodation on board", "Проживание на борту"),
        l("Yatak takımı", "Bed linen", "Постельное бельё"),
      ],
      excluded: [
        l("Yemekler", "Meals", "Питание"),
        l("İçecekler", "Drinks", "Напитки"),
        l("Ekstra su sporları", "Extra water sports", "Дополнительные водные развлечения"),
      ],
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

export const faqs: Seed<Faq>[] = [
  {
    question: l("Fiyata neler dahil?", "What is included in the price?", "Что входит в цену?"),
    answer: l(
      "Kaptan, yakıt, liman ve koy ücretleri, sigorta ve şnorkel ekipmanı dahildir. Yemek ve içecekler ayrıdır; talep ederseniz ekleyebiliyoruz. Her turun sayfasında dahil olan ve olmayan kalemler ayrı ayrı yazılıdır.",
      "Captain, fuel, harbour and bay fees, insurance and snorkelling gear are included. Food and drinks are extra; we can add them on request. Each tour page lists what is and isn't included.",
      "Капитан, топливо, портовые сборы и плата за бухты, страховка и снаряжение для снорклинга включены. Еда и напитки оплачиваются отдельно; по запросу можем добавить. На странице каждого тура отдельно указано, что входит в цену, а что нет.",
    ),
  },
  {
    question: l(
      "Yüzme bilmiyorum, katılabilir miyim?",
      "I can't swim, can I still join?",
      "Я не умею плавать, могу ли я поехать?",
    ),
    answer: l(
      "Katılabilirsiniz. Teknede her misafir için can yeleği bulunuyor ve yüzme molalarında mürettebat sizinle ilgileniyor.",
      "Yes. There is a life jacket for every guest on board, and the crew looks after you during swimming stops.",
      "Да. На борту есть спасательный жилет для каждого гостя, а во время остановок для купания экипаж присматривает за вами.",
    ),
  },
  {
    question: l(
      "Çocuklarla gelebilir miyiz?",
      "Can we bring children?",
      "Можно ли с детьми?",
    ),
    answer: l(
      "Evet. Çocuk boy can yeleğimiz mevcut. Küçük çocuklarla geliyorsanız rezervasyon sırasında belirtin, rotayı buna göre planlayalım.",
      "Yes. We have child-size life jackets. If you are coming with small children, let us know when booking so we can plan the route accordingly.",
      "Да. У нас есть детские спасательные жилеты. Если вы едете с маленькими детьми, сообщите при бронировании, и мы спланируем маршрут с учётом этого.",
    ),
  },
  {
    question: l(
      "Hava kötü olursa ne oluyor?",
      "What happens if the weather is bad?",
      "Что будет, если погода испортится?",
    ),
    answer: l(
      "Hava koşulları güvenli değilse tur yapılmaz. Bu durumda tarihi ücretsiz olarak değiştiriyoruz.",
      "If conditions are not safe, the tour does not go ahead. In that case we change the date free of charge.",
      "Если условия небезопасны, тур не проводится. В этом случае мы бесплатно переносим дату.",
    ),
  },
  {
    question: l(
      "Rezervasyon nasıl yapılıyor?",
      "How do I book?",
      "Как забронировать?",
    ),
    answer: l(
      "Takvimden istediğiniz tarihi seçip talep gönderiyorsunuz. Size dönüş yapıp detayları netleştiriyoruz.",
      "Pick a date on the calendar and send a request. We get back to you and confirm the details.",
      "Выберите дату в календаре и отправьте запрос. Мы свяжемся с вами и уточним детали.",
    ),
  },
  // TODO: iptal ve iade koşulları müşteriden alınacak
];

/**
 * GERÇEK Google yorumları — https://www.google.com/maps?cid=4934811779244890993
 * 2026-09-12'de profilden birebir alındı. Metin değiştirilmez, uydurulmaz,
 * ÇEVRİLMEZ (her dilde orijinal Türkçe metin gösterilir).
 * Uzun yorumlar site için kısaltıldı; kısaltma "…" ile işaretli.
 * Yalnızca Google'ın göreli tarih etiketi ("3 ay önce") çevrilir.
 */
export const googleReviews: Seed<GoogleReview>[] = [
  {
    author: "Mehtap Candaş",
    rating: 5,
    when: l("3 ay önce", "3 months ago", "3 месяца назад"),
    text: "Göcek koylarında geçirdiğimiz 5 gün gerçekten unutulmazdı. Baştan sona her detay özenle düşünülmüş, huzurlu ve keyifli bir deneyim yaşadık. Özellikle kaptanlarımızın profesyonelliği, güler yüzü ve misafirperverliği tatili çok daha özel hale getirdi…",
  },
  {
    author: "mustafa ünal",
    rating: 5,
    when: l("4 yıl önce", "4 years ago", "4 года назад"),
    text: "Bu teknede müşteri değil, misafirsiniz. Serkan ve Ayşe kaptanlar sanki ailemizden birileri gibiydiler. Yemekler,diğer hizmetler, ödediğimiz ücretin kat be kat üzerindeydi,mükemmeldi…",
  },
  {
    author: "Eda Nilüfer Özer",
    rating: 5,
    when: l("2 yıl önce", "2 years ago", "2 года назад"),
    text: "Kaptan Serkan bey ile çıktığımız Göcek tekne tatilinden çok memnun kaldık bizlere çok misafirperver davrandı ve her anımızın tadını çıkartmamız için elinden geleni yaptı…",
  },
  {
    author: "ÖMER ÖZMEN",
    rating: 5,
    when: l("2 yıl önce", "2 years ago", "2 года назад"),
    text: "Mükemmel bir tatil tekne tatili kaptan serkan ve yardımcı kaptan çayan güzel bir tatil geçirmeniz için gerçekten ellerinden geleni yapıyor harika bir yelkenli deneyimi",
  },
  {
    author: "Nuray Tınmaz",
    rating: 5,
    when: l("4 yıl önce", "4 years ago", "4 года назад"),
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
const DAY_CHARTER = l("Günübirlik özel kiralama", "Private day charter", "Частная аренда на день");

export const bays: Seed<Bay>[] = [
  {
    slug: "fethiye-limani",
    name: l("Fethiye Limanı", "Fethiye Harbour", "Порт Фетхие"),
    blurb: l(
      "Kalkış noktamız: Fethiye Limanı beton iskele. Bütün turlar buradan başlar.",
      "Our departure point: the concrete pier at Fethiye Harbour. Every tour starts here.",
      "Точка отправления: бетонный причал порта Фетхие. Все туры начинаются здесь.",
    ),
    distanceFromHarbor: l("Kalkış noktası", "Departure point", "Точка отправления"),
    stayDuration: "—", // TODO: buluşma / kalkış saati düzeni
    tours: l("Tüm turlar", "All tours", "Все туры"),
    highlight: l("Buradan çıkıyoruz", "We leave from here", "Отсюда отправляемся"),
    image: "/koylar/fethiye-limani.webp",
    imageThumb: "/koylar/fethiye-limani-thumb.webp",
  },
  {
    slug: "kizilada",
    name: l("Kızılada", "Kızılada", "Кызылада"),
    blurb: l(
      "Limandan çıkınca ilk durak; günübirlik rotanın yüzme molası.",
      "The first stop after leaving the harbour; the swimming break on the day-charter route.",
      "Первая остановка после выхода из порта; место для купания на дневном маршруте.",
    ),
    distanceFromHarbor: l("~20 dk", "~20 min", "~20 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: DAY_CHARTER, // products[].route → 11:00 Kızılada
    highlight: l("Yüzme molası", "Swimming stop", "Остановка для купания"), // products[].route notu
    image: null, // TODO: Kızılada fotoğrafı gelince /koylar/kizilada.webp
    imageThumb: null,
  },
  {
    slug: "akvaryum-koyu",
    name: l("Akvaryum Koyu", "Aquarium Bay", "Бухта Аквариум"),
    blurb: l(
      "Adını berrak suyundan alan koy; günübirlik rotada öğle molası.",
      "A bay named after its crystal-clear water; the lunch stop on the day-charter route.",
      "Бухта, названная за прозрачную воду; обеденная остановка на дневном маршруте.",
    ),
    distanceFromHarbor: l("~35 dk", "~35 min", "~35 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: DAY_CHARTER, // products[].route → 13:00 Akvaryum Koyu
    highlight: l("Öğle yemeği durağı", "Lunch stop", "Обеденная остановка"), // products[].route notu: Öğle molası
    image: "/koylar/akvaryum-koyu.webp",
    imageThumb: "/koylar/akvaryum-koyu-thumb.webp",
  },
  {
    slug: "samanlik-koyu",
    name: l("Samanlık Koyu", "Samanlık Bay", "Бухта Саманлык"),
    blurb: l(
      "Korunaklı ve sığ koy; günübirlik rotada şnorkel durağı.",
      "A sheltered, shallow bay; the snorkelling stop on the day-charter route.",
      "Защищённая мелкая бухта; остановка для снорклинга на дневном маршруте.",
    ),
    distanceFromHarbor: l("~40 dk", "~40 min", "~40 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: DAY_CHARTER, // products[].route → 15:00 Samanlık Koyu
    highlight: l("Şnorkel", "Snorkelling", "Снорклинг"), // products[].route notu
    image: null, // TODO: Samanlık Koyu fotoğrafı gelince /koylar/samanlik-koyu.webp
    imageThumb: null,
  },
  {
    slug: "oludeniz",
    name: l("Ölüdeniz", "Ölüdeniz", "Олюдениз"),
    blurb: l(
      "Fethiye'nin en bilinen koyu; lagün ve uzun plaj.",
      "Fethiye's best-known bay; the lagoon and the long beach.",
      "Самая известная бухта Фетхие; лагуна и длинный пляж.",
    ),
    distanceFromHarbor: l("~75 dk", "~75 min", "~75 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "—", // TODO: hangi turların rotasında
    highlight: "—", // TODO: öne çıkan özellik
    image: "/koylar/oludeniz.webp", // kuş bakışı lagün
    imageThumb: "/koylar/oludeniz-thumb.webp",
  },
  {
    slug: "gemiler-adasi",
    name: l("Gemiler Adası", "Gemiler Island", "Остров Гемилер"),
    blurb: l(
      "Bizans dönemi kalıntılarının bulunduğu ada ve korunaklı demir yeri.",
      "An island with Byzantine-era ruins and a sheltered anchorage.",
      "Остров с руинами византийской эпохи и защищённой якорной стоянкой.",
    ),
    distanceFromHarbor: l("~60 dk", "~60 min", "~60 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    tours: "—", // TODO: hangi turların rotasında
    highlight: "—", // TODO: öne çıkan özellik
    image: "/koylar/gemiler-adasi.webp",
    imageThumb: "/koylar/gemiler-adasi-thumb.webp",
  },
  {
    slug: "kelebekler-vadisi",
    name: l("Kelebekler Vadisi", "Butterfly Valley", "Долина бабочек"),
    blurb: l(
      "Dik kayalıklar arasında plaj; karadan ulaşımı zor, tekneyle kolay.",
      "A beach between steep cliffs; hard to reach by land, easy by boat.",
      "Пляж между отвесными скалами; по суше добраться трудно, на яхте легко.",
    ),
    distanceFromHarbor: l("~90 dk", "~90 min", "~90 мин"), // TODO: teyit (kaptanla)
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
export const mapPoints: Seed<MapPoint>[] = [
  { slug: "fethiye-limani", name: l("Fethiye Limanı", "Fethiye Harbour", "Порт Фетхие"), kind: "harbor", x: 547.6, y: 258.7, labelDx: 8, labelDy: -14, labelAnchor: "start" }, // pin: siteInfo.departure (TODO gerçek iskele)
  { slug: "fethiye", name: l("Fethiye", "Fethiye", "Фетхие"), kind: "town", x: 551.4, y: 262.6, labelDx: 10, labelDy: 14, labelAnchor: "start" },
  { slug: "karagozler", name: l("Karagözler", "Karagözler", "Карагёзлер"), kind: "town", x: 531.6, y: 262.8, priority: 2, labelDx: -6, labelDy: 12, labelAnchor: "end" },
  { slug: "calis", name: l("Çalış", "Çalış", "Чалыш"), kind: "town", x: 543.5, y: 176.5, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "oludeniz", name: l("Ölüdeniz", "Ölüdeniz", "Олюдениз"), kind: "bay", x: 566.3, y: 397.6, icon: "sunset", labelDx: 0, labelDy: 26, labelAnchor: "middle" },
  { slug: "kayakoy", name: l("Kayaköy", "Kayaköy", "Каякёй"), kind: "town", x: 509.4, y: 345.2, priority: 2, labelDx: 0, labelDy: -8, labelAnchor: "middle" },
  { slug: "hisaronu", name: l("Hisarönü", "Hisarönü", "Хисарёню"), kind: "town", x: 580.7, y: 356.9, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" },
  { slug: "gocek", name: l("Göcek", "Göcek", "Гёчек"), kind: "town", x: 290.3, y: 15.6, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "faralya", name: l("Faralya", "Faralya", "Фаралья"), kind: "town", x: 590.0, y: 500.0, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" }, // TODO: yaklaşık konum
  { slug: "kelebekler-vadisi", name: l("Kelebekler Vadisi", "Butterfly Valley", "Долина бабочек"), kind: "bay", x: 566.0, y: 488.0, icon: "photo", labelDx: -16, labelDy: 4, labelAnchor: "end" }, // TODO: yaklaşık konum (alt kenardan içeri alındı)
  { slug: "sovalye", name: l("Şövalye Adası", "Şövalye Island", "Остров Шёвалье"), kind: "island", x: 531.9, y: 210.8, priority: 2, labelDx: 8, labelDy: -8, labelAnchor: "start" },
  { slug: "kizilada", name: l("Kızılada", "Kızılada", "Кызылада"), kind: "island", x: 449.1, y: 194.3, icon: "snorkel", labelDx: 0, labelDy: -16, labelAnchor: "middle" },
  { slug: "yassica", name: l("Yassıca Adaları", "Yassıca Islands", "Острова Яссыджа"), kind: "island", x: 277.4, y: 107.8, icon: "food", labelDx: -16, labelDy: -2, labelAnchor: "end" },
  { slug: "tersane", name: l("Tersane Adası", "Tersane Island", "Остров Терсане"), kind: "island", x: 263.2, y: 175.7, priority: 2, labelDx: 8, labelDy: 4, labelAnchor: "start" },
  { slug: "domuz", name: l("Domuz Adası", "Domuz Island", "Остров Домуз"), kind: "island", x: 223.1, y: 189.6, icon: "swim", labelDx: -16, labelDy: 4, labelAnchor: "end" },
  { slug: "zeytin", name: l("Zeytin Adası", "Zeytin Island", "Остров Зейтин"), kind: "island", x: 266.9, y: 122.8, priority: 2, labelDx: -8, labelDy: 12, labelAnchor: "end" },
  { slug: "delikli", name: l("Delikli Ada", "Delikli Island", "Остров Деликли"), kind: "island", x: 230.9, y: 157.7, priority: 2, labelDx: -8, labelDy: -6, labelAnchor: "end" }, // TODO: yaklaşık konum (OSM'de bulunamadı)
  { slug: "katranci", name: l("Katrancı Adası", "Katrancı Island", "Остров Катранджи"), kind: "island", x: 390.5, y: 125.0, priority: 2, labelDx: 8, labelDy: -6, labelAnchor: "start" },
  { slug: "gocek-adasi", name: l("Göcek Adası", "Göcek Island", "Остров Гёчек"), kind: "island", x: 289.8, y: 65.3, priority: 2, labelDx: 10, labelDy: 4, labelAnchor: "start" },
  { slug: "akvaryum-koyu", name: l("Akvaryum Koyu", "Aquarium Bay", "Бухта Аквариум"), kind: "bay", x: 458.0, y: 413.0, icon: "snorkel", labelDx: 0, labelDy: 28, labelAnchor: "middle" },
  { slug: "samanlik-koyu", name: l("Samanlık Koyu", "Samanlık Bay", "Бухта Саманлык"), kind: "bay", x: 508.2, y: 223.4, priority: 2, labelDx: -10, labelDy: 4, labelAnchor: "end" },
  { slug: "gemiler-adasi", name: l("Gemiler Adası", "Gemiler Island", "Остров Гемилер"), kind: "island", x: 482.9, y: 391.8, priority: 2, labelDx: 8, labelDy: -6, labelAnchor: "start" },
];

/**
 * TUR ROTALARI — illüstratif haritadaki tur seçici.
 * TODO: duraklar işletmeyle teyit edilecek (şimdilik ürün rotalarından ve
 * koy listesinden türetildi). Rota çizgileri suda kalacak şekilde
 * illustrated-map.tsx içindeki ara noktalarla çizilir.
 */
export const routes: Seed<TourRoute>[] = [
  {
    slug: "gunubirlik",
    name: l("Günübirlik", "Day charter", "На день"),
    productSlug: "gunubirlik-ozel-kiralama",
    stops: ["fethiye-limani", "kizilada", "akvaryum-koyu", "yassica", "fethiye-limani"], // TODO: teyit
  },
  {
    slug: "gun-batimi",
    name: l("Gün batımı", "Sunset", "Закат"),
    productSlug: "gun-batimi-turu",
    stops: ["fethiye-limani", "sovalye", "kizilada", "fethiye-limani"], // TODO: teyit
  },
  {
    slug: "mavi-tur",
    name: l("Mavi tur", "Blue cruise", "Голубой круиз"),
    productSlug: "mavi-tur",
    stops: ["fethiye-limani", "yassica", "oludeniz", "kelebekler-vadisi"], // TODO: teyit (Göcek yönü 12 Adalar → Ölüdeniz → Kelebekler)
  },
];

/**
 * ROTA / KOY REHBERLERİ — /rotalar ve /rotalar/[koy].
 * Metinler yalnızca bilinen coğrafi bilgi; "en güzel", "eşsiz" gibi vaat
 * yok. Süreler TAHMİNİ (bays[].distanceFromHarbor ile aynı; TODO: kaptanla
 * teyit). Kalış süresi ve tur eşleşmeleri işletmeyle teyit edilecek.
 * Fotoğrafı olmayan koylar (Kızılada, Göcek 12 Adalar) görselsiz gösterilir.
 */
export const routeGuides: Seed<RouteGuide>[] = [
  {
    slug: "oludeniz",
    name: l("Ölüdeniz", "Ölüdeniz", "Олюдениз"),
    summary: l(
      "Fethiye'nin en bilinen koyu: lagün, Kumburnu ve uzun plaj.",
      "Fethiye's best-known bay: the lagoon, Kumburnu and the long beach.",
      "Самая известная бухта Фетхие: лагуна, Кумбурну и длинный пляж.",
    ),
    body: [
      l(
        "Ölüdeniz, Fethiye'nin güneyinde, Babadağ'ın eteğinde yer alır. Kumburnu dilinin ayırdığı lagün tabiat parkıdır; tekneler lagüne girmez, koyun açık tarafında demirler.",
        "Ölüdeniz lies south of Fethiye at the foot of Babadağ. The lagoon, separated by the Kumburnu spit, is a nature park; boats do not enter the lagoon and anchor on the open side of the bay.",
        "Олюдениз находится к югу от Фетхие, у подножия горы Бабадаг. Лагуна, отделённая косой Кумбурну, — природный парк; яхты в лагуну не заходят и становятся на якорь с открытой стороны бухты.",
      ),
      l(
        "Gün batımı turunun görseli buradan; Babadağ'dan kalkan yamaç paraşütleri koyun üzerinde iner.",
        "The sunset cruise photo is from here; paragliders launching from Babadağ land over the bay.",
        "Фото тура на закате сделано здесь; парапланы, стартующие с Бабадага, приземляются над бухтой.",
      ),
    ],
    distanceFromHarbor: l("~75 dk", "~75 min", "~75 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO: koyda kalış
    highlights: [
      l("Gün batımı", "Sunset", "Закат"),
      l("Yüzme", "Swimming", "Купание"),
    ],
    tourSlugs: ["mavi-tur"], // TODO: teyit (mavi tur 3. gün "Ölüdeniz yönü")
    mapPointSlugs: ["oludeniz", "kayakoy", "hisaronu"],
    baySlug: "oludeniz",
    image: "/koylar/oludeniz.webp",
    imageThumb: "/koylar/oludeniz-thumb.webp",
  },
  {
    slug: "gocek-12-adalar",
    name: l("Göcek 12 Adalar", "Göcek 12 Islands", "12 островов Гёчека"),
    summary: l(
      "Fethiye Körfezi'nin batısında, Göcek önündeki ada topluluğu.",
      "The group of islands off Göcek, in the west of the Gulf of Fethiye.",
      "Группа островов напротив Гёчека, в западной части залива Фетхие.",
    ),
    body: [
      l(
        "Yassıca, Tersane, Domuz, Zeytin, Göcek Adası ve Katrancı bu topluluğun bilinen adalarından. Adalar arası mesafe kısa; korunaklı koylar rüzgârlı günlerde de demir atmaya elverişli.",
        "Yassıca, Tersane, Domuz, Zeytin, Göcek Island and Katrancı are among the well-known islands of the group. Distances between islands are short; the sheltered bays allow anchoring even on windy days.",
        "Яссыджа, Терсане, Домуз, Зейтин, остров Гёчек и Катранджи — известные острова этой группы. Расстояния между островами короткие; защищённые бухты позволяют вставать на якорь даже в ветреные дни.",
      ),
      l(
        "Mavi turun ikinci günü bu bölgede geçiyor. Hangi adalarda durulacağı hava ve grubun temposuna göre birlikte belirleniyor.",
        "The second day of the blue cruise is spent in this area. Which islands we stop at is decided together, according to the weather and the group's pace.",
        "Второй день голубого круиза проходит в этом районе. На каких островах останавливаться, решаем вместе, с учётом погоды и темпа группы.",
      ),
    ],
    distanceFromHarbor: "—", // TODO: limandan tahmini süre (Yassıca'ya)
    stayDuration: "—", // TODO
    highlights: [
      l("Yemek molası", "Meal stop", "Остановка на обед"),
      l("Yüzme", "Swimming", "Купание"),
    ], // routes[] harita rozetlerinden (yassica: food, domuz: swim)
    tourSlugs: ["mavi-tur", "gunubirlik-ozel-kiralama"], // TODO: teyit (günübirlik rota Yassıca'ya uzanıyor mu?)
    mapPointSlugs: ["yassica", "tersane", "domuz", "zeytin", "delikli", "katranci", "gocek-adasi", "gocek"],
    baySlug: null,
    image: null, // TODO: 12 Adalar fotoğrafı gelince /koylar/gocek-12-adalar.webp
    imageThumb: null,
  },
  {
    slug: "kelebekler-vadisi",
    name: l("Kelebekler Vadisi", "Butterfly Valley", "Долина бабочек"),
    summary: l(
      "Dik kayalıklar arasında plaj; karadan ulaşımı zor, tekneyle kolay.",
      "A beach between steep cliffs; hard to reach by land, easy by boat.",
      "Пляж между отвесными скалами; по суше добраться трудно, на яхте легко.",
    ),
    body: [
      l(
        "Ölüdeniz'in güneyinde, Faralya köyünün altında kalan vadi. Adını yaz aylarında görülen kelebeklerden alır; vadi tabiat alanı olarak korunuyor.",
        "The valley lies south of Ölüdeniz, below the village of Faralya. It is named after the butterflies seen in the summer months; the valley is a protected natural area.",
        "Долина расположена к югу от Олюдениза, под деревней Фаралья. Названа в честь бабочек, которых видно в летние месяцы; долина — охраняемая природная территория.",
      ),
      l(
        "Plaja tekneyle yanaşılır. Kalış süresi ve iniş düzeni işletmeyle netleştirilecek.",
        "The beach is reached by boat. Time ashore and the landing arrangement will be confirmed with the business.",
        "К пляжу подходят на яхте. Время стоянки и порядок высадки будут уточнены с владельцем.",
      ),
    ],
    distanceFromHarbor: l("~90 dk", "~90 min", "~90 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO
    highlights: [l("Fotoğraf durağı", "Photo stop", "Фотоостановка")],
    tourSlugs: ["mavi-tur"], // TODO: teyit
    mapPointSlugs: ["kelebekler-vadisi", "faralya"],
    baySlug: "kelebekler-vadisi",
    image: "/koylar/kelebekler-vadisi.webp",
    imageThumb: "/koylar/kelebekler-vadisi-thumb.webp",
  },
  {
    slug: "kizilada",
    name: l("Kızılada", "Kızılada", "Кызылада"),
    summary: l(
      "Limandan çıkınca ilk durak; günübirlik rotanın yüzme molası.",
      "The first stop after leaving the harbour; the swimming break on the day-charter route.",
      "Первая остановка после выхода из порта; место для купания на дневном маршруте.",
    ),
    body: [
      l(
        "Fethiye Körfezi'nin ağzındaki ada; üzerindeki deniz feneri limandan görülür. Günübirlik özel kiralamanın saat 11:00 durağı ve gün batımı turunun rotasında.",
        "The island at the mouth of the Gulf of Fethiye; its lighthouse is visible from the harbour. It is the 11:00 stop of the private day charter and on the sunset cruise route.",
        "Остров у входа в залив Фетхие; его маяк виден из порта. Остановка в 11:00 на частной дневной аренде и на маршруте тура на закате.",
      ),
    ],
    distanceFromHarbor: l("~20 dk", "~20 min", "~20 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO
    highlights: [
      l("Yüzme molası", "Swimming stop", "Остановка для купания"),
      l("Şnorkel", "Snorkelling", "Снорклинг"),
    ], // products[].route notu + harita rozeti
    tourSlugs: ["gunubirlik-ozel-kiralama", "gun-batimi-turu"], // routes[] (TODO teyit)
    mapPointSlugs: ["kizilada", "sovalye"],
    baySlug: "kizilada",
    image: null, // TODO: Kızılada fotoğrafı gelince /koylar/kizilada.webp
    imageThumb: null,
  },
  {
    slug: "akvaryum-koyu",
    name: l("Akvaryum Koyu", "Aquarium Bay", "Бухта Аквариум"),
    summary: l(
      "Adını berrak suyundan alan koy; günübirlik rotada öğle molası.",
      "A bay named after its crystal-clear water; the lunch stop on the day-charter route.",
      "Бухта, названная за прозрачную воду; обеденная остановка на дневном маршруте.",
    ),
    body: [
      l(
        "Fethiye Körfezi'nin güney kıyısında, korunaklı bir koy. Günübirlik özel kiralamanın 13:00 öğle molası burada; tekne demirdeyken yüzme ve şnorkel için uygun.",
        "A sheltered bay on the southern shore of the Gulf of Fethiye. The private day charter's 13:00 lunch stop is here; while at anchor it is suitable for swimming and snorkelling.",
        "Защищённая бухта на южном берегу залива Фетхие. Здесь обеденная остановка частной дневной аренды в 13:00; на якоре удобно купаться и заниматься снорклингом.",
      ),
    ],
    distanceFromHarbor: l("~35 dk", "~35 min", "~35 мин"), // TODO: teyit (kaptanla)
    stayDuration: "—", // TODO
    highlights: [
      l("Öğle yemeği durağı", "Lunch stop", "Обеденная остановка"),
      l("Şnorkel", "Snorkelling", "Снорклинг"),
    ],
    tourSlugs: ["gunubirlik-ozel-kiralama"], // products[].route
    mapPointSlugs: ["akvaryum-koyu", "gemiler-adasi"],
    baySlug: "akvaryum-koyu",
    image: "/koylar/akvaryum-koyu.webp",
    imageThumb: "/koylar/akvaryum-koyu-thumb.webp",
  },
];
