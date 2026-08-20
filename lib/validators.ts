import { z } from "zod";
import { extractYouTubeId } from "@/lib/youtube";
import { CURRENCIES } from "@/lib/currency";
import { STAFF_LEAVE_TYPES, STAFF_LEAVE_STATUSES } from "@/lib/db/schema";

export const optionalField = z.string().trim().max(2000).optional().default("");

const currencyEnum = z.enum(CURRENCIES);
/** Para birimi + kayıt anında kilitlenen ₺ kuru — her parasal kayıt türünde ortak. */
export const createCurrencyFields = {
  currency: currencyEnum.optional().default("TRY"),
  exchangeRate: z.number().positive().max(10000).optional().default(1),
};
export const updateCurrencyFields = {
  currency: currencyEnum.optional(),
  exchangeRate: z.number().positive().max(10000).optional(),
};

export const createRequestSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı").max(120),
  phone: z.string().trim().min(7, "Telefon geçersiz").max(30),
  placeType: z.string().trim().max(60).optional().default(""),
  systems: z.array(z.string()).max(12).optional().default([]),
  note: z.string().trim().max(2000).optional().default(""),
  website: z.string().max(100).optional().default(""),
});

export const updateRequestSchema = z.object({
  status: z
    .enum(["yeni", "aranacak", "randevu-verildi", "tamamlandi", "iptal"])
    .optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
});

export const customerContactSchema = z.object({
  name: z.string().trim().min(1, "Ad gerekli").max(120),
  phone: z.string().trim().max(30).optional().default(""),
  title: z.string().trim().max(80).optional().default(""),
});

export const customerLocationSchema = z.object({
  label: z.string().trim().max(80).optional().default(""),
  address: z.string().trim().min(1, "Adres gerekli").max(1000),
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().default(""),
  placeType: z.string().trim().max(60).optional().default(""),
  address: z.string().trim().max(1000).optional().default(""),
  contacts: z.array(customerContactSchema).max(20).optional().default([]),
  locations: z.array(customerLocationSchema).max(20).optional().default([]),
  note: z.string().trim().max(2000).optional().default(""),
  source: z
    .enum(["web", "whatsapp", "telefon", "referans", "panel"])
    .optional()
    .default("panel"),
});

// NOT createCustomerSchema.partial(): partial() re-applies each field's
// .default() to absent keys too, silently wiping them back to "" on every
// partial PATCH (e.g. an inline status-only update). See updateJobSchema
// below for the full explanation — same fix applied to every update schema.
export const updateCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  placeType: z.string().trim().max(60).optional(),
  address: z.string().trim().max(1000).optional(),
  contacts: z.array(customerContactSchema).max(20).optional(),
  locations: z.array(customerLocationSchema).max(20).optional(),
  note: z.string().trim().max(2000).optional(),
  source: z.enum(["web", "whatsapp", "telefon", "referans", "panel"]).optional(),
});

export const createCustomerNoteSchema = z.object({
  channel: z.enum(["telefon", "whatsapp", "yuz-yuze", "diger"]).optional().default("telefon"),
  note: z.string().trim().min(1, "Not boş olamaz").max(2000),
});

export const createAppointmentSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz"),
  time: z.string().trim().max(10).optional().default("10:00"),
  address: z.string().trim().max(255).optional().default(""),
  note: z.string().trim().max(2000).optional().default(""),
  status: z.enum(["planlandi", "tamamlandi", "iptal"]).optional().default("planlandi"),
  assignedTo: z.number().int().positive().nullable().optional(),
});

export const updateAppointmentSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz").optional(),
  time: z.string().trim().max(10).optional(),
  address: z.string().trim().max(255).optional(),
  note: z.string().trim().max(2000).optional(),
  status: z.enum(["planlandi", "tamamlandi", "iptal"]).optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
});

export const offerItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  qty: z.number().nonnegative().max(100000).default(1),
  unitPrice: z.number().nonnegative().max(100_000_000).default(0),
  productId: z.number().int().positive().nullable().optional(),
});

export const createOfferSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional().default(""),
  items: z.array(offerItemSchema).max(100).default([]),
  taxRate: z.number().min(0).max(100).optional().default(20),
  ...createCurrencyFields,
  status: z
    .enum(["tasarim", "gonderildi", "onaylandi", "reddedildi"])
    .optional()
    .default("tasarim"),
  sentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  note: z.string().trim().max(2000).optional().default(""),
});

