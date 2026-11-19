// Platform owner security: separate login, mandatory 2FA, code replay
// protection, school-login block, audit log and IP allowlist.

import { beforeEach, describe, expect, it } from "vitest";
import { env } from "../src/config/env.js";
import { totpAt } from "../src/modules/platform/totp.js";
import { SchoolModel } from "../src/modules/schools/school.model.js";
import { UserModel } from "../src/modules/users/user.model.js";
import { PASSWORD, api, bearer, clearDb, createOwner, login, ownerToken, passwordHash, useTestDb } from "./helpers.js";

useTestDb();

beforeEach(async () => {
  await clearDb();
  env.platform.allowedIps.length = 0;
});

const platformLogin = (body: object) => api().post("/api/v1/platform/auth/login").send(body);

/** Owner without 2FA (first sign-in after `npm run super-admin -- create`). */
async function newOwner() {
  await UserModel.create({
    schoolId: null,
    fullName: "Owner",
    email: "owner@platform.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    passwordHash: await passwordHash(),
  });
}

describe("first sign-in: 2FA setup is mandatory", () => {
  it("gives a limited session that can only set up 2FA, then a full one", async () => {
    await newOwner();
    const res = await platformLogin({ email: "owner@platform.com", password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ twoFactorRequired: false, user: { role: "SUPER_ADMIN", twoFactorEnabled: false } });
    const limited = res.body.data.tokens.accessToken;

    const blocked = await api().get("/api/v1/platform/schools").set(bearer(limited));
    expect(blocked.body.error.code).toBe("MFA_SETUP_REQUIRED");

    const setup = await api().post("/api/v1/platform/2fa/setup").set(bearer(limited));
    expect(setup.body.data.otpauthUrl).toMatch(/^otpauth:\/\/totp\/InstituteOS%20Platform:owner%40platform\.com\?secret=/);
    const secret = setup.body.data.secret as string;

    const wrong = await api().post("/api/v1/platform/2fa/enable").set(bearer(limited)).send({ code: "000000" });
    expect(wrong.status).toBe(400);

    const enable = await api().post("/api/v1/platform/2fa/enable").set(bearer(limited)).send({ code: totpAt(secret, Date.now()) });
    expect(enable.status).toBe(200);
    expect(enable.body.data.user.twoFactorEnabled).toBe(true);
    expect((await api().get("/api/v1/platform/schools").set(bearer(enable.body.data.tokens.accessToken))).status).toBe(200);

    // the secret is stored encrypted, never in plain text
    const stored = await UserModel.findOne({ email: "owner@platform.com" }).select("+twoFactor.secret").lean();
    expect(stored!.twoFactor!.secret).not.toContain(secret);
  });
});

describe("sign-in with 2FA", () => {
  it("password alone is not enough; the code completes the sign-in", async () => {
    const secret = await createOwner();
    const step1 = await platformLogin({ email: "owner@platform.com", password: PASSWORD });
    expect(step1.body.data).toEqual({ twoFactorRequired: true, challengeToken: expect.any(String) });
    expect(step1.body.data.tokens).toBeUndefined();

    // the challenge token is not an access token
    expect((await api().get("/api/v1/platform/schools").set(bearer(step1.body.data.challengeToken))).status).toBe(401);

    const bad = await api().post("/api/v1/platform/auth/verify-2fa").send({ challengeToken: step1.body.data.challengeToken, code: "123456" });
    // (1 in a million chance this is the real code)
    if (totpAt(secret, Date.now()) !== "123456") expect(bad.body.error.code).toBe("INVALID_2FA_CODE");

    const code = totpAt(secret, Date.now());
    const ok = await api().post("/api/v1/platform/auth/verify-2fa").send({ challengeToken: step1.body.data.challengeToken, code });
    expect(ok.status).toBe(200);
    expect(ok.body.data.tokens.accessToken).toBeTruthy();

    // the same code can't be used again (replay)
    const again = await platformLogin({ email: "owner@platform.com", password: PASSWORD });
    const replay = await api().post("/api/v1/platform/auth/verify-2fa").send({ challengeToken: again.body.data.challengeToken, code });
    expect(replay.body.error.code).toBe("INVALID_2FA_CODE");
  });

  it("wrong password gives the generic error", async () => {
    await createOwner();
    const res = await platformLogin({ email: "owner@platform.com", password: "Wrong1234" });
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    const nobody = await platformLogin({ email: "nobody@platform.com", password: PASSWORD });
    expect(nobody.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("platform sessions are short (1 day refresh)", async () => {
    const secret = await createOwner();
    const step1 = await platformLogin({ email: "owner@platform.com", password: PASSWORD });
    const res = await api().post("/api/v1/platform/auth/verify-2fa").send({ challengeToken: step1.body.data.challengeToken, code: totpAt(secret, Date.now()) });
    const hours = (new Date(res.body.data.tokens.refreshExpiresAt).getTime() - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(23);
    expect(hours).toBeLessThan(25);
  });
});

describe("separation from the school app", () => {
  it("a school principal can't use the platform login, and the owner can't use the school login", async () => {
    await createOwner();
    const school = await SchoolModel.create({ code: "AAA01", name: "School A" });
    await UserModel.create({ schoolId: school._id, fullName: "P", email: "p@a.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash: await passwordHash() });

    expect((await platformLogin({ email: "p@a.com", password: PASSWORD })).body.error.code).toBe("INVALID_CREDENTIALS");
    expect((await login({ schoolCode: "AAA01", email: "owner@platform.com", password: PASSWORD })).body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("forgot-password never resets the platform owner", async () => {
    await createOwner();
    const res = await api().post("/api/v1/auth/forgot-password").send({ email: "owner@platform.com" });
    expect(res.status).toBe(400); // school code is required
  });
});

describe("audit log", () => {
  it("records sign-ins, failures and school changes", async () => {
    const secret = await createOwner();
    await platformLogin({ email: "owner@platform.com", password: "Wrong1234" });
    const token = await ownerToken(secret);
    await api()
      .post("/api/v1/platform/schools")
      .set(bearer(token))
      .send({ school: { name: "Delhi Public School", code: "DPS01" }, principal: { fullName: "Anita", email: "a@dps.edu", password: "Temp12345" } });

    const logs = (await api().get("/api/v1/platform/audit-logs").set(bearer(token))).body.data;
    expect(logs.map((l: { action: string }) => l.action)).toEqual(["SCHOOL_CREATED", "PLATFORM_LOGIN", "PLATFORM_LOGIN_FAILED"]);
    expect(logs[0].details).toMatchObject({ code: "DPS01", principal: "a@dps.edu" });
  });
});

describe("IP allowlist", () => {
  it("hides the platform API from other IPs", async () => {
    await createOwner();
    env.platform.allowedIps.push("10.9.9.9");
    const res = await platformLogin({ email: "owner@platform.com", password: PASSWORD });
    expect(res.status).toBe(404);
    // school app is unaffected
    expect((await api().get("/api/v1/health")).status).not.toBe(404);
  });
});
