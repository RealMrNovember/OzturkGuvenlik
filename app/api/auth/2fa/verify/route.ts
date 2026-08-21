import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession, peekPendingTwoFactorUserId, clearPendingTwoFactorToken } from "@/lib/auth";
import { verifyTotpCode, consumeBackupCode } from "@/lib/two-factor";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { twoFactorLoginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  // Çerez burada TÜKETİLMİYOR — yanlış kod girilirse kalan süre boyunca
  // (5 dk) tekrar denenebilsin diye yalnızca sahibi okunuyor. Yalnızca
  // doğrulama başarılı olunca aşağıda clearPendingTwoFactorToken() ile
  // tüketiliyor.
  const userId = await peekPendingTwoFactorUserId();
  if (!userId) return jsonErr("Oturum süresi doldu, tekrar giriş yapın", 401);

  const body = await readJson(req);
  const parsed = twoFactorLoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !user.active || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return jsonErr("Oturum geçersiz, tekrar giriş yapın", 401);
  }

  const isTotpValid = verifyTotpCode(user.twoFactorSecret, parsed.data.code);
  let remainingBackupCodes: string[] | null = null;
  if (!isTotpValid) {
    remainingBackupCodes = await consumeBackupCode(
      (user.twoFactorBackupCodes as string[]) ?? [],
      parsed.data.code
    );
    if (!remainingBackupCodes) {
      return jsonErr("Kod geçersiz", 401);
    }
  }

  if (remainingBackupCodes) {
    await db
      .update(users)
      .set({ twoFactorBackupCodes: remainingBackupCodes })
      .where(eq(users.id, user.id));
  }

  await clearPendingTwoFactorToken();
  await createSession(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "staff",
      permissions: (user.permissions as string[] | null) ?? [],
    },
    user.passwordChangedAt
  );

  return jsonOk({ name: user.name, role: user.role });
}
