import { beforeEach, describe, expect, it, vi } from "vitest";

// capture outgoing emails instead of sending them
const sent: { to: string; subject: string; text: string }[] = [];
vi.mock("../src/services/mailer.js", () => ({
  sendMail: vi.fn(async (m: { to: string; subject: string; text: string }) => {
    sent.push(m);
  }),
}));

import { PASSWORD, api, bearer, clearDb, login, passwordHash, useTestDb } from "./helpers.js";
import { SchoolModel } from "../src/modules/schools/school.model.js";
import { UserModel } from "../src/modules/users/user.model.js";
import { PasswordResetModel } from "../src/modules/auth/passwordReset.model.js";

useTestDb();

let schoolId: string;

beforeEach(async () => {
  sent.length = 0;
  await clearDb();
  const school = await SchoolModel.create({ code: "AAA01", name: "School A" });
  schoolId = String(school._id);
  const hash = await passwordHash();
  await UserModel.create([
    { schoolId: null, fullName: "Owner", email: "owner@platform.com", role: "SUPER_ADMIN", status: "ACTIVE", passwordHash: hash },
    { schoolId: school._id, fullName: "Principal", email: "p@a.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash: hash },
    { schoolId: school._id, fullName: "Office Admin", email: "admin@a.com", role: "ADMIN", status: "ACTIVE", passwordHash: hash },
    { schoolId: school._id, fullName: "Teacher", email: "t@a.com", role: "TEACHER", status: "ACTIVE", passwordHash: hash },
  ]);
});

const loginAs = async (email: string, password = PASSWORD) => {
  const res = await login(email === "owner@platform.com" ? { email, password } : { schoolCode: "AAA01", email, password });
  return res;
};
const tokenOf = async (email: string, password = PASSWORD) => (await loginAs(email, password)).body.data.tokens.accessToken as string;
const idOf = async (email: string) => String((await UserModel.findOne({ email }))!._id);

describe("first login with a temporary password", () => {
  async function newPrincipalSession() {
    const owner = await tokenOf("owner@platform.com");
    await api()
      .post("/api/v1/schools")
      .set(bearer(owner))
      .send({
        school: { name: "Delhi Public School", code: "DPS01" },
        principal: { fullName: "Anita Rao", email: "anita@dps.edu", password: "Temp12345" },
      });
    return login({ schoolCode: "DPS01", email: "anita@dps.edu", password: "Temp12345" });
  }

  it("a principal created by the platform must change the password before doing anything", async () => {
    const res = await newPrincipalSession();
    expect(res.status).toBe(200);
    expect(res.body.data.user.mustChangePassword).toBe(true);
    const token = res.body.data.tokens.accessToken;

    const blocked = await api().get("/api/v1/users").set(bearer(token));
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("PASSWORD_CHANGE_REQUIRED");

    // /me still works so the app can show the "set new password" screen
    expect((await api().get("/api/v1/auth/me").set(bearer(token))).status).toBe(200);
  });

  it("changing the password unlocks the account and returns fresh tokens", async () => {
    const res = await newPrincipalSession();
    const { accessToken, refreshToken } = res.body.data.tokens;

    const wrong = await api()
      .post("/api/v1/auth/change-password")
      .set(bearer(accessToken))
      .send({ currentPassword: "nope", newPassword: "MyNewPass1" });
    expect(wrong.body.error.code).toBe("WRONG_PASSWORD");

    const same = await api()
      .post("/api/v1/auth/change-password")
      .set(bearer(accessToken))
      .send({ currentPassword: "Temp12345", newPassword: "Temp12345" });
    expect(same.body.error.code).toBe("SAME_PASSWORD");

    const ok = await api()
      .post("/api/v1/auth/change-password")
      .set(bearer(accessToken))
      .send({ currentPassword: "Temp12345", newPassword: "MyNewPass1" });
    expect(ok.status).toBe(200);
    expect(ok.body.data.user.mustChangePassword).toBe(false);

    const unlocked = await api().get("/api/v1/users").set(bearer(ok.body.data.tokens.accessToken));
    expect(unlocked.status).toBe(200);

    // the old session is gone
    expect((await api().post("/api/v1/auth/refresh").send({ refreshToken })).status).toBe(401);
    // and only the new password works
    expect((await login({ schoolCode: "DPS01", email: "anita@dps.edu", password: "Temp12345" })).status).toBe(401);
    expect((await login({ schoolCode: "DPS01", email: "anita@dps.edu", password: "MyNewPass1" })).status).toBe(200);
  });
});

describe("forgot / reset password", () => {
  const tokenFromEmail = () => {
    const match = sent.at(-1)?.text.match(/reset-password\?token=([a-f0-9]+)/);
    return match?.[1] ?? "";
  };

  it("emails a one-time link that sets a new password", async () => {
    const forgot = await api().post("/api/v1/auth/forgot-password").send({ schoolCode: "aaa01", email: "T@A.com" });
    expect(forgot.status).toBe(200);
    expect(forgot.body.data).not.toHaveProperty("devResetToken"); // only in development
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("t@a.com");

    const token = tokenFromEmail();
    const reset = await api().post("/api/v1/auth/reset-password").send({ token, newPassword: "BrandNew99" });
    expect(reset.status).toBe(200);

    expect((await loginAs("t@a.com", "BrandNew99")).status).toBe(200);
    // the link works only once
    const again = await api().post("/api/v1/auth/reset-password").send({ token, newPassword: "Another99" });
    expect(again.body.error.code).toBe("INVALID_RESET_TOKEN");
  });

  it("answers the same for unknown emails and sends nothing", async () => {
    const res = await api().post("/api/v1/auth/forgot-password").send({ schoolCode: "AAA01", email: "nobody@a.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
    expect(sent).toHaveLength(0);
  });

  it("rejects expired links", async () => {
    await api().post("/api/v1/auth/forgot-password").send({ schoolCode: "AAA01", email: "t@a.com" });
    await PasswordResetModel.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    const res = await api().post("/api/v1/auth/reset-password").send({ token: tokenFromEmail(), newPassword: "BrandNew99" });
    expect(res.body.error.code).toBe("INVALID_RESET_TOKEN");
  });

  it("only the newest link is valid", async () => {
    await api().post("/api/v1/auth/forgot-password").send({ schoolCode: "AAA01", email: "t@a.com" });
    const first = tokenFromEmail();
    await api().post("/api/v1/auth/forgot-password").send({ schoolCode: "AAA01", email: "t@a.com" });
    const res = await api().post("/api/v1/auth/reset-password").send({ token: first, newPassword: "BrandNew99" });
    expect(res.status).toBe(400);
  });
});

describe("admins resetting someone else's password", () => {
  it("principal sets a temporary password for a teacher, who must then change it", async () => {
    const principal = await tokenOf("p@a.com");
    const teacherId = await idOf("t@a.com");

    const res = await api()
      .post(`/api/v1/users/${teacherId}/reset-password`)
      .set(bearer(principal))
      .send({ newPassword: "TempPass11" });
    expect(res.status).toBe(200);

    const teacher = await loginAs("t@a.com", "TempPass11");
    expect(teacher.body.data.user.mustChangePassword).toBe(true);
  });

  it("an office admin cannot reset the principal's password", async () => {
    const admin = await tokenOf("admin@a.com");
    const res = await api()
      .post(`/api/v1/users/${await idOf("p@a.com")}/reset-password`)
      .set(bearer(admin))
      .send({ newPassword: "TempPass11" });
    expect(res.status).toBe(403);
  });

  it("super admin can reset a principal's password", async () => {
    const owner = await tokenOf("owner@platform.com");
    const res = await api()
      .post(`/api/v1/schools/${schoolId}/principals/${await idOf("p@a.com")}/reset-password`)
      .set(bearer(owner))
      .send({ newPassword: "TempPass22" });
    expect(res.status).toBe(200);
    expect((await loginAs("p@a.com", "TempPass22")).body.data.user.mustChangePassword).toBe(true);

    // but not a teacher through the principal endpoint
    const t = await api()
      .post(`/api/v1/schools/${schoolId}/principals/${await idOf("t@a.com")}/reset-password`)
      .set(bearer(owner))
      .send({ newPassword: "TempPass22" });
    expect(t.status).toBe(404);
  });
});
