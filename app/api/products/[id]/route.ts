import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { updateProductSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_products")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  if (parsed.data.barcode) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.barcode, parsed.data.barcode), ne(products.id, numericId)))
      .limit(1);
    if (existing) return jsonErr("Bu barkod zaten başka bir ürüne kayıtlı", 409);
  }

  const set: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.costPrice !== undefined) set.costPrice = String(parsed.data.costPrice);
  if (parsed.data.salePrice !== undefined) set.salePrice = String(parsed.data.salePrice);
  if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);
  // "" değil null: barcode unique kısıtlı — bkz. POST /api/products'taki not.
  if (parsed.data.barcode !== undefined) set.barcode = parsed.data.barcode || null;

  const [updated] = await db
    .update(products)
    .set(set)
    .where(eq(products.id, numericId))
    .returning();
  if (!updated) return jsonErr("Ürün bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_products")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, numericId))
    .returning({ id: products.id });
  if (!deleted) return jsonErr("Ürün bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
