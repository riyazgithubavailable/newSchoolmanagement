import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { app } from "../src/app.js";
import { hashPassword } from "../src/modules/auth/auth.service.js";
import { SchoolModel } from "../src/modules/schools/school.model.js";
import { UserModel } from "../src/modules/users/user.model.js";
import { RefreshTokenModel } from "../src/modules/auth/refreshToken.model.js";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "test" });
  await Promise.all([UserModel.syncIndexes(), SchoolModel.syncIndexes(), RefreshTokenModel.syncIndexes()]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const PASSWORD = "Secret123";

/** fresh data for every test: two schools, a principal in each, a super admin */
beforeEach(async () => {
  await Promise.all([UserModel.deleteMany({}), SchoolModel.deleteMany({}), RefreshTokenModel.deleteMany({})]);
  const [a, b] = await SchoolModel.create([
    { code: "AAA01", name: "School A" },
    { code: "BBB01", name: "School B" },
  ]);
  const passwordHash = await hashPassword(PASSWORD);
  await UserModel.create([
    { schoolId: a._id, fullName: "Principal A", email: "principal@a.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash },
    { schoolId: b._id, fullName: "Principal B", email: "principal@b.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash },
    { schoolId: null, fullName: "Owner", email: "owner@platform.com", role: "SUPER_ADMIN", status: "ACTIVE", passwordHash },
  ]);
});

const api = () => request(app);
const login = (body: Record<string, unknown>) => api().post("/api/v1/auth/login").send(body);
const register = (body: Record<string, unknown>) => api().post("/api/v1/auth/register").send(body);

const teacher = {
  schoolCode: "aaa01", // lower-case on purpose
  fullName: "Neha Verma",
  email: "Neha@Mail.com",
  password: PASSWORD,
  role: "TEACHER",
};

async function principalToken(code = "AAA01", email = "principal@a.com") {
  const res = await login({ schoolCode: code, email, password: PASSWORD });
  return res.body.data.tokens.accessToken as string;
}

/* ------------------------------------------------------------------ */

describe("POST /auth/register", () => {
  it("creates a PENDING account and never returns the password", async () => {
    const res = await register(teacher);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      email: "neha@mail.com",
      role: "TEACHER",
      status: "PENDING",
      school: { code: "AAA01", name: "School A" },
    });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|Secret123/);
  });

  it("rejects an unknown school code", async () => {
    const res = await register({ ...teacher, schoolCode: "NOPE" });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SCHOOL_NOT_FOUND");
  });

  it("does not allow signing up as PRINCIPAL or ADMIN", async () => {
    for (const role of ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"]) {
      const res = await register({ ...teacher, role });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns field-level errors for a weak password", async () => {
    const res = await register({ ...teacher, password: "abcdefgh" });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: "password", message: "Password must contain a number." }]);
  });

  it("rejects a duplicate email in the same school, allows it in another school", async () => {
    await register(teacher);
    const dup = await register({ ...teacher, email: "neha@mail.com" });
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe("EMAIL_TAKEN");

    const other = await register({ ...teacher, schoolCode: "BBB01" });
    expect(other.status).toBe(201);
  });
});

