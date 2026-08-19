import { db } from "@/lib/db";
import { offers, customers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createOfferSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

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
      total: offers.total,
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

  const total = parsed.data.items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  const [created] = await db
    .insert(offers)
    .values({ ...parsed.data, total: String(Math.round(total * 100) / 100) })
    .returning();

  return jsonOk(created);
}