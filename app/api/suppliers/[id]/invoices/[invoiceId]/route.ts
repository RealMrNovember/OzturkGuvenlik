import { db } from "@/lib/db";
import { supplierInvoices, suppliers, transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateSupplierInvoiceSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string; invoiceId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { invoiceId } = await params;
  const numericId = Number(invoiceId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateSupplierInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [before] = await db
    .select()
    .from(supplierInvoices)
    .where(eq(supplierInvoices.id, numericId))
    .limit(1);
  if (!before) return jsonErr("Fatura bulunamadı", 404);

  const set: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.amount !== undefined) set.amount = String(parsed.data.amount);
  if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);
  const becamePaid = parsed.data.status === "odendi" && before.status !== "odendi";
  if (becamePaid && !parsed.data.paidDate) {
    set.paidDate = new Date().toISOString().slice(0, 10);
  }

  const [updated] = await db
    .update(supplierInvoices)
    .set(set)
    .where(eq(supplierInvoices.id, numericId))
    .returning();
  if (!updated) return jsonErr("Fatura bulunamadı", 404);

  // Tedarikçi faturası "ödendi" olarak işaretlendiğinde ödemeyi otomatik
  // olarak Kasa'ya (gider) düşür — aynı ödemeyi iki kez elle girmeyi önler.
  if (becamePaid) {
    const [supplier] = await db
      .select({ name: suppliers.name })
      .from(suppliers)
      .where(eq(suppliers.id, updated.supplierId))
      .limit(1);
    await db.insert(transactions).values({
      type: "gider",
      category: "tedarikci-odemesi",
      amount: updated.amount,
      currency: updated.currency,
      exchangeRate: updated.exchangeRate,
      date: (updated.paidDate as string) ?? new Date().toISOString().slice(0, 10),
      method: "havale",
      description: `${supplier?.name ?? "Tedarikçi"}${updated.invoiceNumber ? ` — ${updated.invoiceNumber}` : ""} faturası ödemesi`,
      createdBy: session.id,
    });
  }

  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "delete_records")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { invoiceId } = await params;
  const numericId = Number(invoiceId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [deleted] = await db
    .delete(supplierInvoices)
    .where(eq(supplierInvoices.id, numericId))
    .returning({ id: supplierInvoices.id });
  if (!deleted) return jsonErr("Fatura bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
