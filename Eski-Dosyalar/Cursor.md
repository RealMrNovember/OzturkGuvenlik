# Öztürk Güvenlik — site önerisi (Cursor)

Tarih: 19 Ağustos 2026  
Kaynak: `info.md` + `ChatGPT.md` + `gemini.md`  
Dağıtım: **VDS** (Hostinger / hPanel değil)

Bu dosya üç ajan metninin sentezi değil; **bu ajanın kesin kararıdır.** ChatGPT’nin satış makinesi ve keşif sihirbazı alınır. Gemini’nin Laravel paneli ve “quiet luxury / altın” dili alınmaz. Firma Yenibosna’da sahada iş yapan aile işletmesidir; Rolex vitrini yapılmaz.

---

## 1. Site ne işe yarar

Tek iş: İstanbul’da (özellikle Avrupa yakası / Yenibosna çevresi) kamera–alarm–PDKS isteyen kişiyi **Özkan Bey’le keşife bağlamak.**

Ziyaretçi 20 saniyede şunu anlar:

1. Bu firma kurulum yapıyor, vitrin satmıyor.
2. Keşif ücretsiz, telefon ve WhatsApp tek hat.
3. Gerçek mahalle firması; şablon ajans değil.

**KPI:** `whatsapp_click` · `phone_click` · `kesif_complete`  
Sayfa görüntüleme başarı sayılmaz.

**Yapılmayacak:** 13 maddelik menü, “IP kamera nedir”, yangın tüpünün 1723 tarihi, pxhere ofis fotoğrafı, “Front Page”, rakip hotlink görsel, “Created for free using WordPress”.

---

## 2. Üç metinden ne alındı, ne atıldı

### Alınan (üçünün de haklı olduğu)

- WordPress yok.
- İlk ekranda ne yaptıkları, 2014, Google 5.0, Yenibosna, iki CTA: Ücretsiz keşif + WhatsApp.
- Bağlamsal WhatsApp (kamera sayfasında kamera mesajı).
- Mobil alt bar: Ara | WhatsApp | Yol tarifi.
- Hizmet sayfası: kim için / ne kuruyoruz / süreç / SSS / CTA.
- Gerçek işler: kentsel dönüşüm, Şirinevler mağaza, ofis PDKS.
- URL düzeltme + eski adreslere 301.
- Yorumlar: seçilmiş kartlar + “Google’da hepsi” (ilk sürümde Reviews API yok).
- Event analitik.

### Atılan

| Kaynak | Atılan | Neden |
|---|---|---|
| Gemini | Laravel 11 + Filament v3 | Özkan panelden slider güncellemeyecek; satış WhatsApp’ta |
| Gemini | Digital boutique, altın/metalik “quiet luxury” | Kuyumcu sitesi olur; bu firma saha montajı |
| Gemini | Hero’da e-posta formu tek kanal | E-posta yayınlanmıyor; kanal WhatsApp |
| ChatGPT | “Digital Experience Platform” | Şişirme dil |
| ChatGPT | 12 anayasa dosyası + 13 faz | Tek spec yeter; bu dosya o spec’in omurgası |
| ChatGPT | Mini asistan + keşif merkezi + 9’lu sihirbaz ayrı ayrı | Aynı ürün üç kere; tek `/kesif` |
| ChatGPT | Canlı Google Reviews API (v1) | Ücret, kota, TOS; kart + resmi link yeterli |
| ChatGPT | Vercel şartı | Proje **VDS**’e kurulacak |

---

## 3. Marka ve ton

Korunacak gerçekler (`info.md`):

- Unvan: Öztürk Güvenlik Sistemleri
- CEO / saha: Recep Özkan Öztürk
- Kuruluş: 2014
- Adres: Yenibosna Merkez Mah., Kenanbey Sk. No: 11, İstanbul
- Telefon / WhatsApp: 0535 014 65 93
- Instagram: `ozturkgvnlk_`
- Facebook: `ozturkgvnlk` (tek hesap; ikinci URL birleştirilir)
- Google: 5.0 / 33+ yorum — Öztürk Kamera & Güvenlik Sistemleri

Ton: sakin, net, ustalık. “Uzman ekibimiz” yok; Özkan’ın adı var.

“7/24” yalnızca WhatsApp hattı gerçekten öyle işletiliyorsa yazılır. Keşif “aynı gün” vaadi yorumlarda var; operasyon doğrulamasına bağlı kullanılır.

