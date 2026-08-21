import { authenticator } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

const ISSUER = "Öztürk Güvenlik Panel";
const BACKUP_CODE_COUNT = 10;

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export async function buildOtpAuthQrDataUrl(secret: string, email: string): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    return authenticator.verify({ token: code.trim(), secret });
  } catch {
    return false;
  }
}

function randomBackupCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışabilecek 0/O, 1/I çıkarıldı
  let code = "";
  for (let i = 0; i < 8; i++) {
    // Math.random() kriptografik olarak güvenli değildir — yedek kodlar
    // birer tek kullanımlık parola olduğu için node:crypto'nun CSPRNG'i
    // kullanılıyor.
    code += alphabet[randomInt(alphabet.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Düz metin kodları döner (kullanıcıya BİR KEZ gösterilir) + DB'ye yazılacak hash'leri. */
export async function generateBackupCodes(): Promise<{ plain: string[]; hashed: string[] }> {
  const plain = Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
  const hashed = await Promise.all(plain.map((code) => bcrypt.hash(code, 10)));
  return { plain, hashed };
}

/** Eşleşen kodu bulup listeden çıkarır (tek kullanımlık). Eşleşme yoksa null döner. */
export async function consumeBackupCode(
  hashedCodes: string[],
  submitted: string
): Promise<string[] | null> {
  const normalized = submitted.trim().toUpperCase();
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(normalized, hashedCodes[i])) {
      return [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
    }
  }
  return null;
}