export const updateOfferSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional(),
  items: z.array(offerItemSchema).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  ...updateCurrencyFields,
  status: z.enum(["tasarim", "gonderildi", "onaylandi", "reddedildi"]).optional(),
  sentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  note: z.string().trim().max(2000).optional(),
});

export const jobItemSchema = z
  .object({
    productId: z.number().int().positive(),
    qty: z.number().positive().max(100000),
    name: z.string().trim().max(200).optional().default(""),
    // Seri takipli ürünlerde: kullanılan product_units.id listesi.
    unitIds: z.array(z.number().int().positive()).max(500).optional(),
  })
  .refine((v) => !v.unitIds || v.unitIds.length === v.qty, {
    message: "Seçilen seri numarası sayısı adetle eşleşmiyor",
    path: ["unitIds"],
  });

export const createJobSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  offerId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional().default(""),
  address: z.string().trim().max(255).optional().default(""),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z
    .enum(["planlandi", "devam-ediyor", "tamamlandi", "garanti"])
    .optional()
    .default("planlandi"),
  equipment: z.array(z.string()).max(60).optional().default([]),
  items: z.array(jobItemSchema).max(200).optional().default([]),
  saleTotal: z.number().nonnegative().max(100_000_000).optional().default(0),
  ...createCurrencyFields,
  notes: z.string().trim().max(3000).optional().default(""),
  staffIds: z.array(z.number().int().positive()).max(20).optional().default([]),
});

// NOT createJobSchema.partial(): Zod's .partial() wraps each field in an
// extra .optional() but does NOT strip the field's own .default(...) — so an
// absent key still resolves through to its default value instead of staying
// absent. Every partial PATCH (e.g. the inline status dropdown sending only
// {status: "..."}) would then silently overwrite title/items/saleTotal/etc.
// back to "" / [] / 0. Confirmed empirically: schema.partial().parse({items:
// [...]}) still returns title: "" even though title was never sent. Writing
// the update schema out explicitly (plain .optional(), no .default()) is the
// only way an absent field is left untouched by the PATCH handler's
// `{...parsed.data}` spread.
export const updateJobSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  requestId: z.number().int().positive().nullable().optional(),
  offerId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().max(200).optional(),
  address: z.string().trim().max(255).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(["planlandi", "devam-ediyor", "tamamlandi", "garanti"]).optional(),
  equipment: z.array(z.string()).max(60).optional(),
  items: z.array(jobItemSchema).max(200).optional(),
  saleTotal: z.number().nonnegative().max(100_000_000).optional(),
  ...updateCurrencyFields,
  notes: z.string().trim().max(3000).optional(),
  staffIds: z.array(z.number().int().positive()).max(20).optional(),
});

const serviceTicketCategory = z.enum([
  "video-izleme",
  "hirsiz-alarm",
  "yangin-algilama",
  "seslendirme",
  "gecis-kontrol",
  "diger",
]);
const serviceTicketRequestType = z.enum(["montaj", "onarim", "bakim", "kesif", "servis", "demontaj"]);
const serviceTicketBillingType = z.enum(["garanti", "ucretli", "sozlesmeli"]);
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saat SS:DD formatında olmalı");

export const createServiceTicketSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  appointmentId: z.number().int().positive().nullable().optional(),
  device: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(255).optional().default(""),
  issue: z.string().trim().min(2, "Arıza açıklaması gerekli").max(2000),
  result: z.string().trim().max(2000).optional().default(""),
  status: z.enum(["acik", "randevu-verildi", "tamamlandi", "iptal"]).optional().default("acik"),
  assignedTo: z.number().int().positive().nullable().optional(),
  items: z.array(jobItemSchema).max(200).optional().default([]),
  fee: z.number().nonnegative().max(100_000_000).optional().default(0),
  ...createCurrencyFields,
  category: serviceTicketCategory.optional().default("diger"),
  requestType: serviceTicketRequestType.optional().default("servis"),
  billingType: serviceTicketBillingType.optional().default("ucretli"),
  startTime: timeString.or(z.literal("")).optional().default(""),
  endTime: timeString.or(z.literal("")).optional().default(""),
});

