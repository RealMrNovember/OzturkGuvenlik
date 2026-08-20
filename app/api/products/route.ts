import { db } from "@/lib/db";
import { products, productUnits } from "@/lib/db/schema";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createProductSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db.select().from(products).orderBy(asc(products.name));

  // Seri takipli ürünlerde stok adedi elle girilmiyor — product_units'teki
  // "stokta" satır sayısından canlı hesaplanıyor (tek doğruluk kaynağı).
  const serializedIds = rows.filter((r) => r.serialized).map((r) => r.id);
  const stockCounts = serializedIds.length
    ? await db
        .select({ productId: productUnits.productId, count: sql<number>`count(*)::int` })
        .from(productUnits)
        .where(
          and(inArray(productUnits.productId, serializedIds), eq(productUnits.status, "stokta"))
        )
        .groupBy(productUnits.productId)
    : [];
  const stockMap = new Map(stockCounts.map((s) => [s.productId, s.count]));

  const withLiveStock = rows.map((r) => ({
    ...r,
    stockQty: r.serialized ? (stockMap.get(r.id) ?? 0) : r.stockQty,
  }));

  // Alış fiyatı ve kâr marjı yalnızca yönetici hesabına gösterilir; personel
  // ürünü tekliflere eklerken yalnızca satış fiyatını görür. Sızdırma riskini
  // azaltmak için beyaz liste kullanılıyor (yeni alan eklenirse varsayılan
  // olarak gizli kalır).
  if (session.role !== "admin") {
    return jsonOk(
      withLiveStock.map((r) => ({
        id: r.id,
        name: r.name,
        sku: r.sku,
        category: r.category,
        unit: r.unit,
        salePrice: r.salePrice,
        currency: r.currency,
        exchangeRate: r.exchangeRate,
        stockQty: r.stockQty,
        barcode: r.barcode,
        serialized: r.serialized,
        active: r.active,
        createdAt: r.createdAt,
      }))
    );
  }
  return jsonOk(withLiveStock);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  if (parsed.data.barcode) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.barcode, parsed.data.barcode))
      .limit(1);
    if (existing) return jsonErr("Bu barkod zaten başka bir ürüne kayıtlı", 409);
  }

  const [created] = await db
    .insert(products)
    .values({
      ...parsed.data,
      costPrice: String(parsed.data.costPrice),
      salePrice: String(parsed.data.salePrice),
      exchangeRate: String(parsed.data.exchangeRate),
      // Seri takipli üründe stok elle girilmez, ilk seri numaraları
      // eklenince kendiliğinden oluşur.
      stockQty: parsed.data.serialized ? 0 : parsed.data.stockQty,
    })
    .returning();

  return jsonOk(created);
}
