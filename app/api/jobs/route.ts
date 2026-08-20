import { db } from "@/lib/db";
import { jobs, customers, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createJobSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { costTotalForItems, applyStockDelta, StockConflictError } from "@/lib/stock";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: jobs.id,
      customerId: jobs.customerId,
      requestId: jobs.requestId,
      offerId: jobs.offerId,
      title: jobs.title,
      address: jobs.address,
      startDate: jobs.startDate,
      endDate: jobs.endDate,
      status: jobs.status,
      equipment: jobs.equipment,
      items: jobs.items,
      costTotal: jobs.costTotal,
      saleTotal: jobs.saleTotal,
      currency: jobs.currency,
      exchangeRate: jobs.exchangeRate,
      notes: jobs.notes,
      staffIds: jobs.staffIds,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .orderBy(desc(jobs.createdAt))
    .limit(300);

  const staffRows = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.active, true));

  const staffMap = Object.fromEntries(staffRows.map((s) => [s.id, s.name]));

  const withStaff = rows.map((job) => ({
    ...job,
    staffNames: (job.staffIds ?? []).map((id) => staffMap[id] ?? "").filter(Boolean),
  }));

  // Maliyet (alış fiyatı üzerinden) ve dolayısıyla kâr yalnızca yöneticiye görünür.
  if (!hasPermission(session, "view_costs")) {
    return jsonOk(
      withStaff.map((j) => ({
        id: j.id,
        customerId: j.customerId,
        requestId: j.requestId,
        offerId: j.offerId,
        title: j.title,
        address: j.address,
        startDate: j.startDate,
        endDate: j.endDate,
        status: j.status,
        equipment: j.equipment,
        items: j.items,
        saleTotal: j.saleTotal,
        currency: j.currency,
        exchangeRate: j.exchangeRate,
        notes: j.notes,
        staffIds: j.staffIds,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
        customerName: j.customerName,
        customerPhone: j.customerPhone,
        staffNames: j.staffNames,
      }))
    );
  }
  return jsonOk(withStaff);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  try {
    const created = await db.transaction(async (tx) => {
      const costTotal = await costTotalForItems(tx, parsed.data.items);
      const [row] = await tx
        .insert(jobs)
        .values({
          ...parsed.data,
          saleTotal: String(parsed.data.saleTotal),
          exchangeRate: String(parsed.data.exchangeRate),
          costTotal: String(costTotal),
        })
        .returning();
      await applyStockDelta(tx, [], parsed.data.items, { jobId: row.id });
      return row;
    });
    return jsonOk(created);
  } catch (e) {
    if (e instanceof StockConflictError) return jsonErr(e.message, 409);
    throw e;
  }
}
