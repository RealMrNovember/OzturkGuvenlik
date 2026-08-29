import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { gibInvoices } from "@/lib/db/schema";
import { jsonErr, readJson } from "@/lib/api";
import { gibInvoiceImportSchema } from "@/lib/validators";
import { gibImportToken, gibImportAllowedOrigins, timingSafeStringEqual } from "@/lib/gib-import";

/**
 * GİB e-Fatura/e-Arşiv portalında çalışan bookmarklet'ten (bkz.
 * lib/gib-bookmarklet.ts) gelen tek bir fatura kaydını kabul eder.
 *
 * Kimlik doğrulama modeli bilinçli olarak şifre/oturum TABANLI DEĞİL: istek,
 * kullanıcının kendi GİB oturumundan değil, tarayıcısında çalışan JS'ten
 * geliyor — GİB'e ait hiçbir bilgi bu sunucuya asla ulaşmaz. Tek kontrol,
 * "bu isteği bizim bookmarklet'imiz mi gönderdi" sorusuna cevap veren
 * paylaşımlı bir site sırrıdır (token), zamanlama saldırılarına karşı güvenli
 * şekilde karşılaştırılır.
 */

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = gibImportAllowedOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : "";
  if (!allowOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, X-Gib-Import-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));

  const expected = gibImportToken();
  if (!expected) {
    return jsonErrWithCors("GİB aktarım jetonu tanımlı değil.", 503, headers);
  }

  const url = new URL(req.url);
  const provided = url.searchParams.get("token") ?? req.headers.get("X-Gib-Import-Token") ?? "";
  if (!timingSafeStringEqual(expected, provided)) {
    return jsonErrWithCors("Geçersiz jeton.", 401, headers);
  }

  const body = await readJson(req);
  const parsed = gibInvoiceImportSchema.safeParse(body);
  if (!parsed.success) {
    return jsonErrWithCors(parsed.error.issues[0]?.message ?? "Geçersiz istek", 400, headers);
  }
  const data = parsed.data;

  // GİB'deki orijinal belge bağlantıları (varsa) indirilip kendi Blob
  // deponuza kopyalanır — asıl amaç bu (GİB 6 ay sonra siler, burası kalıcı
  // arşiv). İndirme başarısız olursa fatura kaydı YİNE DE kaydedilir; belge
  // eksikliği aktarımı asla bloklamaz.
  const [xmlUrl, pdfUrl] = await Promise.all([
    downloadToBlob(data.xmlUrl, "xml"),
    downloadToBlob(data.pdfUrl, "pdf"),
  ]);

  const [created] = await db
    .insert(gibInvoices)
    .values({
      direction: data.direction,
      ettn: data.ettn || null,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      counterpartyName: data.counterpartyName,
      counterpartyTaxId: data.counterpartyTaxId,
      amount: String(data.amount),
      taxAmount: data.taxAmount != null ? String(data.taxAmount) : null,
      currency: data.currency,
      gibStatus: data.gibStatus,
      xmlUrl,
      pdfUrl,
      rawPayload: body,
    })
    .onConflictDoNothing({ target: [gibInvoices.direction, gibInvoices.invoiceNumber, gibInvoices.issueDate, gibInvoices.counterpartyTaxId] })
    .returning({ id: gibInvoices.id });

  return Response.json(
    created
      ? { ok: true, status: "created", id: created.id }
      : { ok: true, status: "duplicate" },
    { status: created ? 201 : 200, headers }
  );
}

function jsonErrWithCors(message: string, status: number, headers: HeadersInit) {
  return Response.json({ ok: false, message }, { status, headers });
}

const GIB_DOCUMENT_PREFIX = "gib-fatura-belgeleri/";

/**
 * Bir belgeyi (XML/PDF) indirip kendi Blob deponuza yazar. Bu klasör, diğer
 * "taranan belge" akışlarının aksine (bkz. lib/blob-retention.ts) HİÇBİR
 * otomatik saklama/silme kuralına tabi DEĞİLDİR — yasal 10 yıllık arşivin
 * amacı bu, dosyalar süresiz saklanır.
 */
/**
 * Bu uç public olduğu için (token bookmarklet içinde tarayıcıda görünür,
 * tam bir sır sayılmaz) sunucunun keyfi bir adrese istek atmasını
 * (SSRF) önlemek amacıyla yalnızca bilinen GİB alan adlarından belge
 * indirilir — başka her adres sessizce reddedilir.
 */
function isTrustedGibHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "efatura.gov.tr" || host.endsWith(".efatura.gov.tr") || host.endsWith(".gov.tr");
}

async function downloadToBlob(sourceUrl: string | null | undefined, kind: "xml" | "pdf"): Promise<string | null> {
  if (!sourceUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !isTrustedGibHost(parsed.hostname)) return null;

  try {
    const res = await fetch(parsed);
    if (!res.ok) return null;
    const body = await res.arrayBuffer();
    if (body.byteLength === 0) return null;

    const pathname = `${GIB_DOCUMENT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${kind}`;
    const blob = await put(pathname, body, {
      access: "private",
      contentType: kind === "xml" ? "application/xml" : "application/pdf",
    });
    return blob.url;
  } catch {
    return null;
  }
}
