export type IconName =
  | "camera"
  | "alarm"
  | "fire"
  | "voice"
  | "turnstile"
  | "fingerprint"
  | "network"
  | "home"
  | "extinguisher"
  | "wildlife"
  | "car"
  | "phone"
  | "whatsapp"
  | "pin"
  | "star"
  | "arrow"
  | "check"
  | "clock"
  | "file"
  | "shield"
  | "map"
  | "instagram"
  | "facebook"
  | "calendar"
  | "briefcase"
  | "users"
  | "plus"
  | "pen"
  | "trash"
  | "search"
  | "logout"
  | "close"
  | "eye"
  | "wallet"
  | "receipt"
  | "box"
  | "menu";

export type Service = {
  slug: string;
  name: string;
  short: string;
  icon: IconName;
  tagline: string;
  intro: string[];
  forWho: { title: string; desc: string }[];
  systems: { title: string; desc: string }[];
  features: string[];
  faqs: { q: string; a: string }[];
  waText: string;
  group: "kamera" | "alarm" | "gecis" | "diger";
};

export const processSteps = [
  {
    n: "01",
    title: "Keşif",
    desc: "Mekânınızı yerinde değerlendirir, ihtiyacınızı ücretsiz tespit ederiz.",
  },
  {
    n: "02",
    title: "Teklif",
    desc: "İhtiyaca göre ürün seçimi ve net, şeffaf fiyat teklifi.",
  },
  {
    n: "03",
    title: "Kurulum",
    desc: "Temiz, planlı montaj; işinizi aksatmadan çalışırız.",
  },
  {
    n: "04",
    title: "Teslim ve eğitim",
    desc: "Sistemi test edip devreye alır, kullanımını birlikte öğretiriz.",
  },
] as const;

