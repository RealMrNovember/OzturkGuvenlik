import { db } from "@/lib/db";
import { serviceRequests, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createRequestSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

// Herkese açık: keşif sihirbazından kayıt (honeypot korumalı)
export async function POST(req: Request) {
  const body = await readJson(req);
  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }
  const { website, ...data } = parsed.data;
  if (website) {
    return jsonOk({ id: 0 }); // botu sustur
  }

  const [created] = await db
    .insert(serviceRequests)
    .values({
      name: data.name,
      phone: data.phone,
      placeType: data.placeType,
      systems: data.systems,
      note: data.note,
      source: "web",
      status: "yeni",
    })
    .returning({ id: serviceRequests.id });

  return jsonOk({ id: created.id });
}

// Oturum gerektiren: liste (filtre: status)
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const rows = await db
    .select({
      id: serviceRequests.id,
      customerId: serviceRequests.customerId,
      name: serviceRequests.name,
      phone: serviceRequests.phone,
      placeType: serviceRequests.placeType,
      systems: serviceRequests.systems,
      note: serviceRequests.note,
      source: serviceRequests.source,
      status: serviceRequests.status,
      assignedTo: serviceRequests.assignedTo,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      assignedName: users.name,
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.assignedTo, users.id))
    .where(status ? eq(serviceRequests.status, status) : undefined)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(200);

  return jsonOk(rows);
}