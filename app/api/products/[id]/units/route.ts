import { db } from "@/lib/db";
import { products, productUnits } from "@/lib/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { bulkAddProductUnitsSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return jsonErr("Geçersiz ID", 400);

  const rows = await db
    .select()
    .from(productUnits)
    .where(eq(productUnits.productId, productId))
    .orderBy(desc(productUnits.createdAt));

  return jsonOk(rows);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_products")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return jsonErr("Geçersiz ID", 400);

  const [product] = await db
    .select({ id: products.id, serialized: products.serialized })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return jsonErr("Ürün bulunamadı", 404);
  if (!product.serialized) {
    return jsonErr("Bu ürün seri takipli değil — önce ürün ayarlarından işaretleyin", 400);
  }

  const body = await readJson(req);
  const parsed = bulkAddProductUnitsSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const incoming = [...new Set(parsed.data.serialNumbers.map((s) => s.trim()).filter(Boolean))];
  const existing = await db
    .select({ serialNumber: productUnits.serialNumber })
    .from(productUnits)
    .where(and(eq(productUnits.productId, productId), inArray(productUnits.serialNumber, incoming)));
  const existingSet = new Set(existing.map((e) => e.serialNumber));

  const toInsert = incoming.filter((s) => !existingSet.has(s));
  const created = toInsert.length
    ? await db
        .insert(productUnits)
        .values(toInsert.map((serialNumber) => ({ productId, serialNumber })))
        .returning()
    : [];

  return jsonOk({ added: created, skipped: incoming.filter((s) => existingSet.has(s)) });
}
