import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { toCsv, csvResponse } from "@/lib/csv";

const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  whatsapp: "WhatsApp",
  telefon: "Telefon",
  referans: "Referans",
  panel: "Panel",
};

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const rows = await db.select().from(customers).orderBy(desc(customers.createdAt)).limit(5000);

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "name", label: "Firma Adı" },
    { key: "contactName", label: "Yetkili Ad Soyad" },
    { key: "phone", label: "Telefon" },
    { key: "placeType", label: "Mekân Tipi" },
    { key: "address", label: "Adres" },
    { value: (r) => SOURCE_LABEL[r.source ?? ""] ?? r.source ?? "", key: "source", label: "Kaynak" },
    { key: "note", label: "Not" },
    { value: (r) => new Date(r.createdAt).toLocaleDateString("tr-TR"), key: "createdAt", label: "Kayıt Tarihi" },
  ]);

  return csvResponse(csv, `musteriler-${new Date().toISOString().slice(0, 10)}.csv`);
}
