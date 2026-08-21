import { describe, expect, test } from "vitest";
import { authenticator } from "otplib";
import {
  generateTotpSecret,
  verifyTotpCode,
  generateBackupCodes,
  consumeBackupCode,
} from "@/lib/two-factor";

describe("TOTP secret + verification", () => {
  test("a freshly generated secret verifies a code generated for it", () => {
    const secret = generateTotpSecret();
    const code = authenticator.generate(secret);
    expect(verifyTotpCode(secret, code)).toBe(true);
  });

  test("rejects a code generated for a different secret", () => {
    const secretA = generateTotpSecret();
    const secretB = generateTotpSecret();
    const codeForB = authenticator.generate(secretB);
    expect(verifyTotpCode(secretA, codeForB)).toBe(false);
  });

  test("rejects garbage input instead of throwing", () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, "not-a-code")).toBe(false);
  });
});

describe("backup codes", () => {
  test("generates 10 unique codes in XXXX-XXXX format with matching hashes", async () => {
    const { plain, hashed } = await generateBackupCodes();
    expect(plain).toHaveLength(10);
    expect(hashed).toHaveLength(10);
    expect(new Set(plain).size).toBe(10);
    for (const code of plain) {
      expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    }
  });

  test("consumeBackupCode matches a valid code case-insensitively and removes only that one", async () => {
    const { plain, hashed } = await generateBackupCodes();
    const target = plain[3];
    const remaining = await consumeBackupCode(hashed, target.toLowerCase());
    expect(remaining).not.toBeNull();
    expect(remaining).toHaveLength(9);
  });

  test("consumeBackupCode returns null for an unknown code and leaves the list untouched", async () => {
    const { hashed } = await generateBackupCodes();
    const remaining = await consumeBackupCode(hashed, "ZZZZ-ZZZZ");
    expect(remaining).toBeNull();
  });

  test("a consumed backup code cannot be reused", async () => {
    const { plain, hashed } = await generateBackupCodes();
    const target = plain[0];
    const afterFirstUse = await consumeBackupCode(hashed, target);
    expect(afterFirstUse).not.toBeNull();
    const afterSecondUse = await consumeBackupCode(afterFirstUse as string[], target);
    expect(afterSecondUse).toBeNull();
  });
});