---

## 4. Tasarım dili

Klasik mavi–beyaz kamera stoğu yok. Altın butik yok.

| Token | Kullanım |
|---|---|
| Primary | Koyu lacivert / siyaha yakın |
| Surface | Kırık beyaz |
| Accent | Mevcut logodaki kırmızı, kontrollü |
| WhatsApp yeşili | Yalnızca WhatsApp CTA |
| Tipografi | Kalın grotesk başlık + okunaklı gövde |

Akılda kalan detay: her önemli ekranda **“Keşif ücretsiz — montaj planlı”** ve görünür telefon.

Animasyon: hero fade, kart hover, hafif scroll reveal. Gradient blob, mouse trail, 3D, abartılı parallax yok.

Görsel kuralı: kendi montaj fotoğrafı. Yoksa bloğu şişirme; stok ofis koyma. Eldeki WhatsApp sahne kareleri ve Özkan portresi v1 hero için kullanılabilir. `sasasa.png` ve rakip hotlink’leri çöp.

---

## 5. Bilgi mimarisi

Üst menü en fazla dört + sağ CTA:

- Hizmetler
- Projeler
- Hakkımızda
- İletişim
- Sağ: `0535 014 65 93` + **Ücretsiz keşif**

Hizmetler menüde **gruplanır**; 11 ayrı üst link olmaz. SEO sayfaları durur.

```
/
├── hizmetler
│   ├── kamera-sistemleri
│   ├── hirsiz-alarm
│   ├── yangin-alarm
│   ├── ses-ve-anons
│   ├── bariyer-ve-turnike
│   ├── pdks
│   ├── network
│   ├── akilli-ev
│   ├── yangin-tupu
│   ├── fotokapan
│   └── arac-ici-kamera
├── projeler
├── hakkimizda
├── iletisim
└── kesif
```

Gruplar (hub kartları):

1. Kamera sistemleri
2. Alarm (hırsız + yangın)
3. Geçiş ve personel (PDKS, turnike, bariyer)
4. Diğer (akıllı ev, network, anons, fotokapan, araç kamerası, yangın tüpü)

Eski URL’ler 301:

- `/pdsk-sistemleri/` → `/hizmetler/pdks`
- `/kameralar/` → `/hizmetler/kamera-sistemleri`
- `/urunlerimiz/` → `/hizmetler`
- `/ornek-sayfa/`, `/2025/02/05/merhaba-dunya/`, boş `/kamera-sistemleri/` → uygun hedef veya 410

Kanonik alan adı: `öztürkgüvenlik.com` (punycode `xn--ztrkgvenlik-qfb4fd.com`). Tek host, www yönlendirmesi net.

---

## 6. Ana sayfa sırası

1. Sticky header: logo, menü, telefon, keşif.
2. Hero: gerçek iş görseli. Başlık somut — *İstanbul’da kamera ve alarm kurulumu. Keşif ücretsiz.* Alt: 2014 · 5.0 Google · Yenibosna. CTA: WhatsApp / Ücretsiz keşif.
3. “Ne lazım?” — 6–8 kart. Tıklama ilgili hizmet sayfasına gider; isteğe bağlı olarak `/kesif?hizmet=kamera` ile sihirbaz ön seçili açılır. İki ayrı sihirbaz yok.
4. Süreç: Yazın → keşif → teklif → montaj ve eğitim.
5. Projeler: 3–6 gerçek iş. Fotoğraf yoksa bu bölüm kısa kalır.
6. Yorumlar: 4–5 gerçek metin (Furkan Pamuk, Abdulsamed Çolak, Berat Kaya vb.) + Google linki.
7. Markalar: UNV, ZKTeco, Seagate, WD, TP-Link — resmi logo; yetkili satıcı iddiası yoksa yazılmaz.
8. Harita + adres.
9. Son CTA: keşif.
10. Footer: hizmetler, iletişim, Instagram, Facebook, © Öztürk Güvenlik Sistemleri. Tema/jenerik imza yok.

Mobil: alt sabit bar `Ara | WhatsApp | Yol tarifi` — native his, ucuz yeşil balon değil. WhatsApp mesajı sayfaya göre değişir.

---

## 7. Tek dönüşüm yüzeyi: `/kesif`

Üç adım, e-posta paneli yok (v1):

