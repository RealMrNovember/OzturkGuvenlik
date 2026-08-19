import { getSiteSettings } from "@/lib/site-settings";
import { extractYouTubeId } from "@/lib/youtube";

function buildEmbedUrl(settings: {
  heroVideoUrl: string | null;
  heroVideoAutoplay: boolean;
  heroVideoMuted: boolean;
  heroVideoStart: number;
  heroVideoDuration: number | null;
}): string | null {
  const videoId = settings.heroVideoUrl ? extractYouTubeId(settings.heroVideoUrl) : null;
  if (!videoId) return null;

  const params = new URLSearchParams({
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    autoplay: settings.heroVideoAutoplay ? "1" : "0",
    mute: settings.heroVideoMuted ? "1" : "0",
  });
  if (settings.heroVideoStart > 0) params.set("start", String(settings.heroVideoStart));
  if (settings.heroVideoDuration) {
    params.set("end", String(settings.heroVideoStart + settings.heroVideoDuration));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Hero arka planı: Site Ayarları'nda bir YouTube linki girilmişse tam
 * ekran kaplayan (cover-fill), otomatik döngülü bir video gösterilir;
 * link boşsa mevcut statik görsele düşer.
 */
export async function HeroMedia() {
  const settings = await getSiteSettings();
  const embedUrl = buildEmbedUrl(settings);

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
