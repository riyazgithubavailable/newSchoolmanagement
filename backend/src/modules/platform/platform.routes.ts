// Platform owner (SUPER_ADMIN) API — used only by the separate Platform Admin
// web app. Mounted at /api/v1/platform behind the optional IP allowlist.
//
//   POST /auth/login        { email, password }        → session, or { twoFactorRequired, challengeToken }
//   POST /auth/verify-2fa   { challengeToken, code }   → session
//   POST /2fa/setup                                    → { secret, otpauthUrl }   (first sign-in)
//   POST /2fa/enable        { code }                   → session without the setup flag
//   GET  /audit-logs                                   → who did what
//   /schools/...                                       → onboard & manage schools

import bcrypt from "bcryptjs";
import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env.js";
import { ROLES, USER_STATUS } from "../../constants/roles.js";
import { platformIpAllowlist, requireAuth, requireAuthAllowMfaSetup, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ApiError } from "../../utils/ApiError.js";
import { decrypt, encrypt } from "../../utils/crypto.js";
import { sendSuccess } from "../../utils/response.js";
import { issueTokens, sessionUser, type ClientInfo } from "../auth/auth.service.js";
import { signMfaChallenge, verifyMfaChallenge } from "../auth/tokens.js";
import { schoolsRouter } from "../schools/schools.routes.js";
import { UserModel, type UserDoc } from "../users/user.model.js";
import { AUDIT, AuditLogModel, audit } from "./auditLog.model.js";
import { generateSecret, otpauthUrl, verifyTotp } from "./totp.js";

export const platformRouter = Router();
platformRouter.use(platformIpAllowlist);

const clientInfo = (req: Request): ClientInfo => ({
  client: String(req.headers["x-client"] ?? "platform").slice(0, 30),
  userAgent: String(req.headers["user-agent"] ?? ""),
});
const who = (req: Request) => ({ ip: req.ip, userAgent: String(req.headers["user-agent"] ?? "") });

/** Stricter than school logins: 5 failed attempts per 15 minutes per IP. */
const platformLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  skip: () => env.nodeEnv === "test",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_ATTEMPTS", message: "Too many attempts. Try again in 15 minutes." } },
});

// compared when the account doesn't exist, so timing reveals nothing
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);
const invalid = () => ApiError.unauthorized("INVALID_CREDENTIALS", "Email or password is incorrect.");

async function session(user: UserDoc, req: Request) {
  return { user: await sessionUser(user, null), tokens: await issueTokens(user, clientInfo(req)) };
}

/** Accepts a code once: the same 30-second code can't be replayed. */
async function checkCode(user: UserDoc, secretEnc: string | undefined, code: string) {
  const step = secretEnc ? verifyTotp(decrypt(secretEnc), code) : null;
  if (step === null || step <= (user.twoFactor?.lastUsedStep ?? 0)) return false;
  await UserModel.updateOne({ _id: user._id }, { $set: { "twoFactor.lastUsedStep": step } });
  return true;
}

/* -------------------------------- Login ---------------------------------- */

const loginSchema = z.object({
  email: z.string({ error: "Email is required." }).trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  password: z.string({ error: "Password is required." }).min(1, "Password is required."),
});

platformRouter.post("/auth/login", platformLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await UserModel.findOne({ schoolId: null, email, role: ROLES.SUPER_ADMIN }).select("+passwordHash");
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !ok || user.status !== USER_STATUS.ACTIVE) {
    await audit({ action: AUDIT.PLATFORM_LOGIN_FAILED, actor: { email }, details: { reason: "password" }, ...who(req) });
    throw invalid();
  }

  if (user.twoFactor?.enabled) {
    // step 2: the app asks for the 6-digit code
    return sendSuccess(res, { twoFactorRequired: true, challengeToken: signMfaChallenge(String(user._id)) });
  }

  // first sign-in: 2FA isn't set up yet → limited session that can only set it up
  await audit({ action: AUDIT.PLATFORM_LOGIN, actor: { id: String(user._id), email, role: user.role }, details: { mfa: "setup-pending" }, ...who(req) });
  sendSuccess(res, { twoFactorRequired: false, ...(await session(user, req)) });
});

