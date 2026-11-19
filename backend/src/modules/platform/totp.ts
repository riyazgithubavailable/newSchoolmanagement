// Time-based one-time passwords (RFC 6238) — the 6-digit codes shown by
// Google Authenticator, Microsoft Authenticator, Authy, etc.
// Implemented with Node's crypto so no extra dependency is needed.

import crypto from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** New random secret (160 bits, the authenticator-app standard). */
export const generateSecret = () => base32Encode(crypto.randomBytes(20));

export function totpAt(secret: string, timeMs: number): string {
  const counter = Math.floor(timeMs / 1000 / STEP_SECONDS);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return String(code).padStart(DIGITS, "0");
}

/**
 * Checks a code, allowing one step of clock drift either way.
 * Returns the matched time-step so callers can refuse re-use of the same code.
 */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
  const clean = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return null;
  for (const drift of [0, -1, 1]) {
    const t = now + drift * STEP_SECONDS * 1000;
    const expected = totpAt(secret, t);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) {
      return Math.floor(t / 1000 / STEP_SECONDS);
    }
  }
  return null;
}

/** Link that authenticator apps understand (encoded into the QR code). */
export const otpauthUrl = (secret: string, account: string, issuer = "InstituteOS Platform") =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
