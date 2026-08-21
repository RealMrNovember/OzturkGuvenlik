import { db } from "@/lib/db";
import { products, productUnits, SERVICE_STOCK_SENTINEL } from "@/lib/db/schema";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createProductSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

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
  if (!hasPermission(session, "view_costs")) {
    return jsonOk(
      withLiveStock.map((r) => ({
        id: r.id,
        name: r.name,
        sku: r.sku,
        category: r.category,
        brand: r.brand,
        model: r.model,
        unit: r.unit,
        salePrice: r.salePrice,
        currency: r.currency,
        exchangeRate: r.exchangeRate,
        stockQty: r.stockQty,
        barcode: r.barcode,
        serialized: r.serialized,
        imageUrl: r.imageUrl,
        isService: r.isService,
        specs: r.specs,
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
  if (!hasPermission(session, "manage_products")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

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

  // Hizmet/işçilik kalemlerinin alış bedeli ve seri takibi kavramı yok —
  // istemci ne gönderirse göndersin sunucu tarafında sabitlenir (bkz.
  // lib/db/schema.ts'teki isService/SERVICE_STOCK_SENTINEL notu).
  const isService = parsed.data.isService;

  const [created] = await db
    .insert(products)
    .values({
      ...parsed.data,
      costPrice: isService ? "0" : String(parsed.data.costPrice),
      salePrice: String(parsed.data.salePrice),
      exchangeRate: String(parsed.data.exchangeRate),
      serialized: isService ? false : parsed.data.serialized,
      // Seri takipli üründe stok elle girilmez, ilk seri numaraları
      // eklenince kendiliğinden oluşur. Hizmette "sınırsız" stoğu temsil eder.
      stockQty: isService ? SERVICE_STOCK_SENTINEL : parsed.data.serialized ? 0 : parsed.data.stockQty,
      // "" değil null: barcode unique kısıtlı — boş string ile kaydedilirse
      // barkodsuz ikinci bir ürün eklenirken "duplicate key" hatası verir.
      barcode: parsed.data.barcode || null,
    })
    .returning();

  return jsonOk(created);
}
