import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { lookupBarcodeGlobal } from "@/lib/barcode";

/**
 * Kutu üzerindeki ürün barkodunu (EAN/UPC) çözer.
 * 1) Önce yerelde (products.barcode) eşleşme aranır — asıl güvenilir yol.
 * 2) Yoksa genel bir ürün veritabanında aranır (yalnızca isim/kategori
 *    önerisi için, yeni ürün formunu önceden doldurmaya yarar).
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const barcode = new URL(req.url).searchParams.get("barcode")?.trim();
  if (!barcode) return jsonErr("Barkod gerekli", 400);

  const [local] = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      category: products.category,
      unit: products.unit,
      salePrice: products.salePrice,
      stockQty: products.stockQty,
      serialized: products.serialized,
      active: products.active,
    })
    .from(products)
    .where(eq(products.barcode, barcode))
    .limit(1);

  if (local) {
    return jsonOk({ found: true, source: "local" as const, product: local });
  }

  const suggestion = await lookupBarcodeGlobal(barcode);
  if (suggestion) {
    return jsonOk({ found: true, source: "global" as const, suggestion });
  }

  return jsonOk({ found: false as const });
}
