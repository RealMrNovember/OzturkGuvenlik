import { db } from "@/lib/db";
import { supplierInvoices, suppliers, transactions, type OfferItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateSupplierInvoiceSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { itemsTotalWithTax } from "@/lib/money";
import { receiveStock } from "@/lib/stock";

type Ctx = { params: Promise<{ id: string; invoiceId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

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
  if (parsed.data.exchangeRate !== undefined) set.exchangeRate = String(parsed.data.exchangeRate);
  if (parsed.data.taxRate !== undefined) set.taxRate = String(parsed.data.taxRate);
  const items = (parsed.data.items ?? (before.items as OfferItem[])) as OfferItem[];
  if (items.length > 0) {
    const taxRate = parsed.data.taxRate ?? Number(before.taxRate);
    set.amount = String(itemsTotalWithTax(items, taxRate));
  } else if (parsed.data.amount !== undefined) {
    set.amount = String(parsed.data.amount);
  }

  const becamePaid = parsed.data.status === "odendi" && before.status !== "odendi";
  if (becamePaid && !parsed.data.paidDate) {
    set.paidDate = new Date().toISOString().slice(0, 10);
  }
  const becameReceived = parsed.data.received === true && !before.received;
  if (becameReceived && !parsed.data.receivedAt) {
    set.receivedAt = new Date().toISOString().slice(0, 10);
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(supplierInvoices)
      .set(set)
      .where(eq(supplierInvoices.id, numericId))
      .returning();
    if (!row) return null;

    // Tedarikçi faturası "ödendi" olarak işaretlendiğinde ödemeyi otomatik
    // olarak Kasa'ya (gider) düşür — aynı ödemeyi iki kez elle girmeyi önler.
    if (becamePaid) {
      const [supplier] = await tx
        .select({ name: suppliers.name })
        .from(suppliers)
        .where(eq(suppliers.id, row.supplierId))
        .limit(1);
      await tx.insert(transactions).values({
        type: "gider",
        category: "tedarikci-odemesi",
        amount: row.amount,
        currency: row.currency,
        exchangeRate: row.exchangeRate,
        date: (row.paidDate as string) ?? new Date().toISOString().slice(0, 10),
        method: "havale",
        description: `${supplier?.name ?? "Tedarikçi"}${row.invoiceNumber ? ` — ${row.invoiceNumber}` : ""} faturası ödemesi`,
        createdBy: session.id,
      });
    }

    let needsSerialEntry: number[] = [];
    if (becameReceived) {
      const result = await receiveStock(tx, items);
      needsSerialEntry = result.needsSerialEntry;
    }

    return { row, needsSerialEntry };
  });

  if (!updated) return jsonErr("Fatura bulunamadı", 404);
  return jsonOk({ ...updated.row, needsSerialEntry: updated.needsSerialEntry });
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
