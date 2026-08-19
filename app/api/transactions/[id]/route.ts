import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateTransactionSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const set: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.amount !== undefined) set.amount = String(parsed.data.amount);

  const [updated] = await db
    .update(transactions)
    .set(set)
    .where(eq(transactions.id, numericId))
    .returning();
  if (!updated) return jsonErr("Kayıt bulunamadı", 404);
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
    .delete(transactions)
    .where(eq(transactions.id, numericId))
    .returning({ id: transactions.id });
  if (!deleted) return jsonErr("Kayıt bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
