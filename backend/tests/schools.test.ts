import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app.js";
import { createOwner, ownerToken as ownerTokenFor } from "./helpers.js";
import { hashPassword } from "../src/modules/auth/auth.service.js";
import { RefreshTokenModel } from "../src/modules/auth/refreshToken.model.js";
import { SchoolModel } from "../src/modules/schools/school.model.js";
import { UserModel } from "../src/modules/users/user.model.js";

let mongo: MongoMemoryServer;
const PASSWORD = "Secret123";

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "test" });
  await Promise.all([UserModel.syncIndexes(), SchoolModel.syncIndexes(), RefreshTokenModel.syncIndexes()]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([UserModel.deleteMany({}), SchoolModel.deleteMany({}), RefreshTokenModel.deleteMany({})]);
  ownerSecret = await createOwner();
});

const api = () => request(app);

let ownerSecret = "";
const ownerToken = () => ownerTokenFor(ownerSecret);

const newSchool = (code = "DPS01", principalEmail = "principal@dps.edu") => ({
  school: { name: "Delhi Public School", code: code.toLowerCase(), email: "office@dps.edu", phone: "", address: "Bhubaneswar" },
  principal: { fullName: "Anita Rao", email: principalEmail, phone: "9876543210", password: "Principal123" },
});

async function createSchool(token: string, body = newSchool()) {
  return api().post("/api/v1/platform/schools").set("Authorization", `Bearer ${token}`).send(body);
}

describe("POST /schools", () => {
  it("creates the school and an ACTIVE principal who can log in straight away", async () => {
    const token = await ownerToken();
    const res = await createSchool(token);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      code: "DPS01",
      name: "Delhi Public School",
      status: "ACTIVE",
      phone: null,
      principals: [{ fullName: "Anita Rao", email: "principal@dps.edu", status: "ACTIVE" }],
      userCounts: { total: 1, principals: 1 },
    });

    const login = await api()
      .post("/api/v1/auth/login")
      .send({ schoolCode: "dps01", email: "principal@dps.edu", password: "Principal123", role: "PRINCIPAL" });
    expect(login.status).toBe(200);
  });

  it("rejects a duplicate school code", async () => {
    const token = await ownerToken();
    await createSchool(token);
    const dup = await createSchool(token, newSchool("DPS01", "other@dps.edu"));
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe("SCHOOL_CODE_TAKEN");
  });

  it("validates code format and principal password with field paths", async () => {
    const token = await ownerToken();
    const body = newSchool("D P S");
    body.principal.password = "short";
    const res = await createSchool(token, body);
    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["school.code", "principal.password"]));
  });

  it("only the super admin can create schools", async () => {
    const token = await ownerToken();
    await createSchool(token);
    const principal = await api()
      .post("/api/v1/auth/login")
      .send({ schoolCode: "DPS01", email: "principal@dps.edu", password: "Principal123" });

    const res = await createSchool(principal.body.data.tokens.accessToken, newSchool("HACK1", "x@x.com"));
    expect(res.status).toBe(403);
    expect(await SchoolModel.countDocuments()).toBe(1);

    expect((await api().post("/api/v1/platform/schools").send(newSchool("NOAUTH"))).status).toBe(401);
  });
});

describe("GET /schools", () => {
  it("lists schools with principal, user counts and platform summary", async () => {
    const token = await ownerToken();
    await createSchool(token, newSchool("AAA01", "p@a.com"));
    const b = await createSchool(token, newSchool("BBB01", "p@b.com"));

    // a pending teacher in school B
    await UserModel.create({
      schoolId: b.body.data.id,
      fullName: "T One",
      email: "t@b.com",
      role: "TEACHER",
      status: "PENDING",
      passwordHash: await hashPassword("Teacher123"),
    });
    await api()
      .patch(`/api/v1/platform/schools/${b.body.data.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "SUSPENDED" });

    const res = await api().get("/api/v1/platform/schools?search=bbb").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      code: "BBB01",
      status: "SUSPENDED",
      userCounts: { total: 2, principals: 1, teachers: 1, pending: 1 },
    });
    expect(res.body.meta).toMatchObject({ total: 1, summary: { schools: 2, active: 1, suspended: 1 } });
  });
});

describe("school status and principals", () => {
  it("suspending logs everyone out and blocks login; reactivating restores it", async () => {
    const token = await ownerToken();
    const created = await createSchool(token);
    const id = created.body.data.id;
    const creds = { schoolCode: "DPS01", email: "principal@dps.edu", password: "Principal123" };
    const session = await api().post("/api/v1/auth/login").send(creds);

    const suspend = await api()
      .patch(`/api/v1/platform/schools/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "SUSPENDED" });
    expect(suspend.status).toBe(200);

    const refresh = await api().post("/api/v1/auth/refresh").send({ refreshToken: session.body.data.tokens.refreshToken });
    expect(refresh.status).toBe(401);
    expect((await api().post("/api/v1/auth/login").send(creds)).body.error.code).toBe("SCHOOL_SUSPENDED");

    await api().patch(`/api/v1/platform/schools/${id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "ACTIVE" });
    expect((await api().post("/api/v1/auth/login").send(creds)).status).toBe(200);
  });

  it("adds a second principal; duplicate email in the same school is rejected", async () => {
    const token = await ownerToken();
    const id = (await createSchool(token)).body.data.id;
    const add = (email: string) =>
      api()
        .post(`/api/v1/platform/schools/${id}/principals`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "New Principal", email, password: "Principal456" });

    const ok = await add("new@dps.edu");
    expect(ok.status).toBe(201);
    expect(ok.body.data.principals).toHaveLength(2);

    expect((await add("principal@dps.edu")).body.error.code).toBe("EMAIL_TAKEN");
  });

  it("returns 404 / 400 for unknown or malformed school ids", async () => {
    const token = await ownerToken();
    const missing = await api().get(`/api/v1/platform/schools/${new mongoose.Types.ObjectId()}`).set("Authorization", `Bearer ${token}`);
    expect(missing.status).toBe(404);
    const bad = await api().get("/api/v1/platform/schools/not-an-id").set("Authorization", `Bearer ${token}`);
    expect(bad.status).toBe(400);
  });
});
