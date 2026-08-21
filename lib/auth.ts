import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

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

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ role: user.role, name: user.name, permissions: user.permissions })
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
    if (!id || !role) return null;
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

export async function consumePendingTwoFactorToken(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(PENDING_2FA_COOKIE)?.value;
  store.delete(PENDING_2FA_COOKIE);
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}