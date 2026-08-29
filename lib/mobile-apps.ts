import type { IconName } from "@/lib/services";

export type AppCategory = "kamera" | "alarm" | "diger" | "destek";

export type MobileApp = {
  brand: string;
  logo?: string;
  app: string;
  note: string;
  category: AppCategory;
  /** false ise App Store/Google Play butonları gösterilmez (yalnızca masaüstü yazılımı). Varsayılan true. */
  mobile?: boolean;
  /** Doluysa "Bilgisayara İndir" butonu, resmi üretici indirme sayfasına yönlenir. */
  desktop?: { url: string };
};

export const APP_CATEGORY_LABEL: Record<AppCategory, string> = {
  kamera: "Kamera & Kayıt Sistemleri",
  alarm: "Alarm Sistemleri",
  diger: "Diğer Marka ve Cihazlar",
  destek: "Uzaktan Destek",
};

export const APP_CATEGORY_ICON: Record<AppCategory, IconName> = {
  kamera: "camera",
  alarm: "alarm",
  diger: "box",
  destek: "wrench",
};

export const CATEGORY_ORDER: AppCategory[] = ["kamera", "alarm", "diger", "destek"];

export const MOBILE_APPS: MobileApp[] = [
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "Hik-Connect",
    note: "IP kamera ve NVR/DVR cihazlarınızı canlı izleyin, kayıtlara erişin, bildirim alın.",
    category: "kamera",
  },
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "iVMS-4500",
    note: "Eski nesil Hikvision NVR/DVR cihazları için mobil izleme uygulaması.",
    category: "kamera",
  },
  {
    brand: "Hikvision",
    logo: "/images/brands/hikvision.png",
    app: "iVMS-4200",
    note: "Hikvision NVR/DVR ve IP kameralarınızı bilgisayardan çoklu ekranla izlemek ve kayıt oynatmak için masaüstü yönetim yazılımı.",
    category: "kamera",
    mobile: false,
    desktop: { url: "https://www.hikvision.com/us-en/support/download/software/ivms4200-series/" },
  },
  {
    brand: "Dahua",
    logo: "/images/brands/dahua.png",
    app: "gDMSS Plus",
    note: "Dahua kamera ve kayıt cihazları için canlı izleme ve bildirim uygulaması.",
    category: "kamera",
  },
  {
    brand: "Dahua",
    logo: "/images/brands/dahua.png",
    app: "SmartPSS",
    note: "Dahua NVR/DVR sistemlerini bilgisayardan merkezi olarak yönetmek ve çoklu kamera izlemek için masaüstü yazılımı.",
    category: "kamera",
    mobile: false,
    desktop: { url: "https://us.dahuasecurity.com/product/smartpss/index.html" },
  },
  {
    brand: "EZVIZ",
    logo: "/images/brands/ezviz.png",
    app: "EZVIZ",
    note: "EZVIZ kameralarınızı tek uygulamadan yönetin, hareket bildirimlerini anında alın.",
    category: "kamera",
  },
  {
    brand: "EZVIZ",
    logo: "/images/brands/ezviz.png",
    app: "EZVIZ Studio",
    note: "EZVIZ kameralarınızı büyük ekranda, bilgisayardan canlı izlemek ve kayıt almak için masaüstü yazılımı.",
    category: "kamera",
    mobile: false,
    desktop: { url: "https://support.ezviz.com/download" },
  },
  {
    brand: "UNV",
    logo: "/images/brands/unv.png",
    app: "EZView",
    note: "Uniview (UNV) kamera ve kayıt cihazları için mobil izleme uygulaması.",
    category: "kamera",
  },
  {
    brand: "UNV",
    logo: "/images/brands/unv.png",
    app: "EZStation",
    note: "Uniview (UNV) kamera ve kayıt cihazlarını bilgisayardan merkezi olarak yönetmek için ücretsiz VMS yazılımı.",
    category: "kamera",
    mobile: false,
    desktop: { url: "https://www.uniview.com/Products/Software/PC/EZStation/" },
  },
  {
    brand: "Hanwha Vision",
    logo: "/images/brands/hanwha.png",
    app: "Wisenet Mobile",
    note: "Hanwha Vision (Wisenet) sistemleri için canlı izleme ve oynatma uygulaması.",
    category: "kamera",
  },
  {
    brand: "Hanwha Vision",
    logo: "/images/brands/hanwha.png",
    app: "Wisenet Viewer",
    note: "Hanwha Vision (Wisenet) sistemlerini bilgisayardan izlemek ve yönetmek için masaüstü yazılımı.",
    category: "kamera",
    mobile: false,
    desktop: { url: "https://www.hanwhavision.com/en/products/software/viewer/A/wisenet-viewer/" },
  },
  {
    brand: "IMOU",
    logo: "/images/brands/imou.webp",
    app: "IMOU Life",
    note: "IMOU kameraları için akıllı bildirimli mobil izleme uygulaması.",
    category: "kamera",
  },
  {
    brand: "Ajax",
    logo: "/images/brands/ajax.png",
    app: "Ajax Security System",
    note: "Ajax hırsız alarm sisteminizi uzaktan kurun, devre dışı bırakın, olayları takip edin.",
    category: "alarm",
  },
  {
    brand: "Ajax",
    logo: "/images/brands/ajax.png",
    app: "Ajax Desktop",
    note: "Ajax alarm sisteminizi bilgisayarınızdan tam ekran kontrol merkezi gibi yönetin, kameraları canlı izleyin.",
    category: "alarm",
    mobile: false,
    desktop: { url: "https://ajax.systems/ajax-desktop/" },
  },
  {
    brand: "Paradox",
    logo: "/images/brands/paradox.png",
    app: "Insite Gold",
    note: "Paradox alarm panelinizi uzaktan kontrol edin ve bildirim alın.",
    category: "alarm",
  },
  {
    brand: "Genel DVR/NVR",
    app: "XMEye",
    note: "Bazı ekonomik DVR/NVR modelleri için mobil canlı izleme uygulaması.",
    category: "diger",
  },
  {
    brand: "Genel DVR/NVR",
    app: "hiEasy",
    note: "Bazı kayıt cihazı modellerinin basit kurulum ve izleme uygulaması.",
    category: "diger",
  },
  {
    brand: "Genel DVR/NVR",
    app: "P6S Lite",
    note: "Bazı DVR/NVR modelleri için mobil canlı izleme uygulaması.",
    category: "diger",
  },
  {
    brand: "WiFi Kamera",
    app: "O-Kam Pro",
    note: "Bazı WiFi IP kamera modelleri için mobil izleme uygulaması.",
    category: "diger",
  },
  {
    brand: "Akıllı Ev",
    app: "Tuya Smart",
    note: "Akıllı priz, anahtar, sensör gibi cihazlarınızı tek uygulamadan yönetin.",
    category: "diger",
  },
  {
    brand: "Uzaktan Destek",
    app: "AnyDesk",
    note: "Teknik ekibimizin, izninizle bilgisayarınıza uzaktan bağlanıp destek verebilmesi için kullanılır.",
    category: "destek",
    desktop: { url: "https://anydesk.com/en/downloads/windows" },
  },
  {
    brand: "Uzaktan Destek",
    app: "TeamViewer",
    note: "Teknik ekibimizin, izninizle bilgisayarınıza uzaktan bağlanıp destek verebilmesi için kullanılır.",
    category: "destek",
    desktop: { url: "https://www.teamviewer.com/en/download/windows/" },
  },
];

export function storeSearchUrl(store: "ios" | "android", query: string): string {
  if (store === "ios") return `https://apps.apple.com/tr/search?term=${encodeURIComponent(query)}`;
  return `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`;
}
