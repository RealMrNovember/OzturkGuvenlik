import { jsonOk, jsonErr } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { CURRENCIES, type Currency } from "@/lib/currency";

/**
 * Güncel $/€ → ₺ kurunu döndürür (Frankfurter/ECB verisi). Next.js'in fetch
 * cache'i 1 saat boyunca aynı sonucu tekrar kullanır — kur kayıt anında
 * kilitlendiği için her istekte canlı çekmeye gerek yok.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return jsonErr("Yetkisiz", 401);

  const currency = new URL(req.url).searchParams.get("currency")?.toUpperCase();
  if (!currency || currency === "TRY" || !CURRENCIES.includes(currency as Currency)) {
    return jsonErr("Geçersiz para birimi", 400);
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=TRY`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
    const data = (await res.json()) as { rates?: { TRY?: number }; date?: string };
    const rate = data.rates?.TRY;
    if (!rate) throw new Error("Kur verisi eksik");
    return jsonOk({ currency, rate, asOf: data.date ?? null });
  } catch {
    return jsonErr("Güncel kur alınamadı, lütfen tekrar deneyin.", 502);
  }
}
