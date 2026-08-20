import { jsonOk, jsonErr } from "@/lib/api";
import { enforceInvoiceScanRetention } from "@/lib/blob-retention";

// Vercel Cron ile günde bir çağrılır (bkz. vercel.json). Yüklemeden hemen
// sonra zaten anında uygulanan sınırın (app/api/suppliers/scan-upload)
// yedek/emniyet katmanı — cron'un tetiklenmemesi/gecikmesi durumunda bile
// dosya sayısı asla uzun süre 10'un üzerinde kalmaz.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return jsonErr("Yetkisiz", 401);
  }

  const result = await enforceInvoiceScanRetention();
  return jsonOk(result);
}
