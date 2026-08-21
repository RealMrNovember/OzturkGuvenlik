import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";

// Sabit bir tarih kullanılıyor — `new Date()` her build/istekte "bugün
// değişti" sinyali verir, bu da Google'ın gerçek değişiklik sıklığını
// yanlış yorumlamasına yol açar. Bu dosyada/içerikte gerçek bir değişiklik
// yapıldığında bu tarih elle güncellenmeli.
const LAST_MODIFIED = new Date("2026-08-21");

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/hizmetler", priority: 0.8 },
  { path: "/kesif", priority: 0.8 },
  { path: "/iletisim", priority: 0.7 },
  { path: "/hesaplama", priority: 0.6 },
  { path: "/sss", priority: 0.6 },
  { path: "/referanslarimiz", priority: 0.6 },
  { path: "/hakkimizda", priority: 0.6 },
  { path: "/markalarimiz", priority: 0.5 },
  { path: "/is-ortaklarimiz", priority: 0.5 },
  { path: "/mobil-uygulamalar", priority: 0.4 },
  { path: "/kalite-cevre-politikasi", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${site.url}/hizmetler/${s.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
