import { db } from "@/lib/db";
import { supplierInvoices } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createSupplierInvoiceSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const supplierId = Number(id);
  if (!Number.isInteger(supplierId)) return jsonErr("Geçersiz ID", 400);

  const rows = await db
    .select()
    .from(supplierInvoices)
    .where(eq(supplierInvoices.supplierId, supplierId))
    .orderBy(desc(supplierInvoices.issueDate));

  return jsonOk(rows);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const supplierId = Number(id);
  if (!Number.isInteger(supplierId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = createSupplierInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(supplierInvoices)
    .values({
      ...parsed.data,
      supplierId,
      amount: String(parsed.data.amount),
      exchangeRate: String(parsed.data.exchangeRate),
    })
    .returning();

  return jsonOk(created);
}
