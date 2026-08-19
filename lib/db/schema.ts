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
  stockQty: integer("stock_qty").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  costTotal: numeric("cost_total", { precision: 12, scale: 2 }).notNull().default("0"), // items'tan otomatik hesaplanır, yalnızca admin'e döner
  saleTotal: numeric("sale_total", { precision: 12, scale: 2 }).notNull().default("0"), // elle girilir
  notes: text("notes").default(""),
  staffIds: pgInteger("staff_ids").array().default([]),
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
export type Invoice = typeof invoices.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Product = typeof products.$inferSelect;

/** Bu adedin altındaki stok "kritik" sayılır (bkz. /panel/urunler, dashboard). */
export const LOW_STOCK_THRESHOLD = 5;

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