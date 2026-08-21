import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const COOKIE_NAME = "og_panel";
const SESSION_DAYS = 7;
const PENDING_2FA_COOKIE = "og_2fa_pending";
const PENDING_2FA_MINUTES = 5;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  permissions: string[];
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

/**
 * securityStamp, users.passwordChangedAt'in saniye damgasıdır — JWT'ye
 * gömülür ve getSession()'da DB'deki güncel değerle karşılaştırılır.
 * Şifre/e-posta/2FA değiştiğinde bu alan güncellenip yeni bir oturum
 * bu yeni damgayla açılmazsa, DEĞİŞİKLİKTEN ÖNCE basılmış her çerez
 * (çalınmış olsa bile) bir sonraki istekte otomatik geçersiz sayılır.
 */
export async function createSession(user: SessionUser, securityStamp: Date) {
  const token = await new SignJWT({
    role: user.role,
    name: user.name,
    permissions: user.permissions,
    sv: Math.floor(securityStamp.getTime() / 1000),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    const id = Number(payload.sub);
    const role = payload.role as SessionUser["role"];
    const name = payload.name as string;
    const permissions = Array.isArray(payload.permissions) ? (payload.permissions as string[]) : [];
    const tokenStamp = Number(payload.sv);
    if (!id || !role || !tokenStamp) return null;

    const [row] = await db
      .select({ passwordChangedAt: users.passwordChangedAt, active: users.active })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!row || !row.active) return null;
    if (Math.floor(row.passwordChangedAt.getTime() / 1000) !== tokenStamp) return null;

    return { id, name, role, email: "", permissions };
  } catch {
    return null;
  }
}

/** Panel sayfaları için: oturum yoksa giriş sayfasına yönlendirir. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/panel/giris");
  return session;
}

/**
 * Şifre doğrulandı ama 2FA kodu henüz girilmedi — bu ara durumu, gerçek
 * oturum çerezinden ayrı, kısa ömürlü (5 dk) bir çerezle tutar. Böylece
 * /api/auth/2fa/verify çağrısı hangi kullanıcının kod girdiğini bilir,
 * ama tam oturum (panel erişimi) yalnızca kod doğrulanınca açılır.
 */
export async function createPendingTwoFactorToken(userId: number): Promise<void> {
  const token = await new SignJWT({ purpose: "2fa-pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_MINUTES}m`)
    .sign(secretKey());

  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_2FA_MINUTES * 60,
  });
}

/**
 * Çerezi SİLMEDEN sahibini okur — 2FA kodu yanlış girilirse kullanıcı
 * kalan süre boyunca (5 dk) tekrar deneyebilsin diye. Çerez yalnızca
 * kod doğrulaması BAŞARILI olunca clearPendingTwoFactorToken() ile
 * tüketilmeli (bkz. /api/auth/2fa/verify).
 */
export async function peekPendingTwoFactorUserId(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.purpose !== "2fa-pending") return null;
    const id = Number(payload.sub);
    return id || null;
  } catch {
    return null;
  }
}

export async function clearPendingTwoFactorToken(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}