# Öztürk Güvenlik — Proje Yapılacaklar Listesi

Son güncelleme: 2026-08-21 (Faz 5 tamamlandı)

## 🏗️ İş Yönetim Sistemi (ERP) — Yol Haritası

Müşterinin tarif ettiği tam kapsam: CRM, iş/proje yönetimi, personel, teklif
sistemi, fatura+finans, stok, servis/arıza, bakım sözleşmesi, CEO dashboard —
tam yaşam döngüsü: `Müşteri → Talep → Keşif → Teklif → Onay → İş → Personel+
Ürün+Planlama → Montaj/Servis → Teslim → Fatura → Tahsilat → Kâr → Periyodik
Bakım`.

Bu tek oturumda bitirilemeyecek kadar büyük bir kapsam (gerçek bir ERP) —
bu yüzden fazlara ayrıldı. **Faz 1 bu oturumda uçtan uca (şema + API + UI +
migration) tamamlandı ve production'da doğrulandı.** Kalan fazlar aşağıda,
hiçbiri kaybolmadı — sadece sırayla gelecek.

### ✅ Faz 1 — Temel finans + teklif + ürün kataloğu (TAMAMLANDI — 2026-08-19)

- [x] **Ürün kataloğu** (`products` tablosu) — **alış fiyatı yalnızca admin'e
      döner, personel yalnızca satış fiyatını görür** (`app/api/products/route.ts`
      beyaz liste ile filtreliyor; personel ürün oluşturamaz/silemez — 403).
      Panel: `/panel/urunler`.
- [x] **Teklif sistemi genişletildi** — kalemler kataloğdan seçilebiliyor
      (seçilince ad+fiyat otomatik doluyor) veya serbest metin olarak
      girilebiliyor. KDV oranı + ara toplam + KDV tutarı + genel toplam
      otomatik hesaplanıyor (`lib/money.ts`). Paylaşılan bileşen:
      `components/panel/ItemsEditor.tsx` (Teklifler + Faturalar aynı bileşeni
      kullanıyor).
- [x] **Faturalar** (`invoices` tablosu, yeni) — otomatik fatura numarası
      (`OG-{yıl}-{sıra}`), KDV, durum (taslak/gönderildi/ödendi/iptal), vade
      tarihi, ilgili işe bağlanabiliyor. Panel: `/panel/faturalar`.
- [x] **Kasa / Gelir-Gider** (`transactions` tablosu, yeni) — gelir/gider
      kategorileri, ödeme yöntemi, bu ay özet kartları (gelir/gider/net).
      Panel: `/panel/kasa`.
- [x] **Otomatik entegrasyon**: fatura "Ödendi" işaretlenince arka planda
      otomatik olarak Kasa'ya gelir kaydı düşüyor (`app/api/invoices/[id]/route.ts`)
      — aynı tahsilatı iki kez elle girmiyorsunuz.
- [x] **CEO dashboard yeniden tasarlandı** (`/panel`): açık iş, bugünkü
      randevu, bekleyen teklif, bekleyen tahsilat sayıları + bu ay ciro + bu
      ay tahmini kâr (gelir−gider), tahsilat bekleyen faturalar listesi.
- [x] Migration uygulandı (`drizzle/0001_sudden_beyonder.sql`), ürün
      kataloğuna 7 örnek kalem seed edildi (gerçek markalarla: UNV, Seagate,
      TP-Link, ZKTeco — homepage'deki marka şeridiyle tutarlı).
- [x] Panel sol menü hizası düzeltildi (ortada kalıyordu → artık ekranın
      soluna yaslı), homepage "başlıca markalar" artık gerçek logo görselleri
      gösteriyor (önceden yalnızca metin rozetiydi, dosyalar `public/images/
      brands/`'te duruyordu ama hiç kullanılmıyordu).

### ✅ Faz 2 — İş bazlı maliyet/kâr + stok (TAMAMLANDI — 2026-08-19)

- [x] `jobs.items` (ürün+adet, kataloğa bağlı), `jobs.costTotal` (kalemlerden
      otomatik, `lib/stock.ts`), `jobs.saleTotal` (elle girilir) eklendi.
      Kâr (satış − maliyet) İşler listesinde ve iş detayında **yalnızca
      admin'e** görünür — personel işte satış tutarını görür, maliyeti görmez.
- [x] **Otomatik stok düşümü**: bir işe ürün eklenince/kaydedilince
      `products.stockQty` işlem içinde (DB transaction, `db.transaction`)
      otomatik güncellenir. İş düzenlenip kalem adedi değişince yalnızca
      **fark** kadar düşer/geri eklenir; iş silinince kullanılan ürünler
      stoğa tam olarak geri eklenir. Negatif stok engellenmiyor (gerçek
      envanter tam kayıtlı olmayabilir) — bunun yerine düşük/kritik stok
      panelde uyarı olarak gösteriliyor.
- [x] **Düşük stok uyarısı**: `/panel/urunler`'de kritik rozet (≤5 adet,
      `LOW_STOCK_THRESHOLD`), dashboard'da "Kritik stok" kartı.
- [x] **İş kartına fotoğraf + teslim tutanağı (TAMAMLANDI — 2026-08-21)**:
      `jobs.photos` (`[{id,url}]`, private Blob + proxy — ürün görseliyle
      aynı desen), `components/panel/PhotoGallery.tsx` düzenleme
      modalında (yalnızca kayıtlı işte). Teslim Tutanağı PDF
      (`components/pdf/JobDeliveryReceiptPdf.tsx`) — kalemler + eklenen
      fotoğraflar gömülü, imza alanlarıyla, indirilebilir. Silinen işin
      fotoğrafları Blob'da öksüz kalmasın diye DELETE'e temizlik eklendi.
      Production'da tam uçtan uca doğrulandı (yükle → PDF'e göm → sil →
      blob temizliği).

**Bu fazı yaparken kritik, önceden var olan bir hata bulundu ve düzeltildi:**
`updateCustomerSchema`, `updateAppointmentSchema`, `updateOfferSchema` (ve artık
`updateJobSchema`/`updateProductSchema`/`updateTransactionSchema`) `createXSchema
.partial()` ile tanımlanmıştı. Zod'da `.partial()` her alanı `.optional()` ile
sarar ama alanın kendi `.default(...)`'ini **iptal etmez** — yani gönderilmeyen
bir alan yine de varsayılana düşüyordu. Somut etkisi: **Randevular/Teklifler/
İşler sayfalarındaki satır-içi durum değiştirme dropdown'u yalnızca
`{status:"..."}` gönderiyor — bu, o kaydın başlığını/notunu/adresini (ve artık
işlerde ürün listesini + dolayısıyla stok düşümünü) sessizce `""`/`[]`/`0`'a
sıfırlıyordu.** `node -e` ile ayrı bir script'te doğrulandı, sonra tüm ilgili
`update*Schema`'lar varsayılansız, elle yazılmış şemalarla değiştirildi
([lib/validators.ts](lib/validators.ts)). Bu, OpenCode'un orijinal kodunda
zaten vardı (Faz 1 öncesi) — ben de aynı deseni fark etmeden Faz 2'ye taşımışım,
kendi testlerimde yakalayıp düzelttim.

### ✅ Faz 3a — CRM derinliği (TAMAMLANDI — 2026-08-19)

