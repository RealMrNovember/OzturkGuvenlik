import Image from "next/image";
import { getSiteSettings } from "@/lib/site-settings";
import { resolveHeroVideos } from "@/lib/hero-size";
import { HeroVideoSlider } from "@/components/HeroVideoSlider";

/**
 * Hero arka planı: Site Ayarları'nda bir veya daha fazla YouTube linki
 * girilmişse tam ekran kaplayan (cover-fill), otomatik döngülü bir video
 * (birden fazlaysa sırayla geçiş yapan bir slider) gösterilir; hiç video
 * yoksa mevcut statik görsele düşülür. Video, yalnızca sm: ve üzeri
 * ekranlarda gömülür — mobil tarayıcılar controls=0 parametresini yok
 * sayıp kendi native video kontrol arayüzünü (oynat/duraklat/sonraki)
 * üstte gösterebildiğinden, mobilde hiç iframe render edilmiyor ve
 * statik görsele düşülüyor.
 */
export async function HeroMedia() {
  const settings = await getSiteSettings();
  const videos = resolveHeroVideos(settings);

  return (
    <div className="absolute inset-0">
      {videos.length > 0 ? (
        <>
          <div className="pointer-events-none absolute inset-0 hidden overflow-hidden opacity-60 sm:block">
            <HeroVideoSlider
              videos={videos}
              autoplay={settings.heroVideoAutoplay}
              muted={settings.heroVideoMuted}
            />
          </div>
          <Image
            src="/images/hero-1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50 sm:hidden"
          />
        </>
      ) : (
        <Image
          src="/images/hero-1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/55 to-ink" />
      <span className="accent-bar absolute inset-x-0 bottom-0 w-full" />
    </div>
  );
}
