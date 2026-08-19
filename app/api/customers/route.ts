import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { createCustomerSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  const rows = await db
    .select()
    .from(customers)
    .where(
      q
        ? or(
            ilike(customers.name, `%${q}%`),
            ilike(customers.phone, `%${q}%`),
            ilike(customers.address, `%${q}%`)
          )
        : undefined
    )
    .orderBy(desc(customers.createdAt))
    .limit(300);

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db.insert(customers).values(parsed.data).returning();
  return jsonOk(created);
}