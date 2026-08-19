import { db } from "@/lib/db";
import { jobs, type JobItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateJobSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { costTotalForItems, applyStockDelta } from "@/lib/stock";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const updated = await db.transaction(async (tx) => {
    const [before] = await tx.select().from(jobs).where(eq(jobs.id, numericId)).limit(1);
    if (!before) return null;

    const set: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.saleTotal !== undefined) set.saleTotal = String(parsed.data.saleTotal);

    if (parsed.data.items) {
      const oldItems = before.items as JobItem[];
      await applyStockDelta(tx, oldItems, parsed.data.items);
      set.costTotal = String(await costTotalForItems(tx, parsed.data.items));
    }

    const [row] = await tx.update(jobs).set(set).where(eq(jobs.id, numericId)).returning();
    return row;
  });

  if (!updated) return jsonErr("İş bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const deleted = await db.transaction(async (tx) => {
    const [job] = await tx.select().from(jobs).where(eq(jobs.id, numericId)).limit(1);
    if (!job) return null;
    // İş silinince, işte kullanılmış ürünleri stoğa geri ekle.
    await applyStockDelta(tx, job.items as JobItem[], []);
    const [row] = await tx.delete(jobs).where(eq(jobs.id, numericId)).returning({ id: jobs.id });
    return row;
  });

  if (!deleted) return jsonErr("İş bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
