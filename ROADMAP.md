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

- [ ] **Header'a sosyal medya + e-posta ekle**
  Şu an header'da sadece telefon numarası var. Sosyal medya butonları ve e-posta adresi da
  eklenecek. Admin panelden (Site Ayarları) düzenlenebilir olacak.

- [ ] **"Ne arıyorsunuz?" (anasayfa hizmet kartları) — tam admin düzenlenebilir + görsel**
  Anasayfadaki hizmet kartları (şu an `lib/services.ts` içinde sabit kodlu) admin panelden
  düzenlenebilir hale gelecek: başlık, açıklama, görsel, sıralama, gösterme/gizleme.
  İkon yerine, kutucuğun tamamını kaplayan bir görsel kullanılabilecek (ikon fallback olarak
  kalacak, görsel yüklenmemişse mevcut görünüm bozulmayacak).

- [ ] **Floating WhatsApp butonuna etiket metni**
  Sağ altta sabit duran WhatsApp butonunun üzerine "Ücretsiz keşif" gibi kısa bir metin
  eklenebilecek. Admin Ayarlar sayfasından düzenlenebilir olacak.

## Notlar

- Her madde, mevcut admin panel desenleriyle (Site Ayarları / ilgili panel sayfaları)
  tutarlı şekilde, veri kaybı yaratmadan (boşsa eski/varsayılan davranışa düşerek)
  uygulanıyor.
- Tamamlanan maddeler canlıya (ozturkguvenlik.com) deploy edilip doğrulanmadan
  işaretlenmiyor.