export const services: Service[] = [
  {
    slug: "kamera-sistemleri",
    name: "Güvenlik Kamera Sistemleri",
    short: "Ev, iş yeri ve projeler için IP / AHD kamera kurulumu, kayıt ve mobil izleme.",
    icon: "camera",
    tagline: "Ev, iş yeri ve projeler için kamera sistemi kuruyoruz — kayıt ve mobil izleme dahil.",
    intro: [
      "Kamera sistemi, tek bir noktadan tüm alanlarınızı izlemenin en etkili yoludur. Öztürk Güvenlik olarak ihtiyacınıza göre IP ve AHD kamera sistemleri planlar, kurar ve kullanımını öğreterek teslim ederiz.",
      "İster tek daire ister kentsel dönüşüm projesi olsun; keşiften kablolamaya, kayıt cihazından mobil uygulama kurulumuna kadar işin tamamını tek elden yürütüyoruz.",
    ],
    forWho: [
      { title: "Ev ve apartmanlar", desc: "Site, apartman ve müstakil evlerde ortak alan ve konut içi güvenlik." },
      { title: "Mağaza ve iş yerleri", desc: "Dükkân, ofis ve depolarda hırsızlık önleme ve çalışan takibi." },
      { title: "Fabrika ve depolar", desc: "Üretim alanı, stok ve giriş-çıkış noktalarının kesintisiz izlenmesi." },
      { title: "Yeni bina ve projeler", desc: "İnşaat sürecinden itibaren projelendirilmiş kamera altyapısı." },
    ],
    systems: [
      {
        title: "IP Kamera",
        desc: "Yüksek çözünürlük, ağ üzerinden kayıt ve telefondan her yerden canlı izleme. Yeni kurulumlarda ilk tercihimiz.",
      },
      {
        title: "AHD Kamera",
        desc: "Mevcut koaksiyel altyapıyı kullanarak 720p/1080p görüntü kalitesi. Eskiyi sökmeden sistemi modernize eder.",
      },
    ],
    features: [
      "Ücretsiz yerinde keşif ve kamera planlaması",
      "Gece görüşlü, dayanıklı IP / AHD kamera seçenekleri",
      "NVR / DVR kayıt cihazı ve kapasite planlaması",
      "Telefon ve tabletten canlı izleme kurulumu",
      "Temiz kablolama ve markasız montaj görüntüsü",
      "Kurulum sonrası eğitim ve garanti desteği",
    ],
    faqs: [
      {
        q: "Kamera sistemi kurulumu ne kadar sürer?",
        a: "Standart bir iş yeri veya ev için kurulum genellikle 1 gün içinde tamamlanır. Ölçek projelerde keşif sonrası net plan çıkarırız.",
      },
      {
        q: "Görüntülere telefondan ulaşabilir miyim?",
        a: "Evet. Sistem tesliminde mobil uygulamayı kurar, canlı izleme ve kayıt izlemeyi size öğretiriz.",
      },
      {
        q: "Kayıtlar ne kadar süre saklanır?",
        a: "Kayıt süresi kamera sayısı ve disk kapasitesine bağlıdır. Keşifte ihtiyacınıza göre 15-90 gün arası planlama yaparız.",
      },
      {
        q: "Mevcut kamera sistemimi yenileyebilir misiniz?",
        a: "Evet. Mevcut kablolamayı değerlendirir, sökmeden AHD veya IP'ye geçiş dahil uygun çözümü öneririz.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Kamera sistemi için keşif almak istiyorum.",
    group: "kamera",
  },
  {
    slug: "hirsiz-alarm",
    name: "Hırsız Alarm Sistemleri",
    short: "Ev ve iş yerlerinde izinsiz girişe karşı hareket, kapı-pencere sensörlü alarm kurulumu.",
    icon: "alarm",
    tagline: "İzinli herkese kapı açılsın, izinsiz herkese alarm. Ev ve iş yerleriniz için hırsız alarm sistemleri.",
    intro: [
      "Hırsız alarm sistemi, davetsiz misafiri kapıdan çevirir: ışık, siren ve anında bildirim. Öztürk Güvenlik olarak hareket sensörlü, kapı-pencere kontaklı ve uzaktan yönetimli alarm sistemleri kuruyoruz.",
      "Sistem devreye alındıktan sonra kullanımı birkaç dakikada öğrenilir: tek tuşla kurma-kapatma, telefondan bildirim ve gerekirse güvenlik merkezi entegrasyonu.",
    ],
    forWho: [
      { title: "Ev ve apartman daireleri", desc: "Yokken güvende olmak: gece ve tatil dönemlerinde kesintisiz koruma." },
      { title: "Mağaza ve ofisler", desc: "Mesai dışı izinsiz girişlerde anında siren ve telefon bildirimi." },
      { title: "Depo ve işletmeler", desc: "Giriş-çıkış noktalarında hareket algılama ile etkin gözetim." },
      { title: "Şantiyeler", desc: "Değerli ekipman ve malzeme için taşınabilir, geçici alarm çözümleri." },
    ],
    systems: [
      {
        title: "Kablosuz sistem",
        desc: "Kablo çekmeye gerek kalmadan hızlı kurulum; kiracı ve geçici kullanımlar için ideal.",
      },
      {
        title: "Kablolu sistem",
        desc: "Kalıcı yapılarda daha sağlam iletişim; geniş alan ve çok kapılı yapılarda önerilir.",
      },
    ],
    features: [
      "Ücretsiz keşif ve risk analizi",
      "Hareket sensörü, kapı-pencere kontağı, siren ve panel",
      "Telefondan kurma-kapatma ve anlık bildirim",
      "Eski sistemlerden kablosuza geçiş desteği",
      "Kurulum sonrası kullanım eğitimi",
      "Uzaktan destek ve bakım hizmeti",
    ],
    faqs: [
      {
        q: "Alarm çaldığında ne olur?",
        a: "Siren öter, size telefon bildirimi gider. Gerekirse sizin belirlediğiniz kişilere de haber düşer.",
      },
      {
        q: "Yanlış alarm durumunda sistem beni yorar mı?",
        a: "Modern sensörler hayvan ve dalgalanma kaynaklı hataları büyük ölçüde eler. Kurulumda doğru yerleşimle yanlış alarm oranı minimuma iner.",
      },
      {
        q: "Kiracıyım, sistem kurabilir miyim?",
        a: "Kablosuz sistemler delme gerektirmez; taşınırken söküp yeni adresinize taşıyabilirsiniz.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Hırsız alarm sistemi için keşif almak istiyorum.",
    group: "alarm",
  },
  {
    slug: "yangin-alarm",
    name: "Yangın Alarm Sistemleri",
    short: "Konvansiyonel ve adreslenebilir yangın algılama, ihbar ve tahliye sistemleri.",
    icon: "fire",
    tagline: "Yangın dakikalar içinde yayılır; algılama ise saniyeler içinde başlamalı. İşletmeniz için yangın algılama ve ihbar sistemleri.",
    intro: [
      "Yangın alarm sistemi; duman, ısı ve alevi algılayıp erken ihbar veren güvenlik altyapısının en kritik parçasıdır. Öztürk Güvenlik olarak iş yerinizin yapısına ve yönetmeliklere uygun konvansiyonel veya adreslenebilir sistemler planlar, kurar ve periyodik bakımını yaparız.",
      "Doğru yerleştirilmiş dedektörler, yangının büyümeden fark edilmesini ve tahliyenin güvenli şekilde başlamasını sağlar.",
    ],
    forWho: [
      { title: "İşletmeler ve ofisler", desc: "Personel ve müşteri güvenliği için erken uyarı." },
      { title: "Fabrikalar ve üretim tesisleri", desc: "Yüksek riskli alanlarda sürekli algılama ve acil ihbar." },
      { title: "Mağaza ve AVM'ler", desc: "Yoğun insan trafiğinde güvenli tahliye yönlendirmesi." },
      { title: "Konut ve siteler", desc: "Apartman geneli yangın algılama ve kat ihbarı." },
    ],
    systems: [
      {
        title: "Konvansiyonel sistem",
        desc: "Bölgesel algılama; küçük ve orta ölçekli işletmeler için ekonomik ve güvenilir çözüm.",
      },
      {
        title: "Adreslenebilir sistem",
        desc: "Her dedektörün ayrı adresi; büyük binalarda yangının kaynağını saniyeler içinde bulur.",
      },
    ],
    features: [
      "Mevzuata uygun projelendirme",
      "Duman, ısı, alev ve karbonmonoksit algılama seçenekleri",
      "Yangın butonu, siren ve flaşörlü ihbar",
      "Acil anons ve tahliye entegrasyonu",
      "Periyodik test ve bakım hizmeti",
      "Evrak ve tutanak desteği",
    ],
    faqs: [
      {
        q: "Hangi tip yangın alarmı bana uygun?",
        a: "Binanın büyüklüğü ve kullanım amacı belirler. Keşifte konvansiyonel ve adreslenebilir sistemleri kıyaslayıp size en doğrusunu öneririz.",
      },
      {
        q: "Yangın alarmı bakımı zorunlu mu?",
        a: "İşyerleri için yangın güvenlik ekipmanlarının düzenli test ve bakımı yasal zorunluluktur. Periyodik bakım sözleşmesi sunuyoruz.",
      },
      {
        q: "Mevcut sistemim çalışmıyor, yenilenir mi?",
        a: "Eski panelleri ve dedektörleri değerlendirir; kısmi yenileme veya komple değişim seçenekleri sunarız.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Yangın alarm sistemi için keşif almak istiyorum.",
    group: "alarm",
  },
  {
    slug: "pdks",
    name: "PDKS Sistemleri",
    short: "Personel devam kontrolü: parmak izi, yüz tanıma ve kartlı geçiş sistemleri.",
    icon: "fingerprint",
    tagline: "Mesai takibi kağıt kalemle olmaz. Personel devam kontrol sistemleri ile devamsızlık ve fazla mesai otomatik hesaplanır.",
    intro: [
      "PDKS (Personel Devam Kontrol Sistemi); çalışanların giriş-çıkış, fazla mesai, izin ve devamsızlık bilgilerini hatasız takip eder. Öztürk Güvenlik olarak parmak izi, yüz tanıma ve kartlı PDKS sistemlerini kuruyor, personel tanımlamayı ve raporlama düzenini sizinle birlikte kuruyoruz.",
      "Bordro öncesi tüm veriler tek ekranda; hem çalışanın hem işletmenin hakkı korunur.",
    ],
    forWho: [
      { title: "Ofisler", desc: "Çalışma saatleri ve esnek mesai düzeninin net takibi." },
      { title: "Üretim tesisleri", desc: "Vardiya sistemi ve fazla mesai hesaplamalarında sıfır hata." },
      { title: "Mağaza zincirleri", desc: "Şube bazında personel devam ve yoklama raporları." },
      { title: "İnşaat ve şantiyeler", desc: "Şantiyede fiilen çalışanın doğru tespiti." },
    ],
    systems: [
      {
        title: "Parmak izi okuyucu",
        desc: "En yaygın ve ekonomik yöntem; saniyede doğrulama, kurumsal vazgeçilmez.",
      },
      {
        title: "Yüz tanıma okuyucu",
        desc: "Temassız ve hızlı; hijyenin önemli olduğu ortamlar için ideal.",
      },
      {
        title: "Kartlı okuyucu",
        desc: "RFID kart ile geçiş; çok girişli tesislerde erişim kontrolüyle birlikte çalışır.",
      },
    ],
    features: [
      "Ücretsiz keşif ve personel sayısına göre kapasite planlaması",
      "Parmak izi / yüz tanıma / kart seçenekleri",
      "Giriş-çıkış, fazla mesai, izin ve devamsızlık raporları",
      "Personel tanımlama ve eğitim desteği",
      "Bordro yazılımlarıyla veri aktarımı",
      "Kurulum sonrası uzaktan destek",
    ],
    faqs: [
      {
        q: "PDKS verileriyle bordro hazırlayabilir miyim?",
        a: "Sistem fazla mesai ve çalışma sürelerini hesaplar; kullandığınız bordro programına uygun raporu birlikte kurarız.",
      },
      {
        q: "Birkaç şubemiz var, tek merkezden takip edebilir miyiz?",
        a: "Evet. Tüm şubelerin cihazlarını tek panel üzerinden uzaktan yönetebiliriz.",
      },
      {
        q: "Kurulum ne kadar sürer?",
        a: "10-50 personellik standart kurulum genellikle yarım gün ile 1 gün arasında tamamlanır.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. PDKS sistemi için keşif almak istiyorum.",
    group: "gecis",
  },
  {
    slug: "bariyer-ve-turnike",
    name: "Bariyer ve Turnike Sistemleri",
    short: "Otopark bariyerleri, optik turnikeler ve yaya erişim kontrolü.",
    icon: "turnstile",
    tagline: "Girişler kontrolsüz bırakılmaz. Otopark bariyeri ve turnike sistemleri ile giriş-çıkış yönetimi.",
    intro: [
      "Bariyer ve turnike sistemleri; otopark, bina girişi ve personel geçişlerinde kimin, ne zaman girdiğini düzenler. Öztürk Güvenlik olarak plakalı otopark bariyerleri, optik turnikeler ve yaya erişim kapılarını tasarlayıp devreye alıyoruz.",
      "Erişim kontrol yazılımı, PDKS ve kamera sistemleriyle entegre çalışır; tüm geçişler kayıt altına alınır.",
    ],
    forWho: [
      { title: "Otoparklar", desc: "Plaka tanımalı bariyer ile hızlı ve kontrolsüz giriş çıkışı engelleme." },
      { title: "Ofis ve plaza girişleri", desc: "Optik turnike ile ziyaretçi ve personel ayrımı." },
      { title: "Siteler ve konutlar", desc: "Sürücü ve yaya girişlerinde kartlı erişim." },
      { title: "Fabrika ve depolar", desc: "Yükleme alanları ve personel girişlerinde sıkı geçiş kontrolü." },
    ],
    systems: [
      {
        title: "Otopark bariyeri",
        desc: "Uzaktan kumanda, kart veya plaka tanıma ile çalışan araç geçiş sistemleri.",
      },
      {
        title: "Optik turnike",
        desc: "Kızılötesi algılamalı, tek yönlü/çift yönlü personel geçişleri.",
      },
      {
        title: "Yaya erişim kapıları",
        desc: "Engelli erişimine uygun, güvenlik kartlarıyla açılan kapı çözümleri.",
      },
    ],
    features: [
      "Ücretsiz keşif ve geçiş analizi",
      "Plaka tanıma ve uzaktan yönetim yazılımı",
      "PDKS ve kamera entegrasyonu",
      "Engelli erişim çözümleri",
      "Periyodik bakım ve yedek parça desteği",
    ],
    faqs: [
      {
        q: "Plaka tanıma sistemi nasıl çalışır?",
        a: "Kamera plakayı okur, kayıtlı plakalar otomatik açılır, kayıtlı olmayanlar için anons ve güvenlik bilgilendirmesi yapılır.",
      },
      {
        q: "Turnike ile PDKS'yi birleştirebilir miyiz?",
        a: "Evet; turnike geçişleri aynı zamanda mesai kaydı olarak işlenir.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Bariyer ve turnike sistemi için keşif almak istiyorum.",
    group: "gecis",
  },
  {
    slug: "ses-ve-anons",
    name: "Ses ve Anons Sistemleri",
    short: "Acil anons, müzik yayını ve duyuru sistemleri; tahliye entegrasyonu.",
    icon: "voice",
    tagline: "Acil durumda tek cümle yüzlerce kişiyi yönlendirir. Ses ve anons sistemleri.",
    intro: [
      "Seslendirme ve anons sistemleri; acil durum uyarıları, duyurular ve müzik yayını için tek altyapıdır. Öztürk Güvenlik olarak ofis, mağaza, fabrika ve sitelerde hoparlör, mikrofon ve amplifikatörden oluşan anons sistemleri kuruyoruz.",
      "Yangın alarmıyla entegre çalışan acil anons sistemleri, tahliye sürecini güvenli ve düzenli yönetir.",
    ],
    forWho: [
      { title: "İşletmeler ve mağazalar", desc: "Duyuru, müzik yayını ve müşteri yönlendirme." },
      { title: "Fabrikalar", desc: "Vardiya anonsları ve acil durum uyarıları." },
      { title: "Siteler ve konutlar", desc: "Genel duyuru ve yangın anonsu." },
      { title: "Etkinlik alanları", desc: "Geniş alanlarda kesintisiz ses dağılımı." },
    ],
    systems: [
      {
        title: "Acil anons sistemi",
        desc: "Yangın ve tahliye senaryolarında otomatik anons; alarmla birlikte devreye girer.",
      },
      {
        title: "Genel seslendirme",
        desc: "Duyuru, yönlendirme ve müzik yayını için bölgelere ayrılabilir sistemler.",
      },
    ],
    features: [
      "Ücretsiz keşif ve ses planlaması",
      "Zonlu (bölgeli) yayın yapılandırması",
      "Yangın alarmı entegrasyonu",
      "Kablosuz mikrofon ve masa üstü anons üniteleri",
    ],
    faqs: [
      {
        q: "Anons sistemi yangın alarmıyla birlikte çalışır mı?",
        a: "Evet. Acil anons panelleri yangın alarmından gelen uyarıyla otomatik devreye girecek şekilde projelendirilir.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Ses ve anons sistemi için keşif almak istiyorum.",
    group: "diger",
  },
  {
    slug: "network",
    name: "Network Sistemleri",
    short: "Yapısal kablolama, ağ altyapısı ve veri iletişimi kurulumu.",
    icon: "network",
    tagline: "Güvenlik sistemleriniz kadar ağınız da sağlam olmalı. Yapısal kablolama ve network altyapısı.",
    intro: [
      "Kamera, PDKS ve bilişim sistemlerinin verimli çalışması, doğru kurulmuş bir ağ altyapısına bağlıdır. Öztürk Güvenlik olarak yapısal kablolama, switch ve ağ kurulumlarını standartlara uygun şekilde gerçekleştiriyoruz.",
      "Kötü kablolama, network sorunlarının en büyük kaynağıdır. Altyapıyı doğru kurduğumuz için sonradan sorun yaşamazsınız.",
    ],
    forWho: [
      { title: "Ofisler", desc: "İnternet, telefon ve güvenlik cihazlarının tek altyapıda toplanması." },
      { title: "Fabrikalar", desc: "Üretim hattı ve saha cihazlarının kesintisiz haberleşmesi." },
      { title: "Siteler ve binalar", desc: "Kamera ve erişim sistemleri için ortak network altyapısı." },
    ],
    systems: [
      {
        title: "Yapısal kablolama",
        desc: "Kategori 6/6A standartlarında, test edilmiş ve etiketlenmiş kablolama.",
      },
      {
        title: "Ağ cihazları ve yapılandırma",
        desc: "Switch, access point ve VLAN yapılandırmasıyla güvenli ağ kurulumu.",
      },
    ],
    features: [
      "Ücretsiz keşif ve altyapı analizi",
      "Standartlara uygun yapısal kablolama",
      "Switch, AP ve ağ yapılandırması",
      "Kamera ve PDKS ağı için ayrı VLAN önerileri",
      "Test raporu ve kablo etiketleme",
    ],
    faqs: [
      {
        q: "Kamera sistemi için internet şart mı?",
        a: "Canlı izleme ve uzaktan erişim için internet gerekir; kayıt cihazı internetsiz de kesintisiz kayıt yapar.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Network altyapısı için keşif almak istiyorum.",
    group: "diger",
  },
  {
    slug: "akilli-ev",
    name: "Akıllı Ev Sistemleri",
    short: "Ev otomasyonu: aydınlatma, ısıtma ve güvenlik tek uygulamada.",
    icon: "home",
    tagline: "Eviniz uzaktan kumandanızda olsun. Akıllı ev otomasyonu ve entegre güvenlik.",
    intro: [
      "Akıllı ev sistemleri; aydınlatma, ısıtma-soğutma, perde ve güvenlik cihazlarını tek uygulamadan yönetmenizi sağlar. Öztürk Güvenlik olarak mevcut elektrik altyapısını bozmadan, modüler akıllı ev kurulumları yapıyoruz.",
      "Uzaktayken ışıkları kontrol edin, kapıyı kimin açtığını görün, kamera ve alarmla evinizi tek panelden izleyin.",
    ],
    forWho: [
      { title: "Yeni ev projeleri", desc: "Proje aşamasında planlanan, altyapısı hazır akıllı ev." },
      { title: "Mevcut konutlar", desc: "Kablo çekmeden, kablosuz cihazlarla sonradan kurulum." },
      { title: "Villa ve müstakil evler", desc: "Çok odalı otomasyon, perde ve bahçe aydınlatması." },
    ],
    systems: [
      {
        title: "Aydınlatma ve enerji",
        desc: "Akıllı anahtar, dimmer ve zamanlama ile enerji tasarrufu.",
      },
      {
        title: "Güvenlik entegrasyonu",
        desc: "Akıllı kilit, kamera ve alarmın tek uygulamada birleşmesi.",
      },
    ],
    features: [
      "Ücretsiz keşif ve cihaz planlaması",
      "Kablosuz, modüler kurulum",
      "Telefon uygulaması ve sesli komut desteği",
      "Mevcut altyapıyı koruyan montaj",
      "Kurulum sonrası eğitim",
    ],
    faqs: [
      {
        q: "Akıllı ev kurulumu mevcut evime olur mu?",
        a: "Olur. Kablosuz modüller duvar yapısını bozmadan mevcut anahtarlara entegre edilir.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Akıllı ev sistemi için keşif almak istiyorum.",
    group: "diger",
  },
  {
    slug: "yangin-tupu",
    name: "Yangın Tüpü",
    short: "Kuru kimyevi ve CO2 yangın söndürücü temini, dolum ve periyodik bakım.",
    icon: "extinguisher",
    tagline: "Yangına ilk müdahale 30 saniyede yapılır; doğru tüp, doğru yerde olmalı.",
    intro: [
      "Yangın tüpleri, küçük yangınlara ilk müdahalenin en hızlı yoludur. Öztürk Güvenlik olarak işletmenizin risk sınıfına uygun kuru kimyevi ve CO2 söndürücü temin ediyor, dolum ve periyodik bakımını yapıyoruz.",
      "Tüplerin muayene ve dolum tarihlerini takip eder; yönetmelik uyumluluğunu üzerinizden alırız.",
    ],
    forWho: [
      { title: "İşletmeler", desc: "Mevzuata uygun tüp bulundurma ve yerleşim planı." },
      { title: "Fabrikalar", desc: "Risk bölgelerine göre tüp tipi ve kapasite belirleme." },
      { title: "Konutlar ve siteler", desc: "Ortak alanlar için standart söndürücü temini." },
    ],
    systems: [
      {
        title: "Kuru kimyevi (ABC)",
        desc: "A, B ve C sınıfı yangınlara karşı çok amaçlı, en yaygın tüp tipi.",
      },
      {
        title: "CO2",
        desc: "Elektrik panoları ve hassas ekipmanlar için kalıntı bırakmayan söndürme.",
      },
    ],
    features: [
      "Risk analizine göre tüp tipi ve sayısı belirleme",
      "Dolum, muayene ve periyodik bakım hizmeti",
      "Tüp yerleşim ve tabela düzeni",
      "Bakım takibi ve hatırlatma",
    ],
    faqs: [
      {
        q: "Yangın tüplerinin bakımı ne sıklıkla yapılmalı?",
        a: "Periyodik kontroller yılda bir, basınç testleri üretici ve mevzuata göre 5-10 yılda bir yapılır. Takibi biz üstleniriz.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Yangın tüpü temini ve bakımı hakkında bilgi almak istiyorum.",
    group: "diger",
  },
  {
    slug: "fotokapan",
    name: "Fotokapan",
    short: "Sahada ve ormanda kızılötesi tetiklemeli uzaktan görüntüleme cihazları.",
    icon: "wildlife",
    tagline: "Gidemediğiniz her yeri fotokapanlar görür. Sahada uzaktan izleme çözümleri.",
    intro: [
      "Fotokapanlar; hareket ve kızılötesi algılama ile gidemediğiniz alanlarda otomatik görüntü yakalayan cihazlardır. Öztürk Güvenlik olarak arazi, bahçe ve işletme alanları için fotokapan satışı ve kurulum desteği sağlıyoruz.",
      "Kamu alanları, tarım arazileri ve özel mülklerde hırsızlık, izinsiz giriş ve yaban hayatı takibi için kullanılır.",
    ],
    forWho: [
      { title: "Arazi ve bahçe sahipleri", desc: "Uzak bölgelerde izinsiz giriş ve hırsızlık tespiti." },
      { title: "İşletmeler", desc: "Şantiye ve depo çevresinde gece gündüz gözetim." },
    ],
    systems: [
      {
        title: "4G / SIM'li modeller",
        desc: "Fotoğraf ve videoyu doğrudan telefonunuza gönderir.",
      },
      {
        title: "Hafıza kartlı modeller",
        desc: "Ekonomik; periyodik kontrol gerektiren standart kullanım.",
      },
    ],
    features: [
      "İhtiyaca uygun model seçimi",
      "Kurulum ve açı ayarı desteği",
      "SIM kart ve uygulama yapılandırması",
      "Pil ömrü ve dayanıklılık önerileri",
    ],
    faqs: [
      {
        q: "Fotokapanlar fotoğrafı telefona gönderir mi?",
        a: "4G destekli modeller görüntüleri anlık telefonunuza iletir; SIM'siz modellerde kayıt hafıza kartına alınır.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Fotokapan hakkında bilgi almak istiyorum.",
    group: "diger",
  },
  {
    slug: "arac-ici-kamera",
    name: "Araç İçi Kamera",
    short: "Ön-arka görüş kayıt sistemleri; kaza ve olaylarda kanıt desteği.",
    icon: "car",
    tagline: "Kaza anında tek kanıt kaynağınız. Araç içi kamera kurulumu.",
    intro: [
      "Araç içi kameralar; sürüş sırasında ön ve arka görüntüyü kesintisiz kaydeder. Kaza, tartışma ve sigorta süreçlerinde en güçlü kanıttır. Öztürk Güvenlik olarak araç kamerası temin ediyor, temiz şekilde monte ediyor ve yapılandırıyoruz.",
      "Park halinde de çalışan modellerle aracınızı her an korur.",
    ],
    forWho: [
      { title: "Bireysel sürücüler", desc: "Kaza ve sigorta süreçlerinde kanıt güvencesi." },
      { title: "Filo ve ticari araçlar", desc: "Sürüş davranışı takibi ve filo güvenliği." },
    ],
    systems: [
      {
        title: "Ön kamera",
        desc: "Standart kayıt; en yaygın ve ekonomik çözüm.",
      },
      {
        title: "Ön + arka kamera",
        desc: "Çift yönlü görüş; park ve manevra güvenliği.",
      },
    ],
    features: [
      "Model seçiminde ihtiyaç analizi",
      "Gizli, temiz kablo ile montaj",
      "Gece görüşü ve park modu ayarları",
      "Kurulum sonrası kullanım eğitimi",
    ],
    faqs: [
      {
        q: "Araç kamerası kayıtları kazada kanıt sayılır mı?",
        a: "Evet; tarih ve saat damgalı kayıtlar trafik kazalarında ve sigorta süreçlerinde delil olarak kullanılabilir.",
      },
    ],
    waText: "Merhaba, web sitenizden ulaşıyorum. Araç içi kamera hakkında bilgi almak istiyorum.",
    group: "diger",
  },
];

export const serviceGroups = [
  {
    key: "kamera" as const,
    title: "Kamera sistemleri",
    desc: "Güvenlik kamerası kurulumu ve kayıt çözümleri.",
  },
  {
    key: "alarm" as const,
    title: "Alarm sistemleri",
    desc: "Hırsız ve yangın algılama, ihbar ve anons.",
  },
  {
    key: "gecis" as const,
    title: "Geçiş ve personel",
    desc: "Turnike, bariyer ve PDKS ile erişim kontrolü.",
  },
  {
    key: "diger" as const,
    title: "Diğer çözümler",
    desc: "Akıllı ev, network, tüp, fotokapan, araç kamerası.",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
