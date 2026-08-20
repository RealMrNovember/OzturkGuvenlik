import type { ExtractedInvoice } from "@/lib/invoice-ocr";

/**
 * Toptancılar liste sayfasında (henüz hiçbir toptancı seçilmeden) taranan
 * bir belgenin sonucunu, hedef toptancının detay sayfasına client-side
 * navigasyonla taşımak için kullanılan sessionStorage anahtarı — aynı
 * sekme içinde kısa ömürlü bir el değiştirme, kalıcı depolama değil.
 */
export const SCAN_HANDOFF_KEY = "toptanci-scan-handoff";

export type ScanHandoff = {
  result: ExtractedInvoice;
  scannedFileUrl: string;
  previewUrl: string;
  rawText: string;
  /** Bu tarama akışı içinde OTOMATİK oluşturulmuş toptancının id'si —
   * kullanıcı fatura formunu kaydetmeden iptal ederse bu toptancı da geri
   * silinir ("İptal diyorsam iptal olmalı": tarama hiçbir kalıcı kayıt
   * bırakmamalı). Mevcut/elle seçilmiş toptancıya taramada bulunmaz. */
  autoCreatedSupplierId?: number;
};
