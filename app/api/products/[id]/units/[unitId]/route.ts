import { db } from "@/lib/db";
import { productUnits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateProductUnitSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; unitId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { unitId } = await params;
  const numericId = Number(unitId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateProductUnitSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const set: Record<string, unknown> = { ...parsed.data };
  // Elle "stokta"ya döndürülüyorsa (örn. yanlış işaretlenmiş bir kayıt
  // düzeltiliyorsa) iş/servis bağlantısını da temizle ki tutarsız kalmasın.
  if (parsed.data.status === "stokta") {
    set.jobId = null;
    set.serviceTicketId = null;
    set.installedAt = null;
  }

  const [updated] = await db
    .update(productUnits)
    .set(set)
    .where(eq(productUnits.id, numericId))
    .returning();
  if (!updated) return jsonErr("Kayıt bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { unitId } = await params;
  const numericId = Number(unitId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [unit] = await db
    .select({ status: productUnits.status })
    .from(productUnits)
    .where(eq(productUnits.id, numericId))
    .limit(1);
  if (!unit) return jsonErr("Kayıt bulunamadı", 404);
  if (unit.status === "kuruldu") {
    return jsonErr(
      "Bu birim şu anda bir işe/servise kurulu — önce ilgili kayıttan kaldırın",
      409
    );
  }

  const [deleted] = await db
    .delete(productUnits)
    .where(eq(productUnits.id, numericId))
    .returning({ id: productUnits.id });
  if (!deleted) return jsonErr("Kayıt bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
