import { db } from "@/lib/db";
import { products, type JobItem } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
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

/**
 * Bir işin ürün kalemleri değiştiğinde stoktan farkı düşer/geri ekler.
 * Negatif stok engellenmiyor (gerçek envanter her zaman tam kayıtlı olmayabilir) —
 * bunun yerine düşük/negatif stok panelde uyarı olarak gösteriliyor.
 */
export async function applyStockDelta(
  tx: Tx,
  oldItems: JobItem[],
  newItems: JobItem[]
): Promise<void> {
  const delta = new Map<number, number>();
  for (const i of oldItems) delta.set(i.productId, (delta.get(i.productId) ?? 0) - i.qty);
  for (const i of newItems) delta.set(i.productId, (delta.get(i.productId) ?? 0) + i.qty);

  for (const [productId, qtyDelta] of delta) {
    if (qtyDelta === 0) continue;
    await tx
      .update(products)
      .set({ stockQty: sql`${products.stockQty} - ${qtyDelta}` })
      .where(eq(products.id, productId));
  }
}
