import { put, del } from "@vercel/blob";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs, type PhotoRef } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

// Kurulum fotoğrafları — ürün görselleriyle aynı desen: Blob deposu
// private-only, tarayıcıya çıplak URL verilmez (bkz. [photoId]/route.ts'teki
// proxy). Görselin aksine burada gizlilik önemsiz değil — saha fotoğrafları
// müşteri/adres bilgisi içerebilir, bu yüzden oturum şartı yeterli
// (manage_products gibi ekstra bir izin aranmaz, panel zaten personel içi).

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024;
const PREFIX = "is-fotograflari/";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [job] = await db.select({ id: jobs.id, photos: jobs.photos }).from(jobs).where(eq(jobs.id, numericId)).limit(1);
  if (!job) return jsonErr("İş bulunamadı", 404);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonErr("Dosya bulunamadı", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return jsonErr("Yalnızca JPG, PNG veya WEBP yüklenebilir", 400);
  if (file.size > MAX_SIZE) return jsonErr("Dosya en fazla 8MB olabilir", 400);

  const photoId = randomBytes(8).toString("hex");
  const ext = file.type.split("/")[1];
  const pathname = `${PREFIX}${numericId}-${photoId}.${ext}`;

  try {
    const blob = await put(pathname, file, { access: "private", contentType: file.type });
    const photos = [...((job.photos as PhotoRef[]) ?? []), { id: photoId, url: blob.url }];
    await db.update(jobs).set({ photos }).where(eq(jobs.id, numericId));
    return jsonOk({ id: photoId });
  } catch (err) {
    return jsonErr(`Yükleme başarısız: ${(err as Error).message}`, 500);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const photoId = new URL(req.url).searchParams.get("photoId");
  if (!photoId) return jsonErr("photoId gerekli", 400);

  const [job] = await db.select({ id: jobs.id, photos: jobs.photos }).from(jobs).where(eq(jobs.id, numericId)).limit(1);
  if (!job) return jsonErr("İş bulunamadı", 404);

  const photos = (job.photos as PhotoRef[]) ?? [];
  const target = photos.find((p) => p.id === photoId);
  if (!target) return jsonErr("Fotoğraf bulunamadı", 404);

  await del(target.url).catch(() => {});
  await db
    .update(jobs)
    .set({ photos: photos.filter((p) => p.id !== photoId) })
    .where(eq(jobs.id, numericId));

  return jsonOk({ ok: true });
}