// NOT createServiceTicketSchema.partial() — bkz. updateJobSchema notu.
export const updateServiceTicketSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  appointmentId: z.number().int().positive().nullable().optional(),
  device: z.string().trim().max(200).optional(),
  location: z.string().trim().max(255).optional(),
  issue: z.string().trim().min(2, "Arıza açıklaması gerekli").max(2000).optional(),
  result: z.string().trim().max(2000).optional(),
  status: z.enum(["acik", "randevu-verildi", "tamamlandi", "iptal"]).optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
  items: z.array(jobItemSchema).max(200).optional(),
  fee: z.number().nonnegative().max(100_000_000).optional(),
  ...updateCurrencyFields,
  category: serviceTicketCategory.optional(),
  requestType: serviceTicketRequestType.optional(),
  billingType: serviceTicketBillingType.optional(),
  startTime: timeString.or(z.literal("")).optional(),
  endTime: timeString.or(z.literal("")).optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email("E-posta geçersiz").max(190),
  phone: z.string().trim().max(30).optional().default(""),
  role: z.enum(["admin", "staff"]).optional().default("staff"),
  specialty: z.string().trim().max(255).optional().default(""),
  password: z.string().min(6, "Şifre en az 6 karakter").max(100),
  active: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().email("E-posta geçersiz").max(190).optional(),
  phone: z.string().trim().max(30).optional(),
  role: z.enum(["admin", "staff"]).optional(),
  specialty: z.string().trim().max(255).optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(6, "Şifre en az 6 karakter").max(100).optional(),
});

export const createInvoiceSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  jobId: z.number().int().positive().nullable().optional(),
  offerId: z.number().int().positive().nullable().optional(),
  items: z.array(offerItemSchema).max(100).default([]),
  taxRate: z.number().min(0).max(100).optional().default(20),
  ...createCurrencyFields,
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz")
    .optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  note: z.string().trim().max(2000).optional().default(""),
});

export const updateInvoiceSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  jobId: z.number().int().positive().nullable().optional(),
  offerId: z.number().int().positive().nullable().optional(),
  items: z.array(offerItemSchema).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  ...updateCurrencyFields,
  status: z.enum(["taslak", "gonderildi", "odendi", "iptal"]).optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  note: z.string().trim().max(2000).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı").max(200),
  sku: z.string().trim().max(60).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  unit: z.string().trim().min(1).max(20).optional().default("adet"),
  costPrice: z.number().nonnegative().max(100_000_000).optional().default(0),
  salePrice: z.number().nonnegative().max(100_000_000),
  ...createCurrencyFields,
  stockQty: z.number().int().optional().default(0),
  barcode: z.string().trim().max(64).optional().default(""),
  serialized: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalı").max(200).optional(),
  sku: z.string().trim().max(60).optional(),
  category: z.string().trim().max(60).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
  costPrice: z.number().nonnegative().max(100_000_000).optional(),
  salePrice: z.number().nonnegative().max(100_000_000).optional(),
  ...updateCurrencyFields,
  stockQty: z.number().int().optional(),
  barcode: z.string().trim().max(64).optional(),
  serialized: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const bulkAddProductUnitsSchema = z.object({
  serialNumbers: z
    .array(z.string().trim().min(1).max(120))
    .min(1, "En az bir seri numarası gerekli")
    .max(500),
});

export const updateProductUnitSchema = z.object({
  serialNumber: z.string().trim().min(1).max(120).optional(),
  status: z.enum(["stokta", "kuruldu", "arizali", "iade"]).optional(),
  note: z.string().trim().max(1000).optional(),
});

export const TRANSACTION_CATEGORIES = [
  "is-tahsilati",
  "diger-gelir",
  "malzeme",
  "yakit-ulasim",
  "personel-maasi",
  "personel-masrafi",
  "personel-primi",
  "kira",
  "fatura-abonelik",
  "diger-gider",
] as const;

