import { describe, expect, test } from "vitest";
import {
  createRequestSchema,
  updateJobSchema,
  updateCustomerSchema,
  updateOfferSchema,
  updateAppointmentSchema,
  createOfferSchema,
} from "@/lib/validators";

describe("createRequestSchema (keşif formu)", () => {
  test("accepts a valid submission and defaults the honeypot field to empty", () => {
    const parsed = createRequestSchema.parse({ name: "Ali Veli", phone: "05551234567" });
    expect(parsed.website).toBe("");
    expect(parsed.name).toBe("Ali Veli");
  });

  test("rejects a name shorter than 2 characters", () => {
    const result = createRequestSchema.safeParse({ name: "A", phone: "05551234567" });
    expect(result.success).toBe(false);
  });

  test("rejects a phone shorter than 7 characters", () => {
    const result = createRequestSchema.safeParse({ name: "Ali Veli", phone: "123" });
    expect(result.success).toBe(false);
  });

  test("preserves a filled honeypot field so the route can silently reject the submission", () => {
    const parsed = createRequestSchema.parse({
      name: "Bot",
      phone: "05551234567",
      website: "http://spam.example",
    });
    expect(parsed.website).toBe("http://spam.example");
  });
});

// Regresyon testleri — bkz. lib/validators.ts'teki updateJobSchema üstündeki
// not: bu şemalar bilerek createXSchema.partial() DEĞİL, elle yazılmış
// .optional() (defaultsız) alanlardan oluşuyor. .partial() kullanılsaydı,
// panelin satır-içi durum güncellemesi gibi yalnızca {status: "..."}
// gönderen kısmi bir PATCH, gönderilmeyen diğer tüm alanları (title, items,
// saleTotal, vb.) sessizce ""/[]/0'a sıfırlardı — bu üretimde gerçekten
// yaşanmış bir hataydı.
describe("update* schemas — partial PATCH must not reintroduce field defaults", () => {
  test("updateJobSchema: a status-only PATCH leaves title/items/saleTotal absent", () => {
    const parsed = updateJobSchema.parse({ status: "tamamlandi" });
    expect(parsed.status).toBe("tamamlandi");
    expect("title" in parsed).toBe(false);
    expect("items" in parsed).toBe(false);
    expect("saleTotal" in parsed).toBe(false);
    expect("staffIds" in parsed).toBe(false);
  });

  test("updateCustomerSchema: a note-only PATCH leaves name/address/contacts absent", () => {
    const parsed = updateCustomerSchema.parse({ note: "Aradı, uygun zaman istedi." });
    expect(parsed.note).toBe("Aradı, uygun zaman istedi.");
    expect("name" in parsed).toBe(false);
    expect("address" in parsed).toBe(false);
    expect("contacts" in parsed).toBe(false);
  });

  test("updateOfferSchema: a status-only PATCH leaves items/taxRate absent", () => {
    const parsed = updateOfferSchema.parse({ status: "onaylandi" });
    expect(parsed.status).toBe("onaylandi");
    expect("items" in parsed).toBe(false);
    expect("taxRate" in parsed).toBe(false);
  });

  test("updateAppointmentSchema: a status-only PATCH leaves title/address/assignedTo absent", () => {
    const parsed = updateAppointmentSchema.parse({ status: "tamamlandi" });
    expect(parsed.status).toBe("tamamlandi");
    expect("title" in parsed).toBe(false);
    expect("address" in parsed).toBe(false);
    expect("assignedTo" in parsed).toBe(false);
  });
});

describe("createOfferSchema (teklif toplam hesabı girişi)", () => {
  test("defaults taxRate to 20 and status to tasarim", () => {
    const parsed = createOfferSchema.parse({ items: [{ name: "Kurulum", qty: 1, unitPrice: 1000 }] });
    expect(parsed.taxRate).toBe(20);
    expect(parsed.status).toBe("tasarim");
    expect(parsed.items).toEqual([{ name: "Kurulum", qty: 1, unitPrice: 1000, productId: undefined }]);
  });
});
