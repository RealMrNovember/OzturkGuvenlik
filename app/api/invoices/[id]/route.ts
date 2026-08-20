import { db } from "@/lib/db";
import { invoices, transactions, type OfferItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateInvoiceSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { itemsTotalWithTax } from "@/lib/money";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [before] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, numericId))
    .limit(1);
  if (!before) return jsonErr("Fatura bulunamadı", 404);

  const set: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.taxRate !== undefined) set.taxRate = String(parsed.data.taxRate);
  if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);
  if (parsed.data.items || parsed.data.taxRate !== undefined) {
    const items = parsed.data.items ?? (before.items as OfferItem[]);
    const taxRate = parsed.data.taxRate ?? Number(before.taxRate);
    set.total = String(itemsTotalWithTax(items, taxRate));
  }
  const becamePaid = parsed.data.status === "odendi" && before.status !== "odendi";
  if (becamePaid && !parsed.data.paidDate) {
    set.paidDate = new Date().toISOString().slice(0, 10);
  }

  const [updated] = await db
    .update(invoices)
    .set(set)
    .where(eq(invoices.id, numericId))
    .returning();
  if (!updated) return jsonErr("Fatura bulunamadı", 404);

  // Fatura "ödendi" olarak işaretlendiğinde tahsilatı otomatik olarak
  // Kasa'ya (gelir) düşür — aynı ödemeyi iki kez elle girmeyi önler.
  if (becamePaid) {
    await db.insert(transactions).values({
      type: "gelir",
      category: "is-tahsilati",
      amount: updated.total,
      currency: updated.currency,
      exchangeRate: updated.exchangeRate,
      date: (updated.paidDate as string) ?? new Date().toISOString().slice(0, 10),
      method: "havale",
      description: `${updated.number} numaralı fatura tahsilatı`,
      jobId: updated.jobId,
      customerId: updated.customerId,
      invoiceId: updated.id,
      createdBy: session.id,
    });
  }

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
    .delete(invoices)
    .where(eq(invoices.id, numericId))
    .returning({ id: invoices.id });
  if (!deleted) return jsonErr("Fatura bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
