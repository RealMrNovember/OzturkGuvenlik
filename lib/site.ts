export const site = {
  name: "Öztürk Güvenlik Sistemleri",
  shortName: "Öztürk Güvenlik",
  googleName: "Öztürk Kamera & Güvenlik Sistemleri",
  founded: 2014,
  ceo: "Recep Özkan Öztürk",
  phoneDisplay: "0535 014 65 93",
  phoneHref: "tel:+905350146593",
  secondPhoneDisplay: "0551 647 05 34",
  secondPhoneHref: "tel:+905516470534",
  email: "guvenlikozturk@gmail.com",
  whatsappNumber: "905350146593",
  whatsappDefaultText: "Merhabalar, güvenlik sistemleri için fiyat almak istiyorum.",
  address: "Yenibosna Merkez Mahallesi, Kenanbey Sokak No: 11, Bahçelievler / İstanbul",
  addressShort: "Yenibosna / İstanbul",
  instagram: "https://www.instagram.com/ozturkgvnlk_/",
  facebook: "https://www.facebook.com/ozturkgvnlk",
  googleReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Öztürk+Kamera+%26+Güvenlik+Sistemleri+Yenibosna",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Yenibosna%20Merkez%20Mahallesi%20Kenanbey%20Sokak%20No%2011%20İstanbul&t=m&z=16&output=embed&iwloc=near",
  mapLink:
    "https://maps.google.com/?q=Yenibosna+Merkez+Mahallesi+Kenanbey+Sokak+No:11+İstanbul",
  // Google Ads bu domain (ozturkguvenlik.com) üzerinden reklam vereceği için
  // kanonik host bu olmalı — sitemap, robots.txt, canonical/OG/JSON-LD hepsi
  // buradan türüyor. Türkçe karakterli IDN (öztürkgüvenlik.com) de Vercel'de
  // aynı projeye bağlı; aynı içeriği iki ayrı domainden servis edip
  // "duplicate content" oluşturmaması için middleware.ts o domaine gelen
  // her isteği buraya 308 ile yönlendiriyor. Vercel'de apex → www 308
  // yönlendirmesi var, bu yüzden kanonik host www'lı.
  domain: "www.ozturkguvenlik.com",
  url: "https://www.ozturkguvenlik.com",
  rating: "5.0",
  reviewCount: 33,
} as const;

export function waLink(text: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function waLinkDefault(): string {
  return waLink(site.whatsappDefaultText);
}