1. Hizmet: kamera / alarm / yangın / PDKS / network / diğer
2. Yer: ev / ofis / mağaza / proje
3. Telefon

Bitiş: **WhatsApp’tan gönder** — hazır metin örneği:

> Merhaba, öztürkgüvenlik.com üzerinden yazıyorum. [hizmet] için [yer] keşfi istiyorum. Tel: [numara]

İsteğe bağlı yedek: aynı payload VDS üzerindeki küçük API’ye de düşer (aşağıda). Klasik “ad soyad / e-posta / mesaj” formu yok.

---

## 8. Hizmet sayfası şablonu

Ansiklopedi yok. Her sayfa:

1. Kim için (apartman / dükkân / ofis)
2. Ne kuruyoruz (üç madde)
3. Hangi sistem (ör. IP vs AHD; konvansiyonel vs adreslenebilir)
4. Süreç (keşif → teklif → kurulum → teslim)
5. SSS (4 soru)
6. CTA: keşif + bağlamsal WhatsApp

Ana para: kamera, hırsız alarm, yangın, PDKS. Fotokapan ve yangın tüpü kısa kalır.

---

## 9. Teknik stack (VDS)

| Katman | Seçim |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Stil | Tailwind CSS, kendi bileşenleri |
| Animasyon | CSS; Framer Motion şart değil |
| Form / keşif | WhatsApp deep link + VDS’te küçük API (ileti bildirimi) |
| CMS | v1 yok. Telefon, adres, WhatsApp `config` dosyasında |
| Analitik | GA4 event’leri |
| SEO | title, description, canonical, OG, JSON-LD (LocalBusiness + Service + FAQ), breadcrumb |
| Görseller | WebP/AVIF, `srcset`, lazy |

WordPress, Laravel, Filament, Sanity, Strapi **v1’de yok.**

### VDS kurulumu (Hostinger değil)

Mevcut Hostinger FTP (`46.202.156.93` / `u894652269`) eski sitenin yeri; **yeni site bu panele bağlanmaz.** Yeni VDS’te:

- Node.js LTS (Next.js build + `node` process) veya Nginx’in arkasında PM2
- Nginx reverse proxy: `443` → Next process
- Let’s Encrypt SSL, HTTP→HTTPS, www kanonu
- `öztürkgüvenlik.com` A kaydı VDS IP’ye
- Eski WordPress URL’leri Nginx veya Next `redirects` ile 301
- Güvenlik: firewall (22/80/443), fail2ban, otomatik güvenlik güncellemesi, rate limit (özellikle `/api/kesif`)
- Süreç yöneticisi: PM2 (restart, log)
- Deploy: git pull + `npm ci` + `npm run build` + `pm2 reload` (basit script; ilk günden CI şart değil)

Keşif kaydı v1’de şart değil; WhatsApp yeterli. İkinci adım: VDS’te `/api/kesif` → e-posta veya Telegram/WhatsApp Business bildirimi, honeypot + rate limit. CAPTCHA yalnızca spam gelirse.

---

## 10. Yayın eşiği

**v1**

- Ana sayfa, hizmetler hub, 11 hizmet şablonu, `/kesif`, hakkımızda, iletişim, projeler
- 301’ler, LocalBusiness schema, event’ler
- Mobil alt bar + bağlamsal WhatsApp

**v1’i kilitleyen:** Özkan’dan 8–12 gerçek montaj fotoğrafı. Yoksa hero’da eldeki sahne + portre; proje ızgarası uydurulmaz.

**v2**

- Keşif API bildirimi
- İnce CMS (sadece yorum/proje ekleme gerekirse)
- Ads’e özel kentsel dönüşüm landing’i

---

## 11. İnşa sırası

Kodlamaya “siteyi yap” diye başlanmaz. Sıra:

1. Bu dosya + `info.md` kaynak kabul edilir.
2. Design token’lar (renk, tipografi, spacing) tek yerde.
3. Layout: header, footer, mobil bar, CTA.
4. Ana sayfa.
5. `/kesif`.
6. Hizmet şablonu × sayfalar.
7. Hakkımızda, iletişim, projeler.
8. SEO + 301 + schema.
9. VDS: Nginx, SSL, PM2, domain.
10. Event doğrulama, mobil QA.

Cursor kuralı: bu dosyayla çelişen “elit panel”, “altın luxury”, “WordPress”, “Hostinger public_html” üretilmez.
