# Öztürk Güvenlik Sistemleri — mevcut site envanteri

Tarih: 19 Ağustos 2026  
Kaynak: canlı site (WordPress REST API, sitemap, ana sayfa HTML)  
Amaç: berbat mevcut siteyi sıfırdan yeniden kurmadan önce tüm metin, iletişim, hizmet ve görsel verisini tek yerde toplamak.

Bu dosyadaki metinler siteden olduğu gibi alınmıştır. Dil hataları, kopyala-yapıştır Wikipedia/rakipler ve boş WordPress varsayılan sayfaları da kasıtlı olarak belgelenmiştir; yeni sitede yeniden yazılacaklardır.

---

## 1. Kimlik ve marka

| Alan | Değer |
|---|---|
| Ticari unvan (sitede geçen) | Öztürk Güvenlik Sistemleri / Öztürk Kamera & Güvenlik Sistemleri |
| Kurucu / CEO | Recep Özkan Öztürk (sitede “Recep Özkan Öztürk,CEO”) |
| Kuruluş | 2014 |
| Dil | tr-TR |
| Unicode alan adı | öztürkgüvenlik.com |
| Punycode | xn--ztrkgvenlik-qfb4fd.com |
| Canlı URL | https://xn--ztrkgvenlik-qfb4fd.com/ |
| Site başlığı (SEO) | Front Page - öztürkgüvenlik.com |
| Telif | © 2025 (üst şerit) / © 2026 öztürkgüvenlik.com (alt bilgi) |
| Tema | Colibri / Althea WP (ana sayfa slug: `althea-wp`, sayfa ID 35) |
| SEO eklentisi | All in One SEO v4.9.7.2 |
| CMS | WordPress, PHP 8.2.30, LiteSpeed, Hostinger (hPanel) |
| Ana CTA | “ÜCRETSİZ KEŞİF ! Hemen arayın veya 7/24 Whatsapp hattına başvurun.” / “Hemen Teklif Al” |
| Chat balonu | “Size nasıl yardımcı olabilirim ?” |

### Marka görselleri

Ana logo (şeffaf PNG, yatay kırpılmış varyantlar mevcut):

- `assets/images/branding/logo/OZTURK_GUVENLIK_SISTEMLERI_logo-removebg-preview-1.png` (orijinal, 553×451)
- `assets/images/branding/logo/cropped-OZTURK_GUVENLIK_SISTEMLERI_logo-removebg-preview-1.png`
- `assets/images/branding/logo/cropped-cropped-OZTURK_GUVENLIK_SISTEMLERI_logo-removebg-preview-1.png` (OG görseli / favicon kaynağı)
- `assets/images/branding/logo/cropped-cropped-cropped-OZTURK_GUVENLIK_SISTEMLERI_logo-removebg-preview-1.png`
- `assets/images/branding/logo/cropped-OZTURK_GUVENLIK_SISTEMLERI_logo-removebg-preview-1-1.png`

CEO / misyon-vizyon fotoğrafı (sitede “erenyragi” dosya adıyla):

- `assets/images/homepage/misyon-vizyon/erenyragi.jpg`
- Elementor thumbnail: `assets/images/homepage/misyon-vizyon/erenyragi-r14iokfph505rilqzsmiew5eoy6zjhbg7i4b1050ss.jpg`

### Ana sayfa marka şeridi (partner logoları)

Dosya adlarından okunan markalar:

| Dosya | Muhtemel marka |
|---|---|
| `assets/images/branding/markalar/sasasa.png` | Belirsiz (dosya adı bozuk) |
| `assets/images/branding/markalar/seageta.png` | Seagate |
| `assets/images/branding/markalar/to-linkk.png` | TP-Link |
| `assets/images/branding/markalar/tp.png` | TP-Link (ikinci logo) |
| `assets/images/branding/markalar/unv.png` | Uniview (UNV) |
| `assets/images/branding/markalar/western.png` | Western Digital |
| `assets/images/branding/markalar/zkt-eco.png` | ZKTeco |

Yeni sitede bu logolar lisans / resmi marka kiti ile doğrulanmalı; mevcut dosyalar düşük çözünürlüklü ve isimleri rastgele.

---

## 2. İletişim

Sitede **e-posta adresi yayınlanmıyor**. WordPress yazar hesabı şu adresi kullanıyor (admin kimliği, sitede görünür iletişim alanı değil): `guvenlikozturk@gmail.com`

| Kanal | Değer |
|---|---|
| Telefon | 0535 014 65 93 (`tel:05350146593`) |
| WhatsApp | +90 535 014 65 93 |
| WhatsApp hazır mesaj | `Merhabalar Güvenlik Sistemleri İçin Fiyat Almak İstiyorum` |
| WhatsApp link | https://api.whatsapp.com/send/?phone=905350146593&text=Merhabalar%20Güvenlik%20Sistemleri%20İçin%20Fiyat%20Almak%20İstiyorum&type=phone_number&app_absent=0 |
| Instagram | https://www.instagram.com/ozturkgvnlk_/ |
| Facebook (1) | https://www.facebook.com/ozturkgvnlk |
| Facebook (2) | https://www.facebook.com/oztrkguvenlik/?locale=tr_TR |
| Adres (Google Maps iframe) | Turkey, İstanbul, Yenibosna Merkez Mahallesi, Kenanbey Sokak No: 11 |
| Maps sorgu | `Turkey İstanbul Yenibosna merkez mahallesi Kenanbey sokak no 11` |
| Google Place CID | `888030174088653510` |
| Google Place ID (yorum avatarlarından) | `ChIJD0FxFC2lyhQRxuphBL3qUgw` |
| Google puanı (widget) | 5.0 / 33 yoruma dayalı |
| Google işletme adı (widget) | Öztürk Kamera & Güvenlik Sistemleri |

Harita embed:

`https://maps.google.com/maps?q=Turkey%20İstanbul%20Yenibosna%20merkez%20mahallesi%20Kenanbey%20sokak%20no%2011&t=m&z=13&output=embed&iwloc=near`

Yorum yazarı fotoğrafları (Google widget): `assets/images/homepage/yorumlar/`

---

## 3. Hosting ve FTP (müşterinin verdiği)

Şifre bu sohbette **verilmedi**. Bu yüzden `public_html` FTP ile indirilmedi; içerik herkese açık siteden çekildi. Yeni kurulumda şifre gelince tam WP yedeği alınabilir.

| Alan | Değer |
|---|---|
| FTP sunucu | `ftp://46.202.156.93` |
| Kullanıcı | `u894652269` |
| Port | 21 |
| Hedef klasör | `public_html` |
| Panel | Hostinger hPanel |
| Sunucu | LiteSpeed |
| PHP | 8.2.30 |
| robots.txt | `/wp-admin/` yasak; sitemap: `/sitemap.xml` ve `/sitemap.rss` |

WordPress sayfa envanteri REST ile alındı: 15 sayfa, 1 yazı (varsayılan “Merhaba dünya!”), 90 medya öğesi.

---

## 4. Site haritası ve menü

