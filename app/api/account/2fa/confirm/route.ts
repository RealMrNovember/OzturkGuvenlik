import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, createSession } from "@/lib/auth";
import { verifyTotpCode, generateBackupCodes } from "@/lib/two-factor";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { twoFactorConfirmSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = twoFactorConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const isValid = verifyTotpCode(parsed.data.secret, parsed.data.code);
  if (!isValid) return jsonErr("Kod geçersiz, tekrar deneyin");

  const { plain, hashed } = await generateBackupCodes();
  const passwordChangedAt = new Date();

  const [updated] = await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: parsed.data.secret,
      twoFactorBackupCodes: hashed,
      passwordChangedAt,
    })
    .where(eq(users.id, session.id))
    .returning();
  if (!updated) return jsonErr("Kullanıcı bulunamadı", 404);

  // 2FA'nın açılması, çalınmış eski bir çerezle girişi de etkiler —
  // önceki çerezler geçersiz sayılsın, ama bu isteği yapan oturum
  // yeniden imzalanarak geçerli kalsın.
  await createSession(
    {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "admin" | "staff",
      permissions: session.permissions,
    },
    passwordChangedAt
  );

  return jsonOk({ enabled: true, backupCodes: plain });
}
