import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { serviceTickets, type PhotoRef } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; photoId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const { id, photoId } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return new Response("Geçersiz ID", { status: 400 });

  const [ticket] = await db
    .select({ photos: serviceTickets.photos })
    .from(serviceTickets)
    .where(eq(serviceTickets.id, numericId))
    .limit(1);
  const photo = ((ticket?.photos as PhotoRef[]) ?? []).find((p) => p.id === photoId);
  if (!photo) return new Response("Fotoğraf bulunamadı", { status: 404 });

  const result = await get(photo.url, { access: "private" });
  if (!result?.stream) return new Response("Fotoğraf bulunamadı (silinmiş olabilir)", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "private, max-age=86400",
    },
  });
}