- [x] **Müşteri detay ekranı** (`/panel/musteriler/[id]`) — o müşteriye ait
      tüm talep/randevu/teklif/iş/fatura/kasa hareketi tek sayfada (mevcut
      liste API'leri client-side `customerId` ile filtreleniyor — bu ölçekte
      ayrı bir agregasyon endpoint'ine gerek yok), üstte toplam fatura /
      toplam tahsilat / bakiye özeti.
- [x] Müşteri başına **birden fazla yetkili kişi** (`customers.contacts`) ve
      **birden fazla lokasyon** (`customers.locations`) — ayrı normalize
      tablolar yerine bilinçli olarak jsonb dizi olarak tutuldu (bu ölçek için
      yeterli, ayrı CRUD endpoint'i gerektirmiyor); ana adres (`address`)
      hâlâ randevu/iş formlarının varsayılan doldurduğu alan, `locations`
      yalnızca ek şubeler/adresler için.
- [x] **Görüşme notu geçmişi** — yeni `customer_notes` tablosu (kanal:
      telefon/WhatsApp/yüz yüze/diğer, yazan kişi, tarih), müşteri kartında
      eklenebilir not akışı.
- [x] Migration uygulandı (`drizzle/0003_calm_the_anarchist.sql`).

### ✅ Faz 3b — Servis / Arıza Yönetimi (TAMAMLANDI — 2026-08-19)

- [x] Yeni `service_tickets` tablosu — müşteri, cihaz, lokasyon, arıza
      açıklaması, teknisyen ataması, kullanılan parça (`lib/stock.ts` Faz
      2'deki stok düşüm mekanizması aynen yeniden kullanıldı — otomatik
      düşer/geri eklenir), servis ücreti (herkese görünür), parça maliyeti
      (yalnızca admin'e görünür), sonuç. Panel: `/panel/servis`.
- [x] Dashboard'a "Açık servis kaydı" kartı eklendi (durum: açık veya
      randevu verildi olanlar sayılıyor).
- [x] **Fotoğraf (TAMAMLANDI — 2026-08-21)**: `service_tickets.photos`,
      işlerdekiyle birebir aynı desen (`PhotoGallery`, private Blob +
      proxy, silinince temizlik). Production'da doğrulandı.
- [x] **Bağlı randevudan otomatik servis kaydı oluşturma (TAMAMLANDI —
      2026-08-21)**: `appointments.type` alanı eklendi (Keşif / Kurulum /
      Servis-Arıza — kullanıcıyla netleştirildi: randevu formuna tür
      alanı eklenmesi tercih edildi). Türü "Servis-Arıza" olan bir randevu
      "Tamamlandı" işaretlenince otomatik bir `service_tickets` taslağı
      açılıyor (durum: açık, kalan alanlar teknisyen doldurur). Aynı
      randevu için tekrar tetiklenmiyor, oluşturma başarısız olsa bile
      randevu güncellemesi etkilenmiyor. [app/api/appointments/[id]/route.ts](app/api/appointments/[id]/route.ts)
- [x] Migration uygulandı (`drizzle/0004_lumpy_ultimo.sql`).

**Aynı oturumda ayrıca acil bir mobil hata düzeltildi**: panel kabuğu ve
giriş sayfası `100vh` (`h-screen`/`min-h-screen`) kullanıyordu — mobil
tarayıcılarda adres çubuğu scroll ile gizlenip açılınca gerçek görünür
yükseklik değişiyor ama `100vh` sabit kaldığı için sayfa "kayıyor" hissi
veriyordu. `dvh` birimine geçildi, ayrı ve hızlı bir deploy ile hemen
düzeltildi (diğer Faz 3b değişikliklerinden bağımsız, veritabanı
migration'ı gerektirmediği için önce o gitti).

**Ek mobil iyileştirme (2026-08-19)**: veri yüklenirken `Loading`
göstergesi çok kısaydı (py-16), gerçek içerik gelince sayfa aniden
uzuyordu — bu da "kayma" hissinin ayrı bir olası kaynağıydı. Artık
`min-h-[50vh]` ile gerçek içeriğe yakın alan kaplıyor. **Eğer sorun
hâlâ sürüyorsa**: tarayıcıyı sil/gizli sekmede dene (istemci önbelleği
ihtimalini eler) ve tam olarak hangi ekranda, hangi anda (yüklenirken
mi, kaydırırken mi, yukarı mı aşağı mı yoksa yana mı) olduğunu
söyle — canlı sistemde körlemesine daha fazla değişiklik yapmak yerine
kesin sebebi bulup tek seferde doğru düzeltmek istiyorum.

### ✅ Faz 3c — Seri numaralı envanter takibi (TAMAMLANDI — 2026-08-20)

Müşteri senaryosu: 6 kamera + 1 DVR kurulacak. Hangi **fiziksel**
cihazların (seri numarasına kadar) hangi işte kullanıldığını kayıt
altına almak ve otomatik olarak stoktan düşmek. Şu anki sistem
yalnızca "kaç adet" düşüyor, "hangi cihaz" bilgisini tutmuyor.

**Veri modeli:**
- `products.serialized: boolean` (varsayılan `false`) — admin bu
  ürünü seri numaralı takip edecek şekilde işaretler (kamera/DVR/NVR
  gibi yüksek değerli, garantisi takip edilecek cihazlar için; kablo/
  vida gibi sarf malzemede kapalı kalır — mevcut basit adet sistemi
  bunlarda aynen çalışmaya devam eder, **geriye dönük uyumlu**).
- Yeni `product_units` tablosu — ürünün her fiziksel adedi bir satır:
  `id, productId, serialNumber (ürün başına benzersiz), status
  (stokta | kuruldu | arizali | iade), jobId, serviceTicketId, note,
  createdAt, installedAt`.
- Seri takipli ürünlerde `products.stockQty` artık elle girilmiyor —
  `product_units` içindeki `status='stokta'` sayısından otomatik
  hesaplanıyor (tek doğruluk kaynağı, iki ayrı sayı sapmasın diye).

**Stok girişi:** Ürünler sayfasında seri takipli bir üründe "Seri
numaralarını yönet" ekranı — yeni gelen cihazların seri numaraları
tek tek veya toplu (her satıra bir seri no) yapıştırılarak eklenir,
durumları `stokta` olarak başlar.

**İş/servis kaydında kullanım:** Bir işe/servis kaydına seri takipli
bir ürün eklendiğinde, düz "adet" alanı yerine o ürünün `stokta`
durumundaki seri numaralarından **çoklu seçim** listesi çıkar (örn.
24 kamera stokta, kullanıcı bunlardan 6'sını işaretler). Kaydedilince:
- seçilen `product_units` satırlarının durumu `kuruldu` olur,
  `jobId`/`serviceTicketId` ve `installedAt` set edilir
- iş/servis kaydı silinir veya o kalem kaldırılırsa durum otomatik
  `stokta`'ya döner (Faz 2/3b'deki `lib/stock.ts` mantığının seri
  numaralı sürümü — `applyStockDelta` unit-id listesi üzerinden
  çalışacak şekilde genişletilecek)
- iş/servis detayında "bu işe hangi seri numaralı cihazlar takıldı"
  listesi otomatik görünür — garanti takibi ve ileride bir arıza
  geldiğinde "bu cihazı biz mi taktık" sorgusu için temel oluşturur

**API:** `app/api/products/[id]/units` (GET liste, POST toplu ekleme),
`app/api/products/[id]/units/[unitId]` (PATCH durum/not, DELETE hatalı
kayıt). `lib/stock.ts`'teki `JobItem` tipine opsiyonel `unitIds:
number[]` eklenecek.

**UI:** Ürünler'de "Seri numaralı" anahtarı + ürün detay sayfası
(birim listesi, toplu ekleme, durum rozetleri); `JobItemsEditor` ve
servis kalem editöründe seri takipli ürün seçilince adet input'u
yerine mevcut stoktaki seri numaralarının aranabilir çoklu seçim
listesi.

Mevcut basit adet sistemini **bozmadan** üstüne eklendi — seri
takibi kapalı ürünlerde hiçbir şey değişmedi. Yukarıdaki tasarımın
tamamı ([lib/stock.ts](lib/stock.ts), `product_units` tablosu,
[JobItemsEditor.tsx](components/panel/JobItemsEditor.tsx) içindeki
`SerialUnitPicker`) plana birebir uygun şekilde uygulandı; ek olarak
`StockConflictError` ile eşzamanlı iki kullanıcının aynı seri
numarasını seçmesi durumu 409 hatasıyla engellendi.

### ✅ Faz 3d — Barkod ile stok girişi (TAMAMLANDI — 2026-08-20)

İki ayrı barkod hedefi var, ikisi de aynı tarama bileşenini kullanır:

1. **Ürün barkodu** (kutu üzerindeki EAN/UPC) — mal kabulde tarat,
   sistemde `products.barcode` eşleşiyorsa direkt o ürünün stok
   ekranı açılır (adet artır / seri takipliyse yeni seri no ekle).
   Eşleşme yoksa: **global sorgu** (öneri: EAN-Search.org, ücretsiz
   katman bu hacim için yeterli — API anahtarı gerekiyor, hesap açma
   ve anahtar üretme kullanıcı tarafında) isim/marka/kategori
   önerisiyle "Yeni Ürün" formunu önceden doldurur, bulunamazsa boş
   form açılır. Ne olursa olsun taranan barkod o ürüne kaydedilir —
   **ikinci taramadan itibaren her zaman yerel eşleşme çalışır**,
   global sorguya bağımlılık yalnızca ilk seferlik.
   Not: global veritabanları perakende/tüketici ürünlerinde güçlü,
   markanıza özgü B2B güvenlik kamerası/NVR modellerinde çoğunlukla
   **bulunamayacaktır** — bu normal, yerel kayıt asıl güvenilir
   mekanizma, global sorgu yalnızca yardımcı.
2. **Seri numarası barkodu/QR'ı** (cihazın üzerindeki) — Faz 3c'deki
   iş/servis kalem seçiminde, seri numarasını elle aramak yerine
   doğrudan tarayarak o `product_units` satırını seçmek için.

**Teknik:** Donanım gerekmez — telefon kamerası üzerinden tarayıcıda
okuma (`@zxing/browser` veya `html5-qrcode`, `BarcodeDetector`
destekleyen tarayıcılarda onu kullanıp diğerlerinde JS kütüphanesine
düşer). İleride ucuz bir USB barkod okuyucu eklenirse otomatik çalışır
(donanım "klavye gibi" davranıp odaklı metin alanına yazar, ekstra
entegrasyon gerekmez).

**Şema:** `products.barcode: varchar unique nullable`.
**API:** `app/api/products/lookup?barcode=...` — önce yerel eşleşme,
yoksa global sorgu sonucu döner (bulunamazsa `null`, form boş açılır).
**UI:** Ürünler sayfasında "Barkod Tara" butonu (kamera erişimi ister),
ürün formunda barkod alanı; iş/servis kalem editöründe seri no alanı
için de aynı tarayıcı bileşeni.

**Uygulamada planla tek farkı**: global sorgu için EAN-Search.org
yerine [UPCitemdb.com](https://www.upcitemdb.com) trial uç noktası
kullanıldı — API anahtarı gerektirmiyor (~100 sorgu/gün limit, bu
hacim için yeterli), kullanıcı tarafında hesap açma adımı ortadan
kalktı. Kamera taraması `html5-qrcode` paketiyle yapıldı
([BarcodeScanner.tsx](components/panel/BarcodeScanner.tsx)),
`continuous` modda art arda tarama destekliyor (toplu seri no girişi
için). Kutu barkodu (`products.barcode`, ürün başına tekil) ile
cihaz üzerindeki seri no (`product_units.serialNumber`, ürün+seri no
birleşiminde tekil) veritabanı seviyesinde ayrı `UNIQUE` kısıtlarıyla
korunuyor — plandaki "kutuda ki barkod ayrı, cihazdaki ayrı" ayrımı
şema seviyesinde de netleştirildi.

### ✅ Faz 3e — Marka görünürlüğü + Site Ayarları (TAMAMLANDI — 2026-08-20)

- [x] **Anasayfa marka logoları**: eski siteden bulunan iş ortağı
      logoları (UNV, ZKTeco, Seagate, Western Digital, TP-Link —
      `public/images/brands/`, daha önce hazırlanmış ama hiç
      kullanılmamışlar) anasayfada profesyonel bir statik şerit
      olarak sergileniyor — hairline-divided grid, grayscale→renkli
      hover geçişi. (İlk denemede eski sitedeki gibi kayan/marquee
      bir tasarım yapıldı, kullanıcı "marquee değil, profesyonelce"
      diye düzeltti — statik gösterime çevrildi.)
      [BrandsShowcase.tsx](components/BrandsShowcase.tsx)
- [x] **Site Ayarları paneli**: yeni `site_settings` tablosu (tekil
      satır, id=1), admin-only `GET/PATCH /api/site-settings`,
      `/panel/ayarlar` sayfası (nav'da yalnızca admin'e görünür) —
      admin ana marka rengi ve açık/vurgu rengini renk seçici + hex
      girişiyle değiştirebiliyor, canlı önizleme var.
      [lib/site-settings.ts](lib/site-settings.ts)
- [x] **Tema renginin siteye yayılması**: kayıtlı renkler root
      layout'ta (`app/layout.tsx`) `<html>` elemanının inline
      `style`'ına (`--color-brand`, `--color-brand-light`) yazılıyor
      — Tailwind v4'ün `@theme` ile ürettiği tüm `bg-brand`/
      `text-brand-light` sınıfları bu değişkenleri kullandığı için
      hem public site hem panel aynı anda etkileniyor. Kayıt anında
      `revalidatePath("/", "layout")` çağrılıyor, yeniden deploy
      gerekmeden anında yayına yansıyor.
- [x] **"Varsayılana Sıfırla" düğmesi**: admin tek tıkla orijinal marka
      renklerine (`#0e6fb8` / `#40a0e0`) dönebiliyor — değerler
      `lib/db/schema.ts`'teki `DEFAULT_BRAND_COLOR`/
      `DEFAULT_BRAND_LIGHT_COLOR` sabitlerinden geliyor (DB kolon
      varsayılanıyla aynı kaynak, sapma riski yok). Zaten
      varsayılandaysa hem Kaydet hem Sıfırla düğmesi devre dışı kalır.
- [x] **Uçtan uca doğrulama — hem local hem gerçek production**:
      - Local (`next dev`): rengi mora çevirip CTA butonunun
        `getComputedStyle` ile gerçekten değiştiğini, sonra Sıfırla
        düğmesiyle varsayılana döndüğünü teyit ettim.
      - **Gerçek production'da API üzerinden canlı test**: giriş yapıp
        `PATCH /api/site-settings` ile rengi değiştirdim, anasayfanın
        **yeniden deploy gerekmeden aynı anda** yeni rengi döndürdüğünü
        `curl` ile doğrudan doğruladım (bu `revalidatePath`'in gerçek
        Vercel ISR ortamında çalıştığının kanıtı — `next dev` bunu
        test edemez, çünkü dev modda statik önbellekleme hiç devrede
        değil). Ardından aynı şekilde varsayılana geri döndürdüm.
      - Güvenlik: oturumsuz `GET`/`PATCH` isteklerinin `401` döndüğü
        doğrulandı.

### ✅ Faz 3f — Setonet ilhamlı görsel yenileme (TAMAMLANDI — 2026-08-20)

Müşteri, iş ortağı firma [setonet.com.tr](https://setonet.com.tr)'yi örnek
göstererek üç şey istedi: hero'da video, kırmızı şerit/çerçeve efektleri
(admin'den ayarlanabilir), ve setonet'in iş ortakları sayfasındaki marka
logoları + Aypro + KNX Future.

- [x] **Vurgu çerçeve efekti sistemi**: `site_settings`'e `accentColor`
      (varsayılan `#e63946`) ve `accentThickness` (varsayılan `3px`)
      eklendi, Site Ayarları'nda ayrı bir "Vurgu Çerçeve Efekti" kartından
      renk + kalınlık (1-12px) admin tarafından değiştirilebiliyor.
      `--color-accent`/`--accent-thickness` CSS değişkenleri olarak
      `app/globals.css`'te `.accent-frame` (tam çerçeve), `.accent-frame-left`
      (sol çerçeve) ve `.accent-bar` (ince şerit) utility sınıfları
      tanımlandı; "Gerçek işler" fotoğraf kartlarına tam çerçeve, yorum
      kartlarına sol çerçeve, bölüm eyebrow başlıklarına küçük bir şerit
      olarak uygulandı. (Setonet'in kendisi bu efekti düz `border`
      kullanarak yapıyor — kullanıcı bunu doğrudan teyit etti, aynı
      teknik izlendi.)
- [x] **Anasayfa marka logoları genişletildi (5 → 33 marka)**: setonet'in
      iş ortakları sayfasından ([setonet.com.tr/is-ortaklarimiz](https://setonet.com.tr/is-ortaklarimiz))
      26 yeni logo (Hikvision, Dahua, Hanwha, EZVIZ, IMOU, Tiandy, TVT,
      Kedacom, Sanjiang, Suprema, Ajax, Paradox, DSC, Caddx, Teletek,
      Roombanker, Honeywell, Grandstream, Wi-Tek, Ruijie Reyee, Kodicom,
      Toshiba, TTEC, Formrack, Westa, Decon) + [Aypro](https://aypro.com)
      + [Future KNX](https://www.futureknx.com) (SVG olarak sayfa
      kaynağından çıkarıldı) eklendi. Orijinal renkler korunuyor
      (grayscale kaldırıldı — kullanıcı özellikle istedi). Grid,
      33 logoyu düzgün sarıp taşıracak şekilde `grid-cols-2 sm:grid-cols-4
      lg:grid-cols-6`'ya genişletildi. [BrandsShowcase.tsx](components/BrandsShowcase.tsx)
- [x] **Hizmetler alt menüsü**: ana site header'ında "Hizmetler" artık
      hover'da (masaüstü) / dokununca (mobil accordion) 11 hizmetin
      tamamını gösteren bir dropdown açıyor, doğrudan ilgili hizmet
      sayfasına gidiliyor. [Header.tsx](components/Header.tsx)
- [x] **Hero videosu — YouTube link sistemi**: dosya yükleme yerine,
      Site Ayarları'nda bir "Hero Videosu" kartından YouTube linki
      yapıştırılıyor (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`
      biçimlerinin hepsi tanınıyor — [lib/youtube.ts](lib/youtube.ts)).
      Link boşsa mevcut statik görsel (`hero-1.jpg`) kalır. Doluysa
      `youtube-nocookie.com` embed'i CSS `aspect-ratio` + container-relatif
      `min-width/min-height:100%` tekniğiyle hero alanını tam kaplayacak
      şekilde (crop/cover, distorsiyonsuz) responsive gösteriliyor —
      viewport birimlerine (`vw`/`vh`) değil container'a göre hesaplanıyor,
      bu yüzden hero'nun gerçek yüksekliği ne olursa olsun doğru çalışıyor.
      Otomatik oynatma, sessiz başlatma, başlangıç saniyesi ve süre
      (loop segmenti — `start`/`end` YouTube parametreleri) admin
      panelinden ayarlanabiliyor. [HeroMedia.tsx](components/HeroMedia.tsx)
      Production'da gerçek bir YouTube linkiyle uçtan uca test edildi
      (embed URL parametreleri, cover-fill boyut hesabı, boş linkte
      görsele geri dönüş) — hepsi doğrulandı.
- [x] Yapay zeka video üretim aracı için kullanılacak bir prompt
      kullanıcıya verildi (güvenlik kurulumu temalı, mavi tonlarda,
      sessiz döngü, 8-10 saniye).

### 🔄 Faz 4 — Sözleşme/bakım + personel derinliği (kısmen tamamlandı)

- [x] **Bakım sözleşmeleri (TAMAMLANDI — 2026-08-20)**: `maintenance_contracts`
      tablosu — müşteri, sözleşme tipi, başlangıç/son/sonraki bakım
      tarihleri, bakım aralığı (ay), not, aktif durumu.
      [lib/db/schema.ts](lib/db/schema.ts), admin+personel erişimli
      `GET/POST /api/maintenance-contracts` + `PATCH/DELETE
      /api/maintenance-contracts/[id]` (silme admin-only).
      `/panel/bakim` sayfası: liste + oluştur/düzenle modalı,
      gecikmiş/yaklaşan/planlı/pasif durum rozetleri, **"Bakımı
      Tamamla" tek tık aksiyonu** (bugünü son bakım yapar, sonraki
      tarihi bakım aralığına göre otomatik hesaplar).
      [app/panel/(panel)/bakim/page.tsx](<app/panel/(panel)/bakim/page.tsx>)
      Dashboard'a "Yaklaşan bakım" kart + önümüzdeki 30 gün (gecikmiş
      dahil) listesi eklendi.
      **Test sırasında bulunan ve düzeltilen hata**: panelin
      client-side tarih hesaplarında (`todayStr`, ay ekleme)
      `toISOString()` ile UTC'ye çevirme yerel saat dilimine göre bir
      gün kaymaya sebep oluyordu — düzeltilip
      [components/panel/ui.tsx](components/panel/ui.tsx)'e paylaşılan
      `todayStr()`/`addMonths()` yardımcıları olarak taşındı (aynı
      hatalı desen dashboard'da da vardı, o da düzeltildi).
      Production'da uçtan uca test edildi: sözleşme oluşturuldu, dashboard
      sayacı doğrulandı, silindi (temiz durum).
- [x] **Personel: izin takibi, masraf, prim/performans alanları (TAMAMLANDI
      — bu satır güncel değilmiş, daha önce yapılmış)**: `/panel/personel/[id]`
      sayfasında üç kart hâlihazırda tam çalışır durumda — İzinler (tür/
      tarih/durum, tek tık onayla/reddet), Masraf & Prim (Kasa'ya otomatik
      `gider` olarak işlenen, `staffId` ile personele bağlı kayıt — maaş/
      masraf/prim ayrımı), Notlar (performans notu/geri bildirim serbest
      metin olarak). 2026-08-21'de production'da uçtan uca doğrulandı
      (`/api/staff/[id]/leaves`, `/notes`, `/api/transactions?staffId=`
      hepsi 200 dönüyor). Bulunan tek gerçek eksik: `lib/db/schema.ts`teki
      `EXPENSE_CATEGORIES` dizisi `personel-masrafi`/`personel-primi`'yi
      içermiyordu (Zod doğrulaması kendi ayrı listesini kullandığı için
      işlevsel bir hataya yol açmıyordu, salt tip/dokümantasyon
      tutarsızlığıydı) — düzeltildi, CSV export etiketleri de eklendi.
- [x] **Master admin — tam yetki yönetimi** (TAMAMLANDI — 2026-08-20):
      `users.permissions: jsonb` eklendi (5 anahtar: view_costs,
      manage_products, delete_records, manage_staff, manage_settings —
      Türkçe etiketler `lib/permissions.ts`'te), admin `/panel/personel`'de
      her personel için tek tek açıp kapatabiliyor. JWT session'a gömülü
      (`lib/auth.ts`), 23 API route'u `session.role==="admin"` yerine
      `hasPermission(session, key)` kullanacak şekilde taşındı; rol/izin
      alanlarının kendisini değiştirme hâlâ salt admin'e kilitli
      (yetki yükseltme önleme). Panel tarafında `usePanelCan(key)` hook'u
      ile UI gate'leri de aynı izin setine taşındı. Production'da
      doğrulandı.
- [x] Personel için "Bugünkü işlerim" filtrelenmiş görünüm (TAMAMLANDI —
      2026-08-20): `/panel/isler` sayfasına personel bazlı filtre eklendi.
- [x] **Alış faturaları (temel) + cari hesap + vadesi geçen tahsilat listesi**
      (TAMAMLANDI — 2026-08-20): yeni `suppliers` + `supplier_invoices`
      tabloları — tedarikçi başına fatura toplamı, para birimi+kur, vade
      tarihi, ödeme durumu. `/panel/tedarikciler` (liste + bakiye rozeti) ve
      `/panel/tedarikciler/[id]` (fatura ekle, "Ödendi" işaretle, sil).
      Fatura "ödendi" işaretlenince Kasa'ya otomatik gider kaydı düşüyor
      (`tedarikci-odemesi` kategorisi, mevcut fatura→Kasa deseniyle aynı).
      Dashboard'a "Tedarikçiye borcumuz" kartı + "Vadesi geçen tedarikçi
      faturaları" listesi eklendi; `/panel/faturalar`'da da (müşteri
      faturaları için) "Vadesi geçti" rozeti + filtre çipi eklendi. Müşteri
      cari hesabı (bakiye = toplam fatura − toplam tahsilat) zaten
      `/panel/musteriler/[id]`'de mevcuttu (Faz 3a) — ayrıca dokunulmadı.
      Migration: `drizzle/0014_slim_warstar.sql` (kod push edildi, production'a
      **henüz uygulanmadı** — bu tamamen client-fetch API'ler olduğu için
      build-time riski yok, ama migration uygulanana kadar `/api/suppliers*`
      500 döner; DB bağlantısı sağlanınca uygulanacak).
      **Not**: bu temel sürüm yalnızca fatura toplamını tutuyor, "hangi
      üründen kaç adet alındı" bilgisini tutmuyor — bu, aşağıdaki
      **Toptancılar** planıyla genişletilecek.

- [x] **Toptancılar modülü (detaylı, Türkiye'ye özel) — TAMAMLANDI (2026-08-20)**:
      Yukarıdaki temel tedarikçi/fatura takibi kalem
      seviyesine çıkarılacak — hangi toptancıdan, ne zaman, hangi faturayla,
      hangi ürünlerden kaç adet, birim fiyatı ne olarak alındığı tek tek
      kayıt altına alınacak. Panelde **Müşteriler'in hemen altına**
      "Toptancılar" menüsü eklenecek (mevcut Tedarikçiler girişi muhtemelen
      bu işin temelini oluşturduğu için yeniden adlandırılıp/taşınıp
      genişletilecek, ya da ayrı bir modül olarak yanına eklenecek — karar
      uygulama sırasında netleşecek).

      **Firma bilgileri** (Türkiye B2B standardı): unvan, yetkili kişi,
      telefon, e-posta, adres, **vergi dairesi + vergi no** (irsaliye/fatura
      eşleştirmesi ve muhasebe entegrasyonu için gerekli — mevcut
      `suppliers` tablosunda yok, eklenecek), ödeme vadesi (gün, örn. net 30),
      not.

      **Alış faturası kalemleri**: `supplier_invoices`'a mevcut
      `invoices.items`/`offers.items` ile aynı desende bir `items: jsonb`
      alanı eklenecek — `{ productId?: number, name, qty, unitPrice,
      currency? }[]`. Kalem kataloğa (`products`) bağlanabilir **veya**
      serbest metin olarak girilebilir (teklif/fatura kalem editöründeki
      davranışla birebir aynı — `ItemsEditor.tsx` bileşeni yeniden
      kullanılacak). Fatura toplamı kalemlerden otomatik hesaplanır
      (`lib/money.ts`), elle girilmez.

      **Otomatik stok girişi (mal kabul)**: bir alış faturası kalemi
      kataloğa bağlıysa ve fatura "teslim alındı" olarak işaretlenirse,
      Faz 2'deki `lib/stock.ts` deseninin tersi çalışır — `products.stockQty`
      kalem adedi kadar **artar** (seri takipli ürünlerde direkt seri no
      girme ekranına yönlendirilir, Faz 3c'deki toplu seri no ekleme akışı
      yeniden kullanılır).

      **Fiyat geçmişi / maliyet analizi**: ürün detay sayfasına
      (`/panel/urunler/[id]`) "Alım geçmişi" bölümü eklenecek — bu ürünün
      hangi toptancıdan, hangi tarihte, hangi fiyata alındığının listesi.
      Bu, zaman içindeki maliyet trendini ve toptancı fiyat karşılaştırmasını
      görünür kılar (örn. "Hikvision NVR'ı en ucuza X toptancısından alıyoruz").

      **Kasa + cari hesap + vade takibi**: yukarıda tamamlanan temel
      sürümdeki otomatik Kasa entegrasyonu, bakiye hesabı ve vadesi geçen
      rozeti/filtresi bu genişletilmiş sürümde aynen korunacak — sadece
      fatura düzeyinden kalem düzeyine iniliyor, mekanizma değişmiyor.

      **Kapsam notu**: bu, önceki kalem-seviyeli özelliklerle (Faz 1 teklif
      kalemleri, Faz 2 iş kalemleri/stok düşümü, Faz 3c seri no takibi)
      karşılaştırılabilir büyüklükte bağımsız bir iş — şema + API + UI +
      migration gerektirir, tek oturumda bitirilebilir ama Faz 4'ün geri
      kalanından (personel izin/masraf, granüler yetki UI'ı — bu ikisi
      zaten ayrı yapıldı) sonra ele alınacak.

- [x] **Toptancılar — fatura/proforma/makbuz tarama ile otomatik stok girişi
      (OCR) — TAMAMLANDI (2026-08-20)**: yukarıdaki kalem bazlı
      Toptancılar modülünün üzerine oturan bir katman. Kullanıcı kamerayla
      tarar ya da dosya (JPG/PDF) yükler, sistem tedarikçiyi, kalemleri ve
      toplamı **otomatik tahmin edip formu önceden doldurur** — kullanıcı
      **her alanı serbestçe düzeltip/değiştirip** onaylayınca stoğa işlenir.
      **Karar (kullanıcı ile netleşti): hiçbir ücretli/dış API kullanılmayacak**
      (Claude/OpenAI görsel API'leri vb. reddedildi — bu yüzden yapay zeka
      görsel modeli değil, **ücretsiz/self-hosted OCR + kural bazlı çıkarım**
      kullanılacak).

      **Teknik yaklaşım — tamamen ücretsiz, dış servise bağımlı değil:**
      - **Tesseract.js** (MIT lisanslı, açık kaynak) — mevcut
        [BarcodeScanner.tsx](components/panel/BarcodeScanner.tsx)'te
        kamera erişimi zaten çözülmüş desenle aynı şekilde, **tarayıcıda
        (client-side, WASM)** çalışacak. Sunucu maliyeti yok, API anahtarı
        yok, kullanım başına ücret yok. Türkçe dil paketi (`tur.traineddata`)
        harici bir CDN'e bağımlı kalmaması için `public/`'a self-hosted
        olarak konacak (mevcut projede zaten dış CDN'lere bağımlılığı
        azaltma yönünde bir alışkanlık var).
      - PDF girişleri için **pdf.js** (açık kaynak, ücretsiz) ile önce
        sayfa görsele render edilip sonra Tesseract'a verilecek.
      - Tesseract kelime bazlı **konum (bounding box)** bilgisi de
        döndürüyor — bu, tablo/kalem satırlarını (ürün adı ~ adet ~ birim
        fiyat ~ tutar sütunları) satır/sütun hizasına göre ayırt etmek için
        kullanılacak (`lib/invoice-ocr.ts`, yeni).

      **Çıkarım kuralları (rule-based, ML eğitimi gerektirmez):**
      - Tarih: Türkçe tarih formatları için regex (`gg.aa.yyyy`, `gg/aa/yyyy`).
      - Fatura/proforma/makbuz no: "Fatura No", "Belge No" gibi anahtar
        kelimelerin yakınındaki alfanümerik değer.
      - Toplam tutar: "TOPLAM", "GENEL TOPLAM", "ÖDENECEK TUTAR" anahtar
        kelimeleri + Türkçe sayı biçimi ayrıştırma (`1.234,56` → `1234.56`).
      - **Tedarikçi eşleştirme**: OCR'dan çıkan metin, mevcut `suppliers.name`
        listesiyle **bulanık eşleştirme** (basit bir Levenshtein/benzerlik
        fonksiyonu, ekstra kütüphane gerekmez) ile karşılaştırılır — tedarikçi
        listesi zaten sınırlı/bilindiği için bu adım şaşırtıcı derecede
        güvenilir çalışır. Eşleşme düşükse alan boş bırakılır, kullanıcı
        elle seçer.
      - **Ürün eşleştirme**: her kalem satırının açıklaması aynı bulanık
        eşleştirmeyle `products.name`/`sku` kataloğuna karşı denenir;
        eşleşmeyen kalemler "yeni ürün" veya "serbest metin kalem" olarak
        işaretlenip kullanıcıya bırakılır.
      - Her çıkarılan alana bir **güven seviyesi** (yüksek/orta/düşük)
        atanır (eşleşme skoruna/regex kesinliğine göre) — düşük güvenli
        alanlar gözden geçirme ekranında görsel olarak vurgulanır, kullanıcının
        gözü doğrudan oraya gitsin diye.

      **Gözden geçirme/düzenleme ekranı (kritik — otomatik commit YOK):**
      taranan görsel bir tarafta (yakınlaştırılabilir), çıkarılan veri diğer
      tarafta **tamamen düzenlenebilir bir form** olarak gösterilir: tedarikçi
      (aranabilir dropdown, en iyi eşleşme önceden seçili ama değiştirilebilir),
      fatura no, tarih, kalemler (mevcut `ItemsEditor.tsx` bileşeniyle —
      satır ekle/sil/düzenle, adet/fiyat değiştir, kataloğa bağla/bağlama).
      Kullanıcı **"Onayla ve Stoğa İşle"** demeden hiçbir şey kalıcı
      olarak kaydedilmez/stoğa işlenmez. Taranan orijinal dosya, oluşan
      `supplier_invoices` kaydına ek olarak saklanır (denetim izi için —
      bu, dosya depolama altyapısı gerektirir, bkz. Faz 2'deki iş fotoğrafı
      için ertelenen Vercel Blob ihtiyacıyla aynı bağımlılık).

      **Dürüst beklenti yönetimi (kullanıcıya önceden söylenmeli):**
      ücretsiz/kural-bazlı OCR, ücretli bir yapay zeka görsel modeline göre
      **daha düşük isabet oranına** sahip olacak — özellikle el yazısı
      makbuzlarda veya düşük ışıkta/eğik çekilmiş telefon fotoğraflarında.
      Düzgün ışıklandırılmış, matbu fatura/proforma'da iyi çalışması
      beklenir; el yazısı makbuzda muhtemelen yalnızca tarih/toplam gibi
      basit alanlarda yardımcı olur, kalemler büyük ölçüde elle girilir.
      Kalem/tablo çıkarımı rule-based OCR'ın en zayıf noktası — bu yüzden
      gözden geçirme ekranı bir "nice to have" değil, sistemin **güvenlik
      ağı**dır. Maliyet yok ama doğruluk bedeli kullanıcı düzeltme
      süresinde ödenir — "no fee" kısıtı göz önüne alındığında makul bir
      denge, ve zorunlu onay adımı OCR kalitesinden bağımsız olarak stoğun
      bozulmasını engeller.
      **İyileştirme yolu (mimari değişmeden)**: kullanıcı düzeltmeleri
      (OCR'ın ne okuduğu vs. kullanıcının neye çevirdiği) zamanla loglanıp
      kural/eşleştirme eşiklerini elle iyileştirmek için kullanılabilir —
      makine öğrenmesi eğitimi gerekmez, sadece örüntü ince ayarı.

      **Gerçek sonuç (yukarıdaki plandan sapmalar)**: e-Arşiv QR kodu
      (`lib/invoice-qr.ts`) plana ek olarak eklendi — VKN/tutar/tarih için
      OCR tahmininden çok daha güvenilir, mevcutsa OCR'ı ezer. Kullanıcının
      3 gerçek faturayla (Teletek, Neutron, Legend) yaptığı testlerde çok
      sayıda gerçek hata bulunup düzeltildi: Türkçe İ karakteri regex'lerde
      eşleşmiyordu (`foldTr()` normalizasyonu eklendi), Tesseract'ın
      varsayılan `recognize()` çağrısı küçük tablo hücrelerini atlıyordu
      (`PSM.AUTO` + `blocks:true` zorunlu hale getirildi), düşük çözünürlüklü
      yüklemelerde DPI yanlış tahmin edilip kalemler tamamen kayboluyordu
      (`user_defined_dpi:"300"` — kök sebep, kullanıcının gerçek yüklediği
      dosya Blob'dan indirilip yerel olarak tekrar üretilerek doğrulandı).
      **Bulunan ayrı bir veri bütünlüğü sorunu**: bu düzeltmelerden önce
      kaydedilmiş 2 fatura (Teletek, Neutron) yanlış miktar/fiyatla
      kaydedilmiş ve zaten stoğa + Kasa'ya işlenmişti — canlı API üzerinden
      hem faturalar hem ilgili stok/Kasa kayıtları gerçek faturalarla
      eşleşecek şekilde düzeltildi, 3 sahte "ürün" (IBAN satırının yanlış
      okunmasıyla oluşmuş) pasife alındı.

### ✅ Faz 4 ek — Ürün görselleri/özellikleri + hizmet ayrıcalığı + müşteri
      firma/yetkili ayrımı (TAMAMLANDI — 2026-08-21)

- [x] **Ürün görselleri**: `products.imageUrl` — admin/personel farkı
      olmadan (yalnızca oturum şartı) herkes ekleyip değiştirebiliyor, çünkü
      alış fiyatının aksine gizlilik gerektirmiyor. Bu projenin Vercel Blob
      deposu **private-only** yapılandırılmış (`access:"public"` reddediliyor)
      — toptancı taramalarındaki private+proxy deseni burada da kullanıldı
      (`app/api/products/[id]/image/route.ts`: POST private yükler, GET
      oturumlu kullanıcıya sunucu tarafında akıtır, tarayıcıya çıplak blob
      URL'i hiç verilmez). `components/panel/ProductImageUpload.tsx` —
      kamera + dosya yükleme, liste (küçük) ve detay (büyük) boyutu.
      4 gerçek ürüne (2 Dahua kamera, Dahua NVR, Neutron NVR) resmi
      distribütör sitelerinden doğrulanmış fotoğraf yüklendi; bu arada
      bullet/dome kameraların model kodundaki bir yazım hatası da (0208B →
      doğrusu 0280B) 6 bağımsız kaynaktan teyitle düzeltildi.
- [x] **Serbest ürün özellikleri**: `products.specs: jsonb` — key/value
      listesi (örn. "Wi-Fi Desteği: Var", "RAID Desteği: RAID 0/1/5"),
      `components/panel/ProductSpecsEditor.tsx` ile formdan eklenir. Stok
      listesinde ayrı bir "Özellikler" sütununda (ilk denemede ürün adının
      altında rozet yığını olarak gösterilmişti, liste anlamsız uzuyordu —
      kullanıcı geri bildirimiyle ayrı sütuna taşınıp en fazla 2 rozet + "+N"
      özetine indirildi), ürün detayında başlık altında rozet olarak.
- [x] **Hizmet/işçilik ayrıcalığı**: `products.isService: boolean` — işaretli
      ürünlerde alış fiyatı/seri takip formdan kalkar, sunucu tarafında
      `costPrice`'ı her ihtimale karşı 0'a, stok adedini "sınırsız" sabitine
      zorlar (`SERVICE_STOCK_SENTINEL`). Mevcut "Montaj İşçiliği" kalemi
      bu bayrakla işaretlendi.
- [x] **Müşteri firma/yetkili ayrımı**: `customers.contactName` eklendi —
      mevcut `name` alanı (firma adı ya da bireysel müşteride kişinin adı)
      korunarak yanına yetkili kişi adı için ayrı alan eklendi (geriye dönük
      veri kaybı yok, salt ekleme migration).
- [x] **Rehberden toplu müşteri ekleme**: Android/Chrome'da W3C Contact
      Picker API (`navigator.contacts.select`, çoklu seçim) ile rehberden
      işaretli kişiler toplu eklenir — işaretlenebilir bir inceleme
      ekranından geçer (telefonu zaten kayıtlı olanlar otomatik işaretsiz).
      **iPhone/Safari bu API'yi hiç desteklemiyor** (Apple platform kısıtı,
      düzeltilemez) — bunun yerine iOS'un "Kişi Kartını Paylaş" ile
      ürettiği `.vcf` dosyalarını yükleyip aynı inceleme akışına besleyen
      platform bağımsız bir alternatif eklendi.
- [x] **Ürünler sayfası tam responsive hale getirildi**: 10 sütunlu tablo
      küçük ekranda taşıp okunaksızlaşıyordu — `lg` altında tablo yerine
      dikey akışlı ürün kartları (görsel + fiyat/stok/kâr marjı grid'i +
      özellik rozetleri), `lg` ve üstünde tablo (Alış+Kâr Marjı tek sütuna
      birleştirildi, sütun sayısı azaltıldı), filtre çubuğu mobilde
      yatay kaydırmalı.
- [x] Migration'lar uygulandı: `drizzle/0018_dashing_payback.sql`
      (`products.image_url`/`specs`/`is_service`),
      `drizzle/0019_free_otto_octavius.sql` (`customers.contact_name`).

### ✅ Faz 5 — Otomasyon ve dış yüz (TAMAMLANDI — 2026-08-21, SMS hariç)

- [x] **Teklif/fatura PDF çıktısı** — `components/pdf/OfferInvoicePdf.tsx`,
      servis formu PDF'iyle aynı desen (react-pdf, Inter font). Production'da
      gerçek bir teklifle uçtan uca doğrulandı.
- [x] **Teklife herkese açık onay linki** — `offers.publicToken`/`respondedAt`,
      panelde "Linki Kopyala" (get-or-create) → `/teklif/[token]` genel
      sayfası. Müşteri oturumsuz görüp onaylar/reddeder; onayda otomatik iş
      kaydı açılır (kataloğa bağlı kalemler stok düşümüyle taşınır, serbest
      metin kalemler işin notuna yazılır). Zaten yanıtlanmış teklif tekrar
      değiştirilemez (409). Production'da doğrulandı.
- [x] **Excel/CSV export** — `lib/csv.ts` (UTF-8 BOM, RFC4180), müşteri/
      teklif/iş/kasa için `/api/*/export` uçları + panel listelerinde
      "Dışa Aktar (CSV)" linki. Production'da gerçek veriyle doğrulandı.
- [x] **E-posta bildirimleri (Resend)** — `lib/email.ts`, `RESEND_API_KEY`
      yoksa sessizce atlar (uygulama e-postasız da çalışır). Yeni keşif
      talebinde anında yönetici e-postası; günde bir (Vercel Cron, 07:00
      İstanbul, `app/api/cron/daily-digest`) yarının randevuları + önümüzdeki
      7 gün içindeki/geciken bakımları özetleyen e-posta. Google Workspace
      ile aynı alan adında çakışmadan bir arada çalışır (Resend SPF/DKIM TXT,
      Workspace MX — ayrı kayıt türleri).
      **SMS bildirimleri kullanıcı isteğiyle şimdilik atlandı** (Türkiye'de
      SMS sağlayıcıları genelde ön ödemeli/kurumsal başvuru gerektiriyor).
- [x] **Ek: müşteri e-postası + ayrı pazarlama izni (KVKK/İYS)** —
      `customers.email`/`marketingConsent`. E-postanın kayıtlı olması
      kampanya göndermeye yetmez, ayrı açık onay şart — form buna göre
      kurgulandı. Rehber/vCard toplu içe aktarımı e-postayı da yakalıyor.
      `?consentOnly=1` ile yalnızca izinli+e-postalı kayıtları veren ayrı bir
      "Pazarlama İzinli Liste" CSV linki eklendi — gelecekteki kampanya
      aracına (ya da bugün başka bir e-posta pazarlama servisine) hazır,
      temiz bir liste üretir. Kampanya gönderim aracının kendisi henüz
      yapılmadı — yalnızca altyapı/hukuki uyum hazır.
- [x] **Yan bulgu: Kasa'da döviz çevirisi hatası** — 3 kayıt (Teletek
      faturası + Kasa ödemesi + 3 Dahua ürününün maliyeti) yanlışlıkla
      kur=1 ile kaydedilmişti, "Bu ay gider" kartı USD tutarı TL gibi
      topluyordu (₺13.395 yerine gerçek ₺64.761,17). Frankfurter'dan fatura
      tarihli gerçek kur (24 Haziran 2026: 1 USD = 46,489 TL) çekilip hepsi
      düzeltildi, production'da doğrulandı.

## 🚀 Canlıya Alma / Deploy (ÖNCELİK YÜKSEK)

- [x] **Vercel Authentication'ı Production için kapat** — `ssoProtection.deploymentType` `all_except_custom_domains` → `preview` (2026-08-19, API ile)
- [x] **Project → Settings → Framework Preset boştu (`framework: null`)** — proje silinip yeniden açılırken auto-detect tutmamış; Vercel bu yüzden `next build` çıktısını Next.js olarak değil generic/static olarak işliyordu → her rota platform seviyesinde 404 veriyordu. `framework: "nextjs"` olarak API'den sabitlendi + yeniden deploy edildi. **Bu asıl "Vercel'de takılma" sebebiydi**, postinstall/allowScripts değil.
- [x] **`DATABASE_URL`'de `sslmode=require` + kod içindeki `ssl:{rejectUnauthorized:false}` çakışması** — ikisi birlikteyken pg "self-signed certificate in certificate chain" hatasıyla bağlanamıyordu (`/api/auth/login` 500 veriyordu). Supabase dashboard'dan kopyalanan connection string'de `sslmode=require` otomatik geliyor; bu yüzden [lib/db/index.ts](lib/db/index.ts) artık supabase URL'lerinden `sslmode` parametresini otomatik temizliyor (tekrar yaşanmasın diye kod seviyesinde düzeltildi, sadece env var'ı düzeltmek yetmezdi).
- [x] Production domain doğrulandı (2026-08-19):
  - [x] `/`, `/hizmetler`, `/kesif`, `/panel/giris` → 200
  - [x] Admin giriş: `yonetici@ozturkguvenlik.com` çalışıyor, session cookie dönüyor
  - [ ] `/api/requests` POST tam akış testi (gerçek veri ile, WhatsApp yönlendirmesi dahil) — henüz yapılmadı
- [x] `ozturk-guvenlik.vercel.app` zaten yeni projeye doğru bağlıydı, taşımaya gerek kalmadı
- [x] **Gerçek alan adı bağlandı** (2026-08-19): `öztürkgüvenlik.com` (punycode
      `xn--ztrkgvenlik-qfb4fd.com`), Hostinger → Cloudflare (DNS-only, proxy
      değil) → Vercel. Apex → www 308 yönlendirmesi, SSL (Let's Encrypt,
      Vercel otomatik yeniliyor) doğrulandı, ikisi de Vercel projesinde
      `verified: true`.
- [x] **Bulunan hata**: `lib/site.ts`'teki `site.url` hiç DNS'de olmayan
      `https://ozturkguvenlik.com`'a (düz ASCII, gerçek domain değil) işaret
      ediyordu — `sitemap.xml`, `robots.txt`'nin Sitemap satırı, canonical/OG
      etiketleri ve JSON-LD hepsi var olmayan bir adrese gidiyordu. Artık
      gerçek domaine (`www.xn--ztrkgvenlik-qfb4fd.com`) düzeltildi, canlıda
      doğrulandı.
- [ ] Uptime/ping monitor eklensin (UptimeRobot / Better Stack)

## 🔐 Güvenlik / Sır Yönetimi

- [ ] **ACİL — Supabase anahtarlarını döndür**: DB şifresi, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` **iki ayrı sohbete** (OpenCode + Claude) yapıştırıldı. Bu satır zaten bir kere yazılmıştı, hâlâ yapılmadı — bu sefer gerçekten yapılmalı: Supabase → Settings → Database (şifre) ve Settings → API (anahtarlar) yenile, Vercel'de `DATABASE_URL` güncelle.
- [ ] Panel admin şifresini (`Ozk4n!2026`, aynı şekilde sohbete yapıştırıldı) ilk girişten sonra değiştir
- [ ] Bu iş için kullanılan Vercel Personal Access Token'ı iptal et (vercel.com/account/tokens) — iş bitti, sohbet geçmişinde duruyor
- [ ] `AUTH_SECRET` güvenli yerde sakla (password manager) — `.env.local` dışında yere yazma
- [ ] Admin/personel şifre politikası gözden geçir (ilk girişte şifre değiştirme zorunluluğu önerilir)

## 🧪 Test / Kalite

- [x] **Test altyapısı kuruldu (KISMEN TAMAMLANDI — 2026-08-21)**: `vitest`
      eklendi (`vitest.config.ts`, `npm test` / `npm run test:watch`).
      Saf iş mantığı (DB gerektirmeyen) için 29 test yazıldı ve yeşil:
      `lib/money.test.ts` (teklif/fatura KDV hesabı), `lib/hdd-calc.test.ts`
      (disk hesaplama), `lib/permissions.test.ts` (rol bazlı erişim),
      `lib/validators.test.ts` (keşif formu honeypot doğrulaması + **daha
      önce yaşanmış "kısmi PATCH alanları sıfırlıyor" hatasının bir daha
      olmayacağını garanti eden regresyon testleri** — updateJob/
      updateCustomer/updateOffer/updateAppointment şemaları). React Testing
      Library eklenmedi — bu ilk geçişte yalnızca saf mantık kapsandı.
      **Eksik kalan**: `/api/requests` POST + honeypot, giriş/çıkış,
      randevu/müşteri CRUD gibi gerçek route/DB entegrasyon testleri —
      bunlar için ya erişilebilir bir test veritabanı (local Docker Postgres
      şu an ayakta değil) ya da `db` modülünün mock'lanması gerekiyor;
      kapsam dışı bırakıldı, ayrı bir iş olarak aşağıda duruyor.
  - [ ] `/api/requests` POST + honeypot — gerçek/mock DB gerekiyor
  - [ ] Auth: giriş/logout, rol bazlı erişim route entegrasyonu — gerçek/mock DB gerekiyor
  - [ ] Randevu CRUD, müşteri arama — gerçek/mock DB gerekiyor
- [x] **Testler yazılırken gerçek bir üretim hatası bulundu ve düzeltildi
      (TAMAMLANDI — 2026-08-21)**: `/hesaplama` sayfasındaki RAID 1 disk
      önerisi ([lib/hdd-calc.ts](lib/hdd-calc.ts) `suggestDisks()`) veri
      miktarını önce ikiye katlayıp SONRA disk boyutu seçiyordu, en sonda
      disk adedini de ayrıca ikiye katlıyordu — sonuç, önerilen toplam
      kapasitenin gerekenin **~2 katı** olmasıydı (ör. 1.5TB veri için 2×2TB
      yerine 2×3TB öneriliyordu). Doğru RAID 1 mantığı: disk boyutu asıl
      veri miktarına göre seçilir, yalnızca disk *adedi* ikiye katlanır.
      Düzeltildi, regresyon testiyle korunuyor.
- [x] **API route'lardaki `p:any` tipleri (KONTROL EDİLDİ — 2026-08-21)**:
      proje genelinde (`.ts`/`.tsx`) `grep`'lendi, hiçbir `: any` kalmamış —
      madde muhtemelen çok daha önceki bir aşamadan kalma, güncel değil.
- [x] **Seed idempotency (KONTROL EDİLDİ — 2026-08-21)**: `scripts/seed.ts`
      incelendi — admin/personel e-posta kontrolüyle, ürün kataloğu
      `count===0` kontrolüyle, örnek müşteri/talep/randevu ise
      `serviceRequests` sayısı `>0` ise erken `return` ile zaten tam
      idempotent. Madde muhtemelen bu koruma eklenmeden önce yazılmış,
      güncel değil.
- [ ] **Lighthouse / Core Web Vitals audit (KISMEN — 2026-08-21)**: canlı
      Lighthouse/PageSpeed taraması yapılamadı (bu oturumda tarayıcı aracı
      "Policy check temporarily unavailable" hatasıyla erişilemez durumdaydı
      — Anthropic tarafında geçici bir altyapı sorunu, kod tarafında bir
      şey değil). Onun yerine kod incelemesiyle gerçek bir **LCP hatası**
      bulundu ve düzeltildi: anasayfa hero arka plan görseli
      ([components/HeroMedia.tsx](components/HeroMedia.tsx)) düz `<img>`
      idi, `priority`/`fetchpriority` ipucu yoktu ve Next.js görsel
      optimizasyonundan (AVIF/WebP, doğru boyutlandırma) faydalanmıyordu —
      bu, sayfanın en büyük içerik öğesi (LCP adayı) olduğu için muhtemelen
      LCP skorunu doğrudan etkiliyordu. `next/image` + `priority` + `fill`
      ile düzeltildi. Aynı geçişte anasayfadaki "gerçek işler" fotoğraf
      ızgarası ve Hakkımızda sayfasındaki 2 görsel de `next/image`'e
      taşındı (önceden `loading="lazy"` bile yoktu, tam boyutlu kaynak
      görsel her zaman indiriliyordu). **Kalan**: tarayıcı aracı düzelince
      gerçek bir Lighthouse taraması yapılıp CLS/INP de doğrulanmalı.

## 🧹 Kod Tabanı / Bakım

- [x] **`Eski-Dosyalar/` kararı (TAMAMLANDI — 2026-08-21)**: kullanıcı
      "arşivle, repodan çıkar" dedi. Kopyalanmadan önce doğrulanarak
      `C:\CiciByte\ÖztürkGüvenlik-Eski-Dosyalar-Arsiv`'e kopyalandı (138
      dosya, 22 MB, kopya sonrası dosya sayısı teyit edildi), sonra
      `git rm -r Eski-Dosyalar` ile repodan kaldırıldı. İçindeki
      kullanılabilecek bilgiler (iletişim, sosyal medya, adres, SEO
      metni) zaten bu oturumda koda taşınmıştı.
- [x] **Kullanılmayan bağımlılık kontrolü (TAMAMLANDI — 2026-08-21)**:
      `@types/bcryptjs` kaldırıldı — `bcryptjs@3` kendi tiplerini
      (`umd/index.d.ts`) taşıyor, ayrı pakete gerek yoktu.
- [x] **`.env.example` güncel tutuldu (TAMAMLANDI — 2026-08-21)**:
      `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `RESEND_API_KEY`,
      `EMAIL_FROM` eklendi (kodda kullanılan ama listede olmayan
      değişkenler).
- [ ] Drizzle migration'ları tek kaynak — yeni şema değişiklikleri için `db:generate` + `db:migrate`

## 💼 Diğer Panel Geliştirmeleri

(ERP kapsamındaki PDF/export/dosya yükleme/bildirim maddeleri yukarıdaki
Faz 2-5'e taşındı — burada yalnızca ERP dışı, bağımsız iyileştirmeler var.)

- [x] **Yorum yönetimi (TAMAMLANDI — 2026-08-21)**: yorumlar artık kodda
      sabit değil, yeni `reviews` tablosunda; `/panel/yorumlar`'dan admin
      ekleyip/düzenleyip/silebiliyor, sıralayabiliyor, yayından
      kaldırabiliyor. Avatar rengi isimden otomatik üretiliyor, "X ay
      önce" etiketi artık dondurulmuş metin değil gerçek tarihten
      hesaplanıyor. Not: bunlar admin'in elle girdiği yorumlar — Google
      yorumlarını API ile otomatik senkronize etmiyor (Google Places API
      ayrı bir maliyetli entegrasyon; şu an admin Google'da gördüğü
      yorumu buraya kendi kopyalıyor).
      [lib/reviews-db.ts](lib/reviews-db.ts)
- [x] **Şifremi unuttum / e-posta ile sıfırlama akışı (TAMAMLANDI — 2026-08-21)**:
      `users.resetToken`/`resetTokenExpiresAt` (tek kullanımlık, 1 saat),
      `/panel/sifremi-unuttum` → Resend ile link gönderir (kullanıcı
      numaralandırmayı önlemek için e-posta kayıtlı olsun olmasın aynı
      genel mesaj döner), `/panel/sifre-sifirla/[token]`. Production'da
      hem enumeration koruması hem geçersiz token reddi doğrulandı.
- [ ] 2FA (admin için opsiyonel)
- [x] **Keşif formu: WhatsApp mesajına kayıt referans no ekle (TAMAMLANDI
      — 2026-08-21)**: kayıt oluşturulduktan sonra dönen id artık
      okunup mesaja `#K{id}` olarak ekleniyor (önceden fetch yanıtı hiç
      okunmuyordu, id'siz gidiyordu).

## 📈 SEO / Pazarlama

- [x] **Site Ayarları paneline SEO/Google/İletişim/Sosyal Medya alanları
      eklendi (TAMAMLANDI — 2026-08-21)**: `/panel/ayarlar` artık 4
      kategorili sekmeye ayrıldı (Görünüm, İletişim, Sosyal Medya &
      WhatsApp, SEO & Google). Admin artık telefon(lar), e-posta, adres,
      harita linki, Instagram/Facebook/WhatsApp, Google puanı/yorum
      sayısı/yorumlar linki, GA4 Ölçüm Kimliği, Search Console doğrulama
      kodu, SEO başlık/açıklama/anahtar kelime/OG görselini **kod
      değişikliği ve geliştirici müdahalesi olmadan** kendisi
      değiştirebiliyor (`lib/site-resolve.ts`, `lib/site-settings.ts`,
      `drizzle/0024_quiet_starjammers.sql`).
- [x] **Eski siteden (`Eski-Dosyalar/`) veri taşındı + profesyonel SEO
      metni yazıldı (TAMAMLANDI — 2026-08-21)**: eski site kaynağı
      taranarak Facebook/Instagram/adres/telefon/Google Haritalar embed
      linki/Google puanı (5.0, 33 yorum, Place ID) doğrulandı — hepsi
      zaten `lib/site.ts`'te doğru duruyordu, panel alanlarına
      taşınması için kullanıcıya tam değer listesi verildi (adminin
      kendisi girdi, giriş/parola gerektirdiği için ben giremedim).
      Eski sitede **Google Analytics/Search Console hiç kurulu
      değilmiş** — taşınacak bir ID yok, sıfırdan hesap açılması
      gerekiyor (bkz. aşağıdaki iki madde).
- [x] **Kapsamlı teknik SEO denetimi + düzeltmeleri (TAMAMLANDI —
      2026-08-21)**: `seo-specialist` ajanıyla tam site taraması yapıldı,
      bulunan 11 sorunun tamamı düzeltildi — tüm public sayfalara
      `alternates.canonical` eklendi (önceden yalnızca hizmet detay
      sayfalarında vardı, apex/www/punycode domain varyantları için
      yinelenen içerik riski taşıyordu), SSS ve 9 hizmet sayfasına
      `FAQPage` schema.org işaretlemesi eklendi (Google zengin sonuç
      fırsatı), Referanslarımız sayfasına `Review` şeması eklendi,
      `localBusinessJsonLd()`'deki **sabit kodlanmış adres** artık
      admin'in panelden girdiği gerçek adresi kullanıyor (önceden admin
      adresi değiştirse görünen içerik güncellenirken yapısal veri eski
      adreste kalıyordu — NAP tutarsızlığı), HDD hesaplama/keşif/SSS
      sayfaları client-only olduğu için kendi meta başlık/açıklaması
      yoktu, server bileşenine ayrıştırılıp eklendi
      (`components/HesaplamaContent.tsx`, `KesifContent.tsx`,
      `SssContent.tsx`), müşteriye özel teklif linki (`/teklif/[token]`
      — ad + fiyat içeriyor) `noindex` yapıldı, sitemap'e eksik 7 sayfa
      eklendi + sabit `lastModified` (önceden her build'de "bugün
      değişti" yanlış sinyali veriyordu), marka logoları `next/image`'e
      taşındı, `next.config.ts`'e AVIF/WebP format desteği eklendi.
      [lib/seo.ts](lib/seo.ts), [app/sitemap.ts](app/sitemap.ts)
- [ ] **Google Analytics 4 hesabı** — panel altyapısı hazır
      (`googleAnalyticsId` alanı doldurulunca `app/layout.tsx` otomatik
      `gtag.js` enjekte ediyor), ama gerçek bir Google hesabıyla
      `analytics.google.com`'da mülk oluşturulması gerekiyor — hesap
      girişi/oluşturma benim yapamayacağım bir işlem, admin kendisi
      yapmalı.
- [ ] **Google Search Console** — panel altyapısı hazır
      (`googleSiteVerification` alanı `metadata.verification.google`'a
      otomatik bağlanıyor), ama `search.google.com/search-console`'da
      mülk doğrulaması admin'in kendi Google hesabıyla yapılması
      gerekiyor.
- [ ] Bing Webmaster ekle
- [ ] Google Business profili ile site bağla (hizmet alanı, saatler, fotoğraf)
- [x] **Web analytics (GA4) — altyapı TAMAMLANDI**: bkz. yukarıdaki GA4
      maddesi, yalnızca hesap oluşturma adımı kalıyor.
- [x] **Sosyal paylaşım (Open Graph / Twitter Card) görselleri
      (TAMAMLANDI — 2026-08-20)**: eksikti, `/images/hero-1.jpg` ile
      eklendi; artık admin panelden de değiştirilebiliyor (`ogImageUrl`).
- [x] **Yerel SEO: `schema.org` yapısı (TAMAMLANDI — güncel değilmiş, daha
      önce yapılmış)**: `lib/seo.ts` — `localBusinessJsonLd()` (adres,
      koordinat, çalışma saatleri, puan, sosyal linkler; `app/layout.tsx`
      üzerinden tüm sitede), `serviceJsonLd()` + `breadcrumbJsonLd()`
      (her hizmet detay sayfasında). Production'da `<script
      type="application/ld+json">` ile doğrulandı.

## 📦 Veri / Yedek

- [ ] Supabase backup politikası belirle (otomatik yedek + periyodik export)
- [ ] Veritabanı büyüme takibi (pooler bağlantı limitleri)
- [x] **Eski WordPress içeriği (TAMAMLANDI — 2026-08-21)**: kullanıcıyla
      netleştirildi — aktarılacak ayrı bir blog/yazı içeriği yoktu, esas
      içerik (ana sayfa metni, iletişim/sosyal medya bilgileri) zaten
      `Eski-Dosyalar/` taraması sırasında koda taşınmıştı.

## ✅ Tamamlananlar (referans)

- Kurumsal site (hero, 11 hizmet, süreç, işler, yorumlar, gerçek marka logoları, harita, CTA)
- Yönetim paneli: giriş, dashboard, talepler, randevular, müşteriler, teklifler, işler
- **Faturalar + Kasa (gelir/gider) + Ürün kataloğu modülleri** (2026-08-19, bkz. Faz 1 yukarıda)
- **İş bazlı maliyet/kâr + otomatik stok düşümü** (2026-08-19, bkz. Faz 2 yukarıda)
- **Kritik hata düzeltmesi**: satır-içi durum değişikliklerinin kaydın diğer
  alanlarını sessizce sıfırlaması (bkz. Faz 2 notu) — müşteri/randevu/teklif/
  iş güncellemelerinin tamamını etkiliyordu, artık düzeltildi
- Personel yönetimi sayfası + staff API'leri; ürün alış fiyatı personelden gizli
- Keşif sihirbazı → backend kaydı + WhatsApp
- JWT cookie auth, rol bazlı yetkilendirme, honeypot koruması
- Supabase prod veritabanı + seed (admin + 2 personel + 7 ürün + örnek veri)
- Lint + build temiz, GitHub push tamamlandı (main)
- Vercel projesi yeniden oluşturuldu (zombi deployment temizliği)
- Vercel Framework Preset + Deployment Protection + DB SSL çakışması düzeltildi (site canlı)
- **Müşteri detay ekranı + yetkili kişiler/lokasyonlar + görüşme notu geçmişi** (2026-08-19, bkz. Faz 3a yukarıda)
- **Servis / Arıza Yönetimi** (2026-08-19, bkz. Faz 3b yukarıda)
- **Mobilde panel kayması düzeltildi** (100vh → dvh)
- **Gerçek alan adı canlıya alındı** (Cloudflare → Vercel) + yanlış canonical/sitemap domaini düzeltildi
- **Servis formu PDF sistemi** (2026-08-20) — react-pdf ile ıslak imzaya uygun servis formu, kaydedilen bilgilerden otomatik oluşuyor
- **Panel: gizli hata mesajı + modal scroll kilidi düzeltildi** (2026-08-20) — kayıt hatası artık modal içinde gösteriliyor (10 sayfada), modal sabit yükseklik + bağımsız scroll'a kavuştu
- **Destek + Kurumsal menüler** (2026-08-20) — HDD/disk kapasitesi hesaplama aracı, SSS, Mobil Uygulamalar, Kalite ve Çevre Politikamız, Markalarımız, İş Ortaklarımız, Referanslarımız sayfaları
- **Çoklu para birimi (₺/$/€)** (2026-08-20) — ürün/teklif/fatura/kasa/iş/servis kayıtlarında para birimi + kayıt anında kilitlenen otomatik kur (Frankfurter/ECB); maliyet ve dashboard toplamları her zaman ₺'ye normalize edilir
- **Hizmet bazlı YouTube videoları** (2026-08-20) — her hizmet detay sayfasının başlık arkasında admin panelden yönetilebilen tanıtım videosu (`/panel/hizmet-medya`)