import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { suppliers, supplierInvoices } from "@/lib/db/schema";
import { eq, isNotNull, and } from "drizzle-orm";
import { updateSupplierSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [updated] = await db
    .update(suppliers)
    .set(parsed.data)
    .where(eq(suppliers.id, numericId))
    .returning();
  if (!updated) return jsonErr("Tedarikçi bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "delete_records")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  // Faturalar ON DELETE CASCADE ile DB seviyesinde silinir — taranan belge
  // blob'ları bu cascade'in dışında kaldığı için önce elle toplanıp,
  // tedarikçi silindikten sonra ayrıca temizlenir.
  const scannedUrls = await db
    .select({ url: supplierInvoices.scannedFileUrl })
    .from(supplierInvoices)
    .where(and(eq(supplierInvoices.supplierId, numericId), isNotNull(supplierInvoices.scannedFileUrl)));

  const [deleted] = await db
    .delete(suppliers)
    .where(eq(suppliers.id, numericId))
    .returning({ id: suppliers.id });
  if (!deleted) return jsonErr("Tedarikçi bulunamadı", 404);

  const urls = scannedUrls.map((r) => r.url).filter((u): u is string => !!u);
  if (urls.length > 0) await del(urls).catch(() => {});

  return jsonOk({ id: deleted.id });
}
