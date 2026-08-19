export type BarcodeSuggestion = {
  name: string;
  category: string;
};

type UpcItemDbResponse = {
  code: string;
  items?: {
    title?: string;
    brand?: string;
    category?: string;
  }[];
};

/**
 * Yerelde eşleşmeyen bir barkodu genel bir ürün veritabanında arar.
 *
 * UPCitemdb'nin "trial" ucu kullanılıyor — API anahtarı gerektirmiyor,
 * günde ~100 sorgu sınırı var (bu işletmenin "yeni ürün ekleme" hacmi için
 * fazlasıyla yeterli). Kapsamı market/perakende ürünlerinde güçlü; markaya
 * özgü B2B güvenlik kamerası/NVR gibi modeller çoğunlukla bulunamaz — bu
 * beklenen bir durumdur, çağıran taraf `null` durumunda formu boş bırakıp
 * kullanıcıdan elle doldurmasını ister. Barkod ilk taramada mutlaka yerel
 * ürüne kaydedilir (bkz. app/api/products/lookup/route.ts), böylece bu
 * dış sorguya yalnızca bir kez ihtiyaç duyulur.
 *
 * Ağ hatası, zaman aşımı veya beklenmeyen yanıt biçiminde sessizce `null`
 * döner — global sorgu asla "yeni ürün ekle" akışını bozmamalı.
 */
export async function lookupBarcodeGlobal(barcode: string): Promise<BarcodeSuggestion | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as UpcItemDbResponse;
    const item = data.items?.[0];
    if (data.code !== "OK" || !item?.title) return null;

    return {
      name: [item.brand, item.title].filter(Boolean).join(" — "),
      category: item.category?.split(">").pop()?.trim() ?? "",
    };
  } catch {
    return null;
  }
}
