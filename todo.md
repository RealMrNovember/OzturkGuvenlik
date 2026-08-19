# Öztürk Güvenlik — Proje Yapılacaklar Listesi

Son güncelleme: 2026-08-19

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

## 💼 İş Özellikleri / Panel Geliştirmeleri

- [ ] Teklif PDF çıktısı (yazdır/indir)
- [ ] Müşteri / teklif / iş için Excel export
- [ ] İş takibi için zaman çizelgesi / ekip notları (iş içinde adım adım ilerleme)
- [ ] Bildirimler: yeni talep/randevu geldiğinde e-posta veya bildirim
- [ ] Dosya yükleme (keşif fotoğrafı, sözleşme PDF'i) — şema + API + UI
- [ ] Yorum yönetimi: sitedeki google yorumlarını panelden yönet/onayla
- [ ] Şifre unuttuum / e-posta ile sıfırlama akışı
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

- Kurumsal site (hero, 11 hizmet, süreç, işler, yorumlar, markalar, harita, CTA)
- Yönetim paneli: giriş, dashboard, talepler, randevular, müşteriler, teklifler, işler
- Personel yönetimi sayfası + staff API'leri ️
- Keşif sihirbazı → backend kaydı + WhatsApp ️
- JWT cookie auth, rol bazlı yetkilendirme, honeypot koruması
- Supabase prod veritabanı + seed (admin + 2 personel + örnek veri)
- Lint + build temiz, GitHub push tamamlandı (main)
- Vercel projesi yeniden oluşturuldu (zombi deployment temizliği)