import { db } from "@/lib/db";
import { invoices, customers, jobs } from "@/lib/db/schema";
import { desc, eq, like } from "drizzle-orm";
import { createInvoiceSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { itemsTotalWithTax } from "@/lib/money";

async function nextInvoiceNumber(year: string): Promise<string> {
  const prefix = `OG-${year}-`;
  const rows = await db
    .select({ number: invoices.number })
    .from(invoices)
    .where(like(invoices.number, `${prefix}%`));
  const seq = rows.length + 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      customerId: invoices.customerId,
      jobId: invoices.jobId,
      offerId: invoices.offerId,
      items: invoices.items,
      taxRate: invoices.taxRate,
      total: invoices.total,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      note: invoices.note,
      createdAt: invoices.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      jobTitle: jobs.title,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(jobs, eq(invoices.jobId, jobs.id))
    .orderBy(desc(invoices.createdAt))
    .limit(300);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const issueDate = parsed.data.issueDate ?? new Date().toISOString().slice(0, 10);
  const total = itemsTotalWithTax(parsed.data.items, parsed.data.taxRate);
  const number = await nextInvoiceNumber(issueDate.slice(0, 4));

  const [created] = await db
    .insert(invoices)
    .values({
      ...parsed.data,
      issueDate,
      number,
      taxRate: String(parsed.data.taxRate),
      total: String(total),
    })
    .returning();

  return jsonOk(created);
}
