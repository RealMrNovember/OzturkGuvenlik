import { db } from "@/lib/db";
import { products, productUnits, type JobItem } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { round2 } from "@/lib/money";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function costTotalForItems(tx: Tx, items: JobItem[]): Promise<number> {
  if (items.length === 0) return 0;
  const ids = [...new Set(items.map((i) => i.productId))];
  const rows = await tx
    .select({ id: products.id, costPrice: products.costPrice })
    .from(products)
    .where(inArray(products.id, ids));
  const costMap = new Map(rows.map((r) => [r.id, Number(r.costPrice)]));
  return round2(items.reduce((sum, i) => sum + i.qty * (costMap.get(i.productId) ?? 0), 0));
}

type StockRef = { jobId?: number | null; serviceTicketId?: number | null };

/** Seçilen seri numaralı birimlerden biri artık "stokta" değilse (başka bir
 * kayıtta aynı anda kullanılmışsa) fırlatılır. */
export class StockConflictError extends Error {}

/**
 * Bir işin/servis kaydının ürün kalemleri değiştiğinde stoktan farkı
 * düşer/geri ekler. İki ayrı mod aynı çağrıda birlikte çalışır:
 *
 * - Adet bazlı ürünler (item.unitIds yok): products.stockQty'den fark kadar
 *   düşülür/eklenir. Negatif stok engellenmiyor (gerçek envanter her zaman
 *   tam kayıtlı olmayabilir) — bunun yerine düşük/negatif stok panelde
 *   uyarı olarak gösteriliyor.
 * - Seri takipli ürünler (item.unitIds dolu): belirli product_units satırları
 *   "kuruldu" (yeni seçilenler, ref ile ilişkilendirilir) veya "stokta"
 *   (artık seçilmeyenler, ilişki temizlenir) olarak işaretlenir — sayı değil,
 *   somut fiziksel birim takip edilir.
 */
export async function applyStockDelta(
  tx: Tx,
  oldItems: JobItem[],
  newItems: JobItem[],
  ref: StockRef = {}
): Promise<void> {
  const qtyDelta = new Map<number, number>();
  for (const i of oldItems) {
    if (i.unitIds) continue;
    qtyDelta.set(i.productId, (qtyDelta.get(i.productId) ?? 0) - i.qty);
  }
  for (const i of newItems) {
    if (i.unitIds) continue;
    qtyDelta.set(i.productId, (qtyDelta.get(i.productId) ?? 0) + i.qty);
  }
  for (const [productId, delta] of qtyDelta) {
    if (delta === 0) continue;
    await tx
      .update(products)
      .set({ stockQty: sql`${products.stockQty} - ${delta}` })
      .where(eq(products.id, productId));
  }

  const oldUnitIds = new Set(oldItems.flatMap((i) => i.unitIds ?? []));
  const newUnitIds = new Set(newItems.flatMap((i) => i.unitIds ?? []));
  const released = [...oldUnitIds].filter((id) => !newUnitIds.has(id));
  const claimed = [...newUnitIds].filter((id) => !oldUnitIds.has(id));

  if (released.length > 0) {
    await tx
      .update(productUnits)
      .set({ status: "stokta", jobId: null, serviceTicketId: null, installedAt: null })
      .where(inArray(productUnits.id, released));
  }
  if (claimed.length > 0) {
    // Yalnızca hâlâ "stokta" olan birimleri talep et — aynı anda başka bir
    // iş/servis kaydına eklenmiş olabilir, bu durumda çakışma hatası ver.
    const claimedRows = await tx
      .update(productUnits)
      .set({
        status: "kuruldu",
        jobId: ref.jobId ?? null,
        serviceTicketId: ref.serviceTicketId ?? null,
        installedAt: new Date(),
      })
      .where(and(inArray(productUnits.id, claimed), eq(productUnits.status, "stokta")))
      .returning({ id: productUnits.id });
    if (claimedRows.length < claimed.length) {
      throw new StockConflictError(
        "Seçilen seri numaralarından bir veya birkaçı artık stokta değil (başka bir kayıtta kullanılmış olabilir) — sayfayı yenileyip tekrar deneyin."
      );
    }
  }
}
