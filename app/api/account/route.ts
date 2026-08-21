import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, createSession, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { updateAccountSchema } from "@/lib/validators";

// Kendi hesabınızı görüntüleme/düzenleme — herhangi bir izin gerekmez,
// yalnızca oturum açık olması yeterli (kendi bilgin, kendi kararın).
export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: users.specialty,
      twoFactorEnabled: users.twoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);
  if (!user) return jsonErr("Kullanıcı bulunamadı", 404);

  return jsonOk(user);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const body = await readJson(req);
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [current] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!current) return jsonErr("Kullanıcı bulunamadı", 404);

  const { currentPassword, ...fields } = parsed.data;
  const changingEmail = fields.email !== undefined && fields.email !== current.email;

  // E-posta, şifre kurtarma akışının hedefidir — çalınmış bir oturumla
  // sessizce başka bir adrese çevrilebilirse hesap devralmaya açık kapı
  // bırakır. Diğer alanlar (ad/telefon/uzmanlık) hassas değil, şifre
  // istemez.
  if (changingEmail) {
    if (!currentPassword) {
      return jsonErr("E-posta değiştirmek için mevcut şifrenizi girmelisiniz");
    }
    const valid = await verifyPassword(currentPassword, current.passwordHash);
    if (!valid) return jsonErr("Mevcut şifre hatalı", 401);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, fields.email as string))
      .limit(1);
    if (existing && existing.id !== session.id) {
      return jsonErr("Bu e-posta adresi başka bir hesapta kayıtlı");
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      ...fields,
      // E-posta değişimi başlı başına bir hesap-kurtarma yüzeyi olduğu
      // için, değiştikten sonra o ana kadar basılmış her çerez (çalınmış
      // olsa bile) bir sonraki istekte otomatik geçersiz sayılsın.
      ...(changingEmail ? { passwordChangedAt: new Date() } : {}),
    })
    .where(eq(users.id, session.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: users.specialty,
      twoFactorEnabled: users.twoFactorEnabled,
      passwordChangedAt: users.passwordChangedAt,
    });

  // Panel oturumu (JWT) ad/rol/izin bilgisini kendi içinde taşıyor — isim
  // değiştiyse oturumu yeniden imzalamazsak kenar çubuğunda eski isim
  // görünmeye devam eder, çıkış/giriş yapana kadar. Güncel security-stamp
  // ile yeniden imzalamak, bu isteği yapan mevcut oturumun (e-posta
  // değişse bile) kendi kendini geçersiz kılmamasını sağlar.
  if (updated) {
    await createSession(
      {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as "admin" | "staff",
        permissions: session.permissions,
      },
      updated.passwordChangedAt
    );
  }

  const { passwordChangedAt: _omit, ...response } = updated;
  return jsonOk(response);
}
