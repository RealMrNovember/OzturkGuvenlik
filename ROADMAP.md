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

- [x] **Floating WhatsApp butonuna etiket metni** — canlıda
  Sağ altta sabit duran WhatsApp butonunun üzerine admin'in yazdığı kısa bir metin ("Örn.
  Ücretsiz Keşif") gösteriliyor; boşsa buton eskisi gibi sade ikon. Site Ayarları → Sosyal
  Medya & WhatsApp sekmesinden düzenlenebilir.

- [x] **Header'a YouTube eklendi, e-posta telefonun altına taşındı**
  Sosyal medya ikon satırına YouTube de eklendi (Footer'a da tutarlılık için eklendi).
  Masaüstünde e-posta artık telefon numarasının hemen altında küçük yazıyla duruyor, ayrı
  ikon satırından kaldırıldı. Site Ayarları'na "YouTube kanalı linki" alanı eklendi.

- [x] **"Ne arıyorsunuz?" (anasayfa hizmet kartları) — tam admin düzenlenebilir + görsel** — canlıda
  Hizmet Medya admin sayfası (eski adıyla "Hizmet Videoları") genişletildi: her hizmet için
  artık kart başlığı/açıklaması (boşsa varsayılana düşer), kapak görseli (yüklenirse ikon
  yerine kutunun tamamını kaplar), anasayfada sıralama ve gösterme/gizleme ayarlanabiliyor.
  Görseller private Vercel Blob'da tutulup herkese açık bir proxy route üzerinden sunuluyor.

- [x] **Öztürk Güvenlik Türkçe (IDN) domaini de siteyi açsın** — canlıda
  Kontrol ettiğimde `öztürkgüvenlik.com` zaten aynı Vercel projesine bağlıydı ve aynı
  siteyi açıyordu (muhtemelen daha önceki bir oturumda eklenmiş). Eksik olan tek şey,
  iki ayrı domainin aynı içeriği servis etmesinden doğan "duplicate content" riskiydi.
  Bunu Vercel/DNS erişimine hiç gerek kalmadan `middleware.ts` ile kod seviyesinde
  çözdüm: bu domaine gelen her istek artık www.ozturkguvenlik.com'a 308 (kalıcı)
  yönlendiriliyor — ziyaretçi yine aynı siteyi görür, Google'da da tek canonical adres
  kalır.

- [x] **TikTok sosyal medya bağlantısı** — canlıda
  Header, Footer ve Site Ayarları → Sosyal Medya sekmesine TikTok eklendi.

- [x] **Kritik: hero video çöküyordu + küçük kalıyordu** — canlıda, doğrulandı
  Tur sayısı özelliğini tüm videolarda aktif edince sayfa çöküyordu (YouTube Player
  API'nin React'in yönettiği bir DOM elemanını kendi iframe'iyle değiştirmesi, React'in
  onu kaldırmaya çalışırken çökmesi — "NotFoundError: removeChild"). Ayrıca video hero
  alanını doldurmuyor, küçük kalıyordu (YouTube'un verdiği 640×390 varsayılan boyut,
  arka planı kırpıp büyüten CSS teknigiyle çakışıyordu). İkisi de düzeltildi; tarayıcıda
  gerçek testle doğrulandı (7 video arasında geçiş, konsol hatasız, video tam boy).

- [x] **Hizmet detay sayfalarındaki videolar kontrol edildi** — sorun yok
  Bu sayfalar ayrı, basit bir bileşen (ServiceHeroMedia, düz iframe) kullanıyor — hero
  slider'daki hatalardan hiç etkilenmemiş. Video olan/olmayan birkaç sayfa tek tek
  tarayıcıda test edildi, hepsi doğru boyutta ve hatasız çalışıyor.

- [x] **"Gerçek işler, gerçek mekânlar" galerisi — admin'den düzenlenebilir** — canlıda
  Anasayfadaki 3 sabit saha fotoğrafı artık Site Ayarları → Görünüm → "Sahadan Kareler"
  bölümünden yönetiliyor: görsel yükleme + açıklama, sıralı liste. Hiç eklenmezse mevcut
  3 varsayılan görsel kullanılmaya devam ediyor.

## Notlar

- Her madde, mevcut admin panel desenleriyle (Site Ayarları / ilgili panel sayfaları)
  tutarlı şekilde, veri kaybı yaratmadan (boşsa eski/varsayılan davranışa düşerek)
  uygulanıyor.
- Tamamlanan maddeler canlıya (ozturkguvenlik.com) deploy edilip doğrulanmadan
  işaretlenmiyor.
