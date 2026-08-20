import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema";
import { asc, ne, sql } from "drizzle-orm";
import { createSupplierSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db.select().from(suppliers).orderBy(asc(suppliers.name));

  // Her tedarikçinin ödenmemiş fatura toplamı (borcumuz) TRY karşılığı üzerinden.
  const balances = await db
    .select({
      supplierId: supplierInvoices.supplierId,
      balance: sql<string>`sum(${supplierInvoices.amount} * ${supplierInvoices.exchangeRate})::text`,
    })
    .from(supplierInvoices)
    .where(ne(supplierInvoices.status, "odendi"))
    .groupBy(supplierInvoices.supplierId);
  const balanceMap = new Map(balances.map((b) => [b.supplierId, b.balance]));

  return jsonOk(
    rows.map((r) => ({ ...r, balance: balanceMap.get(r.id) ?? "0" }))
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = createSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db.insert(suppliers).values(parsed.data).returning();
  return jsonOk(created);
}
