import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendEmail, emailLayout } from "@/lib/email";
import { site } from "@/lib/site";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 saat

export async function POST(req: Request) {
  const body = await readJson(req);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  // Kullanıcı numaralandırmayı (bu e-posta kayıtlı mı?) önlemek için bulunsun
  // bulunmasın her zaman aynı genel mesaj döner — yalnızca kayıtlıysa e-posta
  // gerçekten gönderilir.
  const [user] = await db
    .select({ id: users.id, name: users.name, active: users.active })
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (user?.active) {
    const token = randomBytes(32).toString("hex");
    await db
      .update(users)
      .set({ resetToken: token, resetTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS) })
      .where(eq(users.id, user.id));

    await sendEmail(
      parsed.data.email.toLowerCase(),
      "Şifre sıfırlama — Öztürk Güvenlik Paneli",
      await emailLayout(
        "Şifre Sıfırlama",
        `
          <p style="margin: 0 0 12px;">Merhaba ${user.name},</p>
          <p style="margin: 0 0 16px;">
            Panel şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı
            <strong>1 saat</strong> geçerlidir ve yalnızca bir kez kullanılabilir.
          </p>
          <p style="margin: 0 0 16px;">
            <a href="${site.url}/panel/sifre-sifirla/${token}" style="display: inline-block; background: #0e6fb8; color: #fff; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: bold;">
              Şifremi Sıfırla
            </a>
          </p>
          <p style="margin: 0; font-size: 12px; color: #888;">
            Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz — şifreniz değişmez.
          </p>
        `
      )
    );
  }

  return jsonOk({ message: "Eğer bu e-posta sistemde kayıtlıysa, bir sıfırlama bağlantısı gönderildi." });
}
