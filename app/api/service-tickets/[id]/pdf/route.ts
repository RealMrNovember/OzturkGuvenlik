import { renderToBuffer } from "@react-pdf/renderer";
import { inArray, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  serviceTickets,
  customers,
  products,
  productUnits,
  type JobItem,
  type ServiceTicketBillingType,
  type ServiceTicketCategory,
  type ServiceTicketRequestType,
} from "@/lib/db/schema";
import { jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ServiceFormPdf, type ServiceFormItem } from "@/components/pdf/ServiceFormPdf";

type Ctx = { params: Promise<{ id: string }> };

function fmtDate(d: Date): string {
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(d: Date): string {
  return `${fmtDate(d)} ${d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
}

function computeDuration(start: string, end: string): string {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} dk`;
  if (m === 0) return `${h} sa`;
  return `${h} sa ${m} dk`;
}

const STATUS_LABEL: Record<string, string> = {
  acik: "Açık",
  "randevu-verildi": "Randevu Verildi",
  tamamlandi: "Tamamlandı",
  iptal: "İptal Edildi",
};

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [ticket] = await db
    .select({
      id: serviceTickets.id,
      device: serviceTickets.device,
      location: serviceTickets.location,
      issue: serviceTickets.issue,
      result: serviceTickets.result,
      status: serviceTickets.status,
      items: serviceTickets.items,
      fee: serviceTickets.fee,
      category: serviceTickets.category,
      requestType: serviceTickets.requestType,
      billingType: serviceTickets.billingType,
      startTime: serviceTickets.startTime,
      endTime: serviceTickets.endTime,
      createdAt: serviceTickets.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(serviceTickets)
    .leftJoin(customers, eq(serviceTickets.customerId, customers.id))
    .where(eq(serviceTickets.id, numericId));

  if (!ticket) return jsonErr("Servis kaydı bulunamadı", 404);

  const items = ticket.items as JobItem[];
  const productIds = [...new Set(items.map((i) => i.productId))];
  const productRows = productIds.length
    ? await db
        .select({ id: products.id, sku: products.sku, name: products.name, salePrice: products.salePrice })
        .from(products)
        .where(inArray(products.id, productIds))
    : [];
  const productMap = new Map(productRows.map((p) => [p.id, p]));

  const unitIds = items.flatMap((i) => i.unitIds ?? []);
  const unitRows = unitIds.length
    ? await db
        .select({ id: productUnits.id, serialNumber: productUnits.serialNumber })
        .from(productUnits)
        .where(inArray(productUnits.id, unitIds))
    : [];
  const unitMap = new Map(unitRows.map((u) => [u.id, u.serialNumber]));

  const formItems: ServiceFormItem[] = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = Number(product?.salePrice ?? 0);
    const serialNo = (item.unitIds ?? []).map((uid) => unitMap.get(uid)).filter(Boolean).join(", ");
    return {
      code: product?.sku || String(item.productId),
      name: item.name,
      serialNo,
      qty: item.qty,
      unitPrice,
      total: item.qty * unitPrice,
    };
  });

  const materialTotal = formItems.reduce((sum, i) => sum + i.total, 0);
  const serviceFee = Number(ticket.fee);

  const buffer = await renderToBuffer(
    ServiceFormPdf({
      data: {
        formNo: String(ticket.id).padStart(5, "0"),
        category: (ticket.category || "diger") as ServiceTicketCategory,
        requestType: (ticket.requestType || "servis") as ServiceTicketRequestType,
        billingType: (ticket.billingType || "ucretli") as ServiceTicketBillingType,
        customerName: ticket.customerName ?? "-",
        address: ticket.location || ticket.customerAddress || "-",
        phone: ticket.customerPhone ?? "-",
        reportedAt: fmtDateTime(ticket.createdAt),
        serviceDate: fmtDate(ticket.createdAt),
        startTime: ticket.startTime ?? "",
        endTime: ticket.endTime ?? "",
        totalDuration: computeDuration(ticket.startTime ?? "", ticket.endTime ?? ""),
        requestReason: ticket.issue,
        workDone: ticket.result ?? "",
        result: STATUS_LABEL[ticket.status] ?? ticket.status,
        items: formItems,
        note: "",
        materialTotal,
        serviceFee,
        grandTotal: materialTotal + serviceFee,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="servis-formu-${String(ticket.id).padStart(5, "0")}.pdf"`,
    },
  });
}
