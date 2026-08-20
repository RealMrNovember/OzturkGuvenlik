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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 30 }).default(""),
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
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
});

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
  "kira",
  "fatura-abonelik",
  "diger-gider",
] as const;
export const TRANSACTION_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const CUSTOMER_NOTE_CHANNELS = ["telefon", "whatsapp", "yuz-yuze", "diger"] as const;
export type CustomerNoteChannel = (typeof CUSTOMER_NOTE_CHANNELS)[number];