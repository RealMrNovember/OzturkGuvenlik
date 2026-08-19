import { db } from "@/lib/db";
import { transactions, customers, jobs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createTransactionSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      category: transactions.category,
      amount: transactions.amount,
      date: transactions.date,
      method: transactions.method,
      description: transactions.description,
      jobId: transactions.jobId,
      customerId: transactions.customerId,
      invoiceId: transactions.invoiceId,
      createdAt: transactions.createdAt,
      customerName: customers.name,
      jobTitle: jobs.title,
    })
    .from(transactions)
    .leftJoin(customers, eq(transactions.customerId, customers.id))
    .leftJoin(jobs, eq(transactions.jobId, jobs.id))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(500);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(transactions)
    .values({
      ...parsed.data,
      amount: String(parsed.data.amount),
      createdBy: session.id,
    })
    .returning();

  return jsonOk(created);
}
