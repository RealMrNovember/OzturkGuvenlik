import { db } from "@/lib/db";
import { transactions, customers, jobs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { toCsv, csvResponse } from "@/lib/csv";

const TYPE_LABEL: Record<string, string> = { gelir: "Gelir", gider: "Gider" };
const METHOD_LABEL: Record<string, string> = { nakit: "Nakit", havale: "Havale", kart: "Kart" };
const CATEGORY_LABEL: Record<string, string> = {
  "is-tahsilati": "İş Tahsilatı",
  "diger-gelir": "Diğer Gelir",
  malzeme: "Malzeme",
  "yakit-ulasim": "Yakıt / Ulaşım",
  "personel-maasi": "Personel Maaşı",
  kira: "Kira",
  "fatura-abonelik": "Fatura / Abonelik",
  "tedarikci-odemesi": "Tedarikçi Ödemesi",
  "diger-gider": "Diğer Gider",
};

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      category: transactions.category,
      amount: transactions.amount,
      currency: transactions.currency,
      date: transactions.date,
      method: transactions.method,
      description: transactions.description,
      customerName: customers.name,
      jobTitle: jobs.title,
    })
    .from(transactions)
    .leftJoin(customers, eq(transactions.customerId, customers.id))
    .leftJoin(jobs, eq(transactions.jobId, jobs.id))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(5000);

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { value: (r) => TYPE_LABEL[r.type] ?? r.type, key: "type", label: "Tür" },
    { value: (r) => CATEGORY_LABEL[r.category] ?? r.category, key: "category", label: "Kategori" },
    { key: "amount", label: "Tutar" },
    { key: "currency", label: "Para Birimi" },
    { value: (r) => METHOD_LABEL[r.method] ?? r.method, key: "method", label: "Yöntem" },
    { key: "description", label: "Açıklama" },
    { key: "customerName", label: "Müşteri" },
    { key: "jobTitle", label: "İlgili İş" },
    { value: (r) => new Date(`${r.date}T00:00:00`).toLocaleDateString("tr-TR"), key: "date", label: "Tarih" },
  ]);

  return csvResponse(csv, `kasa-${new Date().toISOString().slice(0, 10)}.csv`);
}
