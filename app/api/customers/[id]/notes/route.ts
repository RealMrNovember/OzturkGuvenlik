import { db } from "@/lib/db";
import { customerNotes, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createCustomerNoteSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId)) return jsonErr("Geçersiz ID", 400);

  const rows = await db
    .select({
      id: customerNotes.id,
      customerId: customerNotes.customerId,
      channel: customerNotes.channel,
      note: customerNotes.note,
      createdAt: customerNotes.createdAt,
      authorName: users.name,
    })
    .from(customerNotes)
    .leftJoin(users, eq(customerNotes.createdBy, users.id))
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(desc(customerNotes.createdAt));

  return jsonOk(rows);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const customerId = Number(id);
  if (!Number.isInteger(customerId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = createCustomerNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(customerNotes)
    .values({ ...parsed.data, customerId, createdBy: session.id })
    .returning();

  return jsonOk(created);
}
