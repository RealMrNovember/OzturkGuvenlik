/**
 * Taranan tedarikçi faturası/proforma/makbuz görselinden yapılandırılmış
 * veri çıkarımı — tamamen ücretsiz, kural bazlı (regex + bulanık eşleştirme),
 * hiçbir ücretli/dış API kullanmaz. Bkz. todo.md "Toptancılar — fatura
 * tarama" maddesi.
 *
 * Bu bir tahmin motorudur, kesin sonuç değil: çıktısı her zaman kullanıcı
 * tarafından gözden geçirilip düzeltilecek bir form için başlangıç noktası
 * olarak kullanılmalı, hiçbir alan otomatik/sessizce kaydedilmemeli.
 */

export type OcrWord = { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } };

export type Confidence = "high" | "medium" | "low" | "none";

export type ExtractedItem = {
  name: string;
  qty: number;
  unitPrice: number;
  productId: number | null;
  confidence: Confidence;
};

export type ExtractedInvoice = {
  supplierId: number | null;
  supplierNameGuess: string;
  supplierConfidence: Confidence;
  invoiceNumber: string;
  issueDate: string | null;
  dueDate: string | null;
  totalGuess: number | null;
  items: ExtractedItem[];
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

/** "1.234,56" veya "1234,56" veya "1234.56" gibi Türkçe/karışık sayı biçimlerini ayrıştırır. */
export function parseTurkishNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  let normalized: string;
  if (cleaned.includes(",")) {
    // Virgül ondalık ayracı, nokta binlik ayracı kabul edilir (TR standardı).
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
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
    results.push(`${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return results;
}

function extractInvoiceNumber(text: string): string {
  const m = text.match(
    /(?:fatura|belge|proforma|makbuz|irsaliye)\s*(?:no|num(?:ara)?s?[iı]?)?\s*[:.]?\s*([A-Z0-9][A-Z0-9\-/]{2,29})/i
  );
  return m ? m[1] : "";
}

function extractTotal(text: string): number | null {
  const lines = text.split("\n");
  const keywordRe = /genel\s*toplam|toplam\s*tutar|ödenecek\s*tutar|net\s*toplam|\btoplam\b/i;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!keywordRe.test(lines[i])) continue;
    const nums = lines[i].match(/[\d.,]+/g);
    if (!nums) continue;
    const n = parseTurkishNumber(nums[nums.length - 1]);
    if (n !== null && n > 0) return n;
  }
  return null;
}

function isNumericToken(s: string): boolean {
  return /\d/.test(s) && /^[\d.,]+$/.test(s);
}

// Türkçe faturalarda adet/tutar hemen ardından birim/para birimi etiketi
// gelir ("5 Adet", "30,0000 USD", "% 20,00") — bu etiketler sayısal
// kuyruğun İÇİNDE atlanabilir kabul edilir, yoksa satır sonu "USD"/"TL"/
// "Adet" gibi bir metinle bittiği için kuyruk hiç bulunamaz (gerçek
// faturalarda hemen her satır böyle biter).
const UNIT_LABELS = new Set([
  "adet", "adt", "ad", "kg", "gr", "lt", "mt", "m2", "m3",
  "paket", "kutu", "koli", "usd", "eur", "try", "tl", "gbp", "kr", "%",
]);

function isUnitLabel(s: string): boolean {
  return UNIT_LABELS.has(s.toLowerCase().replace(/[.,]/g, ""));
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

/**
 * Satırları "ürün adı ... adet ... birim fiyat [... tutar]" kalıbına göre
 * tarar — bir satırın sonundaki ardışık sayısal token grubunu adet+fiyat
 * olarak, öncesindeki metni ürün adı olarak yorumlar. Bu, rule-based OCR'ın
 * en kırılgan kısmı (bkz. todo.md) — yanlış/eksik satırlar kullanıcı
 * tarafından gözden geçirme ekranında düzeltilir.
 */
function extractItemRows(rows: OcrWord[][]): { name: string; qty: number; unitPrice: number }[] {
  const items: { name: string; qty: number; unitPrice: number }[] = [];
  for (const row of rows) {
    const texts = row.map((w) => w.text.trim()).filter(Boolean);
    if (texts.length < 3) continue;

    let splitIdx = texts.length;
    while (
      splitIdx > 0 &&
      (isNumericToken(texts[splitIdx - 1]) || isUnitLabel(texts[splitIdx - 1]))
    ) {
      splitIdx--;
    }
    const nameTokens = texts.slice(0, splitIdx);
    const tailTokens = texts.slice(splitIdx);
    if (nameTokens.length === 0 || tailTokens.length === 0) continue;

    const nums = tailTokens.map(parseTurkishNumber).filter((n): n is number => n !== null);
    if (nums.length < 2) continue;

    const [qty, unitPrice] = nums;
    if (!(qty > 0 && qty <= 100_000) || unitPrice < 0) continue;

    const name = nameTokens.join(" ").trim();
    if (name.length < 2) continue;

    items.push({ name, qty, unitPrice });
  }
  return items;
}

function guessSupplier(
  text: string,
  suppliers: { id: number; name: string }[]
): { supplierId: number | null; supplierNameGuess: string; supplierConfidence: Confidence } {
  // Tedarikçi unvanı genelde belgenin üst kısmında geçer.
  const topLines = text.split("\n").slice(0, 15).filter((l) => l.trim().length > 2);
  let best: { supplier: { id: number; name: string }; score: number } | null = null;
  for (const line of topLines) {
    for (const s of suppliers) {
      const score = similarity(line, s.name);
      if (!best || score > best.score) best = { supplier: s, score };
    }
  }
  if (!best) return { supplierId: null, supplierNameGuess: "", supplierConfidence: "none" };
  const confidence = confidenceFromScore(best.score);
  return {
    supplierId: confidence === "none" ? null : best.supplier.id,
    supplierNameGuess: confidence === "none" ? "" : best.supplier.name,
    supplierConfidence: confidence,
  };
}

export function extractInvoiceData(
  ocrText: string,
  words: OcrWord[],
  knownSuppliers: { id: number; name: string }[],
  knownProducts: { id: number; name: string }[]
): ExtractedInvoice {
  const dates = extractDates(ocrText);
  const invoiceNumber = extractInvoiceNumber(ocrText);
  const totalGuess = extractTotal(ocrText);
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

  return {
    ...supplierGuess,
    invoiceNumber,
    issueDate: dates[0] ?? null,
    dueDate: dates[1] ?? null,
    totalGuess,
    items,
  };
}
