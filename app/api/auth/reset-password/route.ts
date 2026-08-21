import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await readJson(req);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.resetToken, parsed.data.token), gt(users.resetTokenExpiresAt, new Date())))
    .limit(1);

  if (!user) {
    return jsonErr("Bağlantının süresi dolmuş ya da geçersiz — yeni bir sıfırlama isteği gönderin", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  // Token tek kullanımlık — başarılı sıfırlamadan sonra hemen temizlenir.
  // passwordChangedAt de güncellenir: şifremi unuttum akışı genelde bir
  // hesap ele geçirilmişken kullanılır — bu yüzden bu andan önce basılmış
  // her oturum çerezi (çalınmış olsa bile) otomatik geçersiz sayılmalı.
  await db
    .update(users)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null, passwordChangedAt: new Date() })
    .where(eq(users.id, user.id));

  return jsonOk({ ok: true });
}
