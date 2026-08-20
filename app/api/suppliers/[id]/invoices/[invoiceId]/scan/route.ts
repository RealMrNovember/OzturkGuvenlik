import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { supplierInvoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string; invoiceId: string }> };

// Taranan belge private erişimli tutulur — bu route, panel oturumu/izni
// üzerinden erişimi doğrulayıp içeriği sunucu tarafında akıtır. Blob URL'i
// doğrudan tarayıcıya vermiyoruz (private blob zaten public URL ile
// açılamaz), bunun yerine her görüntülemede view_costs kontrolü yapılır.
export async function GET(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });
  if (!hasPermission(session, "view_costs")) return new Response("Yetkisiz", { status: 403 });

  const { invoiceId } = await params;
  const numericId = Number(invoiceId);
  if (!Number.isInteger(numericId)) return new Response("Geçersiz ID", { status: 400 });

  const [row] = await db
    .select({ scannedFileUrl: supplierInvoices.scannedFileUrl })
    .from(supplierInvoices)
    .where(eq(supplierInvoices.id, numericId))
    .limit(1);
  if (!row?.scannedFileUrl) return new Response("Taranan belge bulunamadı", { status: 404 });

  const result = await get(row.scannedFileUrl, { access: "private" });
  if (!result?.stream) return new Response("Taranan belge bulunamadı (silinmiş olabilir)", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType || "application/octet-stream",
      "cache-control": "private, max-age=300",
    },
  });
}
