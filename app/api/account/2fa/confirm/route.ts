import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
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

  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: parsed.data.secret,
      twoFactorBackupCodes: hashed,
    })
    .where(eq(users.id, session.id));

  return jsonOk({ enabled: true, backupCodes: plain });
}
