import type { SiteSettings } from "@/lib/db/schema";

export type GalleryItem = { imageUrl: string; caption: string };

/** Admin panelden hiç düzenlenmemişse gösterilen varsayılan 3 görsel — eski
 * sabit kodlu hâliyle birebir aynı, geriye dönük uyumluluk için. */
export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  { imageUrl: "/images/is-1.jpg", caption: "İş yeri güvenlik kamerası kurulumu" },
  { imageUrl: "/images/hero-1.jpg", caption: "Saha keşif ve montaj çalışması" },
  { imageUrl: "/images/is-2.jpg", caption: "Kurulum sonrası sistem görünümü" },
];

export const MAX_GALLERY_ITEMS = 12;

/** Yüklenen görseller private Vercel Blob'da mutlak (https://...) bir URL
 * olarak saklanır; varsayılan/statik görseller ise /images/... altında
 * normal bir public dosya yoludur ve proxy'ye hiç ihtiyaç duymaz. */
export function isGalleryBlobUrl(imageUrl: string): boolean {
  return /^https?:\/\//.test(imageUrl);
}

/** `galleryItems` doluysa onu (sırasıyla) kullanır; boşsa varsayılan 3 statik
 * görsele düşer. Boş görsel/caption'lı satırlar elenir. Blob'a yüklenmiş
 * görseller herkese açık proxy üzerinden, statik /images/... yolları ise
 * doğrudan sunulur. */
export function resolveGalleryItems(
  settings: Pick<SiteSettings, "galleryItems">
): GalleryItem[] {
  const list = Array.isArray(settings.galleryItems) ? (settings.galleryItems as GalleryItem[]) : [];
  // İndeks, /api/public/gallery/[index]/image route'unun DB'deki HAM diziden
  // okuduğu pozisyonla birebir eşleşmeli — bu yüzden filtrelemeden önce index'i
  // sabitliyoruz (filtrelenmiş bir diziyle yeniden numaralandırmıyoruz).
  const resolved = list
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g && typeof g.imageUrl === "string" && g.imageUrl.trim() !== "")
    .map(({ g, i }) => {
      const caption = g.caption?.trim() || "";
      if (!isGalleryBlobUrl(g.imageUrl)) return { imageUrl: g.imageUrl, caption };
      // Proxy route'u uzun süreli (immutable) cache'leniyor; görsel admin
      // tarafından değiştirildiğinde ziyaretçiye eskisinin gösterilmemesi
      // için blob dosya adından (her yüklemede benzersiz) bir versiyon
      // sorgu parametresi ekleniyor.
      const version = encodeURIComponent(g.imageUrl.split("/").pop() ?? "");
      return { imageUrl: `/api/public/gallery/${i}/image?v=${version}`, caption };
    });
  return resolved.length > 0 ? resolved : DEFAULT_GALLERY_ITEMS;
}
