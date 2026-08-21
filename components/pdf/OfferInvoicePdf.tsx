import { join } from "path";
import { readFileSync } from "fs";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: join(process.cwd(), "public/fonts/Inter-Regular.ttf"), fontWeight: "normal" },
    { src: join(process.cwd(), "public/fonts/Inter-Bold.ttf"), fontWeight: "bold" },
  ],
});

const BLUE = "#1a7fc4";
const RED = "#d32f2f";
const INK = "#1a1a1a";
const GRAY = "#4a4a4a";

const CURRENCY_SYMBOL: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

export type OfferInvoicePdfItem = {
  name: string;
  qty: number;
  unitPrice: number;
};

export type OfferInvoicePdfData = {
  docType: "teklif" | "fatura";
  docNumber: string;
  title: string;
  customerName: string;
  address: string;
  phone: string;
  issueDate: string;
  dueDate: string;
  statusLabel: string;
  items: OfferInvoicePdfItem[];
  taxRate: number;
  currency: string;
  note: string;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: INK,
    padding: 24,
    border: `1pt solid ${BLUE}`,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 130, height: 130, objectFit: "contain" },
  callCenterBox: { alignItems: "flex-end" },
  callCenterTitle: { fontSize: 9, fontWeight: "bold", color: "#fff", backgroundColor: BLUE, padding: 4 },
  bigPhone: { fontSize: 15, fontWeight: "bold", color: INK, marginTop: 3 },
  smallText: { fontSize: 8, color: GRAY, marginTop: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  formTitle: { fontSize: 20, fontWeight: "bold", color: INK },
  formNoLabel: { fontSize: 9, color: GRAY },
  formNoValue: { fontSize: 18, fontWeight: "bold", color: RED },
  statusBadge: {
    marginTop: 4,
    alignSelf: "flex-end",
    fontSize: 8,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: BLUE,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  section: {
    border: `0.7pt solid ${GRAY}`,
    borderRadius: 3,
    marginTop: 10,
    padding: 8,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  fieldRow: { flexDirection: "row", marginBottom: 4 },
  fieldLabel: { width: 90, fontSize: 8.5, color: GRAY },
  fieldValue: { flex: 1, fontSize: 9, borderBottom: "0.5pt dotted #999", paddingBottom: 1 },
  sectionTitle: { fontSize: 8.5, fontWeight: "bold", color: GRAY, marginBottom: 4 },
  table: { marginTop: 10 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#eef3f7" },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #ddd" },
  th: { fontSize: 7.5, fontWeight: "bold", color: GRAY, paddingVertical: 5, paddingHorizontal: 4 },
  td: { fontSize: 8.5, paddingVertical: 5, paddingHorizontal: 4 },
  colName: { width: "52%" },
  colQty: { width: "12%", textAlign: "center" },
  colPrice: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  bottomRow: { flexDirection: "row", marginTop: 12, gap: 10 },
  noteBox: { flex: 1 },
  totalsBox: { width: 180, border: `0.7pt solid ${GRAY}`, borderRadius: 3 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderBottom: "0.5pt solid #ddd",
  },
  totalsLabel: { fontSize: 8.5, color: GRAY },
  totalsValue: { fontSize: 9.5, fontWeight: "bold" },
  grandTotalRow: { backgroundColor: "#eef3f7" },
  bodyText: { fontSize: 9, lineHeight: 1.5 },
  signLine: { marginTop: 30, borderTop: "0.7pt solid #999", paddingTop: 3 },
  signLabel: { fontSize: 8, fontWeight: "bold" },
  terms: { fontSize: 6.5, color: GRAY, marginTop: 14, lineHeight: 1.4 },
});

function fmtMoney(n: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ${symbol}`;
}

// react-pdf'in <Image src="..."> alanı bir dosya yolu değil URL sanıp fetch()
// ile açmaya çalışıyor — yerel dosyalar için sessizce başarısız oluyor. Buffer
// olarak okuyup vermek bu sorunu tamamen ortadan kaldırıyor.
const logoBuffer = readFileSync(join(process.cwd(), "public/images/logo-square.png"));

export function OfferInvoicePdf({ data }: { data: OfferInvoicePdfData }) {
  const subtotal = data.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const grandTotal = subtotal + taxAmount;
  const isOffer = data.docType === "teklif";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoBuffer} style={styles.logo} />
          <View style={styles.callCenterBox}>
            <Text style={styles.callCenterTitle}>7/24 Teknik Servis Çağrı Merkezi</Text>
            <Text style={styles.bigPhone}>0535 014 65 93</Text>
            <Text style={styles.bigPhone}>0551 647 05 34</Text>
            <Text style={styles.smallText}>www.ozturkguvenlik.com</Text>
            <Text style={styles.smallText}>guvenlikozturk@gmail.com</Text>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.formTitle}>{isOffer ? "TEKLİF" : "FATURA"}</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.formNoLabel}>{isOffer ? "Teklif No:" : "Fatura No:"}</Text>
            <Text style={styles.formNoValue}>{data.docNumber}</Text>
            {data.statusLabel && <Text style={styles.statusBadge}>{data.statusLabel}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Müşteri</Text>
                <Text style={styles.fieldValue}>{data.customerName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Adres</Text>
                <Text style={styles.fieldValue}>{data.address}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Telefon</Text>
                <Text style={styles.fieldValue}>{data.phone}</Text>
              </View>
            </View>
            <View style={[styles.col, { marginLeft: 16 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{isOffer ? "Teklif Tarihi" : "Düzenleme Tarihi"}</Text>
                <Text style={styles.fieldValue}>{data.issueDate}</Text>
              </View>
              {data.dueDate && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>{isOffer ? "Geçerlilik" : "Vade Tarihi"}</Text>
                  <Text style={styles.fieldValue}>{data.dueDate}</Text>
                </View>
              )}
              {data.title && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Konu</Text>
                  <Text style={styles.fieldValue}>{data.title}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colName]}>Ürün / Hizmet</Text>
            <Text style={[styles.th, styles.colQty]}>Adet</Text>
            <Text style={[styles.th, styles.colPrice]}>Birim Fiyat</Text>
            <Text style={[styles.th, styles.colTotal]}>Tutar</Text>
          </View>
          {data.items.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: "100%", textAlign: "center", color: GRAY }]}>
                Kalem yok
              </Text>
            </View>
          ) : (
            data.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.colName]}>{item.name}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.qty}</Text>
                <Text style={[styles.td, styles.colPrice]}>{fmtMoney(item.unitPrice, data.currency)}</Text>
                <Text style={[styles.td, styles.colTotal]}>{fmtMoney(item.qty * item.unitPrice, data.currency)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.noteBox}>
            <Text style={styles.sectionTitle}>Not</Text>
            <Text style={styles.bodyText}>{data.note || "-"}</Text>

            <View style={{ flexDirection: "row", marginTop: 24, gap: 30 }}>
              <View style={{ flex: 1 }}>
                <View style={styles.signLine}>
                  <Text style={styles.signLabel}>Müşteri Onayı</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.signLine}>
                  <Text style={styles.signLabel}>Öztürk Güvenlik</Text>
                </View>
              </View>
            </View>

            <Text style={styles.terms}>
              {isOffer
                ? "Bu teklif, düzenleme tarihinden itibaren 15 gün geçerlidir. Fiyatlara KDV dahildir."
                : "Fatura bedeli belirtilen vade tarihine kadar ödenmelidir. Gecikme durumunda yasal işlem uygulanabilir."}
            </Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Ara Toplam</Text>
              <Text style={styles.totalsValue}>{fmtMoney(subtotal, data.currency)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>KDV (%{data.taxRate})</Text>
              <Text style={styles.totalsValue}>{fmtMoney(taxAmount, data.currency)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.grandTotalRow, { borderBottom: "none" }]}>
              <Text style={styles.totalsLabel}>Genel Toplam</Text>
              <Text style={[styles.totalsValue, { color: BLUE, fontSize: 12 }]}>
                {fmtMoney(grandTotal, data.currency)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
