import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { createProductSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db.select().from(products).orderBy(asc(products.name));

  // Alış fiyatı ve kâr marjı yalnızca yönetici hesabına gösterilir; personel
  // ürünü tekliflere eklerken yalnızca satış fiyatını görür. Sızdırma riskini
  // azaltmak için beyaz liste kullanılıyor (yeni alan eklenirse varsayılan
  // olarak gizli kalır).
  if (session.role !== "admin") {
    return jsonOk(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        sku: r.sku,
        category: r.category,
        unit: r.unit,
        salePrice: r.salePrice,
        stockQty: r.stockQty,
        active: r.active,
        createdAt: r.createdAt,
      }))
    );
  }
  return jsonOk(rows);
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

  const [created] = await db
    .insert(products)
    .values({
      ...parsed.data,
      costPrice: String(parsed.data.costPrice),
      salePrice: String(parsed.data.salePrice),
    })
    .returning();

  return jsonOk(created);
}
