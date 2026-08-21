import { revalidatePath } from "next/cache";
import { createReviewSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { listAllReviews, createReview } from "@/lib/reviews-db";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  return jsonOk(await listAllReviews());
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const body = await readJson(req);
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const created = await createReview(parsed.data, session.id);
  revalidatePath("/", "layout");
  return jsonOk(created);
}
