export type BrandCategory = "kamera" | "alarm" | "gecis" | "network" | "depolama" | "altyapi";

export type Brand = { name: string; src: string; category: BrandCategory };

export const BRAND_CATEGORY_LABEL: Record<BrandCategory, string> = {
  kamera: "Kamera & Video",
  alarm: "Alarm & Güvenlik",
  gecis: "Geçiş Kontrolü",
  network: "Network & Akıllı Ev",
  depolama: "Depolama (HDD)",
  altyapi: "Altyapı & Donanım",
};

export const brands: Brand[] = [
  { name: "Hikvision", src: "/images/brands/hikvision.png", category: "kamera" },
  { name: "Dahua", src: "/images/brands/dahua.png", category: "kamera" },
  { name: "UNV", src: "/images/brands/unv.png", category: "kamera" },
  { name: "Hanwha Vision", src: "/images/brands/hanwha.png", category: "kamera" },
  { name: "EZVIZ", src: "/images/brands/ezviz.png", category: "kamera" },
  { name: "IMOU", src: "/images/brands/imou.webp", category: "kamera" },
  { name: "Tiandy", src: "/images/brands/tiandy.png", category: "kamera" },
  { name: "TVT", src: "/images/brands/tvt.png", category: "kamera" },
  { name: "Kedacom", src: "/images/brands/kedacom.webp", category: "kamera" },
  { name: "Sanjiang", src: "/images/brands/sanjiang.webp", category: "kamera" },
  { name: "ZKTeco", src: "/images/brands/zkteco.png", category: "gecis" },
  { name: "Suprema", src: "/images/brands/suprema.png", category: "gecis" },
  { name: "Ajax", src: "/images/brands/ajax.png", category: "alarm" },
  { name: "Paradox", src: "/images/brands/paradox.png", category: "alarm" },
  { name: "DSC", src: "/images/brands/dsc.png", category: "alarm" },
  { name: "Caddx", src: "/images/brands/caddx.png", category: "alarm" },
  { name: "Teletek", src: "/images/brands/teletek.png", category: "alarm" },
  { name: "Roombanker", src: "/images/brands/roombanker.png", category: "alarm" },
  { name: "Honeywell", src: "/images/brands/honeywell.png", category: "alarm" },
  { name: "Grandstream", src: "/images/brands/grandstream.png", category: "network" },
  { name: "Wi-Tek", src: "/images/brands/witek.png", category: "network" },
  { name: "Ruijie Reyee", src: "/images/brands/reyee.png", category: "network" },
  { name: "TP-Link", src: "/images/brands/tplink.png", category: "network" },
  { name: "Kodicom", src: "/images/brands/kodicom.png", category: "network" },
  { name: "Future KNX", src: "/images/brands/knx-future.svg", category: "network" },
  { name: "Aypro", src: "/images/brands/aypro.svg", category: "network" },
  { name: "Toshiba", src: "/images/brands/toshiba.png", category: "depolama" },
  { name: "Western Digital", src: "/images/brands/wd.png", category: "depolama" },
  { name: "Seagate", src: "/images/brands/seagate.png", category: "depolama" },
  { name: "TTEC", src: "/images/brands/ttec.png", category: "altyapi" },
  { name: "Formrack", src: "/images/brands/formrack.png", category: "altyapi" },
  { name: "Westa", src: "/images/brands/westa.png", category: "altyapi" },
  { name: "Decon", src: "/images/brands/decon.png", category: "altyapi" },
];

/** Ana ürün markaları — kamera, alarm ve geçiş kontrolü kurulumlarında doğrudan kullanılan markalar. */
export const CORE_PRODUCT_BRANDS = brands.filter((b) => b.category === "kamera" || b.category === "alarm" || b.category === "gecis");
