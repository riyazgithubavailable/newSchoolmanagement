// AES-256-GCM encryption for small secrets stored in MongoDB (e.g. 2FA keys).
// A database leak alone is then not enough to generate login codes.

import crypto from "node:crypto";
import { env } from "../config/env.js";

const key = crypto
  .createHash("sha256")
  .update(env.encryptionKey || `instituteos:${env.jwt.refreshSecret}`)
  .digest();

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}

export function decrypt(payload: string): string {
  const [iv, tag, data] = payload.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
