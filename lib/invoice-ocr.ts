/**
 * Taranan tedarikçi faturası/proforma/makbuz görselinden yapılandırılmış
 * veri çıkarımı — tamamen ücretsiz, kural bazlı (regex + bulanık eşleştirme),
 * hiçbir ücretli/dış API kullanmaz. Bkz. todo.md "Toptancılar — fatura
 * tarama" maddesi.
 *
 * Türk e-Arşiv/e-Fatura belgelerinde üstteki QR kod fatura no, tarih, VKN,
 * para birimi ve tutarı yapılandırılmış JSON olarak taşır — o yol
 * (lib/invoice-qr.ts) her zaman bu tahmin motorundan önceliklidir; buradaki
 * çıkarım QR okunamayan belgeler (kağıt makbuz, el yazısı, kötü çekim) için
 * yedek katmandır.
 *
 * Bu bir tahmin motorudur, kesin sonuç değil: çıktısı her zaman kullanıcı
 * tarafından gözden geçirilip düzeltilecek bir form için başlangıç noktası
 * olarak kullanılmalı, hiçbir alan otomatik/sessizce kaydedilmemeli.
 */
import { round2 } from "@/lib/money";

export type OcrWord = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };

export type Confidence = "high" | "medium" | "low" | "none";

export type ExtractedItem = {
  name: string;
  qty: number;
  unitPrice: number;
  productId: number | null;
  confidence: Confidence;
};

export type KnownSupplier = { id: number; name: string; taxNumber?: string | null };

export type ExtractedInvoice = {
  supplierId: number | null;
  supplierNameGuess: string;
  supplierConfidence: Confidence;
  /** Eşleşme yoksa (yeni tedarikçi), "yeni toptancı oluştur" akışını
   * faturanın kendi üstündeki bilgilerle önceden doldurmak için. */
  supplierTaxOffice: string;
  supplierTaxNumber: string;
  supplierPhone: string;
  supplierAddress: string;
  invoiceNumber: string;
  issueDate: string | null;
  dueDate: string | null;
  currency: string;
  /** Yabancı para birimli faturada belgeden okunan "Döviz Kuru" — bulunamazsa null. */
  exchangeRate: number | null;
  totalGuess: number | null;
  items: ExtractedItem[];
  /** true ise fatura no/tarih/tutar/VKN belge üzerindeki e-Arşiv QR kodundan
   * doğrulandı (bkz. lib/invoice-qr.ts) — OCR tahmini değil, kesin veri. */
  qrVerified: boolean;
};

