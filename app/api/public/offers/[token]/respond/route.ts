import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { offers, customers, jobs, type OfferItem, type JobItem } from "@/lib/db/schema";
import { jsonOk, jsonErr, readJson } from "@/lib/api";
import { costTotalForItems, applyStockDelta, StockConflictError } from "@/lib/stock";

type Ctx = { params: Promise<{ token: string }> };

const respondSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

/** Oturumsuz, herkese açık — yalnızca tahmin edilemez token ile erişilir.
 * Zaten yanıtlanmış bir teklif tekrar değiştirilemez (çift tıklama/replay
 * ile durum flip-flop etmesin, onayda iş de yalnızca bir kez açılsın diye). */
export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  if (!token) return jsonErr("Geçersiz bağlantı", 400);

  const body = await readJson(req);
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) return jsonErr("Geçersiz istek");

  const [offer] = await db
    .select({
      id: offers.id,
      customerId: offers.customerId,
      title: offers.title,
      items: offers.items,
      total: offers.total,
      currency: offers.currency,
      exchangeRate: offers.exchangeRate,
      status: offers.status,
      customerAddress: customers.address,
    })
    .from(offers)
    .leftJoin(customers, eq(offers.customerId, customers.id))
    .where(eq(offers.publicToken, token))
    .limit(1);

  if (!offer) return jsonErr("Teklif bulunamadı — bağlantı geçersiz olabilir", 404);
  if (offer.status === "onaylandi" || offer.status === "reddedildi") {
    return jsonErr("Bu teklif zaten yanıtlanmış", 409);
  }

  const newStatus = parsed.data.action === "approve" ? "onaylandi" : "reddedildi";

  if (parsed.data.action === "reject") {
    await db
      .update(offers)
      .set({ status: newStatus, respondedAt: new Date() })
      .where(eq(offers.id, offer.id));
    return jsonOk({ status: newStatus });
  }

  // Onayda otomatik iş kaydı açılır. Kataloğa bağlı (productId'li) kalemler
  // doğrudan iş kalemi olarak taşınır — stok düşümü iş kaydedilirken zaten
  // otomatik çalışır (lib/stock.ts). Serbest metin kalemler (productId yok)
  // stokla ilişkilendirilemez; sessizce kaybolmasınlar diye işin notuna
  // yazılır, personel isterse elle katalog kaleme çevirir.
  const items = offer.items as OfferItem[];
  const linkedItems: JobItem[] = items
    .filter((i) => i.productId != null)
    .map((i) => ({ productId: i.productId as number, qty: i.qty, name: i.name }));
  const freeTextItems = items.filter((i) => i.productId == null);
  const freeTextNote =
    freeTextItems.length > 0
      ? `Tekliften taşınan, kataloğa bağlı olmayan kalemler (elle ekleyin):\n${freeTextItems
          .map((i) => `- ${i.name} × ${i.qty}`)
          .join("\n")}`
      : "";

  try {
    const created = await db.transaction(async (tx) => {
      const [updatedOffer] = await tx
        .update(offers)
        .set({ status: newStatus, respondedAt: new Date() })
        .where(eq(offers.id, offer.id))
        .returning({ id: offers.id });
      if (!updatedOffer) throw new Error("Teklif güncellenemedi");

      const costTotal = await costTotalForItems(tx, linkedItems);
      const [job] = await tx
        .insert(jobs)
        .values({
          customerId: offer.customerId,
          offerId: offer.id,
          title: offer.title || `Teklif #${offer.id}`,
          address: offer.customerAddress || "",
          status: "planlandi",
          items: linkedItems,
          costTotal: String(costTotal),
          saleTotal: offer.total,
          currency: offer.currency,
          exchangeRate: offer.exchangeRate,
          notes: freeTextNote,
        })
        .returning({ id: jobs.id });

      await applyStockDelta(tx, [], linkedItems, { jobId: job.id });
      return job;
    });

    return jsonOk({ status: newStatus, jobId: created?.id });
  } catch (e) {
    if (e instanceof StockConflictError) return jsonErr(e.message, 409);
    throw e;
  }
}
