import "server-only";
import { site } from "@/lib/site";
import { gibImportToken } from "@/lib/gib-import";
import type { GibInvoiceDirection } from "@/lib/db/schema";

/**
 * GİB e-Fatura/e-Arşiv portalında çalışan, kullanıcının kendi tarayıcısına
 * eklediği bir "bookmarklet". Sahibinden.com'dan ilan aktarımı yapan benzer
 * bir sistemden esinlenildi: hiçbir şifre/oturum bilgisi taşınmaz, yalnızca
 * o an ekranda görünen veriyi okuyup kendi sunucumuza gönderir.
 *
 * ÖNEMLİ — eksik kalan tek kısım: GİB portalının gerçek HTML yapısını henüz
 * görmedik. Aşağıdaki iki fonksiyon (pickInvoiceRows, extractInvoiceFromRow)
 * bilinçli olarak YER TUTUCU bırakıldı ve açıkça "TODO" ile işaretlendi —
 * geri kalan her şey (ilerleme ekranı, tekilleştirme farkındalığı, sıralı
 * gönderim, hata toleransı) tamamen çalışır durumda. Portalın DOM'u
 * görülünce yalnızca bu iki fonksiyonun içini doldurmak yeterli olacak.
 */

const RAW_SCRIPT = String.raw`
var API_URL = '__API_URL__';
var DIRECTION = '__DIRECTION__';

function txt(el) {
  return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
}

/**
 * TODO (GİB DOM'u görülünce doldurulacak): fatura listesi sayfasındaki her
 * bir fatura satırını (satır/kart elemanını) bir dizi olarak döndürür.
 * Örnek (gerçek seçiciler görülünce güncellenecek):
 *   return Array.prototype.slice.call(document.querySelectorAll('table.faturaListesi tbody tr'));
 */
function pickInvoiceRows() {
  return [];
}

/**
 * TODO (GİB DOM'u görülünce doldurulacak): tek bir satırdan yapılandırılmış
 * fatura verisini okur. issueDate MUTLAKA "YYYY-AA-GG" formatında olmalı
 * (GİB genelde GG.AA.YYYY veya GG/AA/YYYY gösterir — toIsoDate() bunu
 * çevirmek için hazır, aşağıda tanımlı).
 * Beklenen dönüş biçimi:
 *   {
 *     ettn: string|null,
 *     invoiceNumber: string,
 *     issueDate: string,        // YYYY-AA-GG
 *     counterpartyName: string,
 *     counterpartyTaxId: string,
 *     amount: number,
 *     taxAmount: number|null,
 *     currency: string,         // örn. 'TRY'
 *     gibStatus: string,
 *     xmlUrl: string|null,
 *     pdfUrl: string|null
 *   }
 * Zorunlu alanlar okunamazsa null döndürülmeli — çağıran kod bunu "başarısız" sayar.
 */
function extractInvoiceFromRow(row) {
  return null;
}

/** "12.450,75" gibi Türkçe biçimli bir tutarı sayıya çevirir. */
function toAmount(text) {
  var cleaned = String(text || '').replace(/[^\d,.\-]/g, '');
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  var n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/** "GG.AA.YYYY" veya "GG/AA/YYYY" -> "YYYY-AA-GG". Zaten ISO ise olduğu gibi döner. */
function toIsoDate(text) {
  var s = String(text || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { return s; }
  var m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!m) { return s; }
  var day = m[1].length === 1 ? '0' + m[1] : m[1];
  var month = m[2].length === 1 ? '0' + m[2] : m[2];
  return m[3] + '-' + month + '-' + day;
}

/* ---------- İlerleme ekranı (sayfanın tam ortasında) ---------- */

var overlayRoot = null;
var elCurrent = null;
var elCount = null;
var elBar = null;
var elSummary = null;

function buildOverlay() {
  var backdrop = document.createElement('div');
  backdrop.setAttribute('style',
    'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(10,12,16,.72);backdrop-filter:blur(2px);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif'
  );
  var box = document.createElement('div');
  box.setAttribute('style',
    'width:min(420px,90vw);padding:28px 26px;border-radius:16px;background:#12161c;color:#f2f4f7;' +
    'box-shadow:0 24px 60px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.08)'
  );
  box.innerHTML =
    '<div style="font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#5eb1ff;margin-bottom:14px">' +
      'GİB Faturaları Aktarılıyor' +
    '</div>' +
    '<div id="gib-import-current" style="font-size:13px;color:rgba(242,244,247,.75);min-height:18px;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>' +
    '<div style="height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden">' +
      '<div id="gib-import-bar" style="height:100%;width:0%;background:#5eb1ff;transition:width .25s ease"></div>' +
    '</div>' +
    '<div id="gib-import-count" style="margin-top:10px;font-size:13px;font-weight:600;color:#f2f4f7"></div>' +
    '<div id="gib-import-summary" style="margin-top:10px;font-size:12px;color:rgba(242,244,247,.6)"></div>';
  backdrop.appendChild(box);
  document.body.appendChild(backdrop);
  overlayRoot = backdrop;
  elCurrent = box.querySelector('#gib-import-current');
  elBar = box.querySelector('#gib-import-bar');
  elCount = box.querySelector('#gib-import-count');
  elSummary = box.querySelector('#gib-import-summary');
}

function updateOverlay(label, done, total) {
  if (!overlayRoot) { return; }
  elCurrent.textContent = label;
  elCount.textContent = done + ' / ' + total;
  elBar.style.width = (total > 0 ? Math.round((done / total) * 100) : 0) + '%';
}

function finishOverlay(created, duplicate, failed, total) {
  if (!overlayRoot) { return; }
  elCurrent.textContent = 'Tamamlandı';
  elBar.style.width = '100%';
  elCount.textContent = total + ' / ' + total;
  elSummary.textContent = created + ' yeni eklendi, ' + duplicate + ' zaten sistemde vardı' +
    (failed > 0 ? ', ' + failed + ' okunamadı' : '') + '.';
  setTimeout(function () {
    if (overlayRoot && overlayRoot.parentNode) { overlayRoot.parentNode.removeChild(overlayRoot); }
    overlayRoot = null;
  }, 5000);
}

/* ---------- Ana akış ---------- */

var rows = pickInvoiceRows();
var total = rows.length;

if (total === 0) {
  buildOverlay();
  updateOverlay('Bu sayfada fatura bulunamadı', 0, 0);
  setTimeout(function () {
    if (overlayRoot && overlayRoot.parentNode) { overlayRoot.parentNode.removeChild(overlayRoot); }
  }, 3000);
} else {
  buildOverlay();
  var created = 0, duplicate = 0, failed = 0;

  (function next(i) {
    if (i >= total) { finishOverlay(created, duplicate, failed, total); return; }

    var row = rows[i];
    var data = extractInvoiceFromRow(row);

    if (!data || !data.invoiceNumber) {
      failed++;
      updateOverlay('Okunamadı (satır ' + (i + 1) + ')', i + 1, total);
      setTimeout(function () { next(i + 1); }, 40);
      return;
    }

    updateOverlay(data.invoiceNumber + (data.counterpartyName ? ' — ' + data.counterpartyName : ''), i, total);
    data.direction = DIRECTION;

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().then(function (json) { return { ok: res.ok, json: json }; });
      })
      .then(function (result) {
        if (result.ok && result.json && result.json.ok) {
          if (result.json.status === 'duplicate') { duplicate++; } else { created++; }
        } else {
          failed++;
        }
      })
      .catch(function () { failed++; })
      .then(function () {
        updateOverlay(data.invoiceNumber, i + 1, total);
        next(i + 1);
      });
  })(0);
}
`;

export function buildGibBookmarkletHref(direction: GibInvoiceDirection): string {
  const source = RAW_SCRIPT.replace(/__API_URL__/g, gibImportApiUrl()).replace(/__DIRECTION__/g, direction);
  const minified = source.replace(/\n\s*/g, "\n").trim();
  return "javascript:" + encodeURIComponent("(function(){" + minified + "})();");
}

export function gibImportApiUrl(): string {
  return `${site.url}/api/public/gib-invoices/import?token=${encodeURIComponent(gibImportToken())}`;
}

export function gibBookmarkletReadableSource(direction: GibInvoiceDirection): string {
  return RAW_SCRIPT.replace(/__API_URL__/g, gibImportApiUrl()).replace(/__DIRECTION__/g, direction);
}
