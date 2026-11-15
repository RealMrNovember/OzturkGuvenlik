import type { SiteSettings } from "@/lib/db/schema";

/**
 * Hero bölümlerinin (anasayfa + hizmet sayfaları) video/görsel oynadığı
 * alanın dikey boyutu için ortak ölçek. Tailwind JIT derleyicisi sınıf
 * adlarını statik olarak taradığından (string birleştirme ile üretilemez),
 * her boyut için TAM sınıf adları burada sabit olarak tanımlanır.
 */
export const HERO_SIZES = ["kompakt", "normal", "genis", "ekstra-genis", "devasa"] as const;
export type HeroSize = (typeof HERO_SIZES)[number];

export const HERO_SIZE_LABELS: Record<HeroSize, string> = {
  kompakt: "Kompakt",
  normal: "Normal",
  genis: "Geniş",
  "ekstra-genis": "Ekstra Geniş",
  devasa: "Devasa",
};

export const HERO_SIZE_DESCRIPTIONS: Record<HeroSize, string> = {
  kompakt: "Dar — içerik üstte az boşlukla başlar",
  normal: "Varsayılan boyut",
  genis: "Video/görsel daha büyük ve belirgin görünür",
  "ekstra-genis": "En büyük hali — video tam anlamıyla öne çıkar",
  devasa: "En abartılı hâli — video neredeyse tüm ekranı kaplar",
};

/** Anasayfa hero bölümünün iç içerik kutusuna uygulanan dolgu (section'ın görünen yüksekliğini belirler). */
export const HOME_HERO_SIZE_CLASSES: Record<HeroSize, string> = {
  kompakt: "pt-14 pb-20 sm:pt-16 sm:pb-24",
  normal: "pt-20 pb-24 sm:pt-28 sm:pb-32",
  genis: "pt-28 pb-32 sm:pt-36 sm:pb-40",
  "ekstra-genis": "pt-36 pb-40 sm:pt-44 sm:pb-48",
  devasa: "pt-48 pb-56 sm:pt-56 sm:pb-64",
};

/** Hizmet detay sayfasının hero section'ına uygulanan dolgu. */
export const SERVICE_HERO_SIZE_CLASSES: Record<HeroSize, string> = {
  kompakt: "py-10 sm:py-12",
  normal: "py-16 sm:py-20",
  genis: "py-24 sm:py-28",
  "ekstra-genis": "py-32 sm:py-36",
  devasa: "py-44 sm:py-52",
};

export function isHeroSize(value: string): value is HeroSize {
  return (HERO_SIZES as readonly string[]).includes(value);
}

export function toHeroSize(value: string | null | undefined): HeroSize {
  return value && isHeroSize(value) ? value : "normal";
}

export type HeroVideo = { url: string; start?: number; duration?: number };

/**
 * heroVideos (yeni, çoklu) doluysa onu kullanır; boşsa eski tek-video
 * alanlarına (heroVideoUrl + start/duration) düşer — mevcut kayıtlı veri
 * hiçbir zaman kaybolmaz. Boş URL'li satırlar elenir.
 */
export function resolveHeroVideos(
  settings: Pick<SiteSettings, "heroVideos" | "heroVideoUrl" | "heroVideoStart" | "heroVideoDuration">
): HeroVideo[] {
  const list = Array.isArray(settings.heroVideos) ? (settings.heroVideos as HeroVideo[]) : [];
  const valid = list.filter((v) => v && typeof v.url === "string" && v.url.trim() !== "");
  if (valid.length > 0) return valid;

  if (settings.heroVideoUrl && settings.heroVideoUrl.trim() !== "") {
    return [
      {
        url: settings.heroVideoUrl,
        start: settings.heroVideoStart || undefined,
        duration: settings.heroVideoDuration ?? undefined,
      },
    ];
  }

  return [];
}