/** Tesseract.js'in Page.blocks ağacından düz kelime listesi çıkarır. */
export function flattenWords(page: {
  blocks: { paragraphs: { lines: { words: OcrWord[] }[] }[] }[] | null;
}): OcrWord[] {
  const words: OcrWord[] = [];
  for (const block of page.blocks ?? []) {
    for (const para of block.paragraphs) {
      for (const line of para.lines) {
        words.push(...line.words);
      }
    }
  }
  return words;
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** 0..1 arası benzerlik skoru (1 = birebir aynı). */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

function confidenceFromScore(score: number): Confidence {
  if (score >= 0.8) return "high";
  if (score >= 0.55) return "medium";
  if (score >= 0.3) return "low";
  return "none";
}

/** Bir metni verilen aday listesindeki en yakın isme eşler. */
function bestMatch<T>(
  query: string,
  candidates: T[],
  getName: (item: T) => string
): { match: T | null; confidence: Confidence } {
  if (!query.trim() || candidates.length === 0) return { match: null, confidence: "none" };
  let best: T | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = similarity(query, getName(c));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  const confidence = confidenceFromScore(bestScore);
  return { match: confidence === "none" ? null : best, confidence };
}

/**
 * "1.234,56" / "1234,56" / "1234.56" / "28.202" gibi Türkçe/karışık sayı
 * biçimlerini ayrıştırır. Virgül varsa TR standardı (nokta binlik, virgül
 * ondalık); virgül yoksa ve noktalar tam 3'lü gruplar oluşturuyorsa
 * ("28.202" → 28202) binlik ayracı kabul edilir — Türk faturalarında yalın
 * "28.202 TL" neredeyse her zaman yirmi sekiz bin demektir, 28,202 değil.
 */
export function parseTurkishNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return null;
  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

// Ayraç olarak nokta/slash/tire kabul edilir; OCR satır kaymalarında
// tire etrafında boşluk da sık görülür ("24- 06- 2026").
const DATE_RE = /(\d{1,2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{2,4})/g;

function extractDates(text: string): string[] {
  const results: string[] = [];
  for (const m of text.matchAll(DATE_RE)) {
    const [, d, mo, yRaw] = m;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    const day = Number(d);
    const month = Number(mo);
    if (day < 1 || day > 31 || month < 1 || month > 12) continue;
    if (Number(y) < 2000 || Number(y) > 2100) continue;
    results.push(`${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return results;
}

/**
 * GİB e-fatura numarası standart biçimi: 3 harf önek + 4 haneli yıl + 9
 * haneli sıra (örn. TEK2026000000102). Bu kalıp belgede geçiyorsa kesin
 * odur — anahtar kelime aramasına hiç gerek kalmaz. Anahtar kelimeli yedek
 * arama artık "no" kelimesini ZORUNLU tutuyor: önceki hali "Fatura Tipi:
 * SATIS" satırından "Tipi"yi fatura numarası sanıyordu (gerçek taramada
 * görüldü).
 */
function extractInvoiceNumber(text: string): string {
  const gib = text.match(/\b([A-Z]{3}\d{13})\b/);
  if (gib) return gib[1];
  const m = text.match(
    /(?:fatura|belge|proforma|makbuz|irsaliye)\s*(?:no|num(?:ara)?s?[iı]?)\s*[:.;]?\s*([A-Z0-9][A-Z0-9\-/]{5,29})/i
  );
  return m ? m[1] : "";
}

const CURRENCY_TOKEN: Record<string, string> = {
  usd: "USD",
  eur: "EUR",
  "€": "EUR",
  $: "USD",
  tl: "TRY",
  try: "TRY",
  "₺": "TRY",
};

/**
 * Toplam tutar + para birimi + döviz kuru tespiti. Dövizli faturalarda
 * (örn. USD fatura) hem döviz toplamı hem TL karşılığı ayrı satırlarda
 * yazılıdır; "Döviz Kuru" satırı da bulunabiliyorsa döviz tutarı + kur
 * tercih edilir (sistemdeki çoklu-para-birimi modeliyle birebir uyumlu).
 * Kur bulunamazsa güvenli taraf seçilir: TL toplamı, TRY olarak.
 */
function extractTotalsAndCurrency(text: string): {
  totalGuess: number | null;
  currency: string;
  exchangeRate: number | null;
} {
  const lines = text.split("\n");
  const kw = /genel\s*toplam|ödenecek\s*tutar|vergiler\s*dahil|toplam\s*tutar|net\s*toplam/i;
  let tl: number | null = null;
  let foreign: { amount: number; currency: string } | null = null;

  for (let i = lines.length - 1; i >= 0; i--) {
    if (!kw.test(lines[i])) continue;
    const pairs = [...lines[i].matchAll(/([\d.,]+)\s*(usd|eur|tl|try|₺|\$|€)?/gi)]
      .map((m) => ({ n: parseTurkishNumber(m[1]), curRaw: m[2] }))
      .filter((p) => p.n !== null && p.n > 0);
    if (pairs.length === 0) continue;
    const last = pairs[pairs.length - 1];
    const amount = round2(last.n as number);
    const cur = last.curRaw ? CURRENCY_TOKEN[last.curRaw.toLowerCase()] : undefined;
    if (cur && cur !== "TRY") {
      if (!foreign) foreign = { amount, currency: cur };
    } else if (tl === null) {
      tl = amount;
    }
  }

  const rateM = text.match(/d[öo]viz\s*kuru[^\n]*?([\d.,]+)/i);
  const rate = rateM ? parseTurkishNumber(rateM[1]) : null;

  if (foreign && rate && rate > 0) return { totalGuess: foreign.amount, currency: foreign.currency, exchangeRate: rate };
  if (tl !== null) return { totalGuess: tl, currency: "TRY", exchangeRate: null };
  if (foreign) return { totalGuess: foreign.amount, currency: foreign.currency, exchangeRate: null };
  return { totalGuess: null, currency: "TRY", exchangeRate: null };
}

/** Kelimeleri yaklaşık aynı yükseklikteki (y0) satırlara gruplar. */
function groupWordsIntoRows(words: OcrWord[], yTolerance = 12): OcrWord[][] {
  const sorted = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
  const rows: OcrWord[][] = [];
  for (const w of sorted) {
    const row = rows.find((r) => Math.abs(r[0].bbox.y0 - w.bbox.y0) < yTolerance);
    if (row) row.push(w);
    else rows.push([w]);
  }
  rows.forEach((r) => r.sort((a, b) => a.bbox.x0 - b.bbox.x0));
  return rows;
}

const UNIT_LABEL_RE = /^(adet|adt|ad|kg|gr|lt|mt|m2|m3|paket|kutu|koli|usd|eur|try|tl|gbp|kr)[.,;:]?$/i;

/**
 * Kalem satırı çıkarımı — Türk fatura düzeninin sabit çapası "Miktar"
 * sütunundaki "N Adet" (ya da OCR'da sık görülen bitişik "21Adet") kalıbıdır:
 * çapanın SOLU ürün adı, SAĞINDAKİ İLK sayı birim fiyattır. Önceki
 * "satır sonundaki sayı kuyruğu" yaklaşımı gerçek taramalarda (%20,00 KDV
 * sütunu, bitişik "1Adet", satır başındaki sıra no) tamamen dağılıyordu —
 * kullanıcının gerçek fatura testinde kalemler hiç çıkmadı, bu yüzden
 * çapa-tabanlı bu yeniden yazım yapıldı.
 */
function extractItemRows(rows: OcrWord[][]): { name: string; qty: number; unitPrice: number }[] {
  const items: { name: string; qty: number; unitPrice: number }[] = [];
  for (const row of rows) {
    const texts = row.map((w) => w.text.trim()).filter(Boolean);
    if (texts.length < 3) continue;

    let qty = 0;
    let anchor = -1;
    let anchorSpansPrev = false;
    for (let i = 0; i < texts.length; i++) {
      const low = texts[i].toLocaleLowerCase("tr-TR").replace(/[.,;:]+$/, "");
      const glued = /^(\d{1,6})adet$/.exec(low);
      if (glued) {
        qty = Number(glued[1]);
        anchor = i;
        break;
      }
      if (low === "adet" && i > 0) {
        const n = parseTurkishNumber(texts[i - 1]);
        if (n !== null && Number.isInteger(n) && n > 0 && n <= 100_000) {
          qty = n;
          anchor = i;
          anchorSpansPrev = true;
          break;
        }
      }
    }
    if (anchor < 0 || qty <= 0) continue;

    const nameTokens = texts.slice(0, anchorSpansPrev ? anchor - 1 : anchor);
    // Satır başındaki sıra numarasını ("1", "2", …) üründen ayıkla.
    if (nameTokens.length > 0 && /^\d{1,3}$/.test(nameTokens[0])) nameTokens.shift();
    const name = nameTokens.join(" ").trim();
    if (name.length < 3) continue;

    // Çapadan sonraki ilk gerçek sayı = birim fiyat. "%20,00" (KDV oranı)
    // ve "TL"/"USD" gibi etiketler atlanır.
    let unitPrice: number | null = null;
    for (let j = anchor + 1; j < texts.length; j++) {
      const t = texts[j];
      if (t.startsWith("%")) continue;
      if (UNIT_LABEL_RE.test(t)) continue;
      const n = parseTurkishNumber(t);
      if (n !== null) {
        unitPrice = round2(n);
        break;
      }
    }
    if (unitPrice === null || unitPrice < 0) continue;

    items.push({ name, qty, unitPrice });
  }
  return items;
}

// Unvan satırı ASLA bu alan etiketlerini içermez — gerçek taramalarda
// "Ticaret SİCİL No", "Vergi Dairesi" gibi satırlar unvan sanılıyordu.
const NAME_BLOCK_RE =
  /(vergi|vkn|tckn|mersis|sicil|tel\s*[:.]|faks|fax|e-?posta|e-?mail|web\s|sayın|fatura|tarih|irsaliye|belge|ettn|özelleştirme|senaryo|sipariş)/i;

// Türkçe ticari unvan ekleri OCR'da genelde nokta ile ayrılmış kısaltmalar
// olarak geçer ("GÜV.SİSTEM.A.Ş") — satır hem boşluktan hem NOKTADAN
// token'lara bölünür; "A.Ş" böylece ["A","Ş"] bitişik çiftine dönüşür ve
// hangi noktalama/boşlukla yazılırsa yazılsın yakalanır.
const SUFFIX_STANDALONE_TOKENS = new Set([
  "ŞTİ", "STI", "LTD", "TİCARET", "TICARET", "SANAYİ", "SANAYI", "ŞİRKETİ", "SIRKETI",
]);

function lineHasCompanySuffix(line: string): boolean {
  const tokens = line
    .split(/[\s.]+/)
    .map((t) => t.toLocaleUpperCase("tr-TR"))
    .filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    if (SUFFIX_STANDALONE_TOKENS.has(tokens[i])) return true;
    if (tokens[i] === "A" && (tokens[i + 1] === "Ş" || tokens[i + 1] === "S")) return true;
  }
  return false;
}

function isPlausibleCompanyNameLine(line: string): boolean {
  const trimmed = line.trim();
  if (NAME_BLOCK_RE.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  return words.length >= 2 && trimmed.replace(/\s+/g, "").length >= 8;
}

/** Belgenin üst kısmındaki en olası unvan satırı: ticari ek (A.Ş/LTD/ŞTİ)
 * geçen ve alan etiketi içermeyen satır → yoksa ilk makul satır. */
function guessRawSupplierNameLine(topLines: string[]): { text: string; index: number } {
  const plausible = topLines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => isPlausibleCompanyNameLine(line));

  const withSuffix = plausible.find(({ line }) => lineHasCompanySuffix(line));
  if (withSuffix) return { text: withSuffix.line, index: withSuffix.index };
  if (plausible.length > 0) return { text: plausible[0].line, index: plausible[0].index };
  return { text: "", index: 0 };
}

function extractTaxOffice(text: string): string {
  const m = text.match(/vergi\s*dairesi\s*[:.]?\s*([^\n]+)/i);
  return m ? m[1].trim() : "";
}

function extractTaxNumber(text: string): string {
  // VKN (Vergi Kimlik No, 10 hane) veya TCKN (11 hane) — ikisi de "vergi no" alanına yazılabilir.
  const m = text.match(/\bVKN\s*[:.]?\s*(\d{10,11})/i) ?? text.match(/\bTCKN\s*[:.]?\s*(\d{10,11})/i);
  return m ? m[1].trim() : "";
}

function extractPhone(text: string): string {
  const m = text.match(/\bTel\s*[:.]?\s*([\d\s()+-]{7,20})/i);
  return m ? m[1].trim() : "";
}

/** Şirket unvanı satırından sonraki, "Tel/Vergi/VKN/..." gibi bir alan
 * etiketine kadar olan satırları adres tahmini olarak birleştirir —
 * en kırılgan alan, sadece kaba bir başlangıç noktası. */
function extractAddress(topLines: string[], companyLineIndex: number): string {
  const stopRe = /^(tel|faks|fax|e-posta|e-mail|web|vergi|vkn|tckn|mersis|ticaret\s*sicil)/i;
  const parts: string[] = [];
  for (let i = companyLineIndex + 1; i < topLines.length && parts.length < 4; i++) {
    const line = topLines[i].trim();
    if (!line) continue;
    if (stopRe.test(line)) break;
    parts.push(line);
  }
  return parts.join(" ").trim();
}

function guessSupplier(
  text: string,
  suppliers: KnownSupplier[]
): {
  supplierId: number | null;
  supplierNameGuess: string;
  supplierConfidence: Confidence;
  supplierTaxOffice: string;
  supplierTaxNumber: string;
  supplierPhone: string;
  supplierAddress: string;
} {
  // Tedarikçi unvanı genelde belgenin üst kısmında geçer.
  const topLines = text.split("\n").slice(0, 15).filter((l) => l.trim().length > 2);
  const raw = guessRawSupplierNameLine(topLines);
  const supplierTaxOffice = extractTaxOffice(text);
  const supplierTaxNumber = extractTaxNumber(text);
  const supplierPhone = extractPhone(text);
  const supplierAddress = raw.text ? extractAddress(topLines, raw.index) : "";

  // En güvenilir eşleşme: belgedeki satıcı VKN'si sistemde kayıtlı bir
  // toptancının vergi numarasıyla birebir aynıysa isim benzerliğine hiç
  // gerek yok — kesin eşleşmedir.
  if (supplierTaxNumber) {
    const byVkn = suppliers.find((s) => s.taxNumber && s.taxNumber === supplierTaxNumber);
    if (byVkn) {
      return {
        supplierId: byVkn.id,
        supplierNameGuess: byVkn.name,
        supplierConfidence: "high",
        supplierTaxOffice,
        supplierTaxNumber,
        supplierPhone,
        supplierAddress,
      };
    }
  }

  let best: { supplier: KnownSupplier; score: number } | null = null;
  for (const line of topLines) {
    for (const s of suppliers) {
      const score = similarity(line, s.name);
      if (!best || score > best.score) best = { supplier: s, score };
    }
  }

  const confidence = best ? confidenceFromScore(best.score) : "none";
  // Yalnızca orta/yüksek güvenli eşleşmede otomatik yönlendir — düşük
  // güvenli eşleşmeyle YANLIŞ tedarikçiye sessizce gitmek, hiç
  // eşleşmemekten kötü. Aksi halde belgeden okunan ham unvan + iletişim
  // bilgileri "yeni toptancı oluştur" akışını doldurur.
  if (confidence === "high" || confidence === "medium") {
    return {
      supplierId: best!.supplier.id,
      supplierNameGuess: best!.supplier.name,
      supplierConfidence: confidence,
      supplierTaxOffice,
      supplierTaxNumber,
      supplierPhone,
      supplierAddress,
    };
  }
  return {
    supplierId: null,
    supplierNameGuess: raw.text,
    supplierConfidence: raw.text ? "low" : "none",
    supplierTaxOffice,
    supplierTaxNumber,
    supplierPhone,
    supplierAddress,
  };
}

export function extractInvoiceData(
  ocrText: string,
  words: OcrWord[],
  knownSuppliers: KnownSupplier[],
  knownProducts: { id: number; name: string }[]
): ExtractedInvoice {
  const dates = extractDates(ocrText);
  const invoiceNumber = extractInvoiceNumber(ocrText);
  const totals = extractTotalsAndCurrency(ocrText);
  const rows = groupWordsIntoRows(words);
  const rawItems = extractItemRows(rows);

  const items: ExtractedItem[] = rawItems.map((ri) => {
    const { match, confidence } = bestMatch(ri.name, knownProducts, (p) => p.name);
    return {
      name: match ? match.name : ri.name,
      qty: ri.qty,
      unitPrice: ri.unitPrice,
      productId: match ? match.id : null,
      confidence,
    };
  });

  const supplierGuess = guessSupplier(ocrText, knownSuppliers);

  const issueDate = dates[0] ?? null;
  // İkinci bulunan tarih çoğu belgede vade DEĞİL, kesim tarihinin tekrarıdır
  // (irsaliye/sipariş tarihi) — aynıysa vade olarak kullanma.
  const dueDate = dates[1] && dates[1] !== issueDate ? dates[1] : null;

  return {
    ...supplierGuess,
    invoiceNumber,
    issueDate,
    dueDate,
    currency: totals.currency,
    exchangeRate: totals.exchangeRate,
    totalGuess: totals.totalGuess,
    items,
    qrVerified: false,
  };
}
