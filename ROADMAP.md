# Roadmap — Yapılacaklar / Yapılanlar

Bu dosya, müşteri/ekip tarafından istenen özelliklerin takibi için tutulur. Hiçbir istek
atlanmasın diye buraya yazılıyor; tamamlanınca işaretlenir.

## Durum: Devam eden oturum (2026-11-15)

- [x] **Hero video slider — tur sayısı (repeat count)**
  Videolar bir süre tahminiyle değil, gerçekten kaç kez oynadığı sayılarak (YouTube Player
  API ile `ended` olayı sayılıyor) bir sonraki videoya geçiyor. Admin: Site Ayarları →
  Görünüm → Hero Videoları, her videonun yanında "Tur sayısı" alanı. Deploy edildi.

- [x] **Hero video slider — tıklanabilir indicator (sayfa göstergesi)**
  Birden fazla video varsa, hero alanının altında tıklanabilir çubuk göstergeler (aktif
  video vurgulu) eklendi; ziyaretçi istediği videoya elle geçebiliyor. Kod tamamlandı,
  deploy/doğrulama bekliyor.

- [x] **Header'a sosyal medya + e-posta ekle**
  Header'a e-posta (mailto), Instagram ve Facebook ikonları eklendi (masaüstü: telefonun
  yanında; mobil menü: WhatsApp butonunun altında). Bu bilgiler zaten Site Ayarları →
  İletişim/Sosyal sekmelerinden düzenlenebiliyordu, yeni bir admin alanı gerekmedi —
  sadece Header'da gösterilmiyordu. Deploy/doğrulama bekliyor.

- [ ] **"Ne arıyorsunuz?" (anasayfa hizmet kartları) — tam admin düzenlenebilir + görsel**
  Anasayfadaki hizmet kartları (şu an `lib/services.ts` içinde sabit kodlu) admin panelden
  düzenlenebilir hale gelecek: başlık, açıklama, görsel, sıralama, gösterme/gizleme.
  İkon yerine, kutucuğun tamamını kaplayan bir görsel kullanılabilecek (ikon fallback olarak
  kalacak, görsel yüklenmemişse mevcut görünüm bozulmayacak).

- [x] **Floating WhatsApp butonuna etiket metni** — kod tamam, DB migration bekliyor (bkz. not)
  Sağ altta sabit duran WhatsApp butonunun üzerine admin'in yazdığı kısa bir metin ("Örn.
  Ücretsiz Keşif") gösteriliyor; boşsa buton eskisi gibi sade ikon. Site Ayarları → Sosyal
  Medya & WhatsApp sekmesinden düzenlenebilir.

- [x] **Header'a YouTube eklendi, e-posta telefonun altına taşındı**
  Sosyal medya ikon satırına YouTube de eklendi (Footer'a da tutarlılık için eklendi).
  Masaüstünde e-posta artık telefon numarasının hemen altında küçük yazıyla duruyor, ayrı
  ikon satırından kaldırıldı. Site Ayarları'na "YouTube kanalı linki" alanı eklendi.

- [x] **"Ne arıyorsunuz?" (anasayfa hizmet kartları) — tam admin düzenlenebilir + görsel** — kod tamam, DB migration bekliyor
  Hizmet Medya admin sayfası (eski adıyla "Hizmet Videoları") genişletildi: her hizmet için
  artık kart başlığı/açıklaması (boşsa varsayılana düşer), kapak görseli (yüklenirse ikon
  yerine kutunun tamamını kaplar), anasayfada sıralama ve gösterme/gizleme ayarlanabiliyor.
  Görseller private Vercel Blob'da tutulup herkese açık bir proxy route üzerinden sunuluyor.

- [ ] **Öztürk Güvenlik Türkçe (IDN) domaini de siteyi açsın** — ⚠️ BEKLİYOR (bende Vercel erişimi yok)
  `öztürkgüvenlik.com` müşteride mevcut. Bu domain de aynı siteyi açacak şekilde
  Vercel'e eklenecek. SEO'da tekilleştirme (duplicate content) olmasın diye asıl
  domain olan ozturkguvenlik.com'a yönlendirme (redirect) olarak kurulması önerilir —
  kullanıcı tıklayınca/yazınca yine aynı siteyi görür, Google tarafında da tek
  canonical adres kalır.

  Bu oturumda Vercel API erişimim (token) kalmamış, bu yüzden bunu şu an otomatik
  yapamıyorum. Vercel dashboard üzerinden 2 dakikada şöyle yapılabilir:
  1. Vercel → proje → Settings → Domains → "Add"
  2. `öztürkgüvenlik.com` (ve `www.öztürkgüvenlik.com`) girilir
  3. Ekleme ekranında "Redirect to another Domain" seçilip hedef olarak
     `www.ozturkguvenlik.com` (308 Permanent) seçilir
  4. Domain zaten Vercel nameserver'larında değilse, Vercel'in gösterdiği DNS
     kayıtları domain'in alındığı yerde (registrar) eklenir — bu kısmı yalnızca
     müşteri/domain sahibi yapabilir, bana registrar erişimi verilse bile DNS
     tarafı her zaman domain panelinden yapılır.
  Vercel erişimi (token) tekrar sağlanırsa bu adımları ben de buradan yapabilirim.

## ⚠️ Şu an bekleyen: veritabanı erişimi gerekiyor

WhatsApp etiketi ve "Ne arıyorsunuz?" kartları için yazılan kod iki yeni veritabanı
migration'ı üretti (`drizzle/0033_perfect_raider.sql`, `drizzle/0034_fixed_inertia.sql`).
Bu oturumda prodüksiyon Supabase veritabanına bağlanacak DATABASE_URL (transaction
pooler, port 6543) elimde değil — önceki oturumda vardı, bu konuşma sırasında kaybolmuş.

Bu migration'lar canlıya UYGULANMADAN bu kodu deploy edersem site çöker (eksik
kolonlarla ilgili sorgular hata verir). Bu yüzden bu iki özelliği kasıtlı olarak
GitHub'a göndermedim; sadece yerel/kod tarafında hazır bekliyorlar.

**Devam etmek için:** Supabase projesi `hiwribprhiodsnclrosp` → Settings → Database →
Connection string → **Transaction pooler** (port 6543) bağlantı dizesini paylaşmanız
yeterli; onu alır almaz migration'ları uygulayıp bu iki özelliği de deploy ederim.

## Notlar

- Her madde, mevcut admin panel desenleriyle (Site Ayarları / ilgili panel sayfaları)
  tutarlı şekilde, veri kaybı yaratmadan (boşsa eski/varsayılan davranışa düşerek)
  uygulanıyor.
- Tamamlanan maddeler canlıya (ozturkguvenlik.com) deploy edilip doğrulanmadan
  işaretlenmiyor.
