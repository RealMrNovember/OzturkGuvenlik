import type { ExtractedInvoice, KnownSupplier } from "@/lib/invoice-ocr";

/**
 * Türk e-Arşiv/e-Fatura belgelerinin üzerindeki QR kod, GİB standardı gereği
 * faturanın kimlik bilgilerini yapılandırılmış JSON olarak taşır:
 * satıcı VKN/TCKN, fatura no, tarih, para birimi, KDV ve ödenecek tutar.
 * Bu, OCR'ın piksellerden tahmin ettiği her şeyin makine-okunur kesin
 * kaynağıdır — QR çözülebildiğinde fatura no/tarih/tutar/tedarikçi eşleşmesi
 * tahmine değil bu veriye dayanır. (Kağıt makbuz gibi QR'sız belgelerde
 * OCR tahmini tek başına devrede kalır.)
 */
export type EArsivQrData = {
  /** Satıcının VKN'si (10 hane) veya TCKN'si (11 hane). */
  vkn: string | null;
  invoiceNo: string | null;
  /** YYYY-MM-DD. */
  date: string | null;
  /** "TRY" | "USD" | "EUR" … */
  currency: string | null;
  /** Vergiler dahil ödenecek tutar (faturanın kendi para biriminde). */
  payable: number | null;
};

function normalizeQrDate(raw: string | null): string | null {
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const tr = raw.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/);
  if (tr) return `${tr[3]}-${tr[2].padStart(2, "0")}-${tr[1].padStart(2, "0")}`;
  return null;
}

export function parseEArsivQr(decoded: string): EArsivQrData | null {
  let obj: unknown;
  try {
    obj = JSON.parse(decoded);
  } catch {
    return null;
  }
  if (typeof obj !== "object" || obj === null) return null;

  // GİB anahtar adları belgelere göre ufak farklılıklar gösterebiliyor
  // ("paraBirimi"/"parabirimi", "kdvmatrah(20)" gibi) — hepsi
  // küçük-harfe/boşluksuza indirgenip esnek aranır.
  const map = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    map.set(k.toLocaleLowerCase("tr-TR").replace(/\s/g, ""), v);
  }
  const str = (key: string): string | null => {
    const v = map.get(key);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };
  const num = (key: string): number | null => {
    const v = map.get(key);
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const s = v.trim();
      // QR'daki tutarlar genelde "1129.20" (nokta ondalık) biçimindedir;
      // virgül geçiyorsa TR biçimi (nokta binlik, virgül ondalık) kabul edilir.
      const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
      const n = Number(normalized);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const vkn = str("vkntckn");
  const invoiceNo = str("no") ?? str("faturano");
  const date = normalizeQrDate(str("tarih"));
  const currencyRaw = str("parabirimi");
  const payable = num("odenecek") ?? num("ödenecek") ?? num("vergidahil");

  if (!vkn && !invoiceNo && !date && payable === null) return null;
  const currency = currencyRaw ? (currencyRaw.toUpperCase() === "TL" ? "TRY" : currencyRaw.toUpperCase()) : null;
  return { vkn, invoiceNo, date, currency, payable };
}

/** QR'dan gelen kesin verileri OCR tahminlerinin ÜZERİNE yazar; satıcı
 * VKN'si sistemdeki bir toptancının vergi numarasıyla birebir eşleşiyorsa
 * tedarikçi de kesin olarak o kabul edilir. */
export function mergeQrIntoExtraction(
  extracted: ExtractedInvoice,
  qr: EArsivQrData,
  suppliers: KnownSupplier[]
): ExtractedInvoice {
  const out: ExtractedInvoice = { ...extracted, qrVerified: true };
  if (qr.invoiceNo) out.invoiceNumber = qr.invoiceNo;
  if (qr.date) out.issueDate = qr.date;
  if (qr.payable !== null && qr.payable > 0) out.totalGuess = Math.round(qr.payable * 100) / 100;
  if (qr.currency) out.currency = qr.currency;
  if (qr.vkn) {
    if (!out.supplierTaxNumber) out.supplierTaxNumber = qr.vkn;
    const match = suppliers.find((s) => s.taxNumber && s.taxNumber === qr.vkn);
    if (match) {
      out.supplierId = match.id;
      out.supplierNameGuess = match.name;
      out.supplierConfidence = "high";
    }
  }
  return out;
}
