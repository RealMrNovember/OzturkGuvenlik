import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceMedia, type ServiceMedia } from "@/lib/db/schema";

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

export async function upsertServiceMedia(
  slug: string,
  patch: {
    videoUrl: string;
    videoAutoplay: boolean;
    videoMuted: boolean;
    videoStart: number;
    videoDuration: number | null;
    heroSize: string;
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
