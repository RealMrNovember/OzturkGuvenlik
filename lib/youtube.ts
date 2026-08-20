const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 * gibi yaygın YouTube URL biçimlerinden video ID'sini çıkarır. Tanınmayan
 * bir biçimse veya URL geçersizse null döner.
 */
export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      const vParam = url.searchParams.get("v");
      if (vParam && YOUTUBE_ID_REGEX.test(vParam)) return vParam;
      const match = url.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export type YoutubeBackgroundConfig = {
  videoUrl: string | null;
  autoplay: boolean;
  muted: boolean;
  start: number;
  duration: number | null;
};

/** Arka plan olarak otomatik döngülü oynatılan, kontrolsüz bir YouTube embed URL'i üretir. */
export function buildYoutubeBackgroundEmbedUrl(config: YoutubeBackgroundConfig): string | null {
  const videoId = config.videoUrl ? extractYouTubeId(config.videoUrl) : null;
  if (!videoId) return null;

  const params = new URLSearchParams({
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    autoplay: config.autoplay ? "1" : "0",
    mute: config.muted ? "1" : "0",
  });
  if (config.start > 0) params.set("start", String(config.start));
  if (config.duration) params.set("end", String(config.start + config.duration));

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
