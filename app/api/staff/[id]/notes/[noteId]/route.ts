import { db } from "@/lib/db";
import { staffNotes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string; noteId: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_staff")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { noteId } = await params;
  const numericId = Number(noteId);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [deleted] = await db
    .delete(staffNotes)
    .where(eq(staffNotes.id, numericId))
    .returning({ id: staffNotes.id });
  if (!deleted) return jsonErr("Not bulunamadı", 404);
  return jsonOk({ id: deleted.id });
}
