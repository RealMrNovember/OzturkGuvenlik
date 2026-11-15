import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceMedia, type ServiceMedia } from "@/lib/db/schema";
import { services, type Service } from "@/lib/services";

export async function listServiceMedia(): Promise<ServiceMedia[]> {
  return db.select().from(serviceMedia);
}

/** cache() ile sarıldı: hizmet detay sayfası hem hero boyutu için (page.tsx)
 * hem de videonun kendisi için (ServiceHeroMedia) aynı slug'ı sorgular —
 * tek render'da DB'ye yalnızca bir kez gidilir. */
export const getServiceMedia = cache(async (slug: string): Promise<ServiceMedia | null> => {
  const [row] = await db.select().from(serviceMedia).where(eq(serviceMedia.serviceSlug, slug)).limit(1);
  return row ?? null;
});

export type HomeServiceCard = {
  slug: string;
  name: string;
  description: string;
  icon: Service["icon"];
  imageUrl: string | null;
};

/** Anasayfa "Ne arıyorsunuz?" bölümü için: statik hizmet listesiyle admin'in
 * service_media'da düzenlediği kart ayarlarını birleştirir. Kart gizlenmişse
 * (cardVisible=false) listeye hiç girmez; başlık/açıklama boşsa statik
 * hizmet adı/açıklamasına, görsel yoksa null'a (ikon gösterimine) düşer. */
export async function getHomeServiceCards(): Promise<HomeServiceCard[]> {
  const rows = await listServiceMedia();
  const bySlug = new Map(rows.map((r) => [r.serviceSlug, r]));

  return services
    .map((s, i) => {
      const row = bySlug.get(s.slug);
      return {
        service: s,
        row,
        order: row?.cardSortOrder ?? i,
        visible: row?.cardVisible ?? true,
      };
    })
    .filter((x) => x.visible)
    .sort((a, b) => a.order - b.order)
    .map(({ service: s, row }) => ({
      slug: s.slug,
      name: row?.cardTitle?.trim() || s.name,
      description: row?.cardDescription?.trim() || s.short,
      icon: s.icon,
      // Proxy route'u uzun süreli (immutable) cache'leniyor; görsel admin
      // tarafından değiştirildiğinde ziyaretçiye eskisinin gösterilmemesi
      // için blob dosya adından bir versiyon sorgu parametresi ekleniyor.
      imageUrl: row?.cardImageUrl
        ? `/api/public/service-cards/${s.slug}/image?v=${encodeURIComponent(row.cardImageUrl.split("/").pop() ?? "")}`
        : null,
    }));
}

export async function upsertServiceMedia(
  slug: string,
  patch: {
    videoUrl: string;
    videoAutoplay: boolean;
    videoMuted: boolean;
    videoStart: number;
    videoDuration: number | null;
    heroSize: string;
    cardTitle: string;
    cardDescription: string;
    cardVisible: boolean;
    cardSortOrder: number;
  },
  updatedBy: number
): Promise<ServiceMedia> {
  const [row] = await db
    .insert(serviceMedia)
    .values({ serviceSlug: slug, ...patch, updatedBy })
    .onConflictDoUpdate({
      target: serviceMedia.serviceSlug,
      set: { ...patch, updatedAt: new Date(), updatedBy },
    })
    .returning();
  return row;
}
