import { db } from "@/lib/db";
import { serviceTickets, type JobItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateServiceTicketSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { costTotalForItems, applyStockDelta, StockConflictError } from "@/lib/stock";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateServiceTicketSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(serviceTickets)
        .where(eq(serviceTickets.id, numericId))
        .limit(1);
      if (!before) return null;

      const set: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
      if (parsed.data.fee !== undefined) set.fee = String(parsed.data.fee);
      if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);

      if (parsed.data.items) {
        const oldItems = before.items as JobItem[];
        await applyStockDelta(tx, oldItems, parsed.data.items, { serviceTicketId: numericId });
        set.costTotal = String(await costTotalForItems(tx, parsed.data.items));
      }

      const [row] = await tx
        .update(serviceTickets)
        .set(set)
        .where(eq(serviceTickets.id, numericId))
        .returning();
      return row;
    });

    if (!updated) return jsonErr("Servis kaydı bulunamadı", 404);
    return jsonOk(updated);
  } catch (e) {
    if (e instanceof StockConflictError) return jsonErr(e.message, 409);
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const deleted = await db.transaction(async (tx) => {
    const [ticket] = await tx
      .select()
      .from(serviceTickets)
      .where(eq(serviceTickets.id, numericId))
      .limit(1);
    if (!ticket) return null;
    await applyStockDelta(tx, ticket.items as JobItem[], []);
    const [row] = await tx
      .delete(serviceTickets)
      .where(eq(serviceTickets.id, numericId))
      .returning({ id: serviceTickets.id });
    return row;
  });

  if (!deleted) return jsonErr("Servis kaydı bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
