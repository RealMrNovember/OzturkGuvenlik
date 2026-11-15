/**
 * Google Haritalar'ın "Paylaş" düğmesi iki farklı link üretir: kısa paylaşım
 * linki (örn. https://share.google/xxxxx veya /maps/place/... sayfa linki —
 * tarayıcıda açılır ama Google bunu iframe içine gömülmeye KARŞI engeller,
 * "refused to connect" hatası verir) ve "Haritayı yerleştir" sekmesindeki
 * gerçek embed linki (/maps/embed veya ...&output=embed). Admin panelden
 * yanlışlıkla ilkini yapıştırmak çok kolay — bu yüzden gömülebilir olduğunu
 * doğrulamadan asla kullanmıyoruz; geçersizse adresten otomatik, her zaman
 * çalışan bir embed linki üretip ona düşüyoruz.
 */
export function isEmbeddableMapUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (!/(^|\.)google\.[a-z.]+$/i.test(u.hostname)) return false;
    return u.pathname.includes("/maps/embed") || u.searchParams.get("output") === "embed";
  } catch {
    return false;
  }
}

export function resolveMapEmbedUrl(candidate: string, address: string): string {
  if (isEmbeddableMapUrl(candidate)) return candidate;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}
