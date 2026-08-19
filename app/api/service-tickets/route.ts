import { db } from "@/lib/db";
import { serviceTickets, customers, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createServiceTicketSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { costTotalForItems, applyStockDelta } from "@/lib/stock";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: serviceTickets.id,
      customerId: serviceTickets.customerId,
      appointmentId: serviceTickets.appointmentId,
      device: serviceTickets.device,
      location: serviceTickets.location,
      issue: serviceTickets.issue,
      result: serviceTickets.result,
      status: serviceTickets.status,
      assignedTo: serviceTickets.assignedTo,
      items: serviceTickets.items,
      costTotal: serviceTickets.costTotal,
      fee: serviceTickets.fee,
      createdAt: serviceTickets.createdAt,
      updatedAt: serviceTickets.updatedAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      assignedName: users.name,
    })
    .from(serviceTickets)
    .leftJoin(customers, eq(serviceTickets.customerId, customers.id))
    .leftJoin(users, eq(serviceTickets.assignedTo, users.id))
    .orderBy(desc(serviceTickets.createdAt))
    .limit(300);

  // Maliyet yalnızca yöneticiye görünür (bkz. app/api/jobs/route.ts ile aynı ilke).
  if (session.role !== "admin") {
    return jsonOk(
      rows.map((r) => ({
        id: r.id,
        customerId: r.customerId,
        appointmentId: r.appointmentId,
        device: r.device,
        location: r.location,
        issue: r.issue,
        result: r.result,
        status: r.status,
        assignedTo: r.assignedTo,
        items: r.items,
        fee: r.fee,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        assignedName: r.assignedName,
      }))
    );
  }
  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createServiceTicketSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const created = await db.transaction(async (tx) => {
    const costTotal = await costTotalForItems(tx, parsed.data.items);
    const [row] = await tx
      .insert(serviceTickets)
      .values({
        ...parsed.data,
        fee: String(parsed.data.fee),
        costTotal: String(costTotal),
      })
      .returning();
    await applyStockDelta(tx, [], parsed.data.items);
    return row;
  });

  return jsonOk(created);
}
