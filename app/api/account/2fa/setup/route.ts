import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateTotpSecret, buildOtpAuthQrDataUrl } from "@/lib/two-factor";
import { jsonOk, jsonErr } from "@/lib/api";

// Yeni bir TOTP secret üretir ve QR kodunu döner — henüz DB'ye yazılmaz.
// Kullanıcı QR'ı tarayıp geçerli bir kod ürettiğini kanıtladığında
// (/api/account/2fa/confirm) secret hesaba kalıcı olarak bağlanır.
export async function POST() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  if (!user) return jsonErr("Kullanıcı bulunamadı", 404);

  const secret = generateTotpSecret();
  const qrDataUrl = await buildOtpAuthQrDataUrl(secret, user.email);

  return jsonOk({ secret, qrDataUrl });
}
