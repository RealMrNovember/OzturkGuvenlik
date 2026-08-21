import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  integer,
  numeric,
  jsonb,
  integer as pgInteger,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }).default(""),
  role: varchar("role", { length: 20 }).notNull().default("staff"), // admin | staff
  specialty: varchar("specialty", { length: 255 }).default(""),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  active: boolean("active").notNull().default(true),
  // role="admin" için anlamsız (admin her zaman tam yetkili) — yalnızca staff için
  // ince ayar sağlar. Anahtarlar lib/permissions.ts'teki PERMISSION_KEYS'te tanımlı.
  permissions: jsonb("permissions").notNull().default([]),
  // Şifremi unuttum akışı — token yalnızca tek kullanımlık ve süreli (1 saat).
  // Kullanılınca ya da yeni bir istek gelince her ikisi de temizlenir/yenilenir.
  resetToken: varchar("reset_token", { length: 64 }).unique(),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  // Müşterinin birincil görünen adı — firma müşterisinde firma adı ("ABC
  // Tekstil"), bireysel müşteride doğrudan kişinin ad soyadı. Jobs/offers/
  // invoices/dashboard gibi onlarca yerde customers.name bu şekilde
  // okunduğu için anlamı korunuyor; firma+yetkili ayrımı contactName ile
  // yapılıyor (aşağıda).
  name: varchar("name", { length: 120 }).notNull(),
  // Firma müşterilerinde yetkili/iletişim kişisinin ad soyadı ("Ahmet
  // Gedik") — bireysel müşteride genelde boş kalır (name zaten kişinin adı).
  contactName: varchar("contact_name", { length: 120 }).default(""),
  phone: varchar("phone", { length: 30 }).default(""),
  email: varchar("email", { length: 190 }).default(""),
  // Ticari e-posta (kampanya/pazarlama) gönderebilmek için ayrı, açık bir
  // izin — Türkiye'de sadece e-postanın kayıtlı olması yeterli değil,
  // Ticari Elektronik İleti Yönetmeliği/İYS kapsamında açık onay gerekir.
  // Fatura/randevu gibi mevcut iş ilişkisi kapsamındaki e-postalar bu izne
  // tabi değildir — yalnızca gelecekteki kampanya gönderimi bu alanı kontrol
  // edecek (kullanıcı isteği, henüz kampanya gönderim aracı yapılmadı).
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  placeType: varchar("place_type", { length: 60 }).default(""),
  address: text("address").default(""), // ana / fatura adresi
  contacts: jsonb("contacts").notNull().default([]), // [{name, phone, title}] — birden fazla yetkili kişi
  locations: jsonb("locations").notNull().default([]), // [{label, address}] — address dışındaki ek lokasyonlar
  note: text("note").default(""),
  source: varchar("source", { length: 30 }).default("web"), // web | whatsapp | telefon | referans | panel
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerNotes = pgTable("customer_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  channel: varchar("channel", { length: 20 }).notNull().default("telefon"), // telefon | whatsapp | yuz-yuze | diger
  note: text("note").notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const STAFF_LEAVE_TYPES = ["yillik", "hastalik", "ucretsiz", "diger"] as const;
export type StaffLeaveType = (typeof STAFF_LEAVE_TYPES)[number];
export const STAFF_LEAVE_STATUSES = ["bekliyor", "onaylandi", "reddedildi"] as const;
export type StaffLeaveStatus = (typeof STAFF_LEAVE_STATUSES)[number];

export const staffLeaves = pgTable("staff_leaves", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull().default("yillik"), // yillik | hastalik | ucretsiz | diger
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("bekliyor"), // bekliyor | onaylandi | reddedildi
  note: text("note").default(""),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const staffNotes = pgTable("staff_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  note: text("note").notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 120 }).default(""),
  phone: varchar("phone", { length: 30 }).default(""),
  placeType: varchar("place_type", { length: 60 }).default(""),
  systems: varchar("systems", { length: 40 }).array().default([]),
  note: text("note").default(""),
  source: varchar("source", { length: 30 }).notNull().default("web"), // web | whatsapp | telefon | referans | panel
  status: varchar("status", { length: 20 }).notNull().default("yeni"), // yeni | aranacak | randevu-verildi | tamamlandi | iptal
  assignedTo: integer("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  requestId: integer("request_id").references(() => serviceRequests.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).default(""),
  date: date("date", { mode: "string" }).notNull(),
  time: varchar("time", { length: 10 }).default("10:00"),
  address: varchar("address", { length: 255 }).default(""),
  note: text("note").default(""),
  status: varchar("status", { length: 20 }).notNull().default("planlandi"), // planlandi | tamamlandi | iptal
  assignedTo: integer("assigned_to").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 60 }).default(""),
  category: varchar("category", { length: 60 }).default(""),
  // Stok ekranında marka/model bazlı ayrım ve filtreleme için (örn.
  // marka: "Dahua", model: "IPC-HFW1230TC1"). Ad alanı serbest kalır.
  brand: varchar("brand", { length: 80 }).default(""),
  model: varchar("model", { length: 120 }).default(""),
  unit: varchar("unit", { length: 20 }).notNull().default("adet"),
  // Alış fiyatı yalnızca admin'e döner (bkz. app/api/products/route.ts) — personel
  // maliyeti değil satış fiyatını görür.
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull().default("0"),
  // costPrice ve salePrice bu para biriminde girilir; TL karşılığı exchangeRate ile hesaplanır.
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"), // kayıt anında kilitlenen ₺ karşılığı
  // Seri takipsiz ürünlerde elle girilir. Seri takipli ürünlerde (serialized:
  // true) bu alan artık kaynak değil — gerçek stok product_units'teki
  // status='stokta' satır sayısından hesaplanır (bkz. app/api/products/route.ts).
  stockQty: integer("stock_qty").notNull().default(0),
  // Kutu üzerindeki EAN/UPC — barkod taranınca ürünü eşleştirmek için.
  barcode: varchar("barcode", { length: 64 }).unique(),
  // true ise bu ürün tek tek fiziksel birim (seri no) olarak takip edilir
  // (product_units), stok adedi elle değil taranan/eklenen seri sayısından gelir.
  serialized: boolean("serialized").notNull().default(false),
  // Ürün/marka fotoğrafı (Vercel Blob, public erişim) — alış fiyatının aksine
  // gizlilik gerektirmez, view_costs izni olmayan personel de görebilir/ekleyebilir
  // (bkz. app/api/products/[id]/image/route.ts).
  imageUrl: text("image_url"),
  // Serbest biçimli teknik özellikler — [{key:"Wi-Fi Desteği", value:"Var"},
  // {key:"RAID Desteği", value:"RAID 0/1/5"}] gibi. Ürün tipine göre alakalı
  // alanlar değiştiği için sabit kolonlar yerine liste tutulur; stok
  // listesinde ve ürün detayında rozet olarak gösterilir.
  specs: jsonb("specs").notNull().default([]),
  // true ise bu kalem bir hizmet/işçiliktir (örn. "Montaj İşçiliği") — fiziksel
  // stok ve alış bedeli kavramı yoktur. costPrice ve stockQty sunucu tarafında
  // her zaman sabit değerlere zorlanır (bkz. app/api/products/route.ts).
  isService: boolean("is_service").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Hizmet kalemlerinde (isService=true) stockQty bu sabite kilitlenir — "sınırsız"
 * stok anlamına gelir, kritik stok uyarısı hiçbir zaman tetiklenmez. */
export const SERVICE_STOCK_SENTINEL = 100_000_000;

export const productUnits = pgTable("product_units", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  // Cihazın ÜZERİNDEKİ seri no/QR — kutu barkodundan (products.barcode) ayrı.
  serialNumber: varchar("serial_number", { length: 120 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("stokta"), // stokta | kuruldu | arizali | iade
  jobId: integer("job_id").references((): AnyPgColumn => jobs.id, { onDelete: "set null" }),
  serviceTicketId: integer("service_ticket_id").references(
    (): AnyPgColumn => serviceTickets.id,
    { onDelete: "set null" }
  ),
  note: text("note").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  installedAt: timestamp("installed_at"),
}, (table) => [
  uniqueIndex("product_units_product_serial_unique").on(table.productId, table.serialNumber),
]);

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  requestId: integer("request_id").references(() => serviceRequests.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).default(""),
  items: jsonb("items").notNull().default([]), // [{name, qty, unitPrice, productId?}]
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"), // KDV dahil
  // Teklifin tamamı tek para biriminde düzenlenir (items[].unitPrice ve total bu birimde).
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  status: varchar("status", { length: 20 }).notNull().default("tasarim"), // tasarim | gonderildi | onaylandi | reddedildi
  sentDate: date("sent_date", { mode: "string" }),
  note: text("note").default(""),
  // Müşterinin oturum açmadan teklifi görüp onaylayabildiği herkese açık
  // bağlantının sırrı — panelde "Linki Kopyala" ilk tıklandığında
  // (get-or-create) üretilir, /teklif/[token] bu alanla eşleşir.
  publicToken: varchar("public_token", { length: 64 }).unique(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  requestId: integer("request_id").references(() => serviceRequests.id, {
    onDelete: "set null",
  }),
  offerId: integer("offer_id").references(() => offers.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).default(""),
  address: varchar("address", { length: 255 }).default(""),
  startDate: date("start_date", { mode: "string" }),
  endDate: date("end_date", { mode: "string" }),
  status: varchar("status", { length: 20 }).notNull().default("planlandi"), // planlandi | devam-ediyor | tamamlandi | garanti
  equipment: varchar("equipment", { length: 60 }).array().default([]),
  items: jsonb("items").notNull().default([]), // [{productId, qty, name}] — kataloğa bağlı, stok otomatik düşer
  costTotal: numeric("cost_total", { precision: 12, scale: 2 }).notNull().default("0"), // items'tan otomatik hesaplanır (her zaman ₺), yalnızca admin'e döner
  saleTotal: numeric("sale_total", { precision: 12, scale: 2 }).notNull().default("0"), // elle girilir, aşağıdaki currency biriminde
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  notes: text("notes").default(""),
  staffIds: pgInteger("staff_ids").array().default([]),
  // Kurulum/teslim fotoğrafları — [{id, url}], url Vercel Blob'daki (private)
  // dosyanın konumu. Teslim tutanağı PDF'ine gömülür (bkz. app/api/jobs/[id]/
  // delivery-receipt).
  photos: jsonb("photos").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceTickets = pgTable("service_tickets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  appointmentId: integer("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  device: varchar("device", { length: 200 }).default(""), // örn. "NVR", "Kamera 3 - giriş"
  location: varchar("location", { length: 255 }).default(""), // varsayılan: müşteri adresi
  issue: text("issue").notNull(), // arıza açıklaması
  result: text("result").default(""), // yapılan işlem / sonuç
  status: varchar("status", { length: 20 }).notNull().default("acik"), // acik | randevu-verildi | tamamlandi | iptal
  assignedTo: integer("assigned_to").references(() => users.id, { onDelete: "set null" }),
  items: jsonb("items").notNull().default([]), // [{productId, qty, name}] — kullanılan parça, stok otomatik düşer
  costTotal: numeric("cost_total", { precision: 12, scale: 2 }).notNull().default("0"), // her zaman ₺, yalnızca admin'e döner
  fee: numeric("fee", { precision: 12, scale: 2 }).notNull().default("0"), // servis ücreti, aşağıdaki currency biriminde
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  category: varchar("category", { length: 30 }).default(""), // video-izleme | hirsiz-alarm | yangin-algilama | seslendirme | gecis-kontrol | diger — servis formu PDF'i için
  requestType: varchar("request_type", { length: 20 }).default(""), // montaj | onarim | bakim | kesif | servis | demontaj
  billingType: varchar("billing_type", { length: 20 }).default(""), // garanti | ucretli | sozlesmeli
  startTime: varchar("start_time", { length: 5 }).default(""), // "HH:MM"
  endTime: varchar("end_time", { length: 5 }).default(""), // "HH:MM"
  // Arıza/onarım fotoğrafları — [{id, url}], jobs.photos ile aynı desen.
  photos: jsonb("photos").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 30 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  offerId: integer("offer_id").references(() => offers.id, {
    onDelete: "set null",
  }),
  items: jsonb("items").notNull().default([]), // [{name, qty, unitPrice, productId?}]
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"), // KDV dahil
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  status: varchar("status", { length: 20 }).notNull().default("taslak"), // taslak | gonderildi | odendi | iptal
  issueDate: date("issue_date", { mode: "string" }).notNull(),
  dueDate: date("due_date", { mode: "string" }),
  paidDate: date("paid_date", { mode: "string" }),
  note: text("note").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 10 }).notNull(), // gelir | gider
  category: varchar("category", { length: 30 }).notNull().default("diger-gider"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  date: date("date", { mode: "string" }).notNull(),
  method: varchar("method", { length: 20 }).notNull().default("nakit"), // nakit | havale | kart
  description: text("description").default(""),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: "set null" }),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  invoiceId: integer("invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  // personel-maasi | personel-masrafi | personel-primi kategorilerinde hangi personele ait olduğu
  staffId: integer("staff_id").references(() => users.id, { onDelete: "set null" }),
  createdBy: integer("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const maintenanceContracts = pgTable("maintenance_contracts", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  type: varchar("type", { length: 100 }).notNull().default(""), // örn. "Yıllık bakım", "Aylık bakım"
  startDate: date("start_date", { mode: "string" }).notNull(),
  lastServiceDate: date("last_service_date", { mode: "string" }),
  nextServiceDate: date("next_service_date", { mode: "string" }).notNull(),
  intervalMonths: integer("interval_months").notNull().default(12),
  note: text("note").default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 30 }).default(""),
  address: text("address").default(""),
  // Türkiye B2B faturalaşması için: irsaliye/fatura eşleştirmesi ve muhasebe
  // entegrasyonunda kullanılır.
  taxOffice: varchar("tax_office", { length: 100 }).default(""),
  taxNumber: varchar("tax_number", { length: 20 }).default(""),
  paymentTermDays: integer("payment_term_days"),
  note: text("note").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const SUPPLIER_INVOICE_STATUSES = ["odenmedi", "odendi"] as const;
export type SupplierInvoiceStatus = (typeof SUPPLIER_INVOICE_STATUSES)[number];

export const supplierInvoices = pgTable("supplier_invoices", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "cascade" }),
  invoiceNumber: varchar("invoice_number", { length: 60 }).default(""),
  // Kalemler doluysa tutar bunlardan + taxRate'ten otomatik hesaplanır
  // (satış faturası/teklifle aynı desen, bkz. lib/money.ts); boşsa (basit
  // mod — kalemsiz, yalnızca toplam tutar) elle girilen amount kullanılır.
  items: jsonb("items").notNull().default([]), // OfferItem[]
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("20"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("TRY"),
  exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull().default("1"),
  status: varchar("status", { length: 20 }).notNull().default("odenmedi"),
  // Ödeme durumu (yukarıda) ile mal kabul durumu birbirinden bağımsız:
  // fatura ödenmeden mal teslim alınabilir (veya tam tersi, peşin ödenip
  // mal sonra gelebilir). received true olunca stok bir kez otomatik artar.
  received: boolean("received").notNull().default(false),
  receivedAt: date("received_at", { mode: "string" }),
  // Taranan orijinal belge (Vercel Blob, private) — denetim izi. Depolama
  // maliyetini sınırlamak için en fazla son 10 taranan belge tutulur, daha
  // eskiler otomatik silinir (bkz. lib/blob-retention.ts) — silinince bu
  // alan null'a döner.
  scannedFileUrl: text("scanned_file_url"),
  issueDate: date("issue_date", { mode: "string" }).notNull(),
  dueDate: date("due_date", { mode: "string" }),
  paidDate: date("paid_date", { mode: "string" }),
  note: text("note").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Sitenin orijinal marka renkleri — DB kolon varsayılanı ve panelin "Varsayılana Sıfırla" düğmesi aynı değerleri kullanır. */
export const DEFAULT_BRAND_COLOR = "#0e6fb8";
export const DEFAULT_BRAND_LIGHT_COLOR = "#40a0e0";
/** Vurgu çerçeve/şerit efekti (kartlar, hero çerçevesi vb.) için varsayılan renk ve kalınlık. */
export const DEFAULT_ACCENT_COLOR = "#e63946";
export const DEFAULT_ACCENT_THICKNESS = 3;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  brandColor: varchar("brand_color", { length: 7 }).notNull().default(DEFAULT_BRAND_COLOR),
  brandLightColor: varchar("brand_light_color", { length: 7 })
    .notNull()
    .default(DEFAULT_BRAND_LIGHT_COLOR),
  accentColor: varchar("accent_color", { length: 7 }).notNull().default(DEFAULT_ACCENT_COLOR),
  accentThickness: integer("accent_thickness").notNull().default(DEFAULT_ACCENT_THICKNESS),
  heroVideoUrl: varchar("hero_video_url", { length: 500 }).default(""),
  heroVideoAutoplay: boolean("hero_video_autoplay").notNull().default(true),
  heroVideoMuted: boolean("hero_video_muted").notNull().default(true),
  heroVideoStart: integer("hero_video_start").notNull().default(0),
  heroVideoDuration: integer("hero_video_duration"),

  // Aşağıdaki alanların tamamı boş/varsayılan bırakılabilir — boşsa
  // lib/site-settings.ts'teki getResolvedSite() lib/site.ts'teki sabit
  // (kod içi) değerlere düşer, site hiçbir zaman boş/kırık görünmez.
  // Admin panelden doldurunca sabitlerin yerini alır.

  // İletişim — birden fazla telefon numarası desteklenir.
  // [{label: "Satış", number: "0535 014 65 93"}, ...]
  phones: jsonb("phones").notNull().default([]),
  contactEmail: varchar("contact_email", { length: 190 }).default(""),
  address: text("address").default(""),
  mapLink: text("map_link").default(""),
  mapEmbedUrl: text("map_embed_url").default(""),

  // Sosyal medya + WhatsApp
  instagramUrl: varchar("instagram_url", { length: 300 }).default(""),
  facebookUrl: varchar("facebook_url", { length: 300 }).default(""),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).default(""), // yalnızca rakam, örn: 905350146593
  whatsappDefaultText: text("whatsapp_default_text").default(""),

  // Google — puan/yorum (schema.org'a da yansır), Analytics, Search Console
  googleRating: varchar("google_rating", { length: 10 }).default(""),
  googleReviewCount: integer("google_review_count"),
  googleReviewsUrl: text("google_reviews_url").default(""),
  googleAnalyticsId: varchar("google_analytics_id", { length: 20 }).default(""), // örn. G-XXXXXXXXXX
  googleSiteVerification: varchar("google_site_verification", { length: 100 }).default(""),

  // SEO — anasayfa varsayılan meta etiketleri + sosyal paylaşım görseli
  seoTitle: varchar("seo_title", { length: 200 }).default(""),
  seoDescription: text("seo_description").default(""),
  seoKeywords: text("seo_keywords").default(""), // virgülle ayrılmış
  ogImageUrl: text("og_image_url").default(""), // public/ altında bir yol ya da tam URL (OG görseli dış crawler'lara açık olmalı, private Blob kullanılamaz)

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export type SitePhone = { label: string; number: string };

/** Hizmet detay sayfalarının başlık arkasındaki koyu alanda oynatılan YouTube videosu — hizmet başına bir kayıt (bkz. lib/services.ts'teki statik slug listesi). */
export const serviceMedia = pgTable("service_media", {
  id: serial("id").primaryKey(),
  serviceSlug: varchar("service_slug", { length: 60 }).notNull().unique(),
  videoUrl: varchar("video_url", { length: 500 }).default(""),
  videoAutoplay: boolean("video_autoplay").notNull().default(true),
  videoMuted: boolean("video_muted").notNull().default(true),
  videoStart: integer("video_start").notNull().default(0),
  videoDuration: integer("video_duration"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type CustomerContact = { name: string; phone: string; title: string };
export type CustomerLocation = { label: string; address: string };
export type CustomerNote = typeof customerNotes.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type StaffLeave = typeof staffLeaves.$inferSelect;
export type StaffNote = typeof staffNotes.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type ServiceTicket = typeof serviceTickets.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type MaintenanceContract = typeof maintenanceContracts.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductUnit = typeof productUnits.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type ServiceMedia = typeof serviceMedia.$inferSelect;

/** Bu adedin altındaki stok "kritik" sayılır (bkz. /panel/urunler, dashboard). */
export const LOW_STOCK_THRESHOLD = 5;

export const PRODUCT_UNIT_STATUSES = ["stokta", "kuruldu", "arizali", "iade"] as const;
export type ProductUnitStatus = (typeof PRODUCT_UNIT_STATUSES)[number];

export type ProductSpec = { key: string; value: string };

/** jobs.photos / service_tickets.photos ortak biçimi — url private Blob'a işaret eder. */
export type PhotoRef = { id: string; url: string };

export type OfferItem = {
  name: string;
  qty: number;
  unitPrice: number;
  productId?: number | null;
};

export type JobItem = {
  productId: number;
  qty: number;
  name: string;
  /** Seri takipli ürünlerde kullanılan product_units.id listesi — doluysa qty === unitIds.length. */
  unitIds?: number[];
};

export const REQUEST_STATUSES = [
  "yeni",
  "aranacak",
  "randevu-verildi",
  "tamamlandi",
  "iptal",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const APPOINTMENT_STATUSES = ["planlandi", "tamamlandi", "iptal"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const OFFER_STATUSES = [
  "tasarim",
  "gonderildi",
  "onaylandi",
  "reddedildi",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const JOB_STATUSES = [
  "planlandi",
  "devam-ediyor",
  "tamamlandi",
  "garanti",
] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const SERVICE_TICKET_STATUSES = [
  "acik",
  "randevu-verildi",
  "tamamlandi",
  "iptal",
] as const;
export type ServiceTicketStatus = (typeof SERVICE_TICKET_STATUSES)[number];

/** Servis formu PDF'indeki üst checkbox satırı. */
export const SERVICE_TICKET_CATEGORIES = [
  "video-izleme",
  "hirsiz-alarm",
  "yangin-algilama",
  "seslendirme",
  "gecis-kontrol",
  "diger",
] as const;
export type ServiceTicketCategory = (typeof SERVICE_TICKET_CATEGORIES)[number];

export const SERVICE_TICKET_REQUEST_TYPES = [
  "montaj",
  "onarim",
  "bakim",
  "kesif",
  "servis",
  "demontaj",
] as const;
export type ServiceTicketRequestType = (typeof SERVICE_TICKET_REQUEST_TYPES)[number];

export const SERVICE_TICKET_BILLING_TYPES = ["garanti", "ucretli", "sozlesmeli"] as const;
export type ServiceTicketBillingType = (typeof SERVICE_TICKET_BILLING_TYPES)[number];

export const SOURCES = ["web", "whatsapp", "telefon", "referans", "panel"] as const;
export type Source = (typeof SOURCES)[number];

export const INVOICE_STATUSES = ["taslak", "gonderildi", "odendi", "iptal"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const TRANSACTION_TYPES = ["gelir", "gider"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_METHODS = ["nakit", "havale", "kart"] as const;
export type TransactionMethod = (typeof TRANSACTION_METHODS)[number];

export const INCOME_CATEGORIES = ["is-tahsilati", "diger-gelir"] as const;
export const EXPENSE_CATEGORIES = [
  "malzeme",
  "yakit-ulasim",
  "personel-maasi",
  "personel-masrafi",
  "personel-primi",
  "kira",
  "fatura-abonelik",
  "tedarikci-odemesi",
  "diger-gider",
] as const;
export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const CUSTOMER_NOTE_CHANNELS = ["telefon", "whatsapp", "yuz-yuze", "diger"] as const;
export type CustomerNoteChannel = (typeof CUSTOMER_NOTE_CHANNELS)[number];