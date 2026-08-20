import { list, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { supplierInvoices } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export const INVOICE_SCAN_PREFIX = "toptanci-taramalari/";
/** Ek ücretlendirmeye tabi kalmamak için: yalnızca en yeni N taranan belge
 * tutulur, fazlası otomatik silinir (bkz. app/api/suppliers/scan-upload ve
 * app/api/cron/cleanup-invoice-scans). 200 dosya, Vercel Blob'un ücretsiz
 * katmanının (~1GB) çok altında kalacak şekilde seçildi (bkz. Vercel Blob
 * fiyatlandırma sayfası) — küçük işletme hacminde yıllarca yetecek gerçek
 * bir denetim izi sağlar. */
export const INVOICE_SCAN_RETENTION_LIMIT = 200;

/**
 * En yeni INVOICE_SCAN_RETENTION_LIMIT taranan belgeyi tutar, fazlasını
 * siler ve silinen dosyalara işaret eden supplier_invoices.scannedFileUrl
 * alanlarını null'a çeker (kırık link kalmasın diye). Hem her yeni
 * yüklemeden sonra (anında garanti) hem de günlük cron'dan (yedek/emniyet)
 * çağrılır — iki katmanlı, biri diğerine bağımlı değil.
 */
export async function enforceInvoiceScanRetention(): Promise<{ deletedCount: number }> {
  const { blobs } = await list({ prefix: INVOICE_SCAN_PREFIX, limit: 1000 });
  const sorted = [...blobs].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  const toDelete = sorted.slice(INVOICE_SCAN_RETENTION_LIMIT);
  if (toDelete.length === 0) return { deletedCount: 0 };

  const urls = toDelete.map((b) => b.url);
  await del(urls);
  await db
    .update(supplierInvoices)
    .set({ scannedFileUrl: null })
    .where(inArray(supplierInvoices.scannedFileUrl, urls));

  return { deletedCount: urls.length };
}
