import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession, hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const isSelf = session.id === numericId;
  const canManageStaff = hasPermission(session, "manage_staff");
  if (!canManageStaff && !isSelf) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }
  const { newPassword, role, permissions, ...rest } = parsed.data;

  // Rol ve izin değişikliği yalnızca gerçek yöneticiye açık — manage_staff
  // izni verilmiş bir personelin kendini/başkasını admin yapması veya izin
  // dağıtması, ya da kendi izinlerini değiştirmesi engellenir.
  if ((role !== undefined || permissions !== undefined) && session.role !== "admin") {
    return jsonErr("Rol ve izin değişikliği yalnızca yönetici tarafından yapılabilir", 403);
  }

  const data = { ...rest, ...(role !== undefined ? { role } : {}), ...(permissions !== undefined ? { permissions } : {}) };

  const [updated] = await db
    .update(users)
    .set({
      ...data,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
    })
    .where(eq(users.id, numericId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: users.specialty,
      active: users.active,
      permissions: users.permissions,
    });

  if (!updated) return jsonErr("Personel bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);
  if (numericId === session.id) return jsonErr("Kendi hesabınızı silemezsiniz", 400);

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, numericId))
    .returning({ id: users.id });
  if (!deleted) return jsonErr("Personel bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
