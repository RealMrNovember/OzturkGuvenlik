# Öztürk Güvenlik — Proje Yapılacaklar Listesi

Son güncelleme: 2026-08-19

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
- [ ] İş kartına fotoğraf + teslim tutanağı — hâlâ dosya yükleme altyapısı
      gerektiği için ertelendi (Faz 3/4'e taşınabilir, örn. Vercel Blob).

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

### 🔜 Faz 3 — CRM derinliği + servis/arıza

- [ ] Müşteri detay ekranı ("tek ekranda geçmiş"): o müşteriye ait tüm talep/
      randevu/teklif/iş/fatura/tahsilat tek sayfada
- [ ] Müşteri başına birden fazla yetkili kişi + birden fazla lokasyon
      (`customer_contacts`, `customer_locations` tabloları)
- [ ] Görüşme notu geçmişi (telefon/WhatsApp), müşteri kartına eklenebilir not akışı
- [ ] **Servis / Arıza Yönetimi**: yeni `service_tickets` tablosu — müşteri,
      cihaz, lokasyon, arıza açıklaması, fotoğraf, teknisyen ataması, randevu,
      kullanılan parça (stoktan düşer), servis ücreti, sonuç. Panel: `/panel/servis`.

### 🔜 Faz 4 — Sözleşme/bakım + personel derinliği

- [ ] `maintenance_contracts` tablosu — müşteri, sözleşme tipi, son bakım,
      sonraki bakım tarihi. Dashboard'da "yaklaşan bakım" uyarı listesi
- [ ] Personel: izin takibi, masraf, prim/performans alanları
- [ ] Personel için "Bugünkü işlerim" filtrelenmiş görünüm (mevcut
      `/panel/isler` sayfasına personel bazlı filtre eklenerek — ayrı mobil
      app gerekmez, responsive tasarım zaten mobilde çalışıyor)
- [ ] Alış faturaları (tedarikçiden) + cari hesap (müşteri/tedarikçi bakiyesi)
      + vadesi geçen tahsilat listesi

### 🔜 Faz 5 — Otomasyon ve dış yüz

- [ ] Teklif/fatura PDF çıktısı
- [ ] Teklife herkese açık onay linki (müşteri WhatsApp/e-postadan tıklayıp
      onaylar → otomatik işe dönüşür)
- [ ] Excel/CSV export (müşteri, teklif, iş, kasa)
- [ ] E-posta/SMS bildirimleri (yeni talep, randevu hatırlatma, bakım zamanı)

## 🚀 Canlıya Alma / Deploy (ÖNCELİK YÜKSEK)

- [x] **Vercel Authentication'ı Production için kapat** — `ssoProtection.deploymentType` `all_except_custom_domains` → `preview` (2026-08-19, API ile)
- [x] **Project → Settings → Framework Preset boştu (`framework: null`)** — proje silinip yeniden açılırken auto-detect tutmamış; Vercel bu yüzden `next build` çıktısını Next.js olarak değil generic/static olarak işliyordu → her rota platform seviyesinde 404 veriyordu. `framework: "nextjs"` olarak API'den sabitlendi + yeniden deploy edildi. **Bu asıl "Vercel'de takılma" sebebiydi**, postinstall/allowScripts değil.
- [x] **`DATABASE_URL`'de `sslmode=require` + kod içindeki `ssl:{rejectUnauthorized:false}` çakışması** — ikisi birlikteyken pg "self-signed certificate in certificate chain" hatasıyla bağlanamıyordu (`/api/auth/login` 500 veriyordu). Supabase dashboard'dan kopyalanan connection string'de `sslmode=require` otomatik geliyor; bu yüzden [lib/db/index.ts](lib/db/index.ts) artık supabase URL'lerinden `sslmode` parametresini otomatik temizliyor (tekrar yaşanmasın diye kod seviyesinde düzeltildi, sadece env var'ı düzeltmek yetmezdi).
- [x] Production domain doğrulandı (2026-08-19):
  - [x] `/`, `/hizmetler`, `/kesif`, `/panel/giris` → 200
  - [x] Admin giriş: `yonetici@ozturkguvenlik.com` çalışıyor, session cookie dönüyor
  - [ ] `/api/requests` POST tam akış testi (gerçek veri ile, WhatsApp yönlendirmesi dahil) — henüz yapılmadı
- [x] `ozturk-guvenlik.vercel.app` zaten yeni projeye doğru bağlıydı, taşımaya gerek kalmadı
- [ ] Özel domain bağlanacak mı karar ver (örn. `ozturkguvenlik.com` / alt alan)
- [ ] Uptime/ping monitor eklensin (UptimeRobot / Better Stack)

## 🔐 Güvenlik / Sır Yönetimi

- [ ] **ACİL — Supabase anahtarlarını döndür**: DB şifresi, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET` **iki ayrı sohbete** (OpenCode + Claude) yapıştırıldı. Bu satır zaten bir kere yazılmıştı, hâlâ yapılmadı — bu sefer gerçekten yapılmalı: Supabase → Settings → Database (şifre) ve Settings → API (anahtarlar) yenile, Vercel'de `DATABASE_URL` güncelle.
- [ ] Panel admin şifresini (`Ozk4n!2026`, aynı şekilde sohbete yapıştırıldı) ilk girişten sonra değiştir
- [ ] Bu iş için kullanılan Vercel Personal Access Token'ı iptal et (vercel.com/account/tokens) — iş bitti, sohbet geçmişinde duruyor
- [ ] `AUTH_SECRET` güvenli yerde sakla (password manager) — `.env.local` dışında yere yazma
- [ ] Admin/personel şifre politikası gözden geçir (ilk girişte şifre değiştirme zorunluluğu önerilir)

## 🧪 Test / Kalite

- [ ] Test altyapısı kur (vitest + React Testing Library)
- [ ] Kritik akışlar için test yaz:
  - [ ] Keşif formu → `/api/requests` kaydı + honeypot
  - [ ] Auth: giriş/logout, rol bazlı erişim (admin vs personel)
  - [ ] Randevu CRUD, müşteri arama, teklif toplam hesabı, iş ataması
- [ ] API route'lardaki `p:any` tiplerini gerçek tiplerle değiştir
- [ ] Seed idempotency: Supabase'te `db:seed` yeniden çalıştırılırsa örnek veri tekrar ekleniyor — örnek veri ekleme kısmını opsiyonel yap
- [ ] Lighthouse / Core Web Vitals audit (LCP, CLS, INP)

## 🧹 Kod Tabanı / Bakım

- [ ] `Eski-Dosyalar/` (21 MB) kararı — repo'da tarihsel mi kalsın, yoksa arşivle kaldır mı?
- [ ] Kullanılmayan bağımlılık kontrolü (`@types/bcryptjs` gerekli mi?)
- [ ] `.env.example` güncel tut (seed için `ADMIN_*` değişkenleri dahil)
- [ ] Drizzle migration'ları tek kaynak — yeni şema değişiklikleri için `db:generate` + `db:migrate`

## 💼 Diğer Panel Geliştirmeleri

(ERP kapsamındaki PDF/export/dosya yükleme/bildirim maddeleri yukarıdaki
Faz 2-5'e taşındı — burada yalnızca ERP dışı, bağımsız iyileştirmeler var.)

- [ ] Yorum yönetimi: sitedeki google yorumlarını panelden yönet/onayla
- [ ] Şifremi unuttum / e-posta ile sıfırlama akışı
- [ ] 2FA (admin için opsiyonel)
- [ ] Keşif formu: WhatsApp mesajına kayıt referans no ekle

## 📈 SEO / Pazarlama

- [ ] Google Search Console + Bing Webmaster ekle
- [ ] Google Business profili ile site bağla (hizmet alanı, saatler, fotoğraf)
- [ ] Web analytics kur (Vercel Analytics / GA4)
- [ ] Sosyal paylaşım (Open Graph / Twitter Card) görselleri kontrol et
- [ ] Yerel SEO: hizmet sayfaları için `schema.org` LocalBusiness yapısı

## 📦 Veri / Yedek

- [ ] Supabase backup politikası belirle (otomatik yedek + periyodik export)
- [ ] Veritabanı büyüme takibi (pooler bağlantı limitleri)
- [ ] Eski WordPress içeriğinden faydalı kalacakları aktarmayı tamamla (bloglar/yazılar)

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