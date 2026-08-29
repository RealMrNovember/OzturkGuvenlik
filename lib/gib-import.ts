import "server-only";
import { timingSafeEqual } from "crypto";

/**
 * GİB fatura arşiv aktarımı — paylaşımlı ayarlar. Bu, GİB'e giriş yapan bir
 * kimlik bilgisi DEĞİLDİR: yalnızca "bu isteği bizim bookmarklet'imiz mi
 * gönderdi" sorusuna cevap veren, sitenin kendi sırrı olan bir jetondur.
 * Bkz. lib/gib-bookmarklet.ts (üretim) ve app/api/public/gib-invoices/import
 * (doğrulama).
 */

export function gibImportToken(): string {
  return (process.env.GIB_IMPORT_TOKEN ?? "").trim();
}

const DEFAULT_ALLOWED_ORIGINS = [
  "https://earsivportal.efatura.gov.tr",
  "https://portal.efatura.gov.tr",
];

/** Gerçek GİB portal adresi netleşince .env'de GIB_IMPORT_ALLOWED_ORIGINS ile ezilebilir. */
export function gibImportAllowedOrigins(): string[] {
  const raw = process.env.GIB_IMPORT_ALLOWED_ORIGINS;
  if (!raw || raw.trim() === "") return DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Zamanlama saldırılarına karşı güvenli token karşılaştırma. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
