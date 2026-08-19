# Öztürk Güvenlik Sistemleri — Web Sitesi + Yönetim Paneli

İstanbul / Yenibosna'daki Öztürk Güvenlik Sistemleri için kurumsal web sitesi ve
işletme yönetim paneli. Next.js 16 (App Router) + PostgreSQL (Supabase) + Drizzle ORM.

## Özellikler

**Halka açık site (`/`)**

- 11 hizmet sayfası (kamera, hırsız alarmı, yangın alarmı, PDKS, bariyer/turnike,
  ses/anons, network, akıllı ev, yangın tüpü, fotokapan, araç içi kamera)
- 3 adımlı **ücretsiz keşif sihirbazı** (`/kesif`) → kaydı panele düşer + WhatsApp'a gider
- Gerçek müşteri yorumları, saha fotoğrafları, harita, LocalBusiness/Service JSON-LD

**Yönetim paneli (`/panel`)**

- Rol bazlı giriş (yönetici / personel), JWT + httpOnly cookie
- Keşif talepleri: durum takibi (yeni → aranacak → randevu verildi → tamamlandı/iptal),
  personel atama, tek tıkla arama/WhatsApp
- Randevu ajandası (tarih/saat, atama, durum)
- Müşteri defteri (arama, kaynak takibi)
- Teklifler (kalem bazlı fiyatlandırma, otomatik toplam, durum)
- İş/kurulum takibi (ekip ataması, malzeme listesi, tarih aralığı)
- Personel yönetimi (hesap oluşturma, şifre sıfırlama, pasifleştirme)

## Teknolojiler

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) — SSR/SSG
- [Drizzle ORM](https://orm.drizzle.team) + `pg`
- PostgreSQL — yerel geliştirmede Docker, üretimde Supabase
- [Tailwind CSS](https://tailwindcss.com) 4
- [jose](https://github.com/panva/jose) (JWT) + bcryptjs (şifreleme) + zod (doğrulama)

## Yerel geliştirme

Gereksinim: Node.js 20+ ve Docker (PostgreSQL için).

```bash
docker compose up -d                 # PostgreSQL'i başlat
npm install
Copy-Item .env.example .env.local    # (Windows) değerleri doldurun
npm run db:push                      # şemayı yerel DB'ye uygula
npm run db:seed                      # admin + örnek veri
npm run dev                          # http://localhost:3000
```

Panel: http://localhost:3000/panel — giriş bilgileri `db:seed` çıktısında yazar.

## Üretim (Supabase + Vercel)

1. Supabase'te proje oluşturun; Settings → Database → **Connection string**'den
   pooler bağlantı dizesini kopyalayın (şifreyi dolduracak şekilde).
2. Migration'ı uygulayın:

   ```bash
   $env:DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
   npm run db:migrate
   ```

3. İlk yöneticiyi oluşturun:

   ```bash
   $env:DATABASE_URL="postgresql://..."
   $env:ADMIN_PASSWORD="ilk-sifre"
   npm run db:seed
   ```

4. Repoyu Vercel'de import edin ve **Environment Variables**'a ekleyin:
   - `DATABASE_URL` — Supabase connection string
   - `AUTH_SECRET` — `openssl rand -hex 32` ile ürettiğiniz değer

Panel girişi ilk seferde `db:seed`'de verdiğiniz yönetici e-postası + şifresiyle
yapılır; girişten sonra `İşlem yapmadan önce şifrenizi panelden değiştirin`.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Üretim derleme / sunma |
| `npm run lint` | ESLint |
| `npm run db:generate` | Şema değişikliğinden SQL üret |
| `npm run db:push` | Şemayı hedef DB'ye uygula (geliştirme) |
| `npm run db:migrate` | Üretim migration'larını uygula |
| `npm run db:seed` | Admin + örnek veri yükle |

## Lisans

Özel proje — Öztürk Güvenlik Sistemleri. İzinsiz kullanılamaz.