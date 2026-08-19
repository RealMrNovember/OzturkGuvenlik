import { db } from "@/lib/db";
import { jobs, customers, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createJobSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

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

  return jsonOk(
    rows.map((job) => ({
      ...job,
      staffNames: (job.staffIds ?? []).map((id) => staffMap[id] ?? "").filter(Boolean),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(jobs)
    .values(parsed.data)
    .returning();

  return jsonOk(created);
}