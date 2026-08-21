import { db } from "@/lib/db";
import { offers, customers, type OfferItem } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { toCsv, csvResponse } from "@/lib/csv";
import { itemsTotalWithTax } from "@/lib/money";

const STATUS_LABEL: Record<string, string> = {
  tasarim: "Taslak",
  gonderildi: "Gönderildi",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const rows = await db
    .select({
      id: offers.id,
      title: offers.title,
      items: offers.items,
      taxRate: offers.taxRate,
      currency: offers.currency,
      status: offers.status,
      sentDate: offers.sentDate,
      createdAt: offers.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(offers)
    .leftJoin(customers, eq(offers.customerId, customers.id))
    .orderBy(desc(offers.createdAt))
    .limit(5000);

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "title", label: "Konu" },
    { key: "customerName", label: "Müşteri" },
    { key: "customerPhone", label: "Telefon" },
    { value: (r) => (r.items as OfferItem[]).length, key: "itemCount", label: "Kalem Sayısı" },
    { key: "taxRate", label: "KDV %" },
    {
      value: (r) => itemsTotalWithTax(r.items as OfferItem[], Number(r.taxRate)),
      key: "total",
      label: "Toplam",
    },
    { key: "currency", label: "Para Birimi" },
    { value: (r) => STATUS_LABEL[r.status] ?? r.status, key: "status", label: "Durum" },
    { value: (r) => (r.sentDate ? new Date(`${r.sentDate}T00:00:00`).toLocaleDateString("tr-TR") : ""), key: "sentDate", label: "Gönderim Tarihi" },
    { value: (r) => new Date(r.createdAt).toLocaleDateString("tr-TR"), key: "createdAt", label: "Kayıt Tarihi" },
  ]);

  return csvResponse(csv, `teklifler-${new Date().toISOString().slice(0, 10)}.csv`);
}
