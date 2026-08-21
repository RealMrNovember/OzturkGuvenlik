import { put, del } from "@vercel/blob";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

// Ürün görseli, alış fiyatının aksine gizlilik gerektirmez — sahada çalışan
// personel de kataloğa fotoğraf ekleyebilmeli. Bu yüzden burada manage_products
// ya da view_costs değil, yalnızca oturum açık olma şartı aranır.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const PRODUCT_IMAGE_PREFIX = "urun-gorselleri/";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [existing] = await db
    .select({ id: products.id, imageUrl: products.imageUrl })
    .from(products)
    .where(eq(products.id, numericId))
    .limit(1);
  if (!existing) return jsonErr("Ürün bulunamadı", 404);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonErr("Dosya bulunamadı", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return jsonErr("Yalnızca JPG, PNG veya WEBP yüklenebilir", 400);
  if (file.size > MAX_SIZE) return jsonErr("Dosya en fazla 8MB olabilir", 400);

  const ext = file.type.split("/")[1];
  const pathname = `${PRODUCT_IMAGE_PREFIX}${numericId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  // Eski görseli değiştiriyorsak öncekini sil — depolamada birikmesin.
  if (existing.imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }

  await db.update(products).set({ imageUrl: blob.url }).where(eq(products.id, numericId));
  return jsonOk({ imageUrl: blob.url });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return jsonErr("Geçersiz ID", 400);

  const [existing] = await db
    .select({ id: products.id, imageUrl: products.imageUrl })
    .from(products)
    .where(eq(products.id, numericId))
    .limit(1);
  if (!existing) return jsonErr("Ürün bulunamadı", 404);

  if (existing.imageUrl) {
    await del(existing.imageUrl).catch(() => {});
  }
  await db.update(products).set({ imageUrl: null }).where(eq(products.id, numericId));
  return jsonOk({ ok: true });
}
