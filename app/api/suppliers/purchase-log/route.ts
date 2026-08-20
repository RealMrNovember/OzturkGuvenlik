import { db } from "@/lib/db";
import { supplierInvoices, suppliers, type OfferItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

// Toptancılar sayfasındaki "Alım Kayıtları" profesyonel filtreleme paneli
// (tedarikçi / ürün / fiyat / tarih bazlı) için — tüm tedarikçilerin tüm
// fatura kalemlerini tek, düz bir listeye çevirir. Bu ölçekte (küçük
// işletme) tüm kayıtları çekip istemci tarafında filtrelemek yeterli —
// bkz. app/api/products/[id]/purchase-history'deki aynı yaklaşım notu.
export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const rows = await db
    .select({
      invoiceId: supplierInvoices.id,
      invoiceNumber: supplierInvoices.invoiceNumber,
      issueDate: supplierInvoices.issueDate,
      status: supplierInvoices.status,
      received: supplierInvoices.received,
      currency: supplierInvoices.currency,
      exchangeRate: supplierInvoices.exchangeRate,
      items: supplierInvoices.items,
      supplierId: supplierInvoices.supplierId,
      supplierName: suppliers.name,
    })
    .from(supplierInvoices)
    .leftJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
    .orderBy(supplierInvoices.issueDate);

  const log = rows.flatMap((r) =>
    (r.items as OfferItem[]).map((item, idx) => ({
      key: `${r.invoiceId}-${idx}`,
      invoiceId: r.invoiceId,
      invoiceNumber: r.invoiceNumber,
      issueDate: r.issueDate,
      status: r.status,
      received: r.received,
      currency: r.currency,
      exchangeRate: r.exchangeRate,
      supplierId: r.supplierId,
      supplierName: r.supplierName,
      productId: item.productId ?? null,
      productName: item.name,
      qty: item.qty,
      unitPrice: item.unitPrice,
    }))
  );
  log.reverse();

  return jsonOk(log);
}
