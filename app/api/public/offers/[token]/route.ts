import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { offers, customers, type OfferItem } from "@/lib/db/schema";
import { jsonOk, jsonErr } from "@/lib/api";

type Ctx = { params: Promise<{ token: string }> };

/** Oturumsuz, herkese açık — yalnızca tahmin edilemez token ile erişilir.
 * Müşterinin WhatsApp/e-postadan tıklayıp teklifi görmesi/onaylaması için. */
export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;
  if (!token) return jsonErr("Geçersiz bağlantı", 400);

  const [offer] = await db
    .select({
      id: offers.id,
      title: offers.title,
      items: offers.items,
      taxRate: offers.taxRate,
      total: offers.total,
      currency: offers.currency,
      status: offers.status,
      note: offers.note,
      createdAt: offers.createdAt,
      respondedAt: offers.respondedAt,
      customerName: customers.name,
    })
    .from(offers)
    .leftJoin(customers, eq(offers.customerId, customers.id))
    .where(eq(offers.publicToken, token))
    .limit(1);

  if (!offer) return jsonErr("Teklif bulunamadı — bağlantı geçersiz olabilir", 404);

  return jsonOk({
    title: offer.title,
    customerName: offer.customerName,
    items: (offer.items as OfferItem[]).map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice })),
    taxRate: Number(offer.taxRate),
    total: Number(offer.total),
    currency: offer.currency,
    status: offer.status,
    note: offer.note,
    createdAt: offer.createdAt,
    respondedAt: offer.respondedAt,
  });
}
