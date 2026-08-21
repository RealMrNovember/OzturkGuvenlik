import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession, createSession, hashPassword, verifyPassword } from "@/lib/auth";
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
  const { newPassword, role, permissions, currentPassword, ...rest } = parsed.data;

  // Rol ve izin değişikliği yalnızca gerçek yöneticiye açık — manage_staff
  // izni verilmiş bir personelin kendini/başkasını admin yapması veya izin
  // dağıtması, ya da kendi izinlerini değiştirmesi engellenir.
  if ((role !== undefined || permissions !== undefined) && session.role !== "admin") {
    return jsonErr("Rol ve izin değişikliği yalnızca yönetici tarafından yapılabilir", 403);
  }

  const [target] = await db.select().from(users).where(eq(users.id, numericId)).limit(1);
  if (!target) return jsonErr("Personel bulunamadı", 404);

  // Kendi şifresini/e-postasını değiştiren kullanıcı mevcut şifresini
  // kanıtlamalı — aksi halde çalınmış bir oturum çerezi, eski şifreyi
  // hiç bilmeden kalıcı bir hesap devralmaya dönüşebilir. Bir yöneticinin
  // BAŞKA bir personelin şifresini sıfırlaması bu kontrole tabi değil.
  const changingOwnCredential = isSelf && (newPassword !== undefined || (rest.email !== undefined && rest.email !== target.email));
  if (changingOwnCredential) {
    if (!currentPassword) {
      return jsonErr("Şifre veya e-posta değiştirmek için mevcut şifrenizi girmelisiniz");
    }
    const valid = await verifyPassword(currentPassword, target.passwordHash);
    if (!valid) return jsonErr("Mevcut şifre hatalı", 401);
  }

  const data = { ...rest, ...(role !== undefined ? { role } : {}), ...(permissions !== undefined ? { permissions } : {}) };

  // Şifre değişince (kendi şifresi ya da yönetici tarafından başka bir
  // personele atanan yeni şifre), passwordChangedAt güncellenip o ana
  // kadar basılmış tüm oturum çerezleri bir sonraki istekte otomatik
  // geçersiz sayılır (bkz. lib/auth.ts getSession).
  const [updated] = await db
    .update(users)
    .set({
      ...data,
      ...(newPassword ? { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() } : {}),
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
      passwordChangedAt: users.passwordChangedAt,
    });

  if (!updated) return jsonErr("Personel bulunamadı", 404);

  // Kendi kaydını düzenliyorsa (isim/şifre/vb.), oturumu güncel bilgi ve
  // security-stamp ile yeniden imzalıyoruz — yoksa kendi şifresini
  // değiştiren kullanıcı bir sonraki istekte kendi kendini kilitler.
  if (isSelf && updated.active) {
    await createSession(
      {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as "admin" | "staff",
        permissions: (updated.permissions as string[] | null) ?? session.permissions,
      },
      updated.passwordChangedAt
    );
  }

  const { passwordChangedAt: _omit, ...response } = updated;
  return jsonOk(response);
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