Üst / alt menü (aynı yapı tekrarlanıyor):

1. Ana Sayfa → `/`
2. Hizmetlerimiz → `/urunlerimiz/` (sayfa başlığı: Hizmetlerimiz, slug hâlâ `urunlerimiz`)
3. Kameralar → `/kameralar/`
4. Yangın Alarm Sistemleri → `/yangin-alarm-sistemleri/`
5. Hırsız Alarm Sistemleri → `/hirsiz-alarm-sistemleri/`
6. Ses Ve Anons Sistemleri → `/ses-ve-anons-sistemleri/`
7. Akıllı Ev Sistemleri → `/akilli-ev-sistemleri/`
8. Bariyer Turnike Sistemleri → `/bariyer-turnike-sistemleri/`
9. PDKS Sistemleri → `/pdsk-sistemleri/` (slug yazım hatası: **pdsk**, doğru **pdks**)
10. Network Sistemleri → `/network-sistemleri/`
11. Yangın Tüpü → `/yangin-tupu/`
12. Fotokapan → `/fotokapan/`
13. Araç İçi Kamera → `/arac-ici-kamera/`

Sitemap’te olup menüde zayıf / boş olanlar:

- `/kamera-sistemleri/` — içerik boş
- `/ornek-sayfa/` — WordPress örnek sayfa (silinmeli)
- `/2025/02/05/merhaba-dunya/` — varsayılan yazı
- `/category/genel/` — varsayılan kategori

Ana sayfa hizmet kartları (menüden biraz farklı isimler):

1. Güvenlik Kamera Sistemleri
2. Hırsız Alarm Sistemleri
3. Akıllı Ev Sistemleri
4. Yangın Alarm Sistemleri
5. Acil Anons Ve Ses Sistemleri
6. Turnike Ve Bariyer Sistemleri
7. Yangın Tüpü
8. Fotokapan
9. Araç Kamerası

Hizmetlerimiz sayfasında ekstra iki kart: Network Sistemleri, PDKS Sistemleri.

---

## 5. Ana sayfa yapısı

Sıra kabaca şöyle:

1. Üst bar: logo, menü, telefon, sosyal, “Ücretsiz keşif / WhatsApp” çağrısı
2. Hero / slider (WhatsApp’tan atılmış sahne fotoğrafları + stok)
3. 9 hizmet kartı
4. Marka logoları şeridi
5. Misyon (CEO fotoğrafı + metin)
6. Vizyon (aynı CEO fotoğrafı + metin)
7. Google yorum widget (10 yorum gösteriliyor, toplam 33)
8. Harita
9. Footer: menü tekrarı, sosyal, telif, “Created for free using WordPress…” notu
10. Sabit WhatsApp sohbet butonu

Hero / slider görselleri: `assets/images/homepage/hero-slider/`

Tema stok görselleri (pxhere, Colibri demo; yeni sitede kullanılmamalı): `assets/images/homepage/stok-gorseller/` ve `assets/images/homepage/tema-gorselleri/`

---

## 6. Misyon ve vizyon (ana sayfa, birebir)

### Misyonumuz

Öztürk Güvenlik Sistemleri, 2014 yılından bu yana, güvenlik kameraları ve bilişim sistemleri alanında sektördeki en güvenilir çözüm ortağı olmayı hedeflemektedir. Misyonumuz, müşterilerimize en yüksek kalitede güvenlik çözümleri ve bilişim altyapıları sağlayarak, iş sürekliliklerini güvence altına almak ve teknolojik gelişmeleri her zaman bir adım önde takip etmektir. Müşterilerimizin ihtiyaçlarına özel, yenilikçi ve özelleştirilmiş çözümler sunarak, onların güvenliğini ve verimliliğini en üst düzeye çıkarmak amacındayız. Güvenlik ve teknolojiye dair her alanda güçlü bir hizmet anlayışını benimseyerek, tüm projelerde yüksek standartlarda hizmet sunmayı taahhüt ediyoruz.

### Vizyonumuz

Öztürk Güvenlik Sistemleri olarak, teknoloji dünyasında güvenlik ve bilişim sistemleri alanında lider bir marka olmayı amaçlıyoruz. Vizyonumuz, güvenlik teknolojileri ve bilişim çözümlerindeki yenilikleri sürekli olarak takip edip, bu yenilikleri müşterilerimize en hızlı ve etkili şekilde sunarak sektördeki öncü firmalardan biri olmaktır. Müşterilerimizin güvenlik ihtiyaçlarını geleceğe yönelik çözümlerle karşılamak, teknolojiyi iş süreçlerine entegre ederek daha verimli ve güvenli bir ortam yaratmak en büyük hedefimizdir. Her geçen yıl, dünya çapında güvenlik ve bilişim alanındaki gelişmeleri takip ederek, global standartlarda hizmet sunmayı ve sektördeki en iyi uygulamaları hayata geçirmeyi sürdüreceğiz.

---

## 7. Google yorumları (sitede görünen 10 kayıt)

Widget: **Öztürk Kamera & Güvenlik Sistemleri — 5.0 — 33 yoruma dayalı**

### Furkan Pamuk — 4 ay önce

Kentsel dönüşüm kapsamında yaptırdığımız yeni binamıza kamera sistemi kurulumu için Öztürk Güvenlik ile çalıştık ve gerçekten çok memnun kaldık. Hem keşif sürecinde hem montaj aşamasında son derece ilgili ve profesyonel davrandılar. Kullanılan ekipmanlar kaliteli, görüntü netliği çok iyi. Kurulum hızlı ve temiz şekilde yapıldı. Güvenlik konusunda içimiz rahatladı. Gönül rahatlığıyla tavsiye ederim. Özkan beye teşekkürler.

### Muhammed — 4 ay önce

Öztürk Güvenlik Kamera firmasıyla çalışmaktan memnun kaldık. Kurulum hızlı ve sorunsuzdu, ekip hem ilgili hem de işinde profesyoneldi. İletişimleri samimi, hizmetleri güven verici. Tavsiye ederim.

### Cebrail — 4 ay önce

Öztürk ailesine ilgi alakalarıdan dolayı teşekkür ederim tavsiye ederim

### KomikHaus — 4 ay önce

Öztürk ailesine teşekkür ediyorum ilgi ve alakalarından ötürü aile ortamı var yabancılık cekmezsiniz herkese tavsiye ederim

### Abdulsamed Çolak — 4 ay önce

İnstagramdan denk gelip aradık gün içinde ücretsiz keşif yapıp 3 gün içinde montajımızı tamamlayıp teslim ettiler gerçekten işlerini başarıyla titizlikle yapan bir firma keşif yaptırıcaktım sadece araştırma aşamasındaydım keşife gelen Özkan Bey ihtiyacım olduğunu hissettirdi gerçekten de öyleymiş ellerine emeklerine sağlık...

### Halil Güler — 8 ay önce

Öztürk Kamera Güvenlik Sistemlerinden hizmet aldım, işlerini temiz ve düzgün yapıyorlar. Kurulum hızlı oldu, kameraların görüntü kalitesi iyi. Sorularımda da yardımcı oldular, memnun kaldım. Tavsiye ederim.

