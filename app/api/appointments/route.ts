import { db } from "@/lib/db";
import { appointments, customers, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createAppointmentSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: appointments.id,
      customerId: appointments.customerId,
      requestId: appointments.requestId,
      title: appointments.title,
      type: appointments.type,
      date: appointments.date,
      time: appointments.time,
      address: appointments.address,
      note: appointments.note,
      status: appointments.status,
      assignedTo: appointments.assignedTo,
      createdAt: appointments.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      assignedName: users.name,
    })
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(users, eq(appointments.assignedTo, users.id))
    .orderBy(desc(appointments.date), desc(appointments.time))
    .limit(300);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(appointments)
    .values(parsed.data)
    .returning();

  return jsonOk(created);
}