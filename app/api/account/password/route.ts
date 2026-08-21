import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) return jsonErr("Kullanıcı bulunamadı", 404);

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return jsonErr("Mevcut şifre hatalı", 401);

  const passwordChangedAt = new Date();
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword), passwordChangedAt })
    .where(eq(users.id, session.id));

  // Bu değişiklikten önce basılmış her çerez (çalınmış olsa bile) bir
  // sonraki istekte otomatik geçersiz sayılır — ama bu isteği yapan
  // mevcut oturumu da yeniden imzalamazsak kendi kendini kilitler.
  await createSession(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "staff",
      permissions: session.permissions,
    },
    passwordChangedAt
  );

  return jsonOk({ changed: true });
}