### İzzetcan Özcan — 1 yıl önce

İnternetten ulaştık Özkan bey ilgilendi bizimle çok güler yüzlü ve işin ehli bir insandı çok teşekkür ederim taktiği. Ürünlerden çok memnun kaldık

### Berat Kaya — 2 yıl önce

ofisimize parmak okuyucu sistemi taktırdım personel takibim çok kolaylaştı çalışma saatine göre ücret takibi dahi yaptırabiliyorum Özkan beye teşekkürler

### Adem SERTDEMİR — 2 yıl önce

Şirinevler‘de bir tane mağazam var buranın kamera sistemi Öztürk güvenlik tarafından yapıldı. Çok memnun kaldım başarılar diliyorum.

### abdullah kartal — 2 yıl önce

Müşteri memnuniyeti, İlgi ve alakalarından dolayı öztürk güvenliğe teşekkür ederiz

Yorumlardan çıkan operasyonel gerçekler (yeni site için kullanılabilir iddia):

- Ücretsiz keşif, aynı gün keşif / birkaç gün içinde montaj
- Kentsel dönüşüm / yeni bina kamera kurulumu
- Şirinevler mağaza işi
- Ofis PDKS / parmak okuyucu, mesai ve ücret takibi
- Instagram üzerinden gelen müşteri
- Aile işletmesi algısı, Özkan Bey sahada

---

## 8. Hizmet sayfaları — tam metinler

Görseller ilgili klasörde. Birçok metin genel bilgi / Wikipedia-tarzı; firma özgün anlatımı zayıf. Yeni sitede yeniden yazılacak.

### 8.1 Kameralar — `/kameralar/`

Görseller: `assets/images/services/kameralar/`

**Güvenlik Kamera Sistemleri**

Açıkçası insan bir anda her yerde olamaz. Bütün korumak istediğin bölgeleri, bir güvenlik görevlisi tek başına izleyemez. Ancak güvenlik sistemleri, tek bir güvenlik görevlisi ile tüm bölgelerini izlemene olanak sağlar. En basit tanımıyla, kamera güvenlik sistemi bir kamera, bir monitör, bir kayıt cihazı ve onları bağlayan bir kablodan oluşur. Bu tarz sistemlere kapalı devre televizyon sistemleri(CCTV) denir. Bu tarz sistemler, orada olmadan izlemek istediğiniz bölgeyi izlemenize yardımcı olurlar.

**IP KAMERA NEDİR ?**

IP kameralar CCD ya da CMOS sensöründen sağladığı analog sinyali üzerlerindeki tümleşik DVS (Digital Video Server) ile işleyip sayısala çevirerek Ethernet bağlantı noktasından yayın yapabilen kameralardır. Ana IP kamera türleri şunları içerir: sabit kameralar, PTZ kamera ve çok sensörlü kameralar. Yaygın olarak geleneksel CCTV (Closed Circuit Television) sistemlerinde olduğu gibi güvenlik amaçlı gözetim ve video kaydı tutmak amacıyla kullanılırlar. Bununla birlikte sadece gözetim ya da personel takibi amacıyla da tercih edilmektedirler. IP kameralar ile alınan video kaydı, bir yazılım yardımıyla bilgisayar ortamında saklanabileceği gibi; Hybrid DVR (Digital Video Recorder) üzerinde veya NVR (Network Video Recorder) üzerinde de saklanabilir.

Endüstriyel kullanım için üretilen ve Gigabit (1000mbit/s) Ethernet bağlantı noktasına sahip türevleri de bulunmaktadır.

**AHD KAMERA**

AHD Kamera, yüksek görüntü elde edebilen Analog HD kamera sistemleri anlamına gelmektedir. Analog CCTV altyapısı kullanılarak 720p ve 1080p çözünürlüklerde görüntü alabilen yüksek düzey performansa sahip kamera sistemleridir. HD Kalite de görüntü elde eden bu cihazlar koaksiyel kablo aracılığıyla aktarılan analog video sinyallerini işlemektedir. 2014 yılının son çeyreğinde duyurulan AHD teknolojisi, AHD-DVR dijital kayıt cihazı tarafından işlenerek kaydedilmektedir.

**KAYIT CİHAZI**

DVR ya da Digital Video Recorder olarak da bilinir. Analog video sinyallerini önce sayısala dönüştüren ve sabit disk (HDD) içerisinde depolayan kayıt cihazıdır. Genel olarak elektronik güvenlik endüstrisinde kullanılırlar. Kişisel kullanıma özgü versiyonları PVR Personal Video Recorder olarak bilinir. Günümüzde DVR'ların 4, 8, 16, 24, 32 ve 64 kanal çeşitleri bulunmaktadır.

Sayfada kullanılan / çekilen görseller:

- `guzel-gfibi.jpg` (banner)
- `652-8-kamerali-gece-goruslu-set-ahd-kamera-sistemi-tak-calistir-8liset-jpg-8liset-e1738965051701.jpg` (AHD set)
- `61TXppI2OdL._AC_UF1000,1000_QL80_.jpg` (Amazon’dan hotlink; yeni sitede kullanılmamalı)
- Kartlar: `h.jpg`, `haho6.jpg`
- Medya kütüphanesinde duran analog/HD kıyas görselleri: `assets/images/media/kullanilmamis/HD-ANALOG-FARKI-*.jpg`

Harici 404: `https://www.optimumteknoloji.com.tr/img/haber/IP-Kamera-Sistemleri-Kurulumu.jpg`

### 8.2 Hırsız Alarm Sistemleri — `/hirsiz-alarm-sistemleri/`

Görseller: `assets/images/services/hirsiz-alarm/`

Hırsız güvenlik sistemleri, bireylerin ve işletmelerin güvenliğini sağlamak için kritik bir öneme sahiptir. Bu sistemler, izinsiz girişleri tespit etmek ve olası hırsızlık girişimlerini önlemek amacıyla tasarlanmıştır. Öztürk Güvenlik Sistemleri, bu alanda uzmanlaşmış bir firma olarak, yüksek kaliteli hırsız güvenlik sistemleri sunarak müşterilerine güvenli bir ortam sağlamaktadır. Kurulum süreçleri, profesyonel ekipler tarafından gerçekleştirilerek, sistemlerin etkin bir şekilde çalışmasını ve uzun ömürlü olmasını garanti eder.

Öztürk Güvenlik Sistemleri, sunduğu hırsız güvenlik sistemleri ile kullanıcıların ihtiyaçlarına uygun çözümler geliştirmektedir. Hareket sensörleri, kapı ve pencere sensörleri, alarm sistemleri gibi çeşitli bileşenler, her türlü ortamda etkili bir güvenlik sağlar. Kullanıcı dostu arayüzleri sayesinde, sistemlerin yönetimi oldukça kolaydır. Ayrıca, uzaktan erişim imkanı sunarak, kullanıcıların güvenlik durumlarını her an kontrol etmelerine olanak tanımaktadır.

