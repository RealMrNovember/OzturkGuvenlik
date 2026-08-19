import { db } from "@/lib/db";
import { serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateRequestSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const body = await readJson(req);
  const parsed = updateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const [updated] = await db
    .update(serviceRequests)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(serviceRequests.id, numericId))
    .returning();

  if (!updated) return jsonErr("Talep bulunamadı", 404);
  return jsonOk(updated);
}