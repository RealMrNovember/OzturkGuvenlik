import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, type SiteSettings } from "@/lib/db/schema";

const SETTINGS_ID = 1;

/** site_settings tek satırlık (singleton) bir tablo — her zaman id=1 kullanılır. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const [existing] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SETTINGS_ID));
  if (existing) return existing;

  const [inserted] = await db
    .insert(siteSettings)
    .values({ id: SETTINGS_ID })
    .onConflictDoNothing({ target: siteSettings.id })
    .returning();
  if (inserted) return inserted;

  const [afterRace] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, SETTINGS_ID));
  return afterRace;
}

export async function updateSiteSettings(
  patch: Partial<Pick<SiteSettings, "brandColor" | "brandLightColor">>,
  updatedBy: number
): Promise<SiteSettings> {
  await getSiteSettings();
  const [updated] = await db
    .update(siteSettings)
    .set({ ...patch, updatedAt: new Date(), updatedBy })
    .where(eq(siteSettings.id, SETTINGS_ID))
    .returning();
  return updated;
}
