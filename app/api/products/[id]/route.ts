import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateProductSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const set: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.costPrice !== undefined) set.costPrice = String(parsed.data.costPrice);
  if (parsed.data.salePrice !== undefined) set.salePrice = String(parsed.data.salePrice);

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
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

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
