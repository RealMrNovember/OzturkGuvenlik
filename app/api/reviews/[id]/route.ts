import { revalidatePath } from "next/cache";
import { updateReviewSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { updateReview, deleteReview } from "@/lib/reviews-db";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId)) return jsonErr("Geçersiz kayıt", 404);

  const body = await readJson(req);
  const parsed = updateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const updated = await updateReview(reviewId, parsed.data, session.id);
  if (!updated) return jsonErr("Kayıt bulunamadı", 404);
  revalidatePath("/", "layout");
  return jsonOk(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId)) return jsonErr("Geçersiz kayıt", 404);

  const ok = await deleteReview(reviewId);
  if (!ok) return jsonErr("Kayıt bulunamadı", 404);
  revalidatePath("/", "layout");
  return jsonOk({ deleted: true });
}
