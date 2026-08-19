import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword } from "@/lib/auth";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await readJson(req);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek", 400);
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.active) {
    return jsonErr("E-posta veya şifre hatalı", 401);
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return jsonErr("E-posta veya şifre hatalı", 401);
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "staff",
  });

  return jsonOk({ name: user.name, role: user.role });
}