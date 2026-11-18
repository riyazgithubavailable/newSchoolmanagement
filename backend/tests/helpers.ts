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
