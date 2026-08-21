import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession, createSession } from "@/lib/auth";
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

  if (parsed.data.email) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);
    if (existing && existing.id !== session.id) {
      return jsonErr("Bu e-posta adresi başka bir hesapta kayıtlı");
    }
  }

  const [updated] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, session.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: users.specialty,
      twoFactorEnabled: users.twoFactorEnabled,
    });

  // Panel oturumu (JWT) ad/rol/izin bilgisini kendi içinde taşıyor — isim
  // değiştiyse oturumu yeniden imzalamazsak kenar çubuğunda eski isim
  // görünmeye devam eder, çıkış/giriş yapana kadar.
  if (updated) {
    await createSession({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role as "admin" | "staff",
      permissions: session.permissions,
    });
  }

  return jsonOk(updated);
}
