import { db } from "@/lib/db";
import { staffNotes, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { createStaffNoteSchema } from "@/lib/validators";
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
    .select({
      id: staffNotes.id,
      userId: staffNotes.userId,
      note: staffNotes.note,
      createdAt: staffNotes.createdAt,
      authorName: users.name,
    })
    .from(staffNotes)
    .leftJoin(users, eq(staffNotes.createdBy, users.id))
    .where(eq(staffNotes.userId, userId))
    .orderBy(desc(staffNotes.createdAt));

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
  const parsed = createStaffNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [created] = await db
    .insert(staffNotes)
    .values({ ...parsed.data, userId, createdBy: session.id })
    .returning();

  return jsonOk(created);
}
