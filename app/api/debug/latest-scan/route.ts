import { list, get } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { INVOICE_SCAN_PREFIX } from "@/lib/blob-retention";

/**
 * GEÇİCİ hata ayıklama ucu (admin/view_costs korumalı): kullanıcının en son
 * taradığı belge dosyasını indirir — OCR kalem çıkarımı kullanıcının gerçek
 * yüklemesinde başarısız olurken yerel simülasyonlarda geçiyordu; kesin
 * teşhis için birebir aynı girdiye ihtiyaç var. Sorun çözülünce kaldırılacak.
 * ?index=N ile daha eski dosyalar (0 = en yeni).
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });
  if (!hasPermission(session, "view_costs")) return new Response("Yetkisiz", { status: 403 });

  const index = Number(new URL(req.url).searchParams.get("index") ?? "0");
  const { blobs } = await list({ prefix: INVOICE_SCAN_PREFIX, limit: 1000 });
  const sorted = [...blobs].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  const target = sorted[Number.isInteger(index) && index >= 0 ? index : 0];
  if (!target) return new Response("Taranmış dosya yok", { status: 404 });

  const result = await get(target.url, { access: "private" });
  if (!result?.stream) return new Response("Dosya okunamadı", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "x-scan-pathname": target.pathname,
      "x-scan-uploaded-at": target.uploadedAt.toISOString(),
      "x-scan-count": String(sorted.length),
    },
  });
}