const verifySchema = z.object({
  challengeToken: z.string({ error: "challengeToken is required." }).min(10),
  code: z.string({ error: "Enter the 6-digit code." }).trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

platformRouter.post("/auth/verify-2fa", platformLimiter, validate(verifySchema), async (req: Request, res: Response) => {
  const userId = verifyMfaChallenge(req.body.challengeToken);
  const user = await UserModel.findOne({ _id: userId, role: ROLES.SUPER_ADMIN }).select("+twoFactor.secret");
  if (!user || user.status !== USER_STATUS.ACTIVE || !user.twoFactor?.enabled) throw invalid();

  if (!(await checkCode(user, user.twoFactor.secret ?? undefined, req.body.code))) {
    await audit({ action: AUDIT.PLATFORM_2FA_FAILED, actor: { id: userId, email: user.email, role: user.role }, ...who(req) });
    throw ApiError.unauthorized("INVALID_2FA_CODE", "That code is incorrect or already used. Wait for a new code and try again.");
  }

  user.lastLoginAt = new Date();
  await user.save();
  await audit({ action: AUDIT.PLATFORM_LOGIN, actor: { id: userId, email: user.email, role: user.role }, ...who(req) });
  sendSuccess(res, await session(user, req), { message: "Signed in." });
});

/* ------------------------------ 2FA setup -------------------------------- */

const owner = [requireAuthAllowMfaSetup, requireRole(ROLES.SUPER_ADMIN)];

platformRouter.get("/auth/me", ...owner, async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.auth!.sub);
  if (!user) throw ApiError.unauthorized("INVALID_TOKEN", "User no longer exists.");
  sendSuccess(res, { user: await sessionUser(user, null) });
});

platformRouter.post("/2fa/setup", ...owner, async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.auth!.sub);
  if (!user) throw ApiError.unauthorized("INVALID_TOKEN", "User no longer exists.");
  if (user.twoFactor?.enabled) throw ApiError.conflict("MFA_ALREADY_ENABLED", "2-step verification is already on.");

  const secret = generateSecret();
  user.set("twoFactor", { enabled: false, pendingSecret: encrypt(secret), lastUsedStep: 0 });
  await user.save();
  sendSuccess(res, { secret, otpauthUrl: otpauthUrl(secret, user.email) });
});

platformRouter.post(
  "/2fa/enable",
  ...owner,
  validate(z.object({ code: verifySchema.shape.code })),
  async (req: Request, res: Response) => {
    const user = await UserModel.findById(req.auth!.sub).select("+twoFactor.pendingSecret");
    if (!user?.twoFactor?.pendingSecret) {
      throw ApiError.badRequest("MFA_NOT_STARTED", "Start the setup again to get a new QR code.");
    }
    if (!(await checkCode(user, user.twoFactor.pendingSecret, req.body.code))) {
      throw ApiError.badRequest("INVALID_2FA_CODE", "That code doesn't match. Check the time on your phone and try the newest code.");
    }
    const fresh = await UserModel.findById(user._id).select("+twoFactor.pendingSecret");
    fresh!.set("twoFactor", {
      enabled: true,
      secret: user.twoFactor.pendingSecret,
      pendingSecret: undefined,
      lastUsedStep: fresh!.twoFactor?.lastUsedStep ?? 0,
      enabledAt: new Date(),
    });
    await fresh!.save();
    await audit({ action: AUDIT.PLATFORM_2FA_ENABLED, actor: { id: String(user._id), email: user.email, role: user.role }, ...who(req) });
    // new tokens without the "setup required" flag
    sendSuccess(res, await session(fresh!, req), { message: "2-step verification is on." });
  },
);

/* ------------------------------- Audit log ------------------------------- */

const auditQuery = z.object({
  action: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

platformRouter.get(
  "/audit-logs",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN),
  validate(auditQuery, "query"),
  async (_req: Request, res: Response) => {
    const q = res.locals.query as z.infer<typeof auditQuery>;
    const filter = q.action ? { action: q.action } : {};
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
      AuditLogModel.countDocuments(filter),
    ]);
    sendSuccess(
      res,
      items.map(({ _id, __v: _v, ...rest }) => ({ id: String(_id), ...rest })),
      { meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } },
    );
  },
);

/* ------------------------------- Schools --------------------------------- */

platformRouter.use("/schools", schoolsRouter);