Hırsız güvenlik sistemlerinin kullanımı, sadece hırsızlıkları önlemekle kalmaz, aynı zamanda olay anında hızlı müdahale imkanı da sağlar. Özellikle iş yerleri, alışveriş merkezleri ve konutlar gibi alanlarda, bu sistemler sayesinde izinsiz girişler anında tespit edilir ve gerekli önlemler alınır. Öztürk Güvenlik Sistemleri, sistemlerin sürekli bakımını ve güncellemelerini yaparak, güvenilir bir hizmet sunmayı hedeflemektedir. Müşteri memnuniyetini ön planda tutarak, her zaman en iyi çözümleri sunmaya çalışmaktadır.

Sonuç olarak, Öztürk Güvenlik Sistemleri, hırsız güvenlik sistemleri konusunda geniş bir ürün yelpazesine sahip olup, sektördeki deneyimi ile öne çıkmaktadır. Sağladığı güvenlik çözümleri, hem bireysel hem de kurumsal müşteriler için büyük bir avantaj sunmaktadır. Kurulum, kullanım ve bakım konusundaki profesyonellikleri, Öztürk Güvenlik Sistemleri’ni tercih edenlerin güvenliğini artırmakta ve huzurlu bir yaşam alanı sağlamaktadır.

Görseller: `hirsiz_alarm_sistemi_888777-850x850-1-e1739040144446.jpeg`, kart `haho7.jpg`

### 8.3 Akıllı Ev Sistemleri — `/akilli-ev-sistemleri/`

Görseller: `assets/images/services/akilli-ev/` (hotlink: galip.com.tr `akilli-ev-sistemi.jpg`)

Teknolojinin ilerlemesiyle evler, akıllı sistemlerle daha konforlu, güvenli ve enerji verimli hale geliyor. Öztürk Güvenlik Sistemleri, akıllı ev sistemleri kurulumunda profesyonel hizmet sunarak, evlerinizi geleceğe taşıyor.

**Akıllı Ev Sistemlerinin Avantajları**

Akıllı ev sistemleri, evdeki cihazları bir araya getirerek uzaktan kontrol ve otomasyon sağlar. Aydınlatma, ısıtma, güvenlik ve eğlence sistemleri, tek bir platformdan yönetilebilir hale gelir.

- Konfor: Aydınlatma, ısıtma gibi işlevler otomatikleşir ve günlük rutinlerinizde kolaylık sağlar.
- Enerji Tasarrufu: Akıllı termostatlar, enerji kullanımını optimize ederek tasarruf sağlar.
- Güvenlik: Akıllı güvenlik sistemleri, 7/24 izleme ve anlık bildirimlerle evinizi korur.
- Eğlence: Eğlence sistemleri, sesli komutlar veya uygulamalarla merkezi olarak yönetilebilir.

**Kurulum Süreci**

Öztürk Güvenlik Sistemleri, kurulum sürecinde şu adımları izler:

1. İhtiyaç Analizi: Ev sahiplerinin ihtiyaçları belirlenir.
2. Tasarım: Akıllı ev sistemleri tasarlanır ve cihazlar seçilir.
3. Kurulum: Cihazlar monte edilir, sistemler entegre edilir.
4. Test ve Devreye Alma: Sistemler test edilip devreye alınır.
5. Bakım ve Destek: Kurulum sonrası bakım ve destek hizmetleri sunulur.

Sonuç: Öztürk Güvenlik Sistemleri, evlerinizi akıllı sistemlerle donatarak, yaşam kalitenizi artırır. Akıllı ev sistemleri, modern yaşamın bir gerekliliği haline gelmiştir ve Öztürk Güvenlik Sistemleri, bu ihtiyaçlarınızı karşılamak için profesyonel çözümler sunar.

### 8.4 Yangın Alarm Sistemleri — `/yangin-alarm-sistemleri/`

Görseller: `assets/images/services/yangin-alarm/` (`ihbar-1.png`, `yangin-amlama.jpg`)

**Yangın Alarm Sistemi Nedir ve Nasıl Çalışır?**

Yangın alarm sistemi duman, yangın, karbon monoksit ya da yangınla ilgili diğer tehlikeler algılandığında insanları uyaran, duman ve ısı dedektörleri tarafından otomatik olarak ya da yangın alarm butonu gibi butonların kullanımı ile manuel olarak aktifleştirilebilen sistemlerdir. Ev ve iş yeri yangın alarm sistemleri her ne kadar farklılık gösterse de temel işlevleri aynıdır. Ancak ev tipi yangın alarm sistemleri daha küçük bir alanda kullanıldığı için daha az sayıda bileşene sahiptir. Günümüzde yaygın olarak konvansiyonel ve adreslenebilir olmak üzere iki farklı türde yangın alarmı kullanılmaktadır.

**Yangın Alarm Sistemi Nedir?**

Sahip olduğu bileşenler sayesinde ortamdaki dumanı, ısıyı veya her ikisini birden algılayarak bireylerin tehlikeden haberdar olmasını sağlayan; yangının çıktığı ortamdan insanların hızla tahliye edilmesini ve yangının kolluk kuvvetlerine hızlı şekilde bildirilmesini mümkün kılan güvenlik sistemleri, yangın alarm sistemi olarak adlandırılır.

Konvansiyonel yangın alarm sistemleri oldukça basit, yaygın ve ticari alanlarda sıkça kullanılan yangın algılama sistemi olarak karşımıza çıkar. Konvansiyonel sistemler, güvenilirlikleri ve düşük maliyetleri sayesinde küçük ve orta büyüklüklerdeki binalar için ideal nitelik taşır. Sistem tüm bileşenlerin bağlandığı alarm kontrol panelinden yönetilir. Bu panele sabit teller aracılığı ile bağlı duman, alev ya da ısı dedektörleri bulunur. Kontrol paneli dedektörlere ek olarak alarm zili ya da flaş lamba sisteminin diğer bileşenlerinin de kontrol edildiği ana merkezdir.

Adreslenebilir yangın alarm sistemleri ise yeni nesil teknolojilerden yararlanmaktadır. Bu sistemlerde duman veya ısı dedektörleri ve çekme anahtarı gibi sistem bileşenleri benzersiz bir adrese sahiptir. Bu tasarım aynı zamanda arızalı cihazların izole edilmesini, bu şekilde sorun giderme ve servis işlemlerinin de daha kolay gerçekleştirilmesini sağlar. Adreslenebilir sistem bileşenlerinde yer alan tüm cihazlar bina içerisinden geçen tek bir kablo döngüsüne yerleştirilebilmektedir. Bu sayede sistemin çalışması için konvansiyonel sistemlere oranla daha az kablolama yapılması yeterli olur. (Not: sitede “Konvansiyonel sistemler bu yönüyle kablosuz yangın algılama sistemi olarak da bilinir.” cümlesi teknik olarak yanlış.)

**Yangın Alarm Sistemi Nasıl Çalışır?**

