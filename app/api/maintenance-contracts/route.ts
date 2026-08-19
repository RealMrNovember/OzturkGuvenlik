import { db } from "@/lib/db";
import { maintenanceContracts, customers } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { createMaintenanceContractSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: maintenanceContracts.id,
      customerId: maintenanceContracts.customerId,
      type: maintenanceContracts.type,
      startDate: maintenanceContracts.startDate,
      lastServiceDate: maintenanceContracts.lastServiceDate,
      nextServiceDate: maintenanceContracts.nextServiceDate,
      intervalMonths: maintenanceContracts.intervalMonths,
      note: maintenanceContracts.note,
      active: maintenanceContracts.active,
      createdAt: maintenanceContracts.createdAt,
      updatedAt: maintenanceContracts.updatedAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(maintenanceContracts)
    .leftJoin(customers, eq(maintenanceContracts.customerId, customers.id))
    .orderBy(asc(maintenanceContracts.nextServiceDate))
    .limit(500);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createMaintenanceContractSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db.insert(maintenanceContracts).values(parsed.data).returning();
  return jsonOk(created);
}
