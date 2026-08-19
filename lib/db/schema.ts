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
  address: text("address").default(""),
  note: text("note").default(""),
  source: varchar("source", { length: 30 }).default("web"), // web | whatsapp | telefon | referans | panel
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

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  requestId: integer("request_id").references(() => serviceRequests.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).default(""),
  items: jsonb("items").notNull().default([]), // [{name, qty, unitPrice}]
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
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
  notes: text("notes").default(""),
  staffIds: pgInteger("staff_ids").array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Job = typeof jobs.$inferSelect;

export type OfferItem = { name: string; qty: number; unitPrice: number };

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