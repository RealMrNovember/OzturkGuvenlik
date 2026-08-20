import { put } from "@vercel/blob";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { INVOICE_SCAN_PREFIX, enforceInvoiceScanRetention } from "@/lib/blob-retention";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);
  if (!hasPermission(session, "view_costs")) return jsonErr("Bu işlem için yönetici yetkisi gerekli", 403);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonErr("Dosya bulunamadı", 400);
  if (!ALLOWED_TYPES.includes(file.type)) return jsonErr("Yalnızca JPG, PNG, WEBP veya PDF yüklenebilir", 400);
  if (file.size > MAX_SIZE) return jsonErr("Dosya en fazla 15MB olabilir", 400);

  const ext = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1];
  const pathname = `${INVOICE_SCAN_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(pathname, file, {
    access: "private",
    contentType: file.type,
  });

  // Yükleme anında garanti et — cron'u beklemeden 10 dosya sınırı hemen uygulanır.
  await enforceInvoiceScanRetention();

  return jsonOk({ url: blob.url });
}