export const createTransactionSchema = z.object({
  type: z.enum(["gelir", "gider"], { message: "Tür gelir veya gider olmalı" }),
  category: z.enum(TRANSACTION_CATEGORIES),
  amount: z.number().positive("Tutar 0'dan büyük olmalı").max(100_000_000),
  ...createCurrencyFields,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz"),
  method: z.enum(["nakit", "havale", "kart"]).optional().default("nakit"),
  description: z.string().trim().max(500).optional().default(""),
  jobId: z.number().int().positive().nullable().optional(),
  customerId: z.number().int().positive().nullable().optional(),
  staffId: z.number().int().positive().nullable().optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(["gelir", "gider"]).optional(),
  category: z.enum(TRANSACTION_CATEGORIES).optional(),
  amount: z.number().positive("Tutar 0'dan büyük olmalı").max(100_000_000).optional(),
  ...updateCurrencyFields,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz").optional(),
  method: z.enum(["nakit", "havale", "kart"]).optional(),
  description: z.string().trim().max(500).optional(),
  staffId: z.number().int().positive().nullable().optional(),
  jobId: z.number().int().positive().nullable().optional(),
  customerId: z.number().int().positive().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("E-posta geçersiz").max(190),
  password: z.string().min(1, "Şifre gerekli").max(100),
});

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Renk #rrggbb formatında olmalı");

export const updateSiteSettingsSchema = z.object({
  brandColor: hexColor.optional(),
  brandLightColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  accentThickness: z.number().int().min(1, "En az 1px olmalı").max(12, "En fazla 12px olabilir").optional(),
  heroVideoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || extractYouTubeId(v) !== null, "Geçerli bir YouTube linki girin")
    .optional(),
  heroVideoAutoplay: z.boolean().optional(),
  heroVideoMuted: z.boolean().optional(),
  heroVideoStart: z.number().int().min(0, "0'dan küçük olamaz").max(86_400).optional(),
  heroVideoDuration: z
    .number()
    .int()
    .min(1, "En az 1 saniye olmalı")
    .max(3600, "En fazla 3600 saniye olabilir")
    .nullable()
    .optional(),
});

export const upsertServiceMediaSchema = z.object({
  videoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || extractYouTubeId(v) !== null, "Geçerli bir YouTube linki girin")
    .optional()
    .default(""),
  videoAutoplay: z.boolean().optional().default(true),
  videoMuted: z.boolean().optional().default(true),
  videoStart: z.number().int().min(0, "0'dan küçük olamaz").max(86_400).optional().default(0),
  videoDuration: z
    .number()
    .int()
    .min(1, "En az 1 saniye olmalı")
    .max(3600, "En fazla 3600 saniye olabilir")
    .nullable()
    .optional(),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih geçersiz");

export const createMaintenanceContractSchema = z.object({
  customerId: z.number().int().positive("Müşteri gerekli"),
  type: z.string().trim().max(100).optional().default(""),
  startDate: isoDate,
  lastServiceDate: isoDate.nullable().optional(),
  nextServiceDate: isoDate,
  intervalMonths: z.number().int().min(1).max(60).optional().default(12),
  note: z.string().trim().max(2000).optional().default(""),
  active: z.boolean().optional().default(true),
});

// NOT createMaintenanceContractSchema.partial() — bkz. updateJobSchema notu.
export const updateMaintenanceContractSchema = z.object({
  customerId: z.number().int().positive().optional(),
  type: z.string().trim().max(100).optional(),
  startDate: isoDate.optional(),
  lastServiceDate: isoDate.nullable().optional(),
  nextServiceDate: isoDate.optional(),
  intervalMonths: z.number().int().min(1).max(60).optional(),
  note: z.string().trim().max(2000).optional(),
  active: z.boolean().optional(),
});

export const createStaffLeaveSchema = z.object({
  type: z.enum(STAFF_LEAVE_TYPES).optional().default("yillik"),
  startDate: isoDate,
  endDate: isoDate,
  status: z.enum(STAFF_LEAVE_STATUSES).optional().default("bekliyor"),
  note: z.string().trim().max(1000).optional().default(""),
});

export const updateStaffLeaveSchema = z.object({
  type: z.enum(STAFF_LEAVE_TYPES).optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  status: z.enum(STAFF_LEAVE_STATUSES).optional(),
  note: z.string().trim().max(1000).optional(),
});

export const createStaffNoteSchema = z.object({
  note: z.string().trim().min(1, "Not boş olamaz").max(2000),
});