import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUserSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession, hashPassword } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const isAdmin = session.role === "admin";
  const isSelf = session.id === numericId;
  if (!isAdmin && !isSelf) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }
  const { newPassword, ...data } = parsed.data;

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
    });

  if (!updated) return jsonErr("Personel bulunamadı", 404);
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (session.role !== "admin") return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

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