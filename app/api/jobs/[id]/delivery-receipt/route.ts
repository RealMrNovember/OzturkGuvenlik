import { renderToBuffer } from "@react-pdf/renderer";
import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, customers, type JobItem, type PhotoRef } from "@/lib/db/schema";
import { jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { JobDeliveryReceiptPdf } from "@/components/pdf/JobDeliveryReceiptPdf";

type Ctx = { params: Promise<{ id: string }> };

const STATUS_LABEL: Record<string, string> = {
  planlandi: "Planlandı",
  "devam-ediyor": "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  garanti: "Garanti",
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(`${d}T00:00:00`).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtMoney(n: number, currency: string): string {
  const symbol = { TRY: "₺", USD: "$", EUR: "€" }[currency] ?? currency;
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${symbol}`;
}

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [job] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      address: jobs.address,
      startDate: jobs.startDate,
      endDate: jobs.endDate,
      status: jobs.status,
      items: jobs.items,
      saleTotal: jobs.saleTotal,
      currency: jobs.currency,
      notes: jobs.notes,
      photos: jobs.photos,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .where(eq(jobs.id, numericId));

  if (!job) return jsonErr("İş bulunamadı", 404);

  const photos = (job.photos as PhotoRef[]) ?? [];
  const photoBuffers = (
    await Promise.all(
      photos.map(async (p) => {
        try {
          const result = await get(p.url, { access: "private" });
          if (!result?.stream) return null;
          const arrayBuffer = await new Response(result.stream).arrayBuffer();
          return Buffer.from(arrayBuffer);
        } catch {
          return null;
        }
      })
    )
  ).filter((b) => b !== null) as Buffer[];

  const buffer = await renderToBuffer(
    JobDeliveryReceiptPdf({
      data: {
        jobNo: String(job.id).padStart(4, "0"),
        title: job.title || `İş #${job.id}`,
        customerName: job.customerName ?? "-",
        address: job.address || job.customerAddress || "-",
        phone: job.customerPhone ?? "-",
        startDate: fmtDate(job.startDate),
        endDate: fmtDate(job.endDate),
        statusLabel: STATUS_LABEL[job.status] ?? job.status,
        items: (job.items as JobItem[]).map((i) => ({ name: i.name, qty: i.qty })),
        notes: job.notes ?? "",
        saleTotalLabel: fmtMoney(Number(job.saleTotal), job.currency),
        photoBuffers,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="teslim-tutanagi-${String(job.id).padStart(4, "0")}.pdf"`,
    },
  });
}
