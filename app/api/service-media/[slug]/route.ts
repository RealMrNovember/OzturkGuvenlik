import { revalidatePath } from "next/cache";
import { upsertServiceMediaSchema } from "@/lib/validators";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { upsertServiceMedia } from "@/lib/service-media";
import { services } from "@/lib/services";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { slug } = await params;
  if (!services.some((s) => s.slug === slug)) return jsonErr("Geçersiz hizmet", 404);

  const body = await readJson(req);
  const parsed = upsertServiceMediaSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErr(parsed.error.issues[0]?.message ?? "Geçersiz istek");
  }

  const updated = await upsertServiceMedia(
    slug,
    {
      videoUrl: parsed.data.videoUrl,
      videoAutoplay: parsed.data.videoAutoplay,
      videoMuted: parsed.data.videoMuted,
      videoStart: parsed.data.videoStart,
      videoDuration: parsed.data.videoDuration ?? null,
    },
    session.id
  );
  revalidatePath(`/hizmetler/${slug}`);
  return jsonOk(updated);
}