Konvansiyonel de olsa adreslenebilir de olsa “Yangın alarm sistemi nasıl çalışır?” sorusunun cevabı temelinde aynıdır. Sistemde yer alan dedektörlerin duman ya da ısı algılaması sonucunda alarm sistemini harekete geçirmesiyle birlikte yangın alarm sistemi çalışmaya başlar. Sistemde ısı, duman, karbon monoksit ya da çoklu sensörlü yangın alarm dedektörü kullanılabilmektedir. Bu dedektörler yüksek teknolojiyle üretildiği için oldukça hassastır ve yangının başlamasıyla alarm sistemini devreye alır.

**Yangın Alarm Sistemi Nasıl Kurulur?**

Yangın algılama sistemlerinin tek bir kurulum şeması yoktur. Her binanın farklı yapısı, boyutu, kullanım amacı olması nedeniyle yangın sistemlerinin de mekâna özel bir şekilde belirlenmesi ve kurulumunun gerçekleştirilmesi gerekir. Ev tipi yangın alarm sistemleri nispeten kolay kuruluma sahip olsa da işlemin uzmanlar tarafından gerçekleştirilmesi son derece önemlidir. Ev tipi sistemlerde görece daha az bileşen kullanılmaktadır. İş yeri tipi sistemlerde ise gelişmiş söndürme araçları da dahil olmak üzere daha farklı ve daha çok sayıda bileşen yer alır. Ev ya da iş yeri fark etmeksizin başarılı bir sistem için binanın uzmanlar tarafından incelenmesi, doğru ihtiyacın belirlenmesi ve bu doğrultuda kurulumun gerçekleştirilmesi gerekir.

### 8.5 Ses ve Anons Sistemleri — `/ses-ve-anons-sistemleri/`

Görseller: `assets/images/services/ses-anons/` (`4430728547-acil-anons-ses-sistemi.jpg`, `ses.jpg`)

**Acil Anons & Ses Sistemleri**

Seslendirme ve anons sistemleri, bir yerde veya bir alanda duyulan sesleri kontrol etmek için kullanılan bir elektronik sistemdir. Bu sistemler, halka açık alanlarda veya geniş ofislerde birçok amaç için kullanılabilirler. Bu amaçlar arasında, güvenlik uyarıları, anonslar, müzik yayını, reklam yayını, yönlendirme mesajları gibi birçok farklı seçenek bulunur. Seslendirme ve anons sistemleri, hoparlörler, mikrofonlar, amplifikatörler ve diğer bileşenlerden oluşur.

Genel seslendirme ve anons sistemleri birçok fayda sağlarlar. İşletmeler ve kuruluşlar, bu sistemlerin kullanımı ile şu avantajları elde ederler:

**Güvenlik**

Seslendirme ve anons sistemleri, birçok işletme ve kuruluş için önemli bir güvenlik aracıdır. Acil anons sistemi ile acil durumlarda, bu sistemler güvenlik personelinin hızlı bir şekilde müdahale etmesini sağlar. Yangın, hırsızlık, sel ve diğer acil durumlar için uyarı yayınlayarak, insanların güvenli bir şekilde tahliye edilmesini sağlarlar.

**Yönlendirme**

Seslendirme sistemleri, birçok işletme ve kuruluş için yol gösterici bir araçtır. Bu sistemler, insanların bir alanda hareket etmesini kolaylaştıran yönlendirme mesajları yayınlayabilirler. Örneğin, bir havaalanında yolcuların hangi kapıdan uçağa binmeleri gerektiğini belirten anonslar yayınlanabilir.

**İletişim**

Seslendirme ve anons sistemleri, birçok işletme ve kuruluş için bir iletişim aracıdır. Bu sistemler, duyuru yapmak, mesaj iletmek veya bir olay hakkında bilgilendirme yapmak için kullanılabilirler. Örneğin, bir alışveriş merkezinde, müşterilere özel teklifler hakkında bilgi veren anonslar yayınlanabilir.

### 8.6 Bariyer ve Turnike Sistemleri — `/bariyer-turnike-sistemleri/`

Görseller: `assets/images/services/bariyer-turnike/` (`Medium_0529119c-6c51-4cec-9e72-3b67dbaf960a-1.jpg`, `durnike.jpg`)

**Bariyer Sistemleri Nedir?**

Bariyer Sistemleri, yaya erişim kontrol kapısıdır. Bu tür bir kapı, açılıp kapanan kanada ya da kanatlara sahip olabilir. Engelli erişilebilirliğe ihtiyaç duyulduğunda güvenlik kanatları kullanılır, ancak erişim kontrol güvenliği hala gereklidir. Bu kapılar, elektronik optik turnikelerle entegrasyon dahil olmak üzere, turnike geçiş kontrol sistemleriyle birlikte çalışacak şekilde ayarlanabilir.

**Bariyer Sistemleri Varyasyonları**

ADA uyumlu motorlu ve kendiliğinden kapanan kanatlı kapılar, döner kollu optik turnikeler ile birlikte kanatlı güvenlik kapıları olarak kabul edilir. Yapı ve bazı işlevler açısından farklılık gösterse de, hepsi açılır ve erişimi kontrol etmek için kullanılır. Tüm bu kapılar tek yönlü veya çift yönlü erişim için yapılandırılabilir. Güvenlik kanatlı kapılar, özellikle engelli giriş çözümleri olarak kullanıldığında birçok uygulama için esnek erişim kontrol seçenekleridir.

**Bariyer Sistemleri Uygulamaları**

Engelli erişilebilirlik gerektiğinde erişimi kontrol etmek için genellikle bir güvenlik salıncak kapısı kullanılır. Bir yayanın fiziksel sınırlamalar nedeniyle turnikeyi kullanamaması durumunda sürekli güvenlik sağlar. Turnike güvenlik kanatlı kapılar, ofis lobileri, stadyumlar, ofis binaları, depolar ve metro sistemleri gibi normal turnikelerin kullanıldığı çoğu yerde sıklıkla kullanılabilir. Entegre güvenlik için turnike geçiş kontrol sistemleri ile çalışmak üzere programlanmıştır.

Bariyer sistemleri yüksek kaliteli, teknolojik olarak gelişmiş güvenlikli turnike giriş çözümleridir. Görünmez kızılötesi ışınlarla birbirine bağlanan iki kabinden oluşurlar. Bu dolaplar, bir kişinin optik turnike şeridinden ne zaman geçtiğini söylemek için kızılötesi ışınları kullanır. Bir kişi uygun boşluk olmadan girmeye çalıştığında, görsel veya işitsel bir uyarı tetiklenir. Turnike bir bariyere sahipse, bariyer, erişimi etkili bir şekilde reddetmek için uyarılarla birlikte açmayı reddedecektir. Optik turnikeler, modern erişim kontrol sistemleriyle entegre olmak için gelişmiş yazılım kullanır ve bir IP ağı aracılığıyla uzaktan kontrol edilebilir.

### 8.7 Yangın Tüpü — `/yangin-tupu/`

Görseller: `assets/images/services/yangin-tupu/` (`23323.jpg`, `am-tupu.jpg`)

