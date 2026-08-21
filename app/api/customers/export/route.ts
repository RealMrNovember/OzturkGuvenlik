import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { toCsv, csvResponse } from "@/lib/csv";

const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  whatsapp: "WhatsApp",
  telefon: "Telefon",
  referans: "Referans",
  panel: "Panel",
};

// ?consentOnly=1: yalnızca pazarlama izni açık VE e-postası dolu kayıtlar —
// gelecekteki kampanya aracına (ya da bugün doğrudan Resend/Mailchimp gibi
// bir servise) yüklenebilecek, KVKK/İYS açısından temiz bir liste üretir.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new Response("Yetkisiz", { status: 401 });

  const consentOnly = new URL(req.url).searchParams.get("consentOnly") === "1";

  const rows = await db
    .select()
    .from(customers)
    .where(consentOnly ? and(eq(customers.marketingConsent, true), ne(customers.email, "")) : undefined)
    .orderBy(desc(customers.createdAt))
    .limit(5000);

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "name", label: "Firma Adı" },
    { key: "contactName", label: "Yetkili Ad Soyad" },
    { key: "phone", label: "Telefon" },
    { key: "email", label: "E-posta" },
    { value: (r) => (r.marketingConsent ? "Evet" : "Hayır"), key: "marketingConsent", label: "Pazarlama İzni" },
    { key: "placeType", label: "Mekân Tipi" },
    { key: "address", label: "Adres" },
    { value: (r) => SOURCE_LABEL[r.source ?? ""] ?? r.source ?? "", key: "source", label: "Kaynak" },
    { key: "note", label: "Not" },
    { value: (r) => new Date(r.createdAt).toLocaleDateString("tr-TR"), key: "createdAt", label: "Kayıt Tarihi" },
  ]);

  const suffix = consentOnly ? "pazarlama-izinli" : "tumu";
  return csvResponse(csv, `musteriler-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`);
}
