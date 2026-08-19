import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateCustomerSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [row] = await db.select().from(customers).where(eq(customers.id, numericId)).limit(1);
  if (!row) return jsonErr("Müşteri bulunamadı", 404);
  return jsonOk(row);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [updated] = await db
    .update(customers)
    .set(parsed.data)
    .where(eq(customers.id, numericId))
    .returning();
  if (!updated) return jsonErr("Müşteri bulunamadı", 404);
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
    .delete(customers)
    .where(eq(customers.id, numericId))
    .returning({ id: customers.id });
  if (!deleted) return jsonErr("Müşteri bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}