Yangın söndürücü, genellikle acil durumlarda küçük yangınları söndürmek veya kontrol etmek için kullanılan aktif bir yangından korunma cihazıdır. Tipik olarak, bir yangın söndürücü, yangını söndürmek için boşaltılabilen bir madde içeren, elde tutulan bir silindirik basınçlı kazan’dan oluşur. Silindirik olmayan basınçlı kaplarla üretilen yangın söndürücüler de mevcuttur, ancak daha az yaygındır.

İki ana tip yangın söndürücü vardır: depolanmış basınçlı ve kartuşla çalışan. Depolanan basınç birimlerinde, tahliye maddesi, yangın söndürme maddesinin kendisi ile aynı bölmede depolanır. Kullanılan ajana bağlı olarak farklı itici gazlar kullanılır. Kuru kimyasal söndürücülerde genellikle nitrojen kullanılır; su ve köpük söndürücüler tipik olarak hava kullanır.

Bilinen ilk yangın söndürücü, 1723’te İngiltere’de Ambrose Godfrey tarafından patentlendi.

(Not: bu metin neredeyse Wikipedia. Yeni sitede ürün/hizmet odaklı yazılmalı.)

### 8.8 Fotokapan — `/fotokapan/`

Görseller: `assets/images/services/fotokapan/` (`ormanlara-fotokapanli-destek-vitrin.jpeg`, `ayu.jpg`)

Fotokapan, hareket sensörü veya kızılötesi sensör ile donatılmış veya tetikleyici olarak bir ışık demeti kullanan, uzaktan etkinleştirilmiş bir kameradır. Kamera yakalama, araştırmacılar yoksa vahşi hayvanları film üzerinde yakalamak için kullanılan bir yöntemdir ve onlarca yıldır ekolojik araştırmalarda kullanılmıştır. Avcılık ve yaban hayatı görüntüleme uygulamalarına ek olarak, araştırma uygulamaları arasında yuva ekolojisi, nadir türlerin tespiti, nüfus büyüklüğü ve tür zenginliğinin tahmin edilmesi yanı sıra insan yapımı yapıların yaşam alanı kullanımı ve işgali araştırmaları da yer almaktadır.

Fotokapanlar, iz kamera olarak da bilinirler, mümkün olduğunca az insan karışımı ile yaban hayatı görüntülerini yakalamak için kullanılırlar. 1990’lı yılların başlarında ticari kızıl ötesi tetiklemeli kameraların kullanıma sunulmasından bu yana kullanımları arttı. Kamera ekipmanının kalitesindeki ilerlemelerle bu saha gözlem yöntemi, araştırmacılar arasında daha popüler hale geldi. Avcıların kamera tuzakları geliştirmelerinde avlanma önemli bir rol oynamıştır, çünkü avcılar oyunu avlamak için kullanıyorlar. Bu avcılar, zamanla pek çok yeniliğe yol açan cihazlar için bir ticari pazar açtılar.

### 8.9 Araç İçi Kamera — `/arac-ici-kamera/`

Görseller: `assets/images/services/arac-ici-kamera/` (`arac-ici-kamera-2.jpg`, `arac-ici-kamera-2-1.jpg`, `arac-kamerasi-nasil-takilir.jpg` — Cloudinary/tasit.com hotlink)

Araç yol kamerası, araç içinde kullanılan ve ses ile görüntü kaydında bulunan bir tür kameradır. Pek çok amaç için kullanılabilen araç yol kamerasının en önemli fonksiyonu, kaza gibi beklenmedik durumlarda olayın detaylı bir şekilde analiz edilmesini mümkün kılmasıdır. Ayrıca araç içi kamera, sürüş deneyiminin artmasını sağlar. Bu ve bunun gibi nedenlerden ötürü araç içi kameraları sıklıkla tercih edilmektedir.

**Araç Yol Kamerası Nedir?**

Araç yol kamerası, araç içinde görüntü alan ve ses kaydında bulunan fonksiyonel bir kamera olarak tanımlanabilir. Aracın seyir halinde görüntüsünü kaydeden bu tür kameralar, yolun uzaktan izlenebilmesini mümkün kılar. Bunun yanı sıra kaza gibi beklenmedik durumlarda kayıt alan ve kanıt olarak sunulabilecek görüntülere imkan tanıyan araç içi kameralar, sürücülerin yaşadıkları olumsuzlukları daha sonra değerlendirmelerini olanaklı hale getirir. Araç içi kameraları temel olarak sürücülerin sürüş deneyimlerini arttırmaları amacıyla tasarlanmıştır. Bunun yanı sıra güvenli sürüş de bu tür kameraların üretilme nedenleri arasında yer alır. Otomobilin hareketliliği esnasında bilgi toplayan, sürücülerin sürüş stillerini geliştirmelerine destek olan araç yol kamerası yenilikçi bir kullanım sunmaktadır.

**Araç Yol Kamerası Ne İşe Yarar?**

- Sürüş sırasında öndeki veya arkadaki yolun kaydedilmesini sağlar.
- Video ile ses kaydı yapar.
- Araç kaza yaptığında veya trafik kazalarında delil olarak kullanılabilir.
- Yolculukların videoya alınmasını sağlar. Bu sayede daha sonradan izlenebilen videolar ortaya çıkar.
- Kişinin sürüş deneyiminin artmasına katkıda bulunur.
- Park kazalarının önlenmesine destek olur. Aracınızı çok daha etkili bir şekilde park etmenizi sağlar.

**Araç Yol Kamerası Kullanım Alanları**

İşlevsel bir kullanım sunan araç yol kameraları, oldukça geniş bir kullanım alanına sahiptir. Öncelikle araç içinde video ve ses kaydı alınmasını sağlar. Bu nedenle araç içi kullanımı son derece yaygındır. Araç içi kamera 360 derece bir görüntüyü mümkün kılar. Aracın hem ön hem de arka kısmından görüntü alınmasına katkıda bulunur. Araç yol kameralarının kullanım alanlarından bir diğeri de aracın arka ya da ön kısmındaki yolun görüntüye alınmasıdır. Özellikle kaza gibi durumlarda, araç yol kamerasının almış olduğu görüntü kanıt olarak değerlendirilebilir. Araç yol kameralarının sıklıkla kullanıldığı alanlardan bir diğeri de sürüş deneyiminin arttırılması için görüntü almadır. Kameranın çekmiş olduğu görüntüyü izleyen sürücü, sürüş sırasında yaptığı hataları çok daha kolay bir şekilde fark edebilir. Bu hataları tekrarlamayarak çok daha yenilikçi bir sürüş deneyimi elde edebilir.

**Araç İçi Kamera Neden Gereklidir?**

Araç içi kamera önerisi kapsamında pek çok farklı kamera çeşidi yer alır. Fakat araç içi kameraların birtakım özellikleri benzerdir. Bu tür kameralar araç içinde görüntü ve ses kaydının efektif bir şekilde alınmasını sağlar. Bu özelliği son derece dikkat çekicidir. Araç içi kameralar caydırıcı bir nitelik taşıdığından meydana gelebilecek dolandırıcılıkların önlenmesini sağlar. Trafik ihlalleri, trafikte oluşabilecek kazalar gibi olumsuz durumların kaydedilmesine olanak tanıyan araç içi kameraları; bu tür nedenlerden ötürü de tercih edilmektedir. Araç içi kamera tavsiye kapsamında kaliteli ve fonksiyonel ürünlerin satın alınması son derece önemli. Çünkü ancak kaliteli ürünler yenilikçi bir şekilde ve uzun süre kullanılabilmektedir.

