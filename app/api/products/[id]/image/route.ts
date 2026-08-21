import { put, del, get } from "@vercel/blob";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";

// Ürün görseli, alış fiyatının aksine gizlilik gerektirmez — sahada çalışan
// personel de kataloğa fotoğraf ekleyebilmeli. Bu yüzden burada manage_products
// ya da view_costs değil, yalnızca oturum açık olma şartı aranır.
//
// Bu projenin Vercel Blob deposu private-only yapılandırılmış (access:"public"
// ile put() çağrısı "Cannot use public access on a private store" hatası
// veriyor) — toptancı taramalarıyla aynı desen: dosya private yüklenir,
// GET altta bu route üzerinden sunucu tarafında akıtılır; tarayıcıya asla
// çıplak blob URL'i verilmez.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const PRODUCT_IMAGE_PREFIX = "urun-gorselleri/";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return new Response("Geçersiz ID", { status: 400 });

  const [row] = await db
    .select({ imageUrl: products.imageUrl })
    .from(products)
    .where(eq(products.id, numericId))
    .limit(1);
  if (!row?.imageUrl) return new Response("Görsel bulunamadı", { status: 404 });

  const result = await get(row.imageUrl, { access: "private" });
  if (!result?.stream) return new Response("Görsel bulunamadı (silinmiş olabilir)", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "private, max-age=86400",
    },
  });
}

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

  try {
    const blob = await put(pathname, file, {
      access: "private",
      contentType: file.type,
    });

    // Eski görseli değiştiriyorsak öncekini sil — depolamada birikmesin.
    if (existing.imageUrl) {
      await del(existing.imageUrl).catch(() => {});
    }

    await db.update(products).set({ imageUrl: blob.url }).where(eq(products.id, numericId));
    return jsonOk({ imageUrl: blob.url });
  } catch (err) {
    return jsonErr(`Yükleme başarısız: ${(err as Error).message}`, 500);
  }
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
