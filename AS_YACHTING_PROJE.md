# AS YACHTING — Marka & Dijital Proje Ana Dosyası

> **Bu dosya projenin tek doğruluk kaynağıdır (single source of truth).**
> Claude Code her fazın sonunda bu dosyayı güncellemekle yükümlüdür. Kurallar: [Faz Sonu Protokolü](#12-faz-sonu-protokolü-claude-code-için)

| Alan | Değer |
|---|---|
| Proje adı | AS Yachting — Marka & Web Platformu |
| Versiyon | v0.5 (Demo çalışıyor) |
| Son güncelleme | 2026-08-17 |
| Güncelleyen | Claude Code (Faz 2 uygulaması) |
| Aktif faz | **Faz 3 — Müşteri Sunumu** |
| Durum | ✅ Faz 2 tamamlandı — demo tarayıcıda çalışıyor |

## 🎯 Proje Modu: DEMO ÖNCE

Bu proje şu an **müşteriye sunulacak bir demo** aşamasındadır. Gerçek filo, fiyat ve içerik verisi henüz yok.

**Bu ne demek:**
- Tüm veri **tek bir seed dosyasından** (`data/seed.ts`) gelir. Gerçek bilgi geldiğinde sadece o dosya değişir, kod değişmez.
- Demo verisi **gerçekçi ama açıkça geçici** olmalı. Uydurma sertifika, uydurma müşteri sayısı, uydurma ödül **yazılmaz** — bunlar müşteri sunumunda yalan olur.
- Google puanı (5.0 / 34 yorum) **gerçektir** ve demoda kullanılabilir. Sunumun en güçlü kozu budur.
- Amaç: müşteriye "sitesi olsa nasıl görünürdü" değil, **"parası nasıl artardı"** hissini vermek.

## ⭐ Kilitlenen Kararlar (değiştirilemez varsayım — aksi belirtilmedikçe)

| Karar | Seçim | Sonucu |
|---|---|---|
| Konumlandırma | **B — Erişilebilir keyif / şeffaf fiyat** | Fiyatlar sitede açık yayınlanacak. "Fiyat için arayın" yasak. |
| Sitenin ana işi | **Online takvim + müsaitlik gösterimi** | Site statik broşür değil, veri tabanlı uygulama. |
| Eldeki varlıklar | Logo görseli var, amatör fotoğraflar var, domain **henüz alınmadı** | Logo dijitalleştirilecek, çekim Faz 3'te kritik yol. |
| Filo | **Muhtemelen tek tekne** (doğrulanacak) | "Filo" sayfası yok. Site tek tekne + çok ürün mantığıyla kurulur. |
| Fiyatlandırma | **Karma** (ürüne göre günlük / kişi başı / saatlik) | Fiyat motoru `pricing_type` alanıyla üç modeli birden desteklemeli. |
| Mevcut rezervasyon kanalı | **Yok.** Sadece Google hesabı var | Çift rezervasyon riski **yok**. iCal senkronu v2'ye ertelendi — büyük kapsam tasarrufu. |

---

## 1. Firma Künyesi

| Alan | Bilgi | Kaynak |
|---|---|---|
| İşletme adı | AS_Yachting | Google Business Profile |
| Sektör | Tekne / yat kiralama | GBP |
| Konum | Fethiye Limanı beton iskele, 48300 Fethiye / Muğla | GBP |
| Telefon | 0544 450 70 13 | GBP |
| Çalışma saati | 24 saat | GBP |
| Google puanı | 5.0 / 34 yorum | GBP |
| Web sitesi | **YOK** | GBP |
| Domain | ❓ belirlenecek | — |
| Sosyal medya | ❓ (Instagram muhtemelen var, doğrulanacak) | — |

**⚠️ Doğrulanmamış varsayımlar** — Faz 0'da müşteriden teyit alınacak, teyit alınmadan hiçbir metne girmeyecek:
- Filo büyüklüğü, tekne tipi (gulet / motoryat / sürat teknesi / yelkenli), kapasite
- Kendi teknesi mi, brokerlik/aracılık mı yaptığı
- Günübirlik tur mu, özel kiralama mı, mavi tur (konaklamalı) mu ağırlıklı
- Fiyat aralığı, sezon dışı faaliyet
- Yabancı müşteri oranı ve uyrukları

---

## 2. Mevcut Durum Analizi (Teşhis)

**Güçlü yanlar**
- 5.0 ortalama, 34 yorum → sektör ortalamasının üstünde ve satışa çevrilebilir en değerli varlık
- 24 saat erişilebilirlik → operasyonel güven sinyali
- Liman içi, yüksek görünürlüklü fiziksel konum

**Zayıf yanlar / kayıp gelir noktaları**
- Web sitesi yok → Google'da "Fethiye tekne kiralama" aramalarında organik olarak yer alınamıyor
- Trafik ve rezervasyon üçüncü taraf platformlara (aracı komisyonu) veya tesadüfe bağlı
- Marka hafızası yok; müşteri "teknenin adı"nı hatırlıyor, markayı değil
- Fiyat şeffaflığı yok → fiyat sorma sürtünmesi (her müşteri için WhatsApp emeği)
- İngilizce/çok dilli varlık yok → yüksek bütçeli yabancı segment kaçırılıyor

**Fırsat**
- Fethiye'de tekne kiralama arzı yüksek ama **markalaşmış** oyuncu az; çoğu rakip fotoğraf galerisi + telefon numarasından ibaret. Konumlandırma boşluğu var.

---

## 3. Marka Stratejisi

### 3.1 Konumlandırma seçenekleri (müşteri seçecek — Faz 0 kararı)

| # | Konumlandırma | Kime | Vaadi | Fiyat seviyesi |
|---|---|---|---|---|
| **A** | **Premium özel charter** | Yüksek gelirli çift/aile, yabancı turist | "Kalabalık tur değil, size ait bir gün" | Yüksek |
| **B** ✅ | **Erişilebilir keyif — SEÇİLDİ** | Yerli aile, arkadaş grubu | "Şeffaf fiyat, sürprizsiz, 5 yıldızlı hizmet" | Orta |
| **C** | **Deneyim tasarımcısı** | Evlilik teklifi, doğum günü, kurumsal | "Tekne bir araç; biz anı kurguluyoruz" | Yüksek marj |
| **D** | **Uzman kaptan** | Tekrar eden misafir, denizci | "Koyları bilen kaptan; rota her gün aynı değil" | Orta-yüksek |

> **Karar: B seçildi.** Uygulama kuralları:
> - Her tekne ve turun fiyatı sitede **rakamla** yazılacak; gizli ücret olmayacak.
> - "Fiyata dahil / dahil değil" listesi her ürün sayfasında zorunlu (yakıt, yemek, liman, KDV).
> - Ucuzluk vurgusu yapılmayacak; vurgu **netlik ve sürprizsizlik**. "En ucuz" kelimesi yasak.
> - Görsel dil: temiz, aydınlık, samimi. Lüks-gösteriş estetiğinden (şampanya, siyah-altın) kaçınılacak.
> - Katman 1 deneyim paketleri yine satılacak ama **fiyatı açık paket** olarak (ör. "Evlilik teklifi paketi — X TL, şunları içerir").

### 3.2 Marka kimliği — KİLİTLENDİ

**Logo**
- Kullanılacak: **açık zeminli, altın el yazısı versiyon** (cream arka plan)
- Kullanılmayacak: koyu lacivert zeminli, "LUXURY A YACHTING" yazan versiyon — konumlandırmayla çelişiyor
- Wordmark: **"As Yachting"** — alt çizgi (`_`) kaldırılacak, "Luxury" ibaresi kaldırılacak
- Gerekli çıktılar: SVG (vektör), PNG şeffaf, favicon 32/180px, sosyal medya kare versiyon

**Renk paleti** (Stitch çıktısından alındı, konumlandırmaya göre yumuşatıldı)

| Rol | Değer | Kullanım |
|---|---|---|
| Zemin | `#F7F4ED` cream | Ana arka plan |
| Yüzey | `#FFFFFF` | Kartlar |
| Metin | `#1C2A38` derin lacivert | Başlık ve gövde |
| İkincil metin | `#5A6875` | Açıklama |
| Vurgu | `#B08D3F` sıcak altın | Sadece çizgi, ikon, küçük detay |
| Kenarlık | `#E3DDD0` | İnce ayraçlar |

> **Kural:** Altın **zemin rengi olarak kullanılmaz.** Stitch çıktısındaki siyah+altın bloklar ("Begin The Myth" bölümü) kaldırılacak. Altın sadece ince vurgu.

**Tipografi**
- Başlık: serif (Cormorant Garamond veya Playfair Display) — Stitch'in yakaladığı zarafet buradan geliyor, korunuyor
- Gövde: sans-serif (Inter veya Manrope) — Türkçe karakter desteği doğrulanacak
- BÜYÜK HARF kullanımı sadece küçük etiketlerde, başlıklarda değil

**Ton**
- Sıcak, net, abartısız. "Bespoke", "uncompromising", "myth", "concierge" gibi kelimeler **yasak**
- Türkçe birincil dil, İngilizce ikincil

---

## 4. Hizmet Ekosistemi (Gelir Katmanları)

### Katman 0 — Çekirdek
- Günübirlik özel tekne kiralama (private charter)
- Mavi tur / konaklamalı kiralama
- Günübirlik paylaşımlı tur (koltuk satışı)
- Transfer & taksi tekne

### Katman 1 — Deneyim paketleri (yüksek marj)
- Evlilik teklifi kurgusu (dekor, fotoğrafçı, müzik)
- Doğum günü / yıldönümü / bekarlığa veda
- Denizde düğün & nikah sonrası çekim
- Gün batımı seansı (2–3 saat, kısa ve pahalı ürün)
- Yüzme + kahvaltı sabah turu (ölü saatleri doldurur)

### Katman 2 — Yardımcı hizmetler (upsell)
- Şef eşliğinde tekne yemeği / özel menü
- Fotoğraf & drone çekimi paketi
- Su sporları (jet ski, wakeboard, dalış, sea-bob, şnorkel)
- Havalimanı (DLM) ↔ liman VIP transfer
- Villa + tekne kombine paket (villa şirketleriyle gelir paylaşımı)
- Onboard masaj / hostes hizmeti

### Katman 3 — B2B ve kurumsal
- Kurumsal etkinlik / takım günü / yatırımcı ağırlama
- Otel & villa acenteleri için komisyonlu tedarik anlaşmaları
- Prodüksiyon kiralaması (reklam, klip, dizi çekimi)
- Düğün organizatörleri partnerliği
- Influencer & marka iş birliği paketleri

### Katman 4 — Uç noktalar (kritik gelir yaratanlar)
- **Tekne yönetimi / işletmeciliği:** başkasının teknesini AS Yachting adına kiralayıp gelir paylaşımı → sermayesiz filo büyütme
- **Charter aracılığı (broker):** kendi filon doluysa komisyonla başka tekne bağlama
- **Üyelik / kulüp:** yıllık aidatla X gün kullanım hakkı, öncelikli rezervasyon
- **Hisseli kullanım (fractional):** tekne sahipliğinin 1/8'i
- **Rota rehberi ürünü:** "Fethiye 12 koy" dijital rehber → SEO + e-posta listesi kurma aracı
- **Kış geliri:** bakım, kışlama, teknik servis, kiralık ekipman
- **Beyaz etiket rezervasyon altyapısı:** yerel küçük tekne sahiplerine rezervasyon paneli kiralama
- **Marka lisanslama:** Göcek / Kaş / Bodrum'da AS Yachting adıyla franchise

---

## 5. Web Sitesi — Kapsam ve Mimari

### 5.1 Sitenin tek işi
Ziyaretçinin **tarihi ve fiyatı kendi başına görüp talebi başlatması**. Ziyaretçi hiç kimseye sormadan "şu tarih boş, şu fiyat" bilgisine ulaşabilmeli. Her sayfa bu hedefe hizmet etmiyorsa siteye girmez.

**Kritik uyarı:** Müsaitlik takvimi, gerçeği yansıtmadığı anda güveni fiyat gizlemekten daha çok yıkar. Takvim ancak tek bir yerden yönetilirse çalışır. Bu yüzden yönetim paneli, sitenin kendisi kadar önemli bir çıktıdır.

### 5.2 Sayfa haritası (v1)
```
/                     Ana sayfa (hero, tekne, ürünler, 5.0 puan, takvim önizleme, CTA)
/tekne                Teknenin kendisi: galeri, kapasite, donanım, güvenlik
/turlar               Ürün listesi (asıl satış sayfası — fiyatlar burada)
/turlar/[urun]        Ürün detay (rota, saat planı, fiyat, dahil olanlar, takvim)
/deneyimler           Evlilik teklifi, doğum günü, kurumsal
/hakkimizda           Kaptan ve ekip hikâyesi (güvenin merkezi)
/yorumlar             Google yorumları + video referans
/sss                  Sık sorulan sorular (SEO + itiraz karşılama)
/blog                 Rehber içerikleri (SEO motoru)
/iletisim             Harita, WhatsApp, telefon, form
/rezervasyon          Tarih seç → tekne seç → fiyat gör → talep gönder
/fiyatlar             Tüm fiyat listesi tek sayfada (SEO + güven)
/admin                Yönetim paneli: takvim bloklama, fiyat güncelleme, talep listesi
```

### 5.3 Teknik yaklaşım (öneri — Faz 1'de kesinleşir)
- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Veri katmanı:** Demo aşamasında `data/seed.ts` (tip güvenli TypeScript objeleri). Tüm okuma işlemleri `lib/repository.ts` arkasından yapılır. Canlıya geçişte sadece repository implementasyonu Supabase'e döner — sayfalar hiç değişmez. **Bu soyutlama zorunludur.**
- **Veri modeli:** `boat`, `products` (pricing_type: `per_day` | `per_person` | `per_hour`), `availability_blocks`, `booking_requests`
- **Takvim mantığı:** varsayılan "müsait", istisnalar bloklanır. Başka satış kanalı olmadığı için iCal senkronu **v2'ye ertelendi**
- **Fiyat motoru:** sezon (düşük/yüksek), hafta içi/sonu, süre bazlı kural tablosu → fiyat sayfada otomatik hesaplanır
- **Admin paneli:** şifre korumalı, mobil uyumlu (kaptan telefondan tarih kapatabilmeli)
- **İçerik:** MDX veya hafif headless CMS (müşteri kendi güncelleyebilmeli)
- **Hosting:** Vercel
- **Dil:** TR + EN zorunlu; RU / DE opsiyonel (hreflang doğru kurulacak)
- **Form:** WhatsApp deep link + e-posta bildirimi + basit CRM kaydı
- **Analitik:** GA4 + Google Search Console + WhatsApp tıklama olayı
- **SEO:** Schema.org `LocalBusiness` + `Product` + `Offer` + `AggregateRating`, sunucu tarafı render, Core Web Vitals yeşil
- **Performans hedefi:** mobilde LCP < 2.5s (trafiğin ~%80'i mobil olacak)

### 5.4 Dönüşüm mekaniği
- Sabit WhatsApp butonu (mobilde her ekranda)
- "Müsaitlik sor" formu: tarih + kişi sayısı + tekne → 3 alan, fazlası değil
- Fiyat açıkça yazılır; ürün sayfasında "dahil / dahil değil" listesi zorunlu
- Google yorumlarının ana sayfada gerçek görüntüsü
- Çıkış niyeti yok, pop-up yok — güveni bozar

---

## 6. Faz Planı

| Faz | Ad | Çıktı | Durum |
|---|---|---|---|
| **0** | Keşif & Brief | Cevaplanmış soru listesi, konumlandırma kararı | ✅ Tamamlandı |
| **1** | Strateji & Kapsam | Konumlandırma, ürün mantığı, veri modeli kilitli | ✅ Tamamlandı |
| **2** | **Demo İnşası** | Çalışan demo: ana sayfa, ürünler, takvim, talep formu, ~~admin taslağı~~ | ✅ Tamamlandı (admin paneli hariç — DoD'da yoktu, Faz 6'ya alındı) |
| **3** | Müşteri Sunumu | Demo gösterimi, gerçek veri toplama, onay | ⏳ Devam ediyor |
| **4** | Marka Kimliği | Logo vektörleştirme, palet, tipografi, ton rehberi | ⬜ |
| **5** | İçerik & Çekim | Profesyonel çekim, metinler (TR/EN), SSS | ⬜ |
| **6** | Gerçek Veri & Supabase | Seed → veritabanı geçişi, admin paneli, çoklu dil | ⬜ |
| **7** | SEO & Yayın | Schema, sitemap, GBP optimizasyonu, GA4, domain, SSL | ⬜ |
| **8** | Büyüme | İçerik takvimi, yorum toplama, reklam, raporlama | ⬜ |

### Faz Tanımı — Faz 0 (tamamlandı)
Konumlandırma B seçildi, site işlevi (takvim) seçildi, varlık envanteri çıkarıldı.

### Faz Tanımı — Faz 1 (tamamlandı)
Konumlandırma B, tek tekne + çok ürün mantığı, karma fiyatlandırma, seed tabanlı veri katmanı kilitlendi.

### Faz Tanımı — Faz 2 — Demo İnşası (tamamlandı)
**Hedef:** Müşteriye gösterilecek, tarayıcıda çalışan, mobil uyumlu demo.
**Bitti sayılma kriteri (DoD):**
- [x] `data/seed.ts` — tek tekne + 5 ürün (özel kiralama, gün batımı, kahvaltı turu, evlilik teklifi, mavi tur) örnek verisiyle
- [x] `lib/repository.ts` soyutlaması — sayfalar seed'i doğrudan import etmiyor *(doğrulandı: `@/data/seed` importu yalnızca `lib/repository.ts` içinde geçiyor)*
- [x] Ana sayfa: hero, ürün kartları, 5.0/34 yorum vurgusu, WhatsApp CTA
- [x] Ürün listesi + detay sayfaları, üç fiyat tipini de doğru gösteriyor *(günlük ₺18.000/gün, saatlik ₺2.500/saat, kişi başı ₺1.200/kişi — tarayıcı testiyle doğrulandı)*
- [x] Müsaitlik takvimi bileşeni (bloklu tarihler seed'den) *(bloklu gün butonu `disabled`, etiketi "22 — Dolu")*
- [x] Talep formu: tarih + kişi sayısı + ürün → WhatsApp mesajı üretir *(uçtan uca test: 5 kişi × ₺1.200 × 1,1 yüksek sezon = ₺6.600, `wa.me/905444507013` mesajı doğru üretiliyor)*
- [x] Mobilde LCP < 2.5s, 375px genişlikte kırılma yok *(kısıtlanmış mobil profilde LCP 0,92–1,62 s; 375px'te `documentElement.scrollWidth = 375`, taşan öge yok)*
- [x] Görsel yer tutucuları belli (`/public/placeholder/`) — gerçek foto geldiğinde tek klasör değişecek

**Demo yasakları:** uydurma yorum metni, uydurma sertifika/ödül, gerçekmiş gibi sunulan fiyat. Fiyatlar `ÖRNEK` etiketiyle gösterilir.

**Faz 2 kapsam dışı bırakılanlar** (DoD'da yoktu, bilerek üretilmedi — navigasyona ölü bağlantı konmadı):
`/deneyimler`, `/hakkimizda`, `/yorumlar`, `/sss`, `/blog`, `/iletisim`, `/rezervasyon`, `/fiyatlar`, `/admin`.
Not: `/sss` içeriği (5 soru) şimdilik ana sayfada gösteriliyor; `/fiyatlar` işlevini `/turlar` sayfasındaki fiyat tablosu görüyor.

### Faz Tanımı — Faz 3 — Müşteri Sunumu (aktif)
**Hedef:** Demoyu müşteriye göstermek ve eksik gerçek veriyi toplamak.
**Bitti sayılma kriteri (DoD):**
- [ ] Demo müşteriye canlı gösterildi (mobil cihazdan da açıldı)
- [ ] Bölüm 10'daki B1–B5 soruları cevaplandı
- [ ] Tekne künyesi tamamlandı: ad, tip, boy, kabin sayısı, yapım yılı
- [ ] Gerçek fiyatlar alındı; `isSamplePrice` alanları `false` yapılabilir durumda
- [ ] Fiyata dahil / dahil değil listeleri müşteriyle satır satır teyit edildi
- [ ] İptal ve iade koşulları yazıldı (`data/seed.ts` içinde açık TODO)
- [ ] Sigorta ve turizm işletme belgesi durumu netleşti
- [ ] Google Business Profile kısa linki alındı (`googleProfileUrl`)
- [ ] Profesyonel çekim için karar ve bütçe alındı (Faz 5 kritik yolu)
- [ ] Domain adı seçildi

---

## 7. Ölçüm ve Hedefler (KPI)

| Metrik | Başlangıç | 6 ay hedefi |
|---|---|---|
| Organik aylık ziyaretçi | 0 | 2.000+ |
| Site → WhatsApp tıklama oranı | — | %8+ |
| Talep → rezervasyon dönüşümü | ❓ | %30+ |
| Google yorum sayısı | 34 | 100+ |
| Aracı platform bağımlılığı | ❓ | %50 azalt |
| Doğrudan rezervasyon oranı | ❓ | %60 |

---

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| Kaliteli görsel yokluğu (elde sadece amatör foto) | **Kritik** | Faz 3 kritik yol. Şeffaf fiyat konumlandırmasında görsel zayıflığı doğrudan "ucuz iş" algısına dönüşür. Tek günlük profesyonel çekim (tekne + insan + drone + gün batımı) minimum şart |
| Takvimin gerçeği yansıtmaması → çift rezervasyon | **Kritik** | Tek kaynak kural: aracı platformlar iCal ile senkron, değilse aracı platformlarda satış durdurulur |
| Logo sadece görsel dosya (vektör yok) | Orta | Faz 2'de logo vektörize edilip favicon/sosyal medya varyantları üretilecek |
| Domain adı geç seçilirse marka işleri tıkanır | Orta | İsim Faz 1'de seçilir, alım sonraya kalabilir |
| Fiyat sitede açıkken rakip fiyat kırar | Orta | Fiyat değil kapsam rekabeti: "dahil olanlar" listesi rakipten uzun tutulur |
| Sezonluk trafik | Orta | Kış içerik + erken rezervasyon kampanyası |
| Müşterinin siteyi güncelleyememesi | Orta | CMS + video eğitim |
| Yasal (turizm belgesi, sigorta, KVKK) | Yüksek | Faz 7 öncesi belge ve metin kontrolü |
| Rakiplerin fiyat kırması | Orta | Deneyim paketleriyle fiyat karşılaştırmasından çıkma |
| **Doğrulanmamış kapasite/mürettebat bilgisi sayfada kesin bilgi gibi görünüyor** (Faz 2'de eklendi) | **Yüksek** | `/tekne` ve tur sayfaları "12 kişiye kadar" ve "2 kişi mürettebat" yazıyor; bu değerler seed'de varsayım. Müşteri sunumundan **önce** teyit alınmalı (soru C3). Teyit gelmezse bu iki alan da "Bilgi bekleniyor"a çevrilmeli |
| **Google puanı rozeti tıklanamıyor** (Faz 2'de eklendi) | Orta | `googleProfileUrl` boş olduğu için sitenin tek gerçek sosyal kanıtı doğrulanabilir değil. GBP kısa linki alınınca rozet otomatik tıklanabilir hâle geliyor (soru C6) |
| **Yer tutucu görseller sunumda "eksik iş" izlenimi verebilir** (Faz 2'de eklendi) | Orta | Görseller marka paletinde ve "YER TUTUCU" damgalı üretildi; sunumda bunun geçici olduğu sözlü olarak da söylenmeli. Kalıcı çözüm Faz 5 çekimi |

---

## 9. Karar Günlüğü

| Tarih | Karar | Gerekçe |
|---|---|---|
| 2026-08-17 | Proje ana dosyası oluşturuldu | Fazlar arası süreklilik |
| 2026-08-17 | Konumlandırma: B — erişilebilir, şeffaf fiyat | Müşteri kararı. Fiyat gizleme yaklaşımı terk edildi |
| 2026-08-17 | Site tipi: veri tabanlı takvimli uygulama | Müşteri kararı. Statik site seçeneği elendi |
| 2026-08-17 | Postgres/Supabase + admin paneli kapsama eklendi | Takvim kararının teknik zorunluluğu |
| 2026-08-17 | Profesyonel çekim kritik yola alındı | Eldeki görseller amatör; şeffaf fiyat konumlandırması görsel kaliteye bağımlı |
| 2026-08-17 | Domain alımı ertelendi, isim kararı Faz 1'e alındı | Marka işleri isim olmadan ilerleyemez |
| 2026-08-17 | Proje "demo önce" moduna alındı | Gerçek filo/fiyat verisi yok; demo müşteri onayı için üretilecek |
| 2026-08-17 | "Filo" konsepti kaldırıldı, tek tekne + çok ürün mimarisi | Muhtemelen tek tekne. Satılan şey tekne değil, ürün/deneyim |
| 2026-08-17 | iCal senkronu v2'ye ertelendi | Başka satış kanalı yok, çift rezervasyon riski mevcut değil |
| 2026-08-17 | Repository soyutlaması zorunlu kılındı | Demo seed'den canlı veritabanına geçiş sayfaları bozmadan yapılabilsin |
| 2026-08-17 | Supabase kurulumu Faz 6'ya ertelendi | Demo aşamasında veritabanı gereksiz karmaşıklık |
| 2026-08-17 | Tasarım kaynağı: Stitch çıktısı — **yapı ve tipografi alınır, içerik alınmaz** | Stitch ultra-lüks charter dili üretti (€120.000/hafta, concierge, özel jet). Konumlandırma B ile çelişiyor |
| 2026-08-17 | Açık zeminli altın logo seçildi; koyu lacivert "Luxury" versiyon reddedildi | Konumlandırmayla uyum |
| 2026-08-17 | Wordmark "As Yachting" — alt çizgi ve "Luxury" kaldırıldı | Müşteri talebi |
| 2026-08-17 | Siyah+altın blok bölümler kaldırıldı, altın sadece vurgu | "Pahalı görünme" tuzağından kaçınma |
| 2026-08-17 | Fiyatlar TL, Fethiye günübirlik gerçekliğine göre | Euro/hafta charter kurgusu terk edildi |
| 2026-08-17 | **Faz 2 teknik kararları aşağıda** ⬇️ | — |
| 2026-08-17 | Next.js 15.5.23 + React 19.1 + TypeScript + Tailwind v4 kuruldu | Bölüm 5.3'teki teknik yaklaşımın uygulanması. Tailwind v4 `@theme` bloğu marka paletini CSS değişkeni olarak sunuyor, ayrı config dosyası gerekmiyor |
| 2026-08-17 | `design/theme.css` → `app/globals.css` olarak tek canlı kopya | İki kopya tutulsa palet zamanla birbirinden ayrışırdı |
| 2026-08-17 | Fontlar `next/font` ile kendi sunucumuzdan servis ediliyor | Google Fonts'a giden render-blocking istek kalkıyor; LCP < 2.5s hedefi doğrudan bunu gerektiriyor. `globals.css`'te sadece iki font satırı değişkene bağlandı, renkler ve kurallar dokunulmadı |
| 2026-08-17 | Türkçe karakterler için `latin-ext` alt kümesi seçildi | Bölüm 3.2'deki "Türkçe karakter desteği doğrulanacak" maddesi kapandı: ş ğ ı İ ç ö ü sorunsuz |
| 2026-08-17 | **Fiyat rakamları gövde fontunda (Inter), başlık fontunda değil** | Cormorant Garamond eski usul (küçük harf görünümlü) rakam kullanıyor; ₺18.000 okunurluğu düşüyordu. Konumlandırma B'nin tek kozu fiyatın anında okunması |
| 2026-08-17 | Mobilde fiyat tablosu yatay kaydırma yerine **kolon gizleme** | Yatay kaydırmada fiyat kolonu ekran dışında kalıyordu. Trafiğin ~%80'i mobil; fiyatı gizleyen bir çözüm konumlandırmayı bozar. Kapasite ve fiyat tipi kolonları küçük ekranda gizlendi, fiyat her zaman görünür |
| 2026-08-17 | Talep formu sunucu eylemi (`app/actions.ts`) üzerinden repository'ye gidiyor | İstemci ne seed'i ne mesaj biçimini görüyor; Kural 4 korunuyor. Müsaitlik ve kişi sayısı sunucuda **yeniden** doğrulanıyor — tarayıcı kontrolüne güvenilmiyor |
| 2026-08-17 | WhatsApp'a `window.location.href` ile gidiliyor, yeni sekme açılmıyor | Mobilde WhatsApp uygulamasını doğrudan açıyor ve pop-up engelleyicilere yakalanmıyor |
| 2026-08-17 | `BookingRequest.name` / `phone` boş dizge geçiliyor | DoD ve Bölüm 5.4 formu 3 alanla sınırlıyor; kimlik WhatsApp hesabından geliyor. Faz 6'da talepler veritabanına yazılırken bu iki alan forma eklenecek |
| 2026-08-17 | `TODO:` içeren seed alanları arayüzde "Bilgi bekleniyor" olarak gösteriliyor | Ham "TODO: Tekne adı" metnini müşteriye basmak demoyu bozuk gösterirdi. `lib/placeholder.ts` bu alanları tespit edip etiketliyor; gerçek değer girildiği an kendiliğinden görünür oluyor |
| 2026-08-17 | Yer tutucu görseller marka paletinde, "YER TUTUCU" damgalı üretildi | Boş gri kutu demo sunumunda "eksik iş" izlenimi verir. Damga, görselin geçici olduğunu müşteriye açıkça söylüyor |
| 2026-08-17 | Wordmark şimdilik metin olarak ("As Yachting", alt çizgi ve "Luxury" yok) | Vektör logo Faz 4'te üretilecek; `components/Wordmark.tsx` tek dosya olarak değişecek |
| 2026-08-17 | Takvim varsayılan salt okunur, `onSelect` verilirse seçilebilir hâle geliyor | Aynı bileşen hem ana sayfa/tekne önizlemesinde hem talep formunda kullanılıyor, kod ikizlenmiyor |
| 2026-08-17 | Tarih işlemleri `lib/dates.ts` içinde yerel saatle yapılıyor, `toISOString()` kullanılmıyor | Türkiye saatinde `toISOString()` tarihi bir gün geriye kaydırıyor — takvimde yanlış günün dolu görünmesine yol açardı |
| 2026-08-17 | Mobilde sabit alt bar (Ara + WhatsApp), pop-up yok | Bölüm 5.4 dönüşüm mekaniği; "çıkış niyeti yok, pop-up yok" kuralına uyuluyor |

---

## 10. Açık Sorular

### 🔴 Faz 1'i bloke edenler (öncelikli)
- **B1.** Filo: kaç tekne, tipleri, kapasiteleri, isimleri? Kendinizin mi, aracılık mı?
- **B2.** Fiyat modeli: saatlik mi, günlük mü, kişi başı mı? Sezona göre değişiyor mu?
- **B3.** Fiyata dahil olanlar / olmayanlar tam listesi?
- **B4.** Takvimi kim yönetecek, hangi cihazdan? Şu an başka platformda listeleniyor musunuz?
- **B5.** Domain için tercih: `asyachting.com` / `asyachtingfethiye.com` / başka?

### Cevaplananlar
- ~~Konumlandırma tercihi~~ → **B, şeffaf fiyat**
- ~~Sitenin ana işlevi~~ → **Online takvim + müsaitlik**
- ~~Eldeki varlıklar~~ → **Logo görseli var (vektör yok), amatör fotoğraflar var, domain alınmadı**
- ~~Gövde fontu Türkçe karakterleri destekliyor mu?~~ → **Evet. Inter + Cormorant Garamond `latin-ext` alt kümesiyle ş ğ ı İ ç ö ü sorunsuz (Faz 2'de doğrulandı)**

### 🔴 Faz 2'de ortaya çıkan, demoyu müşteriye sunmadan cevaplanması gerekenler
- **C1.** Teknenin **adı** nedir? Demo şu an "Teknemiz" diyor, tekne adı hiçbir yerde yazmıyor.
- **C2.** Tekne tipi (gulet / motoryat / sürat teknesi / yelkenli), **boyu**, **kabin sayısı**, **yapım yılı**? `/tekne` sayfasında bu 4 alan "Bilgi bekleniyor" olarak duruyor.
- **C3.** `12 kişi` kapasite ve `2 kişi` mürettebat doğru mu? Şu an seed'de varsayım olarak duruyor ve sayfada **kesin bilgi gibi** görünüyor — teyit edilmezse Kural 1 ihlali olur.
- **C4.** İptal ve iade koşulları nedir? SSS'de eksik olan tek soru bu.
- **C5.** Sigorta poliçesi ve turizm işletme belgesi var mı? Güvenlik bölümünde yer ayrıldı, içerik bekliyor.
- **C6.** Google Business Profile kısa linki? Şu an `googleProfileUrl: null` olduğu için 5.0 puan rozeti **tıklanamıyor** — en güçlü sosyal kanıt doğrulanabilir değil.
- **C7.** Ticari unvan (`legalName`) — KVKK ve yasal metinler için Faz 7'de zorunlu.
- **C8.** Instagram hesabı var mı? Footer'da yer ayrıldı, link bekliyor.
- **C9.** WhatsApp mesajındaki tarih biçimi: şu an `Tarih: 2026-08-30` gibi ISO formatta gidiyor. `30 Ağustos 2026` tercih edilirse `lib/repository.ts` içinde tek satır değişir — bu dosya korunmuş olduğu için dokunulmadı.
- **C10.** Yüksek sezon çarpanları (günübirlik 1,25 / gün batımı 1,15 / kahvaltı 1,10 / evlilik teklifi 1,20 / mavi tur 1,30) ve yüksek sezon ayları (Haziran–Eylül) doğru mu? Fiyat motoru bunları canlı uyguluyor.

### Kalan sorular (Faz 2–3'te lazım olacak)

**İşletme**
1. Gelirin dağılımı: günübirlik / özel / mavi tur?
2. Gelirin yüzde kaçı günübirlik tur, yüzde kaçı özel kiralama / mavi tur?
3. Müşterileriniz şu an sizi nasıl buluyor? (Google, Instagram, otel yönlendirmesi, aracı site)
4. Aracı platformlara ödediğiniz komisyon var mı, ne kadar?
5. Fiyat aralığınız nedir ve siteye fiyat yazmak istiyor musunuz?
6. Sezon dışında (Kasım–Mart) ne yapıyorsunuz?
7. Kapasite doluluk oranınız nedir? Sorun talep mi, doluluk mu?

**Müşteri**
8. Yerli / yabancı oranı? Yabancıların uyruğu?
9. En kârlı müşteri tipi hangisi?
10. Tekrar gelen müşteri var mı?

**Marka**
11. Kaptanın / kurucunun hikâyesi nedir? (Sitenin en güçlü sayfası burası olacak)
12. Sizi rakiplerden ayıran, sadece sizin yapabildiğiniz şey nedir?
13. Rakip olarak kimi görüyorsunuz? Beğendiğiniz bir marka var mı?

**Proje**
14. Bütçe ve zaman hedefi? (Sezon başına yetişme hedefi var mı?)
15. Instagram hesabı ve takipçi sayısı?
16. Online ödeme / kapora tahsilatı ileride istenecek mi?
17. Turizm işletme belgesi / sigorta durumu?
18. Siteyi kim güncelleyecek?
19. Profesyonel çekim için bütçe ayrılabilir mi? (Faz 3 kritik yol)

---

## 11. Faz Sonu Protokolü (Claude Code için)

Her fazın sonunda, kod yazmadan önce ve sonra bu dosya **otomatik** güncellenecek:

1. Üst tablodaki `Versiyon`, `Son güncelleme`, `Aktif faz`, `Durum` alanlarını güncelle.
2. Bölüm 6'daki faz tablosunda ilgili satırı `✅ Tamamlandı` yap, bir sonrakini `⏳ Devam ediyor` yap.
3. Bölüm 9 Karar Günlüğü'ne o fazda alınan **her teknik ve stratejik kararı** tarih + gerekçe ile ekle.
4. Bölüm 10'da cevaplanan soruları `~~üstü çizili~~` yapıp cevabı yanına yaz; yeni çıkan soruları ekle.
5. Yeni risk çıktıysa Bölüm 8'e ekle.
6. Fazda üretilen dosyaların listesini "Üretilen Dosyalar" bölümüne yaz.
7. Bir sonraki fazın DoD'unu (bitti sayılma kriteri) yaz.
8. Değişikliği `docs: faz N tamamlandı` formatında commit et.

**Yasak:** Doğrulanmamış bilgiyi (filo, fiyat, sertifika, müşteri sayısı) kesin bilgi gibi yazmak. Bilinmeyen her alan `❓` ile işaretlenir.

### Claude Code başlangıç komutu (Faz 2 için)
```
Bu dosyayı (AS_YACHTING_PROJE.md) baştan sona oku.
"Proje Modu: DEMO ÖNCE" ve "Kilitlenen Kararlar" bölümlerine harfiyen uy.

Faz 2'yi uygula. Sırayla:
1. Next.js + TypeScript + Tailwind projesi kur
2. data/seed.ts ve lib/repository.ts yaz (sayfalar seed'i doğrudan import etmeyecek)
3. Ana sayfa, /turlar, /turlar/[urun], /tekne sayfaları
4. Müsaitlik takvimi bileşeni ve talep formu (WhatsApp mesajı üretir)

Kurallar:
- Bilmediğin hiçbir bilgiyi uydurma. Eksikse TODO yaz ve bana sor.
- Fiyatlar ÖRNEK etiketiyle gösterilecek.
- Mobil önce tasarla.
Her adım bitince DoD listesindeki kutuyu işaretle ve Bölüm 11 protokolünü uygula.
```

### 🚀 Siteden bağımsız hızlı kazanımlar (bu hafta yapılabilir, ücretsiz)
Site hazır olana kadar bekleyecek bir şey yok. Google hesabı zaten en değerli varlık:
1. Google Business Profile'a **fotoğraf yükleme** (haftada 3–5 adet) — sıralamayı doğrudan etkiler
2. GBP'ye **hizmet ve ürün listesi** ekleme (fiyatlarıyla) — mini web sitesi görevi görür
3. GBP **soru-cevap** bölümünü kendi kendine doldurma (en çok sorulan 10 soru)
4. Site yayınlanana kadar GBP'ye **WhatsApp bağlantısı** ekleme
5. Her müşteriden çıkışta **yorum isteme ritüeli** (34 → 100 yorum en büyük rekabet avantajı)

---

## 12. Üretilen Dosyalar

### Faz 1
- `AS_YACHTING_PROJE.md` — ana proje dosyası (bu dosya)
- `CLAUDE.md` — Claude Code çalışma kuralları
- `data/seed.ts`, `lib/types.ts`, `lib/repository.ts`, `lib/pricing.ts`, `design/theme.css` — Faz 2'de yerlerine taşındı, içerikleri değiştirilmedi

### Faz 2 — Demo İnşası

**Kurulum**
- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `.gitignore`

**Sayfalar** (`app/`)
- `app/layout.tsx` — kök şablon, fontlar, üstbilgi/altbilgi/mobil bar, metadata
- `app/globals.css` — marka teması (`design/theme.css`'ten taşındı; sadece font satırları değişkene bağlandı)
- `app/page.tsx` — ana sayfa
- `app/turlar/page.tsx` — tur listesi + fiyat tablosu
- `app/turlar/[urun]/page.tsx` — tur detayı (5 sayfa statik üretiliyor)
- `app/tekne/page.tsx` — tekne sayfası
- `app/actions.ts` — talep formu sunucu eylemi
- `app/icon.svg` — geçici favicon (Faz 4'te gerçek logodan üretilecek)

**Bileşenler** (`components/`)
- `AvailabilityCalendar.tsx` — müsaitlik takvimi (salt okunur + seçilebilir iki mod)
- `BookingPanel.tsx` — talep formu: tarih + kişi sayısı + canlı fiyat → WhatsApp
- `ProductCard.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `MobileContactBar.tsx`
- `GoogleRating.tsx`, `SampleBadge.tsx` (`ÖRNEK` rozeti), `DemoNotice.tsx`, `Wordmark.tsx`, `icons.tsx`

**Yardımcılar** (`lib/`) — hiçbiri veri okumaz, hepsi saf fonksiyon
- `lib/dates.ts` — takvim ızgarası ve yerel tarih biçimlendirme
- `lib/links.ts` — `wa.me` ve `tel:` bağlantı üretimi
- `lib/placeholder.ts` — doldurulmamış seed alanlarını tespit etme

**Görseller** (`public/placeholder/`)
- `boat-01.jpg`, `boat-02.jpg`, `boat-03.jpg`
- `product-private-01.jpg`, `product-sunset-01.jpg`, `product-breakfast-01.jpg`, `product-proposal-01.jpg`, `product-bluecruise-01.jpg`
- Hepsi marka paletinde, "YER TUTUCU" damgalı. Gerçek foto gelince **sadece bu klasör** değişir.

### Faz 2 doğrulama sonuçları

| Ölçüt | Sonuç |
|---|---|
| `next build` | ✅ Hatasız — tip kontrolü ve lint dahil |
| Sayfa üretimi | 9 rota statik/SSG olarak ön-üretildi |
| İlk yük JS | 111–115 kB |
| Mobil LCP (kısıtlanmış profil, 4× CPU + yavaş 4G) | Ana sayfa 0,92 s · `/turlar` 1,22 s · tur detayı 1,62 s · `/tekne` 1,41 s — **hedef < 2,5 s** |
| 375px kırılma | ✅ Yok — dört sayfada da `scrollWidth = 375`, taşan öge sıfır |
| Kural 4 (repository soyutlaması) | ✅ `@/data/seed` importu yalnızca `lib/repository.ts`'te |
| Talep formu uçtan uca | ✅ 5 kişi × ₺1.200 × 1,1 = ₺6.600, doğru `wa.me` mesajı üretildi |
| Bloklu tarih | ✅ 22 Ağustos butonu `disabled`, etiket "22 — Dolu" |

> **Not:** LCP ölçümü yerel sunucuda yapıldı; gerçek alan değeri hosting ve ağ gecikmesiyle artacak. Aradaki pay hedefe göre geniş.
