import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceMedia } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { services } from "@/lib/services";

// Anasayfa "Ne arıyorsunuz?" kartının kapak görseli — bu proje Blob deposu
// private-only yapılandırılmış (products/[id]/image ile aynı desen), bu
// yüzden herkese açık gösterim app/api/public/service-cards/[slug]/image
// altında ayrı, oturumsuz bir proxy route üzerinden yapılır.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const CARD_IMAGE_PREFIX = "anasayfa-kartlari/";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { slug } = await params;
  if (!services.some((s) => s.slug === slug)) return jsonErr("Geçersiz hizmet", 404);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonErr("Dosya bulunamadı", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return jsonErr("Yalnızca JPG, PNG veya WEBP yüklenebilir", 400);
  if (file.size > MAX_SIZE) return jsonErr("Dosya en fazla 8MB olabilir", 400);

  const ext = file.type.split("/")[1];
  const pathname = `${CARD_IMAGE_PREFIX}${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const [existing] = await db
    .select({ cardImageUrl: serviceMedia.cardImageUrl })
    .from(serviceMedia)
    .where(eq(serviceMedia.serviceSlug, slug))
    .limit(1);

  try {
    const blob = await put(pathname, file, { access: "private", contentType: file.type });

    await db
      .insert(serviceMedia)
      .values({ serviceSlug: slug, cardImageUrl: blob.url, updatedBy: session.id })
      .onConflictDoUpdate({
        target: serviceMedia.serviceSlug,
        set: { cardImageUrl: blob.url, updatedAt: new Date(), updatedBy: session.id },
      });

    if (existing?.cardImageUrl) {
      await del(existing.cardImageUrl).catch(() => {});
    }

    revalidatePath("/");
    return jsonOk({ cardImageUrl: blob.url });
  } catch (err) {
    return jsonErr(`Yükleme başarısız: ${(err as Error).message}`, 500);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const { slug } = await params;
  const [existing] = await db
    .select({ cardImageUrl: serviceMedia.cardImageUrl })
    .from(serviceMedia)
    .where(eq(serviceMedia.serviceSlug, slug))
    .limit(1);
  if (!existing) return jsonErr("Kayıt bulunamadı", 404);

  if (existing.cardImageUrl) {
    await del(existing.cardImageUrl).catch(() => {});
  }
  await db.update(serviceMedia).set({ cardImageUrl: null }).where(eq(serviceMedia.serviceSlug, slug));
  revalidatePath("/");
  return jsonOk({ ok: true });
}
