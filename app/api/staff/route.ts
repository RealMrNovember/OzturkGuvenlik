import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { createUserSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession, hashPassword } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      specialty: users.specialty,
      active: users.active,
      permissions: users.permissions,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.name));

  return jsonOk(rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  // Rol ve izin ataması yalnızca gerçek yöneticiye açık — manage_staff izni
  // verilmiş bir personelin kendini/başkasını admin yapması veya izin
  // dağıtması engellenir.
  if (session.role !== "admin" && (parsed.data.role === "admin" || parsed.data.permissions.length > 0)) {
    return jsonErr("Rol ve izin ataması yalnızca yönetici tarafından yapılabilir", 403);
  }

  const { password, ...data } = parsed.data;
  const [created] = await db
    .insert(users)
    .values({ ...data, email: data.email.toLowerCase(), passwordHash: await hashPassword(password) })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      specialty: users.specialty,
      active: users.active,
      permissions: users.permissions,
    });

  return jsonOk(created);
}
