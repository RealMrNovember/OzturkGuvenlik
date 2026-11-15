import { get } from "@vercel/blob";
import { getSiteSettings } from "@/lib/site-settings";
import type { GalleryItem } from "@/lib/gallery";

// Anasayfa galeri görseli herkese açık gösterilmeli; bu projenin Blob
// deposu private-only olduğu için (bkz. diğer public proxy route'ları)
// burası bilinçli olarak oturumsuz bırakılmıştır. İndeks, lib/gallery.ts'teki
// resolveGalleryItems'ın ürettiği indeksle birebir aynı (ham dizi pozisyonu).

type Ctx = { params: Promise<{ index: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { index } = await params;
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0) return new Response("Geçersiz indeks", { status: 400 });

  const settings = await getSiteSettings();
  const items = Array.isArray(settings.galleryItems) ? (settings.galleryItems as GalleryItem[]) : [];
  const item = items[i];
  if (!item?.imageUrl) return new Response("Görsel bulunamadı", { status: 404 });

  const result = await get(item.imageUrl, { access: "private" });
  if (!result?.stream) return new Response("Görsel bulunamadı (silinmiş olabilir)", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
