// DB'ye HİÇ dokunmayan saf yardımcılar — hem sunucu hem istemci bileşenlerinde
// güvenle import edilebilir. lib/site-settings.ts (db bağlantısı içerir,
// "pg" paketi Node-only) yalnızca sunucu bileşenlerinde import edilmeli;
// istemci bileşenleri (Header, kesif/hesaplama/sss sayfaları) bunun yerine
// bu dosyadan ve components/SiteContext.tsx'ten import eder.
import type { SitePhone } from "@/lib/db/schema";

export type ResolvedSite = {
  name: string;
  shortName: string;
  googleName: string;
  founded: number;
  ceo: string;
  phones: SitePhone[];
  phoneDisplay: string;
  phoneHref: string;
  secondPhoneDisplay: string;
  secondPhoneHref: string;
  email: string;
  whatsappNumber: string;
  whatsappDefaultText: string;
  address: string;
  addressShort: string;
  instagram: string;
  facebook: string;
  googleReviewsUrl: string;
  mapEmbedUrl: string;
  mapLink: string;
  domain: string;
  url: string;
  rating: string;
  reviewCount: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;
};

/** "0535 014 65 93" → "tel:+905350146593". Admin serbest biçimde yazsa da
 * (boşluklu/boşluksuz, başında 0 ya da 90 ile) doğru tel: linkini üretir. */
export function toTelHref(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+90${digits.slice(1)}`;
  return `tel:+90${digits}`;
}

export function resolvedWaLink(resolved: ResolvedSite, text: string): string {
  return `https://wa.me/${resolved.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function resolvedWaLinkDefault(resolved: ResolvedSite): string {
  return resolvedWaLink(resolved, resolved.whatsappDefaultText);
}
