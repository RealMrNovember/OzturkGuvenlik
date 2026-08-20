import { db } from "@/lib/db";
import { supplierInvoices, suppliers, type OfferItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

// Kalemler jsonb olarak tutulduğu için (bkz. supplier_invoices.items),
// bu ölçekte (küçük işletme, yüzlerce alış faturası) tüm faturaları çekip
// uygulama tarafında ilgili ürün id'sine göre filtrelemek DB'de jsonb
// containment sorgusu yazmaktan daha basit ve yeterince hızlı.
export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return jsonErr("Geçersiz ID", 400);

  const rows = await db
    .select({
      invoiceId: supplierInvoices.id,
      invoiceNumber: supplierInvoices.invoiceNumber,
      issueDate: supplierInvoices.issueDate,
      currency: supplierInvoices.currency,
      exchangeRate: supplierInvoices.exchangeRate,
      items: supplierInvoices.items,
      supplierId: supplierInvoices.supplierId,
      supplierName: suppliers.name,
    })
    .from(supplierInvoices)
    .leftJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
    .orderBy(supplierInvoices.issueDate);

  const history = rows.flatMap((r) =>
    (r.items as OfferItem[])
      .filter((item) => item.productId === productId)
      .map((item) => ({
        invoiceId: r.invoiceId,
        invoiceNumber: r.invoiceNumber,
        issueDate: r.issueDate,
        currency: r.currency,
        exchangeRate: r.exchangeRate,
        supplierId: r.supplierId,
        supplierName: r.supplierName,
        qty: item.qty,
        unitPrice: item.unitPrice,
      }))
  );
  history.reverse();

  return jsonOk(history);
}
