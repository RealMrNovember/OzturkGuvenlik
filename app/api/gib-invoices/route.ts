import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { gibInvoices, GIB_INVOICE_DIRECTIONS } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const url = new URL(req.url);
  const direction = url.searchParams.get("direction");
  const q = url.searchParams.get("q")?.trim();

  const conditions = [];
  if (direction && (GIB_INVOICE_DIRECTIONS as readonly string[]).includes(direction)) {
    conditions.push(eq(gibInvoices.direction, direction));
  }
  if (q) {
    conditions.push(
      or(
        ilike(gibInvoices.invoiceNumber, `%${q}%`),
        ilike(gibInvoices.counterpartyName, `%${q}%`),
        ilike(gibInvoices.counterpartyTaxId, `%${q}%`)
      )
    );
  }

  const rows = await db
    .select({
      id: gibInvoices.id,
      direction: gibInvoices.direction,
      ettn: gibInvoices.ettn,
      invoiceNumber: gibInvoices.invoiceNumber,
      issueDate: gibInvoices.issueDate,
      counterpartyName: gibInvoices.counterpartyName,
      counterpartyTaxId: gibInvoices.counterpartyTaxId,
      amount: gibInvoices.amount,
      taxAmount: gibInvoices.taxAmount,
      currency: gibInvoices.currency,
      gibStatus: gibInvoices.gibStatus,
      xmlUrl: gibInvoices.xmlUrl,
      pdfUrl: gibInvoices.pdfUrl,
      createdAt: gibInvoices.createdAt,
    })
    .from(gibInvoices)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(gibInvoices.issueDate), desc(gibInvoices.id))
    .limit(2000);

  return jsonOk(rows);
}
