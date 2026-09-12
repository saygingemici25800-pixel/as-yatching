# AS Yachting — Claude Code Çalışma Kuralları

Bu dosyayı her oturumda oku. `AS_YACHTING_PROJE.md` ana strateji dosyasıdır, o da okunacak.

## Proje özeti
Fethiye'de tek tekneli bir tekne kiralama işletmesi için, **şeffaf fiyatlı**, **online müsaitlik takvimli** tanıtım ve talep toplama sitesi. Şu an **demo aşaması** — gerçek veri yok.

## Mutlak kurallar

1. **Uydurma yok.** Sertifika, ödül, müşteri yorumu, kapasite, sertifika numarası uydurulmaz. Bilinmeyen alan `TODO:` ile işaretlenir ve kullanıcıya sorulur.
2. **Gerçek olan tek sosyal kanıt:** Google 5.0 puan / 33 yorum (2026-09). Yorum metinleri `data/seed.ts` → `googleReviews` içinde profilden birebir alınmıştır; asla uydurulmaz, düzenlenmez (yalnızca "…" ile kısaltılır).
3. **Fiyatlar demo verisidir.** Arayüzde `ÖRNEK` rozetiyle gösterilir.
4. **Veri erişimi sadece `lib/repository.ts` üzerinden.** Hiçbir sayfa `data/seed.ts`'i doğrudan import etmez. Bu kural Supabase geçişi içindir, esnetilmez.
5. **Mobil önce.** 375px'te kırılma olmayacak. Trafiğin çoğu mobil olacak.
6. **Türkçe birincil dil.** İngilizce v2.

## Marka dili

**Kullan:** net, sıcak, sade. "Fiyata dahil olanlar", "tarih seçin, müsaitliği görün", "kaptanımız", "12 kişiye kadar".

**Kullanma:** bespoke, concierge, uncompromising, myth, curated, "hayalinizdeki tatil", "eşsiz deneyim", "lüks", "ayrıcalık". Aşırı süslü dil bu markanın konumlandırmasını bozar.

## Görsel sistem

```
Zemin        #EDDACC
Yüzey        #F7EDE3
Metin        #003357
İkincil      #3F5F7A
Vurgu        #B08D3F   (sadece ince çizgi, ikon, küçük etiket — ASLA blok zemin)
Kenarlık     #D9C2AD
```

- Başlık fontu: Caviar Dreams (app/fonts/CaviarDreams.ttf, tek kesim)
- Gövde fontu: sans (Inter)
- Siyah zeminli, altın yazılı blok bölüm **yapılmaz**
- Logo: açık zeminli altın el yazısı. Wordmark **"As Yachting"** — alt çizgi yok, "Luxury" yok
- Görseller `/public/placeholder/` altında yer tutucu. Gerçek foto gelince sadece bu klasör değişir

## Klasör yapısı

```
app/                 Next.js App Router sayfaları
components/          Yeniden kullanılabilir bileşenler
data/seed.ts         TÜM demo verisi burada
lib/types.ts         Tip tanımları
lib/repository.ts    Veri erişim katmanı (tek kapı)
lib/pricing.ts       Fiyat hesaplama
public/placeholder/  Yer tutucu görseller
```

## Faz bitince
`AS_YACHTING_PROJE.md` Bölüm 11'deki protokolü uygula: künyeyi güncelle, faz tablosunu işaretle, karar günlüğüne ekle, yeni soruları yaz, `docs: faz N tamamlandı` commit'i at.
