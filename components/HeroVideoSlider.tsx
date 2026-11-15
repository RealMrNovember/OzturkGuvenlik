"use client";

import { useEffect, useRef, useState } from "react";
import { buildYoutubeBackgroundEmbedUrl, extractYouTubeId } from "@/lib/youtube";
import type { HeroVideo } from "@/lib/hero-size";

/** Süresi belirtilmemiş bir slaytın ekranda kalacağı varsayılan süre (sn). */
const DEFAULT_SLIDE_SECONDS = 15;

const IFRAME_CLASS =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[fadeIn_0.6s_ease] border-0";

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  getIframe: () => HTMLIFrameElement;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;
function loadYoutubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return youtubeApiPromise;
}

/**
 * Bir videoyu gerçek YouTube Player API'siyle oynatıp, tam olarak bittiği
 * (ended) anları sayar; `repeatCount` tura ulaşınca `onDone`'ı çağırır.
 * Süre tahmini yerine videonun GERÇEKTEN kaç kez oynadığını saydığı için
 * video uzunluğundan bağımsız, her zaman doğru çalışır.
 */
function RepeatCountedVideo({
  video,
  autoplay,
  muted,
  onDone,
}: {
  video: HeroVideo;
  autoplay: boolean;
  muted: boolean;
  onDone: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoId = extractYouTubeId(video.url);
    if (!videoId || !containerRef.current) return;

    let destroyed = false;
    let player: YTPlayer | null = null;
    let plays = 0;
    const target = Math.max(1, video.repeatCount ?? 1);
    const start = video.start ?? 0;

    loadYoutubeIframeApi().then(() => {
      if (destroyed || !containerRef.current || !window.YT) return;
      player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: muted ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          start,
        },
        events: {
          onReady: () => {
            const iframe = player?.getIframe();
            if (iframe) {
              iframe.className = IFRAME_CLASS;
              iframe.style.aspectRatio = "16 / 9";
              iframe.style.minWidth = "100%";
              iframe.style.minHeight = "100%";
              iframe.title = "Tanıtım videosu";
            }
          },
          onStateChange: (event: { data: number }) => {
            if (!window.YT || event.data !== window.YT.PlayerState.ENDED) return;
            plays += 1;
            if (plays >= target) {
              onDone();
            } else {
              player?.seekTo(start, true);
              player?.playVideo();
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      player?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.url, video.start, video.repeatCount]);

  return <div ref={containerRef} />;
}

/**
 * Birden fazla YouTube arka plan videosu arasında sırayla geçiş yapan,
 * kontrolsüz "hero slider". Her video kendi ayarıyla oynar: `repeatCount`
 * doluysa gerçek oynatma sayısı sayılır, boşsa eski "gösterim süresi"
 * (sn) davranışına düşülür. Son videodan sonra başa döner. Tek video
 * varsa normal döngülü oynatmadan farksızdır.
 */
export function HeroVideoSlider({
  videos,
  autoplay,
  muted,
}: {
  videos: HeroVideo[];
  autoplay: boolean;
  muted: boolean;
}) {
  const [index, setIndex] = useState(0);
  const safeIndex = index < videos.length ? index : 0;
  const current = videos[safeIndex];

  const advance = () => setIndex((i) => (i + 1) % videos.length);
  const useRepeatCount = Boolean(current?.repeatCount && current.repeatCount > 0 && videos.length > 1);

  useEffect(() => {
    if (useRepeatCount || videos.length < 2) return;
    const seconds =
      current?.duration && current.duration > 0 ? current.duration : DEFAULT_SLIDE_SECONDS;
    const timer = setTimeout(advance, seconds * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, videos.length, useRepeatCount]);

  if (!current) return null;

  if (useRepeatCount) {
    return (
      <RepeatCountedVideo key={safeIndex} video={current} autoplay={autoplay} muted={muted} onDone={advance} />
    );
  }

  const embedUrl = buildYoutubeBackgroundEmbedUrl({
    videoUrl: current.url,
    autoplay,
    muted,
    start: current.start ?? 0,
    duration: current.duration ?? null,
  });
  if (!embedUrl) return null;

  return (
    <iframe
      key={safeIndex}
      src={embedUrl}
      title="Tanıtım videosu"
      className={IFRAME_CLASS}
      style={{ aspectRatio: "16 / 9", minWidth: "100%", minHeight: "100%" }}
      allow="autoplay; encrypted-media"
    />
  );
}
