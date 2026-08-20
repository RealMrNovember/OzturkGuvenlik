import { db } from "@/lib/db";
import { staffLeaves } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateStaffLeaveSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string; leaveId: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { leaveId } = await params;
  const numericId = Number(leaveId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateStaffLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [updated] = await db
    .update(staffLeaves)
    .set(parsed.data)
    .where(eq(staffLeaves.id, numericId))
    .returning();
  if (!updated) return jsonErr("İzin kaydı bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { leaveId } = await params;
  const numericId = Number(leaveId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [deleted] = await db
    .delete(staffLeaves)
    .where(eq(staffLeaves.id, numericId))
    .returning({ id: staffLeaves.id });
  if (!deleted) return jsonErr("İzin kaydı bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
