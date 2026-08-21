import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
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

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword) })
    .where(eq(users.id, session.id));

  return jsonOk({ changed: true });
}
