import { getServiceMedia } from "@/lib/service-media";
import { buildYoutubeBackgroundEmbedUrl } from "@/lib/youtube";

/**
 * Hizmet detay sayfasının koyu başlık alanında oynatılan, hizmete özel
 * YouTube arka plan videosu — admin panelden hizmet bazında yönetilir
 * (bkz. /panel/hizmet-medya). Video tanımlı değilse hiçbir şey render etmez,
 * mevcut düz koyu arka plan (bg-ink) olduğu gibi kalır.
 */
export async function ServiceHeroMedia({ slug }: { slug: string }) {
  const media = await getServiceMedia(slug);
  const embedUrl = media
    ? buildYoutubeBackgroundEmbedUrl({
        videoUrl: media.videoUrl,
        autoplay: media.videoAutoplay,
        muted: media.videoMuted,
        start: media.videoStart,
        duration: media.videoDuration,
      })
    : null;
  if (!embedUrl) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <iframe
        src={embedUrl}
        title="Hizmet tanıtım videosu"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0 opacity-45"
        style={{ aspectRatio: "16 / 9", minWidth: "100%", minHeight: "100%" }}
        allow="autoplay; encrypted-media"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
    </div>
  );
}
