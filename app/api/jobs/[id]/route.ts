import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { jobs, type JobItem, type PhotoRef } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateJobSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { costTotalForItems, applyStockDelta, StockConflictError } from "@/lib/stock";
import { hasPermission } from "@/lib/permissions";

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

  try {
    const updated = await db.transaction(async (tx) => {
      const [before] = await tx.select().from(jobs).where(eq(jobs.id, numericId)).limit(1);
      if (!before) return null;

      const set: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
      if (parsed.data.saleTotal !== undefined) set.saleTotal = String(parsed.data.saleTotal);
      if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);

      if (parsed.data.items) {
        const oldItems = before.items as JobItem[];
        await applyStockDelta(tx, oldItems, parsed.data.items, { jobId: numericId });
        set.costTotal = String(await costTotalForItems(tx, parsed.data.items));
      }

      const [row] = await tx.update(jobs).set(set).where(eq(jobs.id, numericId)).returning();
      return row;
    });

    if (!updated) return jsonErr("İş bulunamadı", 404);
    return jsonOk(updated);
  } catch (e) {
    if (e instanceof StockConflictError) return jsonErr(e.message, 409);
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "delete_records")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const result = await db.transaction(async (tx) => {
    const [job] = await tx.select().from(jobs).where(eq(jobs.id, numericId)).limit(1);
    if (!job) return null;
    // İş silinince, işte kullanılmış ürünleri stoğa geri ekle.
    await applyStockDelta(tx, job.items as JobItem[], []);
    const [row] = await tx.delete(jobs).where(eq(jobs.id, numericId)).returning({ id: jobs.id });
    return { row, photos: job.photos as PhotoRef[] };
  });

  if (!result) return jsonErr("İş bulunamadı", 404);
  // Blob'da birikmesin — iş kaydıyla birlikte fotoğrafları da sil.
  if (result.photos.length > 0) {
    await del(result.photos.map((p) => p.url)).catch(() => {});
  }
  return jsonOk({ id: result.row.id });
}
