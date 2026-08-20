import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceMedia, type ServiceMedia } from "@/lib/db/schema";

export async function listServiceMedia(): Promise<ServiceMedia[]> {
  return db.select().from(serviceMedia);
}

export async function getServiceMedia(slug: string): Promise<ServiceMedia | null> {
  const [row] = await db.select().from(serviceMedia).where(eq(serviceMedia.serviceSlug, slug)).limit(1);
  return row ?? null;
}

export async function upsertServiceMedia(
  slug: string,
  patch: {
    videoUrl: string;
    videoAutoplay: boolean;
    videoMuted: boolean;
    videoStart: number;
    videoDuration: number | null;
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
