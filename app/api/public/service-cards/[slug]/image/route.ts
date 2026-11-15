import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { serviceMedia } from "@/lib/db/schema";

// Anasayfadaki hizmet kartı görseli herkese (anonim ziyaretçiye) gösterilmeli,
// ama bu projenin Blob deposu private-only — bu yüzden bilinçli olarak
// oturumsuz bırakılmış tek proxy burasıdır (bkz. ../../../service-media/[slug]/
// card-image/route.ts'teki yükleme route'u). Dosya adı her yüklemede değiştiği
// için (card-image route'una bkz.) uzun ömürlü cache tamamen güvenli.

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;

  const [row] = await db
    .select({ cardImageUrl: serviceMedia.cardImageUrl })
    .from(serviceMedia)
    .where(eq(serviceMedia.serviceSlug, slug))
    .limit(1);
  if (!row?.cardImageUrl) return new Response("Görsel bulunamadı", { status: 404 });

  const result = await get(row.cardImageUrl, { access: "private" });
  if (!result?.stream) return new Response("Görsel bulunamadı (silinmiş olabilir)", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
