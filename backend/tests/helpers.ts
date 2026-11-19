// Shared test setup: in-memory MongoDB + small API helpers.

import { afterAll, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app.js";
import { hashPassword } from "../src/modules/auth/auth.service.js";

export const PASSWORD = "Secret123";

export function useTestDb() {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "test" });
    await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
}

export async function clearDb() {
  await Promise.all(Object.values(mongoose.models).map((m) => m.deleteMany({})));
}

export const api = () => request(app);

export const passwordHash = () => hashPassword(PASSWORD);

export async function login(body: Record<string, unknown>) {
  const res = await api().post("/api/v1/auth/login").send(body);
  return res;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

/* ---------------- platform owner (2FA) ---------------- */

import { UserModel } from "../src/modules/users/user.model.js";
import { encrypt } from "../src/utils/crypto.js";
import { generateSecret, totpAt } from "../src/modules/platform/totp.js";

/** Creates an ACTIVE super admin with 2FA already enabled; returns its secret. */
export async function createOwner(email = "owner@platform.com") {
  const secret = generateSecret();
  await UserModel.create({
    schoolId: null,
    fullName: "Owner",
    email,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    passwordHash: await passwordHash(),
    twoFactor: { enabled: true, secret: encrypt(secret), lastUsedStep: 0 },
  });
  return secret;
}

/** Full platform sign-in (password + 6-digit code) → access token. */
export async function ownerToken(secret: string, email = "owner@platform.com") {
  // tests sign in many times within one 30-second window; allow re-use here
  await UserModel.updateOne({ email, role: "SUPER_ADMIN" }, { $set: { "twoFactor.lastUsedStep": 0 } });
  const step1 = await api().post("/api/v1/platform/auth/login").send({ email, password: PASSWORD });
  const step2 = await api()
    .post("/api/v1/platform/auth/verify-2fa")
    .send({ challengeToken: step1.body.data.challengeToken, code: totpAt(secret, Date.now()) });
  return step2.body.data.tokens.accessToken as string;
}
