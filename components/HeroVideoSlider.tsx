"use client";

import { useEffect, useState } from "react";
import { buildYoutubeBackgroundEmbedUrl } from "@/lib/youtube";
import type { HeroVideo } from "@/lib/hero-size";

/** Süresi belirtilmemiş bir slaytın ekranda kalacağı varsayılan süre (sn). */
const DEFAULT_SLIDE_SECONDS = 15;

/**
 * Birden fazla YouTube arka plan videosu arasında sırayla geçiş yapan,
 * kontrolsüz "hero slider". Her video kendi start/duration ayarıyla oynar;
 * süre dolunca bir sonrakine geçilir (son videodan sonra başa döner).
 * Tek video varsa normal döngülü oynatmadan farksızdır.
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

  useEffect(() => {
    if (videos.length < 2) return;
    const seconds =
      current?.duration && current.duration > 0 ? current.duration : DEFAULT_SLIDE_SECONDS;
    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % videos.length);
    }, seconds * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, videos.length]);

  if (!current) return null;

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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[fadeIn_0.6s_ease] border-0"
      style={{ aspectRatio: "16 / 9", minWidth: "100%", minHeight: "100%" }}
      allow="autoplay; encrypted-media"
    />
  );
}
