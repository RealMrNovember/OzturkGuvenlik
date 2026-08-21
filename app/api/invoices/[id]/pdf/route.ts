import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, customers, type OfferItem } from "@/lib/db/schema";
import { jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { OfferInvoicePdf } from "@/components/pdf/OfferInvoicePdf";

type Ctx = { params: Promise<{ id: string }> };

const STATUS_LABEL: Record<string, string> = {
  taslak: "Taslak",
  gonderildi: "Gönderildi",
  odendi: "Ödendi",
  iptal: "İptal",
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(`${d}T00:00:00`).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [invoice] = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      items: invoices.items,
      taxRate: invoices.taxRate,
      currency: invoices.currency,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      note: invoices.note,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, numericId));

  if (!invoice) return jsonErr("Fatura bulunamadı", 404);

  const buffer = await renderToBuffer(
    OfferInvoicePdf({
      data: {
        docType: "fatura",
        docNumber: invoice.number,
        title: "",
        customerName: invoice.customerName ?? "-",
        address: invoice.customerAddress || "-",
        phone: invoice.customerPhone ?? "-",
        issueDate: fmtDate(invoice.issueDate),
        dueDate: fmtDate(invoice.dueDate),
        statusLabel: STATUS_LABEL[invoice.status] ?? invoice.status,
        items: (invoice.items as OfferItem[]).map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        taxRate: Number(invoice.taxRate),
        currency: invoice.currency,
        note: invoice.note ?? "",
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fatura-${invoice.number}.pdf"`,
    },
  });
}
