import { db } from "@/lib/db";
import { offers, customers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createOfferSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { itemsTotalWithTax } from "@/lib/money";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: offers.id,
      customerId: offers.customerId,
      requestId: offers.requestId,
      title: offers.title,
      items: offers.items,
      taxRate: offers.taxRate,
      total: offers.total,
      currency: offers.currency,
      exchangeRate: offers.exchangeRate,
      status: offers.status,
      sentDate: offers.sentDate,
      note: offers.note,
      createdAt: offers.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(offers)
    .leftJoin(customers, eq(offers.customerId, customers.id))
    .orderBy(desc(offers.createdAt))
    .limit(300);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createOfferSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const total = itemsTotalWithTax(parsed.data.items, parsed.data.taxRate);

  const [created] = await db
    .insert(offers)
    .values({
      ...parsed.data,
      taxRate: String(parsed.data.taxRate),
      exchangeRate: String(parsed.data.exchangeRate),
      total: String(total),
    })
    .returning();

  return jsonOk(created);
}