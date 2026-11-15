declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Ads dönüşüm olayını güvenle tetikler. gtag henüz yüklenmemişse
 * (Google menüsünden Ads dönüşümü bağlanmamışsa, ya da reklam engelleyici
 * script'i bloke ettiyse) sessizce hiçbir şey yapmaz — form akışını asla
 * bozmaz.
 */
export function fireGoogleAdsConversion(conversionId: string, conversionLabel: string): void {
  if (!conversionId || !conversionLabel) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: `${conversionId}/${conversionLabel}` });
}
