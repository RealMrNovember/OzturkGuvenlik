import { getSiteSettings } from "@/lib/site-settings";
import { buildYoutubeBackgroundEmbedUrl } from "@/lib/youtube";

/**
 * Hero arka planı: Site Ayarları'nda bir YouTube linki girilmişse tam
 * ekran kaplayan (cover-fill), otomatik döngülü bir video gösterilir;
 * link boşsa mevcut statik görsele düşer.
 */
export async function HeroMedia() {
  const settings = await getSiteSettings();
  const embedUrl = buildYoutubeBackgroundEmbedUrl({
    videoUrl: settings.heroVideoUrl,
    autoplay: settings.heroVideoAutoplay,
    muted: settings.heroVideoMuted,
    start: settings.heroVideoStart,
    duration: settings.heroVideoDuration,
  });

  return (
    <div className="absolute inset-0">
      {embedUrl ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
          <iframe
            src={embedUrl}
            title="Tanıtım videosu"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
            style={{ aspectRatio: "16 / 9", minWidth: "100%", minHeight: "100%" }}
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/hero-1.jpg"
          alt=""
          className="h-full w-full object-cover opacity-50"
          width={2000}
          height={1500}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
      <span className="accent-bar absolute inset-x-0 bottom-0 w-full" />
    </div>
  );
}
