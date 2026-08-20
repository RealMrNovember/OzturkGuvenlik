import { db } from "@/lib/db";
import { staffLeaves } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createStaffLeaveSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) return jsonErr("Geçersiz ID", 400);

  const rows = await db
    .select()
    .from(staffLeaves)
    .where(eq(staffLeaves.userId, userId))
    .orderBy(desc(staffLeaves.startDate));

  return jsonOk(rows);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = createStaffLeaveSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }
  if (parsed.data.endDate < parsed.data.startDate) {
    return jsonErr("Bitiş tarihi başlangıçtan önce olamaz");
  }

  const [created] = await db
    .insert(staffLeaves)
    .values({ ...parsed.data, userId, createdBy: session.id })
    .returning();

  return jsonOk(created);
}
