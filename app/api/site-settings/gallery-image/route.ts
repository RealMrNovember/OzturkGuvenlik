import { put, get } from "@vercel/blob";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

// Anasayfa "Gerçek işler, gerçek mekânlar" galerisi için görsel yükleme.
// Diğer kart/medya yüklemelerinden farklı olarak burada sabit bir satır
// (slug gibi) yok — galeri serbest bir liste olduğu için bu route sadece
// dosyayı private Blob'a yükleyip URL'sini döner; admin panel bu URL'yi
// kendi `galleryItems` dizisine ekleyip normal "Kaydet" akışıyla
// /api/site-settings PATCH'ine gönderir. Herkese açık gösterim
// app/api/public/gallery/[index]/image altındaki oturumsuz proxy ile yapılır
// (o, DB'deki index'e göre okur — henüz kaydedilmemiş bir yüklemeyi
// gösteremez). Admin panelin kendi önizlemesi bu yüzden GET ile, blob
// URL'si verilerek, oturumlu şekilde buradan yapılır.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const GALLERY_IMAGE_PREFIX = "galeri/";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const url = new URL(req.url).searchParams.get("url");
  if (!url) return jsonErr("url gerekli", 400);

  let pathname: string;
  try {
    pathname = new URL(url).pathname.replace(/^\//, "");
  } catch {
    return jsonErr("Geçersiz url", 400);
  }
  if (!pathname.startsWith(GALLERY_IMAGE_PREFIX)) return jsonErr("Geçersiz url", 400);

  const result = await get(url, { access: "private" });
  if (!result?.stream) return jsonErr("Görsel bulunamadı", 404);

  return new Response(result.stream, {
    headers: { "content-type": result.blob.contentType || "application/octet-stream" },
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "manage_settings")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonErr("Dosya bulunamadı", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return jsonErr("Yalnızca JPG, PNG veya WEBP yüklenebilir", 400);
  if (file.size > MAX_SIZE) return jsonErr("Dosya en fazla 8MB olabilir", 400);

  const ext = file.type.split("/")[1];
  const pathname = `${GALLERY_IMAGE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const blob = await put(pathname, file, { access: "private", contentType: file.type });
    return jsonOk({ imageUrl: blob.url });
  } catch (err) {
    return jsonErr(`Yükleme başarısız: ${(err as Error).message}`, 500);
  }
}
