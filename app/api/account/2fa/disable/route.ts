import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { twoFactorDisableSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = twoFactorDisableSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user) return jsonErr("Kullanıcı bulunamadı", 404);

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return jsonErr("Şifre hatalı", 401);

  await db
    .update(users)
    .set({ twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] })
    .where(eq(users.id, session.id));

  return jsonOk({ disabled: true });
}
