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

export type JobDeliveryReceiptItem = { name: string; qty: number };

export type JobDeliveryReceiptData = {
  jobNo: string;
  title: string;
  customerName: string;
  address: string;
  phone: string;
  startDate: string;
  endDate: string;
  statusLabel: string;
  items: JobDeliveryReceiptItem[];
  notes: string;
  saleTotalLabel: string;
  photoBuffers: Buffer[];
};

const styles = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 9, color: INK, padding: 24, border: `1pt solid ${BLUE}` },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logo: { width: 130, height: 130, objectFit: "contain" },
  callCenterBox: { alignItems: "flex-end" },
  callCenterTitle: { fontSize: 9, fontWeight: "bold", color: "#fff", backgroundColor: BLUE, padding: 4 },
  bigPhone: { fontSize: 15, fontWeight: "bold", color: INK, marginTop: 3 },
  smallText: { fontSize: 8, color: GRAY, marginTop: 1 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  formTitle: { fontSize: 20, fontWeight: "bold", color: INK },
  formNoLabel: { fontSize: 9, color: GRAY },
  formNoValue: { fontSize: 18, fontWeight: "bold", color: RED },
  section: { border: `0.7pt solid ${GRAY}`, borderRadius: 3, marginTop: 10, padding: 8 },
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
  colName: { width: "80%" },
  colQty: { width: "20%", textAlign: "center" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  photo: { width: 110, height: 110, objectFit: "cover", borderRadius: 3 },
  bottomRow: { flexDirection: "row", marginTop: 20, gap: 30 },
  signLine: { marginTop: 30, borderTop: "0.7pt solid #999", paddingTop: 3 },
  signLabel: { fontSize: 8, fontWeight: "bold" },
  totalLine: { marginTop: 10, fontSize: 11, fontWeight: "bold", color: BLUE, textAlign: "right" },
  terms: { fontSize: 6.5, color: GRAY, marginTop: 14, lineHeight: 1.4 },
});

const logoBuffer = readFileSync(join(process.cwd(), "public/images/logo-square.png"));

export function JobDeliveryReceiptPdf({ data }: { data: JobDeliveryReceiptData }) {
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
          <Text style={styles.formTitle}>TESLİM TUTANAĞI</Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.formNoLabel}>İş No:</Text>
            <Text style={styles.formNoValue}>{data.jobNo}</Text>
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
                <Text style={styles.fieldLabel}>İş</Text>
                <Text style={styles.fieldValue}>{data.title}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Tarih</Text>
                <Text style={styles.fieldValue}>
                  {data.startDate}
                  {data.endDate ? ` → ${data.endDate}` : ""}
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Durum</Text>
                <Text style={styles.fieldValue}>{data.statusLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colName]}>Kurulan Ürün / Ekipman</Text>
            <Text style={[styles.th, styles.colQty]}>Adet</Text>
          </View>
          {data.items.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: "100%", textAlign: "center", color: GRAY }]}>Kalem yok</Text>
            </View>
          ) : (
            data.items.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, styles.colName]}>{item.name}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.qty}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.totalLine}>Toplam: {data.saleTotalLabel}</Text>

        {data.notes && (
          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>{data.notes}</Text>
          </View>
        )}

        {data.photoBuffers.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Fotoğraflar</Text>
            <View style={styles.photoGrid}>
              {data.photoBuffers.map((buf, i) => (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image key={i} src={buf} style={styles.photo} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>Teslim Eden (Öztürk Güvenlik)</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.signLine}>
              <Text style={styles.signLabel}>Teslim Alan (Müşteri)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.terms}>
          Yukarıda belirtilen ürün/ekipman ve işçilik, iş sahibi tarafından çalışır ve eksiksiz teslim
          alınmıştır. İşbu tutanak, işin tamamlandığının ve teslim edildiğinin karşılıklı kabulüdür.
        </Text>
      </Page>
    </Document>
  );
}