describe("POST /auth/login", () => {
  it("logs in a principal and returns tokens + user", async () => {
    const res = await login({ schoolCode: "AAA01", email: "PRINCIPAL@a.com", password: PASSWORD, role: "PRINCIPAL" });
    expect(res.status).toBe(200);
    expect(res.body.data.tokens).toMatchObject({ tokenType: "Bearer", expiresIn: 900 });
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    expect(res.body.data.tokens.refreshToken).toBeTruthy();
    expect(res.body.data.user).toMatchObject({ role: "PRINCIPAL", school: { code: "AAA01" } });
  });

  it("gives the same error for wrong password, unknown email and unknown school", async () => {
    const cases = [
      { schoolCode: "AAA01", email: "principal@a.com", password: "Wrong1234" },
      { schoolCode: "AAA01", email: "nobody@a.com", password: PASSWORD },
      { schoolCode: "ZZZ99", email: "principal@a.com", password: PASSWORD },
      { schoolCode: "BBB01", email: "principal@a.com", password: PASSWORD }, // right user, wrong school
    ];
    for (const body of cases) {
      const res = await login(body);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("tells the user when they picked the wrong role tab", async () => {
    const res = await login({ schoolCode: "AAA01", email: "principal@a.com", password: PASSWORD, role: "TEACHER" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ROLE_MISMATCH");
  });

  it("blocks pending accounts until a principal approves them", async () => {
    const reg = await register(teacher);
    const creds = { schoolCode: "AAA01", email: teacher.email, password: PASSWORD };

    const before = await login(creds);
    expect(before.status).toBe(403);
    expect(before.body.error.code).toBe("ACCOUNT_PENDING");

    const token = await principalToken();
    const approve = await api()
      .patch(`/api/v1/users/${reg.body.data.user.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "ACTIVE" });
    expect(approve.status).toBe(200);

    const after = await login(creds);
    expect(after.status).toBe(200);
    expect(after.body.data.user.status).toBe("ACTIVE");
  });

  it("blocks login when the school is suspended", async () => {
    await SchoolModel.updateOne({ code: "AAA01" }, { status: "SUSPENDED" });
    const res = await login({ schoolCode: "AAA01", email: "principal@a.com", password: PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("SCHOOL_SUSPENDED");
  });

  it("lets the super admin log in without a school code", async () => {
    const res = await login({ email: "owner@platform.com", password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ role: "SUPER_ADMIN", school: null });

    // but a school principal can't log in without the school code
    const p = await login({ email: "principal@a.com", password: PASSWORD });
    expect(p.status).toBe(401);
  });
});

describe("tokens: /auth/me, /auth/refresh, /auth/logout", () => {
  async function loginTokens() {
    const res = await login({ schoolCode: "AAA01", email: "principal@a.com", password: PASSWORD });
    return res.body.data.tokens as { accessToken: string; refreshToken: string };
  }

  it("/me needs a valid Bearer token", async () => {
    const { accessToken } = await loginTokens();
    const ok = await api().get("/api/v1/auth/me").set("Authorization", `Bearer ${accessToken}`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.user.email).toBe("principal@a.com");

    const none = await api().get("/api/v1/auth/me");
    expect(none.status).toBe(401);
    const bad = await api().get("/api/v1/auth/me").set("Authorization", "Bearer abc.def.ghi");
    expect(bad.body.error.code).toBe("INVALID_TOKEN");
  });

  it("refresh rotates the token; replaying the old one logs out every device", async () => {
    const first = await loginTokens();

    const r1 = await api().post("/api/v1/auth/refresh").send({ refreshToken: first.refreshToken });
    expect(r1.status).toBe(200);
    const second = r1.body.data.tokens;
    expect(second.refreshToken).not.toBe(first.refreshToken);

    // old token used again → rejected, and the new one is revoked too
    const replay = await api().post("/api/v1/auth/refresh").send({ refreshToken: first.refreshToken });
    expect(replay.status).toBe(401);
    const afterReplay = await api().post("/api/v1/auth/refresh").send({ refreshToken: second.refreshToken });
    expect(afterReplay.status).toBe(401);
  });

  it("logout revokes only that device's refresh token", async () => {
    const web = await loginTokens();
    const phone = await loginTokens();

    const out = await api().post("/api/v1/auth/logout").send({ refreshToken: web.refreshToken });
    expect(out.status).toBe(200);

    expect((await api().post("/api/v1/auth/refresh").send({ refreshToken: phone.refreshToken })).status).toBe(200);
    expect(await RefreshTokenModel.countDocuments({ tokenHash: { $exists: true } })).toBe(1);
  });
});

describe("account approval is scoped to the school", () => {
  it("a principal of another school cannot see or approve the account", async () => {
    const reg = await register(teacher); // signs up in school A
    const tokenB = await principalToken("BBB01", "principal@b.com");

    const list = await api().get("/api/v1/users?status=PENDING").set("Authorization", `Bearer ${tokenB}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);

    const patch = await api()
      .patch(`/api/v1/users/${reg.body.data.user.id}/status`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ status: "ACTIVE" });
    expect(patch.status).toBe(404);
  });

  it("lists pending accounts with pagination meta for the right principal", async () => {
    await register(teacher);
    const token = await principalToken();
    const res = await api().get("/api/v1/users?status=PENDING&limit=10").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(res.body.data[0]).not.toHaveProperty("passwordHash");
  });

  it("teachers cannot manage accounts", async () => {
    const reg = await register(teacher);
    await UserModel.updateOne({ _id: reg.body.data.user.id }, { status: "ACTIVE" });
    const t = await login({ schoolCode: "AAA01", email: teacher.email, password: PASSWORD });
    const res = await api()
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${t.body.data.tokens.accessToken}`);
    expect(res.status).toBe(403);
  });

  it("disabling a user logs them out everywhere", async () => {
    const reg = await register(teacher);
    const id = reg.body.data.user.id;
    await UserModel.updateOne({ _id: id }, { status: "ACTIVE" });
    const t = await login({ schoolCode: "AAA01", email: teacher.email, password: PASSWORD });

    const token = await principalToken();
    await api().patch(`/api/v1/users/${id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "DISABLED" });

    const refresh = await api().post("/api/v1/auth/refresh").send({ refreshToken: t.body.data.tokens.refreshToken });
    expect(refresh.status).toBe(401);
  });
});

describe("error format", () => {
  it("returns JSON for malformed bodies and unknown routes", async () => {
    const bad = await api().post("/api/v1/auth/login").set("Content-Type", "application/json").send("{oops");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("INVALID_JSON");

    const missing = await api().get("/api/v1/nope");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Route GET /api/v1/nope not found" },
    });
  });
});
