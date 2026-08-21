import { site } from "@/lib/site";
import type { Service } from "@/lib/services";
import type { ResolvedSite } from "@/lib/site-settings";

export function localBusinessJsonLd(resolved: ResolvedSite) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.googleName,
    url: site.url,
    telephone: resolved.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: resolved.address,
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 41.0055, longitude: 28.8367 },
    openingHours: "Mo-Sa 09:00-19:00",
    founder: { "@type": "Person", name: site.ceo },
    foundingDate: String(site.founded),
    priceRange: "₺₺",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: resolved.rating,
      reviewCount: resolved.reviewCount,
    },
    sameAs: [resolved.instagram, resolved.facebook, resolved.googleReviewsUrl],
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

export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

export function reviewsJsonLd(items: { name: string; text: string; rating: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    review: items.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewBody: r.text,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
  };
}
