import { site } from "@/lib/site";
import type { Service } from "@/lib/services";

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.googleName,
    url: site.url,
    telephone: site.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yenibosna Merkez Mahallesi, Kenanbey Sokak No: 11",
      addressLocality: "İstanbul",
      addressRegion: "Bahçelievler",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 41.0055, longitude: 28.8367 },
    openingHours: "Mo-Sa 09:00-19:00",
    founder: { "@type": "Person", name: site.ceo },
    foundingDate: String(site.founded),
    priceRange: "₺₺",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating,
      reviewCount: site.reviewCount,
    },
    sameAs: [site.instagram, site.facebook, site.googleReviewsUrl],
    areaServed: "İstanbul",
  };
}

export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} Hizmeti`,
    serviceType: service.name,
    provider: { "@id": `${site.url}/#business` },
    url: `${site.url}/hizmetler/${service.slug}`,
    description: service.tagline,
    areaServed: "İstanbul",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
      description: "Ücretsiz keşif ve fiyat teklifi",
      availability: "https://schema.org/InStock",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
