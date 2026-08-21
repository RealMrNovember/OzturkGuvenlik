import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, type SiteSettings, type SitePhone } from "@/lib/db/schema";
import { site as staticSite } from "@/lib/site";
import { toTelHref, type ResolvedSite } from "@/lib/site-resolve";

export type { ResolvedSite } from "@/lib/site-resolve";
export { toTelHref, resolvedWaLink, resolvedWaLinkDefault } from "@/lib/site-resolve";

const SETTINGS_ID = 1;

/** site_settings tek satırlık (singleton) bir tablo — her zaman id=1 kullanılır.
 * react cache() ile sarıldı: tek bir sayfa render'ında Header/Footer/MobileBar/
 * SEO gibi birden çok yer aynı isteği yapsa da DB'ye yalnızca bir kez gidilir. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
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
});

export async function updateSiteSettings(
  patch: Partial<Omit<SiteSettings, "id" | "updatedAt" | "updatedBy">>,
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

/** lib/site.ts'teki statik `site` nesnesiyle AYNI alan adlarını taşıyan,
 * DB'den gelen admin ayarlarıyla birleştirilmiş (boşsa statik değere düşen)
 * çözümlenmiş nesne — bkz. lib/site-resolve.ts'teki ResolvedSite şekli.
 * Yalnızca SUNUCU bileşenlerinde kullanılır (db bağlantısı içerir); istemci
 * bileşenleri components/SiteContext.tsx'teki useSite() hook'unu kullanır. */
export const getResolvedSite = cache(async (): Promise<ResolvedSite> => {
  const s = await getSiteSettings();
  const dbPhones = Array.isArray(s.phones) ? (s.phones as SitePhone[]).filter((p) => p?.number) : [];
  const phones: SitePhone[] =
    dbPhones.length > 0
      ? dbPhones
      : [
          { label: "", number: staticSite.phoneDisplay },
          { label: "", number: staticSite.secondPhoneDisplay },
        ];
  const primary = phones[0];
  const secondary = phones[1];

  return {
    name: staticSite.name,
    shortName: staticSite.shortName,
    googleName: staticSite.googleName,
    founded: staticSite.founded,
    ceo: staticSite.ceo,
    phones,
    phoneDisplay: primary.number,
    phoneHref: toTelHref(primary.number),
    secondPhoneDisplay: secondary?.number ?? "",
    secondPhoneHref: secondary ? toTelHref(secondary.number) : "",
    email: s.contactEmail || staticSite.email,
    whatsappNumber: s.whatsappNumber || staticSite.whatsappNumber,
    whatsappDefaultText: s.whatsappDefaultText || staticSite.whatsappDefaultText,
    address: s.address || staticSite.address,
    addressShort: staticSite.addressShort,
    instagram: s.instagramUrl || staticSite.instagram,
    facebook: s.facebookUrl || staticSite.facebook,
    googleReviewsUrl: s.googleReviewsUrl || staticSite.googleReviewsUrl,
    mapEmbedUrl: s.mapEmbedUrl || staticSite.mapEmbedUrl,
    mapLink: s.mapLink || staticSite.mapLink,
    domain: staticSite.domain,
    url: staticSite.url,
    rating: s.googleRating || staticSite.rating,
    reviewCount: s.googleReviewCount ?? staticSite.reviewCount,
    seoTitle: s.seoTitle || "",
    seoDescription: s.seoDescription || "",
    seoKeywords: s.seoKeywords || "",
    ogImageUrl: s.ogImageUrl || "/images/hero-1.jpg",
    googleAnalyticsId: s.googleAnalyticsId || "",
    googleSiteVerification: s.googleSiteVerification || "",
  };
});