### 8.10 Network Sistemleri — `/network-sistemleri/`

Görseller: `assets/images/services/network-sistemleri/` (`ag-network-sistemleri-nedir-1024x683-1.jpg`)  
Harici 404/SSL: bilgesis.com.tr network fotoğrafı indirilemedi.

**Data ve Network Sistemleri Nedir?**

Data ve network sistemleri bilgi ve sistem kaynaklarının farklı kullanıcılar tarafından paylaşıldığı, bir yerden bir yere veri aktarımını sağlayan iletişim sistemlerinin bütünüdür. Bu sistemler kablolu veya kablosuz olarak kaynak paylaşımının yanı sıra ağ haberleşmesini mümkün kılar. Data ve network sistemlerine yapılan yatırımlar bilişim ve güvenliği alanındaki en uzun ömürlü, verimli ve yatırımın karşılığını tam anlamıyla veren yatırımlardır.

Data ve network sistemleri asıl olarak sistemleri internetteki verilerin saklanıp korunduğu bir depodur. Bilgisayardaki sistemlerle diğer sistemleri barındıran geniş bir serverdir. Fiziksel olarak tüm verilerin depolandığı sürücü sistemi içinde bilgisayarı işleten sistemin odaları yer alır. Yangın söndürme alarmları, jeneratörler, güvenlik açıkları hep bu sunucu altında toplanır. Oluşabilecek durumları tehlike seviyelerine göre nitelendirip güvenlik altyapısı oluşturulur. Güvenlik altyapısının tek bir altyapı sistemi altında toplanması, acil durumlara tek elden müdahale edebilmeyi kolaylaştırır.

Data ve network sistemleri bir binada, kampüs veya şirkette birçok sistemin bağlı olduğu temel altyapıdır. Giderek daha fazla sistem ve uygulama veri ağına bağlı hale gelmektedir.

Kapsam:

- Yerel Alan Ağı
- Geniş Alan Ağı
- Veri Merkezi
- Ağ Güvenliği
- Ağ Optimizasyonu ve Yönetimi
- VLAN, IP Adresi, Port Yapılandırma Veritabanı Tasarımı

Yerel alan ağı fiziksel olarak birbirine yakın ağların birbirine bağlantı kurmasını sağlayan ağ yapısıdır, birçok şirket veya evde kullanılan sistemdir.

Geniş alan ağları en geniş kapsamlı ağdır. Birden fazla cihazın birbiri ile bağlanmasını ve iletişim kurmasını sağlayan ağdır. Yerel olarak kurulan ağların birbirine bağlaması sağlayan en geniş ağ çeşididir. Farklı LAN ağlarının birbirine bağlanmasıyla haberleşeme sağlayan büyük bir ağ oluşturur.

Veri merkezleri ticari barındırma sistemleri ve internet servis sağlayıcıları olarak 2 kategoriye ayrılır. Ticari özel barındırma sistemlerini şirketler bünyelerindeki iletişimin hızlı ve güvenli bir şekilde olması açısından tercih ederler. Bu sistem şirketlerin güvenlik sistemlerinin tek bir server altında toplanmasını sağlar. Bu sayede orunlara çabuk ve etkin çözümler üretilir. Web hosting servis sağlayıcıları ve hat bulundurma hizmeti şirketlerin en çok tercih ettiği hizmetler arasındadır. İnternet servis sağlayıcıları ise, genellikle günlük ihtiyaçları için kullanılır. Fiber altyapı sayesinde internette güvenlik sorunu çözülür.

**Data ve Network Sistemleri Nasıl Çalışır?**

Sistemlerin hızlı ve verimli çalışması ise network kablolamaya bağlıdır. Eksik yapılan kablolama, daha büyük sorunların yaşanmasına neden olur. Kablolama alt yapısı kurumların toplam network yatırımlarının yüzde 2’sini oluştururken, karşılaşılan network sorunlarının yüzde 80′ i yanlış uygulanmış kablolamadan kaynaklanmaktadır. Bu noktada devreye yapısal kablolama girmektedir. Yapısal kablolama network sisteminin en uzun süre kullanılan parçası olarak kabul edilir ve networklerin can damarı yapısal kablolama olarak tanımlanır.

Yapısal kablolama, ihtiyaç duyulan büyük veri iletişimini karşılamak için kablolama altyapısının standartlara uygun şekilde kurulması işlemidir. doğru yapılan bir yapısal kablolama, sistemlerin sorunsuz ve hızlı çalışmasını sağlar.

**Kullanım Alanları**

Küçük işletmeler, büyük uluslararası şirketler, binalar, kampüsler, okullar ve veri merkezleri de dahil olmak data ve network sistemlerine her işletme ihtiyaç duyar. Bu nedenle bu sistemlerin kullanım alanı oldukça geniştir.

### 8.11 PDKS Sistemleri — `/pdsk-sistemleri/`

Görseller: `assets/images/services/pdks-sistemleri/` (`personel-devam-kontrol-sistemleri-02-e1739042814841.jpg`, `949-pdks-sistemleri-takip-sistemleri.webp` — sedguvenlik.com.tr hotlink)

İşletmelerde büyük öneme sahip olan insan gücü sistemli bir şekilde organize edildiğinde ticari işletmeye büyük faydalar sağlamaktadır. İnsan gücünün kullanımı için belirli bir sistemin kusursuz ve hatasız bir şekilde çalışması şarttır. Bu sebeple geçmişte işletmeler sistemi kurmak ve işletmek için geleneksel yöntemler olan kağıda yazarak veya çizelge oluşturarak tutuyordu. Artık teknolojinin gelişmesi ile kağıt kalemlerin yerlerini dijital sistemler aldı. PDKS Personel Devam Kontrol Sistemi ile personel takibi artık hatasız bir şekilde yapılabiliyor.

**PDKS SİSTEMİ NEDİR**

Personel Devam Kontrol Sistemi (PDKS) kısaca çalışanların çalışma süreleri, fazla mesaileri, izinleri ve devamsızlık bilgilerini hesaplayan, hakediş ve kesintilerini kayıt eden ve saklayan sistemlere verilen isimdir. PDKS sistemi ile işletme çalışanlarının tüm işe devam bilgilerini kontrol altında tutarak insan gücünden maksimum verimi alabilir. Günümüzde çalışan sayısının yüksek olduğu hemen hemen her işletme PDKS sistemlerinden faydalanmaktadır.

PDKS yüz tanıma, parmak izi okuma, elektronik kart gibi farklı metodlar ile elde edilen veriler ile çalışmaktadır.

**PDKS Ne İşe Yarar?**

