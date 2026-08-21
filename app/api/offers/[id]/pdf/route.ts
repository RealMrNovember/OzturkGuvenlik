import { renderToBuffer } from "@react-pdf/renderer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { offers, customers, type OfferItem } from "@/lib/db/schema";
import { jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { OfferInvoicePdf } from "@/components/pdf/OfferInvoicePdf";

type Ctx = { params: Promise<{ id: string }> };

const STATUS_LABEL: Record<string, string> = {
  tasarim: "Taslak",
  gonderildi: "Gönderildi",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
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

  const [offer] = await db
    .select({
      id: offers.id,
      title: offers.title,
      items: offers.items,
      taxRate: offers.taxRate,
      currency: offers.currency,
      status: offers.status,
      sentDate: offers.sentDate,
      note: offers.note,
      createdAt: offers.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(offers)
    .leftJoin(customers, eq(offers.customerId, customers.id))
    .where(eq(offers.id, numericId));

  if (!offer) return jsonErr("Teklif bulunamadı", 404);

  const buffer = await renderToBuffer(
    OfferInvoicePdf({
      data: {
        docType: "teklif",
        docNumber: `TKL-${String(offer.id).padStart(4, "0")}`,
        title: offer.title ?? "",
        customerName: offer.customerName ?? "-",
        address: offer.customerAddress || "-",
        phone: offer.customerPhone ?? "-",
        issueDate: fmtDate(offer.sentDate) || fmtDate(offer.createdAt.toISOString().slice(0, 10)),
        dueDate: "",
        statusLabel: STATUS_LABEL[offer.status] ?? offer.status,
        items: (offer.items as OfferItem[]).map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
        taxRate: Number(offer.taxRate),
        currency: offer.currency,
        note: offer.note ?? "",
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="teklif-${String(offer.id).padStart(4, "0")}.pdf"`,
    },
  });
}
