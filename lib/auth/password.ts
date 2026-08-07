import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Format: scrypt$<salt-hex>$<hash-hex> — scrypt kommt aus node:crypto, kein Native-Build nötig. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface PasswordRule {
  test: (value: string) => boolean;
  message: string;
}

const RULES: PasswordRule[] = [
  { test: (v) => v.length >= 8, message: "mindestens 8 Zeichen" },
  { test: (v) => /[a-zA-Z]/.test(v), message: "mindestens ein Buchstabe" },
  { test: (v) => /[0-9]/.test(v), message: "mindestens eine Zahl" },
];

export function passwordProblems(password: string): string[] {
  return RULES.filter((r) => !r.test(password)).map((r) => r.message);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