PDKS ile işletmeler öncelikle çalışanların haklarını korurken aynı zamanda işletmenin işçiye kesintiler ve hakkedişler ile ilgili ödemeler konusunda hata payını sıfıra indirmiş olur. Çünkü PDKS tüm verileri hesaplayarak yasal sınırlar içinde en doğru veriyi sunar. Bu sayede çalışan verimliliği artarken, işletmenin ise olası fazla ödeme gibi hatalı durumlardan kaçınmasını sağlar. Kısaca bu sistem ile hem işçinin hem de işletmenin hakları korunmuş olur. Personelin işe geliş gidiş saatlerini tutabilen, vardiya bilgilerini ve fazla mesailerini baz alarak hesaplamalar yaparak sonuçları hızlı bir şekilde veren PDKS ile işletmeler büyük bir efordan kurtulmuş olurlar.

**PDKS Nerede Kullanılır?**

Çalışan sayısı farketmeksizin tüm işletmeler bu sistemi kullanabilirler. Günümüzde tekstil, üretim, zincir marketler gibi aklınıza gelebilecek neredeyse tüm sektörlerde PDKS kullanılmaktadır. Bunun dışında özellikle vardiyalı çalışan işletmelerde oldukça verimli bir süreç sağladığı için yoğunlukla kullanılmaktadır.

**PDKS Programı Nasıl Kullanılır?**

Personel Devam Kontrol Sistemi kullanımı işletmenin dinamiklerine göre yüz tanıma, parmak izi okutma gibi sistemlerden birini seçerek kullanıma başlanabilir. Seçilen sistem kurulumu yapıldıktan sonra çalışan verilerinin sisteme tek tek tanımlanması ile sistem çalışabilir duruma gelecektir. Personel tanımlamaları ile birlikte günlük, aylık verileri işleyen sistem işçinin işe geliş gidiş ve mesaileri gibi bilgileri işleyecektir. İşveren istediği zaman bu bilgilere erişebilecek ve işleyebilecektir. Ayrıca çoğu işletmede olduğu gibi ay sonu işçinin hakedişlerinin hesaplanmasında da oldukça işe yarayacaktır. Bordrolama süreçlerinde hata payını sıfıra indiren bu sistem ile tüm süreç kontrol altında tutulmuş olacaktır.

### 8.12 Hizmetlerimiz — `/urunlerimiz/`

Yalnızca kart ızgarası. Metin yok. Kart görselleri: `assets/images/services/hizmetlerimiz/`

Sıra:

1. Kameralar — `h.jpg`
2. Hırsız Alarm Sistemleri — `haho6.jpg` / `haho7.jpg`
3. Akıllı Ev Sistemleri
4. Yangın Alarm Sistemleri — `yangin-amlama.jpg`
5. Ses Ve Anons Sistemleri — `ses.jpg`
6. Bariyer Turnike Sistemleri — `durnike.jpg`
7. Yangın Tüpü — `am-tupu.jpg`
8. Fotokapan — `ayu.jpg`
9. Araç İçi Kamera — hotlink araç kamerası
10. Network Sistemleri — harici (indirilemedi)
11. PDKS Sistemleri — harici webp

### 8.13 Boş / çöp sayfalar

- `/kamera-sistemleri/` — içerik yok
- `/ornek-sayfa/` — WordPress “bisikletli kurye / piña colada” örnek metni
- `/2025/02/05/merhaba-dunya/` — “WordPress'e hoş geldiniz…”

---

## 9. Görsel dizin

Tüm indirilen dosyalar `assets/images/` altında. Ham JSON: `_source/image-manifest.json`, `_source/pages.json`, `_source/media1.json`.

```
assets/images/
  branding/logo/                 Firma logosu ve kırpılmış varyantlar
  branding/markalar/             Seagate, TP-Link, UNV, WD, ZKTeco vb.
  homepage/hero-slider/          Ana slider / WhatsApp sahne fotoğrafları
  homepage/misyon-vizyon/        CEO fotoğrafı
  homepage/yorumlar/             Google yorum avatarları
  homepage/stok-gorseller/       Pxhere / Colibri stok (yeni sitede atılacak)
  homepage/tema-gorselleri/      Colibri tema PNG’leri (atılacak)
  homepage/diger/
  services/kameralar/
  services/hirsiz-alarm/
  services/akilli-ev/
  services/yangin-alarm/
  services/ses-anons/
  services/bariyer-turnike/
  services/yangin-tupu/
  services/fotokapan/
  services/arac-ici-kamera/
  services/network-sistemleri/
  services/pdks-sistemleri/
  services/hizmetlerimiz/        Kart ızgarası görselleri
  media/kirpilmis-kopyalar/      WP cropped-* kopyaları
  media/kullanilmamis/           Kütüphanede duran, sayfada zayıf kullanılan
```

Kullanılmayan ama kütüphanede duran iş görselleri (`haho.jpg`, `haho2.jpg`, `haho3.jpg`, `haho4.jpg`, `kamaraaaaa.jpg`, `fsafsa.jpg`, HD analog farkı serisi) yeni sitede orijinal çekim olarak değerlendirilebilir.

İndirilemeyen 4 harici/bozuk URL:

1. `https://www.optimumteknoloji.com.tr/img/haber/IP-Kamera-Sistemleri-Kurulumu.jpg` (404)
2. `https://www.bilgesis.com.tr/yuklemeler/galeri/buyuk/network-altyapisi-kurulumu-1-13.jpg` (SSL)
3. Sitemap’teki eski dosya adları (`ag-network-sistemleri-nedir-1.jpg`, `hirsiz_alarm_sistemi_888777-1-...jpeg`) — kütüphanedeki gerçek dosyalar alındı

---

## 10. Yeni site için çıkarılacak gerçekler

Korunacak:

- Marka: Öztürk Güvenlik Sistemleri, 2014, CEO Recep Özkan Öztürk
- Konum: Yenibosna Merkez Mah. Kenanbey Sk. No: 11, İstanbul
- Telefon / WhatsApp: 0535 014 65 93, 7/24 teklif
- Ücretsiz keşif vaadi
- Hizmet seti: kamera, hırsız alarm, yangın alarm, anons, turnike/bariyer, yangın tüpü, fotokapan, araç kamerası, network, PDKS, akıllı ev
- Sosyal: Instagram `ozturkgvnlk_`, Facebook `ozturkgvnlk` / `oztrkguvenlik`
- Google 5.0 / 33 yorum

Atılacak / yeniden yazılacak:

- “Front Page” başlığı, örnek sayfa, merhaba dünya
- Wikipedia yangın tüpü / fotokapan metinleri
- Rakip sitelerden hotlink görseller (Amazon, Optimum, Bilgesis, Sedgüvenlik, Galip, Taşıt.com)
- Colibri ücretsiz tema stok ofis fotoğrafları
- `pdsk` slug yazım hatası
- SEO description’ın misyon metnini kesmesi
- Footer’daki “Created for free using WordPress”
- Yayınlanmayan e-posta; iletişim formunun belirsizliği

Ham yedek: `_source/` (HTML, sitemap, REST JSON).
