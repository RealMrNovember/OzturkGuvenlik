import { db } from "@/lib/db";
import { jobs, customers, type JobItem } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { toCsv, csvResponse } from "@/lib/csv";

const STATUS_LABEL: Record<string, string> = {
  planlandi: "Planlandı",
  "devam-ediyor": "Devam Ediyor",
  tamamlandi: "Tamamlandı",
  garanti: "Garanti",
};

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });
  const canViewCosts = hasPermission(session, "view_costs");

  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      address: jobs.address,
      status: jobs.status,
      items: jobs.items,
      costTotal: jobs.costTotal,
      saleTotal: jobs.saleTotal,
      currency: jobs.currency,
      startDate: jobs.startDate,
      endDate: jobs.endDate,
      createdAt: jobs.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .orderBy(desc(jobs.createdAt))
    .limit(5000);

  const columns = [
    { key: "id" as const, label: "ID" },
    { key: "title" as const, label: "Başlık" },
    { key: "customerName" as const, label: "Müşteri" },
    { key: "customerPhone" as const, label: "Telefon" },
    { key: "address" as const, label: "Adres" },
    { value: (r: (typeof rows)[number]) => (r.items as JobItem[]).length, key: "itemCount", label: "Kalem Sayısı" },
    ...(canViewCosts ? [{ key: "costTotal" as const, label: "Maliyet (₺)" }] : []),
    { key: "saleTotal" as const, label: "Satış Tutarı" },
    { key: "currency" as const, label: "Para Birimi" },
    { value: (r: (typeof rows)[number]) => STATUS_LABEL[r.status] ?? r.status, key: "status", label: "Durum" },
    { value: (r: (typeof rows)[number]) => (r.startDate ? new Date(`${r.startDate}T00:00:00`).toLocaleDateString("tr-TR") : ""), key: "startDate", label: "Başlangıç" },
    { value: (r: (typeof rows)[number]) => (r.endDate ? new Date(`${r.endDate}T00:00:00`).toLocaleDateString("tr-TR") : ""), key: "endDate", label: "Bitiş" },
    { value: (r: (typeof rows)[number]) => new Date(r.createdAt).toLocaleDateString("tr-TR"), key: "createdAt", label: "Kayıt Tarihi" },
  ];

  const csv = toCsv(rows, columns);
  return csvResponse(csv, `isler-${new Date().toISOString().slice(0, 10)}.csv`);
}
