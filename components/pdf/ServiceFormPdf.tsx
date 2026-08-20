import { join } from "path";
import { readFileSync } from "fs";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type {
  ServiceTicketBillingType,
  ServiceTicketCategory,
  ServiceTicketRequestType,
} from "@/lib/db/schema";

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

const CATEGORY_LABELS: Record<ServiceTicketCategory, string> = {
  "video-izleme": "Video İzleme",
  "hirsiz-alarm": "Hırsız Alarm",
  "yangin-algilama": "Yangın Algılama",
  seslendirme: "Seslendirme",
  "gecis-kontrol": "Geçiş Kontrol",
  diger: "Diğer",
};

const REQUEST_TYPE_LABELS: Record<ServiceTicketRequestType, string> = {
  montaj: "Montaj",
  onarim: "Onarım",
  bakim: "Bakım",
  kesif: "Keşif",
  servis: "Servis",
  demontaj: "Demontaj",
};

const BILLING_TYPE_LABELS: Record<ServiceTicketBillingType, string> = {
  garanti: "Garanti Kapsamında",
  ucretli: "Ücretli",
  sozlesmeli: "Sözleşmeli",
};

export type ServiceFormItem = {
  code: string;
  name: string;
  serialNo: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type ServiceFormData = {
  formNo: string;
  category: ServiceTicketCategory;
  requestType: ServiceTicketRequestType;
  billingType: ServiceTicketBillingType;
  customerName: string;
  address: string;
  phone: string;
  reportedAt: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  totalDuration: string;
  requestReason: string;
  workDone: string;
  result: string;
  items: ServiceFormItem[];
  note: string;
  materialTotal: number;
  serviceFee: number;
  grandTotal: number;
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
  categoryBar: {
    flexDirection: "row",
    backgroundColor: BLUE,
    marginTop: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRightWidth: 0.5,
    borderRightColor: "#ffffff55",
  },
  categoryLabel: { fontSize: 7.5, color: "#fff" },
  checkbox: {
    width: 8,
    height: 8,
    border: "0.7pt solid #fff",
    backgroundColor: "transparent",
  },
  checkboxChecked: { backgroundColor: "#fff" },
  darkCheckbox: { width: 8, height: 8, border: `0.7pt solid ${INK}` },
  darkCheckboxChecked: { backgroundColor: INK },
  section: {
    border: `0.7pt solid ${GRAY}`,
    borderRadius: 3,
    marginTop: 8,
    padding: 8,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  fieldRow: { flexDirection: "row", marginBottom: 4 },
  fieldLabel: { width: 90, fontSize: 8.5, color: GRAY },
  fieldValue: { flex: 1, fontSize: 9, borderBottom: "0.5pt dotted #999", paddingBottom: 1 },
  checkGroup: { flexDirection: "row", gap: 10, marginTop: 4, flexWrap: "wrap" },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  sectionTitle: { fontSize: 8.5, fontWeight: "bold", color: GRAY, marginBottom: 4 },
  bodyText: { fontSize: 9, lineHeight: 1.5 },
  table: { marginTop: 8 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#eef3f7" },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #ddd" },
  th: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: GRAY,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  td: { fontSize: 8, paddingVertical: 4, paddingHorizontal: 3 },
  colCode: { width: "12%" },
  colName: { width: "26%" },
  colSerial: { width: "16%" },
  colQty: { width: "8%", textAlign: "center" },
  colPrice: { width: "16%", textAlign: "right" },
  colTotal: { width: "16%", textAlign: "right" },
  bottomRow: { flexDirection: "row", marginTop: 10, gap: 10 },
  signBox: { flex: 1 },
  totalsBox: { width: 160, border: `0.7pt solid ${GRAY}`, borderRadius: 3 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottom: "0.5pt solid #ddd",
  },
  totalsLabel: { fontSize: 8, color: GRAY },
  totalsValue: { fontSize: 9, fontWeight: "bold" },
  grandTotalRow: { backgroundColor: "#eef3f7" },
  signLine: { marginTop: 24, borderTop: "0.7pt solid #999", paddingTop: 3 },
  signLabel: { fontSize: 8, fontWeight: "bold" },
  terms: { fontSize: 6.5, color: GRAY, marginTop: 10, lineHeight: 1.4 },
});

function Checkbox({ checked, dark }: { checked: boolean; dark?: boolean }) {
  if (dark) {
    return <View style={[styles.darkCheckbox, checked ? styles.darkCheckboxChecked : {}]} />;
  }
  return <View style={[styles.checkbox, checked ? styles.checkboxChecked : {}]} />;
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " ₺";
}

// react-pdf'in <Image src="..."> alanı bir dosya yolu değil URL sanıp fetch()
// ile açmaya çalışıyor — yerel dosyalar için sessizce başarısız oluyor. Buffer
// olarak okuyup vermek bu sorunu tamamen ortadan kaldırıyor.
const logoBuffer = readFileSync(join(process.cwd(), "public/images/logo-square.png"));

export function ServiceFormPdf({ data }: { data: ServiceFormData }) {
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
          <Text style={styles.formTitle}>SERVİS FORMU</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.formNoLabel}>Servis Talep No:</Text>
            <Text style={styles.formNoValue}>{data.formNo}</Text>
          </View>
        </View>

        <View style={styles.categoryBar}>
          {(Object.keys(CATEGORY_LABELS) as ServiceTicketCategory[]).map((key, i, arr) => (
            <View
              key={key}
              style={[styles.categoryCell, i === arr.length - 1 ? { borderRightWidth: 0 } : {}]}
            >
              <Checkbox checked={data.category === key} />
              <Text style={styles.categoryLabel}>{CATEGORY_LABELS[key]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Müşteri Adı</Text>
                <Text style={styles.fieldValue}>{data.customerName}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Adresi</Text>
                <Text style={styles.fieldValue}>{data.address}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Telefonu</Text>
                <Text style={styles.fieldValue}>{data.phone}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Bildirim Tarihi</Text>
                <Text style={styles.fieldValue}>{data.reportedAt}</Text>
              </View>
            </View>
            <View style={[styles.col, { marginLeft: 16 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Servis Tarihi</Text>
                <Text style={styles.fieldValue}>{data.serviceDate}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Başlangıç Saati</Text>
                <Text style={styles.fieldValue}>{data.startTime || "-"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Bitiş Saati</Text>
                <Text style={styles.fieldValue}>{data.endTime || "-"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Toplam Süre</Text>
                <Text style={styles.fieldValue}>{data.totalDuration || "-"}</Text>
              </View>
              <View style={styles.checkGroup}>
                {(Object.keys(BILLING_TYPE_LABELS) as ServiceTicketBillingType[]).map((key) => (
                  <View key={key} style={styles.checkItem}>
                    <Checkbox checked={data.billingType === key} dark />
                    <Text style={{ fontSize: 8 }}>{BILLING_TYPE_LABELS[key]}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Talep Türü</Text>
          <View style={styles.checkGroup}>
            {(Object.keys(REQUEST_TYPE_LABELS) as ServiceTicketRequestType[]).map((key) => (
              <View key={key} style={styles.checkItem}>
                <Checkbox checked={data.requestType === key} dark />
                <Text style={{ fontSize: 8 }}>{REQUEST_TYPE_LABELS[key]}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Talep Nedeni</Text>
          <Text style={styles.bodyText}>{data.requestReason || "-"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yapılan İş</Text>
          <Text style={styles.bodyText}>{data.workDone || "-"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sonuç</Text>
          <Text style={styles.bodyText}>{data.result || "-"}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colCode]}>Ürün Kodu</Text>
            <Text style={[styles.th, styles.colName]}>Ürün Adı</Text>
            <Text style={[styles.th, styles.colSerial]}>Seri No</Text>
            <Text style={[styles.th, styles.colQty]}>Adet</Text>
            <Text style={[styles.th, styles.colPrice]}>Birim Fiyatı</Text>
            <Text style={[styles.th, styles.colTotal]}>Toplam Fiyat</Text>
          </View>
          {data.items.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: "100%", textAlign: "center", color: GRAY }]}>
                Kullanılan ürün yok
              </Text>
            </View>
          ) : (
            data.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.colCode]}>{item.code}</Text>
                <Text style={[styles.td, styles.colName]}>{item.name}</Text>
                <Text style={[styles.td, styles.colSerial]}>{item.serialNo || "-"}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.qty}</Text>
                <Text style={[styles.td, styles.colPrice]}>{fmtMoney(item.unitPrice)}</Text>
                <Text style={[styles.td, styles.colTotal]}>{fmtMoney(item.total)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.signBox}>
            <Text style={styles.sectionTitle}>Özel Not</Text>
            <Text style={styles.bodyText}>{data.note || "-"}</Text>

            <View style={{ flexDirection: "row", marginTop: 20, gap: 30 }}>
              <View style={{ flex: 1 }}>
                <View style={styles.signLine}>
                  <Text style={styles.signLabel}>Müşteri Yetkilisi</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.signLine}>
                  <Text style={styles.signLabel}>Servis Yetkilisi</Text>
                </View>
              </View>
            </View>

            <Text style={styles.terms}>
              Yukarıda model ve seri numarası belirtilen cihazı/cihazları çalışır teslim aldım.
              Tamir süremiz azami 20 iş günü olup, servise müteakiben 90 takvim günü içerisinde
              alınmayan ürünlerden firmamız sorumlu değildir.
            </Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Malzeme Bedeli</Text>
              <Text style={styles.totalsValue}>{fmtMoney(data.materialTotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Servis Bedeli</Text>
              <Text style={styles.totalsValue}>{fmtMoney(data.serviceFee)}</Text>
            </View>
            <View style={[styles.totalsRow, styles.grandTotalRow, { borderBottom: "none" }]}>
              <View>
                <Text style={styles.totalsLabel}>Genel Toplam</Text>
                <Text style={{ fontSize: 6, color: GRAY }}>(KDV Dahil Değildir)</Text>
              </View>
              <Text style={[styles.totalsValue, { color: BLUE, fontSize: 11 }]}>
                {fmtMoney(data.grandTotal)}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
