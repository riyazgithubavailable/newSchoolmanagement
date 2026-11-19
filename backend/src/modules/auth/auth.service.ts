import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { ROLES, USER_STATUS, type Role } from "../../constants/roles.js";
import { ApiError } from "../../utils/ApiError.js";
import { SCHOOL_STATUS, SchoolModel, type SchoolDoc } from "../schools/school.model.js";
import { UserModel, type UserDoc } from "../users/user.model.js";
import crypto from "node:crypto";
import { sendMail } from "../../services/mailer.js";
import { classTeacherOf } from "../academics/academics.service.js";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from "./auth.schemas.js";
import { PasswordResetModel, RESET_TOKEN_TTL_MINUTES } from "./passwordReset.model.js";
import { RefreshTokenModel } from "./refreshToken.model.js";
import {
  accessTokenTtlSeconds,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./tokens.js";

const BCRYPT_ROUNDS = env.isProduction ? 12 : 10;
// compared against when the user doesn't exist, so response time doesn't reveal it
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_ROUNDS);

const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  PRINCIPAL: "Principal",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};

export interface ClientInfo {
  client: string; // "web" | "android" | ...
  userAgent: string;
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_ROUNDS);

/** The user object returned to web and mobile clients */
export function toPublicUser(user: UserDoc, school: SchoolDoc | null) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role as Role,
    status: user.status,
    schoolId: school ? String(school._id) : null,
    school: school ? { id: String(school._id), code: school.code, name: school.name } : null,
    lastLoginAt: user.lastLoginAt ?? null,
    /** client must show the "set a new password" screen before anything else */
    mustChangePassword: !!user.mustChangePassword,
  };
}

/** Public user + (for teachers) the section they are class teacher of. */
export async function sessionUser(user: UserDoc, school: SchoolDoc | null) {
  const base = toPublicUser(user, school);
  if (user.role === ROLES.SUPER_ADMIN) return { ...base, classTeacherOf: null, twoFactorEnabled: !!user.twoFactor?.enabled };
  if (user.role !== ROLES.TEACHER || !user.schoolId) return { ...base, classTeacherOf: null };
  return { ...base, classTeacherOf: await classTeacherOf(String(user.schoolId), String(user._id)) };
}

const invalidCredentials = () =>
  ApiError.unauthorized("INVALID_CREDENTIALS", "School code, email or password is incorrect.");

export async function issueTokens(user: UserDoc, info: ClientInfo) {
  const isPlatform = user.role === ROLES.SUPER_ADMIN;
  const accessToken = signAccessToken({
    sub: String(user._id),
    role: user.role as Role,
    schoolId: user.schoolId ? String(user.schoolId) : null,
    ...(user.mustChangePassword ? { mustChangePassword: true } : {}),
    // the platform owner must have 2-step verification before doing anything
    ...(isPlatform && !user.twoFactor?.enabled ? { mfaSetupRequired: true } : {}),
  });
  // platform owner sessions are much shorter than school users'
  const refresh = signRefreshToken(String(user._id), isPlatform ? env.platform.refreshExpiresIn : undefined);
  await RefreshTokenModel.create({
    userId: user._id,
    tokenHash: hashToken(refresh.token),
    client: info.client,
    userAgent: info.userAgent.slice(0, 300),
    expiresAt: refresh.expiresAt,
  });
  return {
    accessToken,
    refreshToken: refresh.token,
    tokenType: "Bearer" as const,
    expiresIn: accessTokenTtlSeconds(accessToken),
    refreshExpiresAt: refresh.expiresAt.toISOString(),
  };
}

/** Throws if the user or their school may not use the app right now */
function assertCanLogin(user: UserDoc, school: SchoolDoc | null) {
  if (school && school.status !== SCHOOL_STATUS.ACTIVE) {
    throw ApiError.forbidden("SCHOOL_SUSPENDED", "Your school's account is suspended. Please contact the school office.");
  }
  switch (user.status) {
    case USER_STATUS.ACTIVE:
      return;
    case USER_STATUS.PENDING:
      throw ApiError.forbidden("ACCOUNT_PENDING", "Your account is waiting for approval from the school.");
    case USER_STATUS.REJECTED:
      throw ApiError.forbidden("ACCOUNT_REJECTED", "Your registration was not approved. Please contact the school.");
    default:
      throw ApiError.forbidden("ACCOUNT_DISABLED", "Your account has been disabled. Please contact the school.");
  }
}

export const authService = {
  async login(input: LoginInput, info: ClientInfo) {
    // School users only. The platform owner signs in through /platform/auth/login.
    const school = await SchoolModel.findOne({ code: input.schoolCode });
    const user = school
      ? await UserModel.findOne({ schoolId: school._id, email: input.email }).select("+passwordHash")
      : null;

    const passwordOk = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordOk) throw invalidCredentials();

    if (input.role && input.role !== user.role) {
      throw ApiError.forbidden(
        "ROLE_MISMATCH",
        `This account is registered as ${ROLE_LABEL[user.role as Role]}. Please choose the ${ROLE_LABEL[user.role as Role]} option to sign in.`,
      );
    }

    assertCanLogin(user, school);

    user.lastLoginAt = new Date();
    await user.save();

    return { user: await sessionUser(user, school), tokens: await issueTokens(user, info) };
  },

  /** Exchange a refresh token for a new pair (the old one stops working). */
  async refresh(refreshToken: string, info: ClientInfo) {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await RefreshTokenModel.findOneAndDelete({ tokenHash: hashToken(refreshToken) });

    if (!stored) {
      // A valid-looking token that we no longer have = already used or logged out.
      // Could be a stolen token being replayed → log this user out everywhere.
      await RefreshTokenModel.deleteMany({ userId: payload.sub });
      throw ApiError.unauthorized("INVALID_REFRESH_TOKEN", "Session expired. Please log in again.");
    }

    const user = await UserModel.findById(stored.userId);
    if (!user) throw ApiError.unauthorized("INVALID_REFRESH_TOKEN", "Session expired. Please log in again.");
    const school = user.schoolId ? await SchoolModel.findById(user.schoolId) : null;
    assertCanLogin(user, school);

    return { user: await sessionUser(user, school), tokens: await issueTokens(user, info) };
  },

  /** Logs out this device only. Safe to call twice. */
  async logout(refreshToken: string) {
    await RefreshTokenModel.deleteOne({ tokenHash: hashToken(refreshToken) });
  },

  async me(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw ApiError.unauthorized("INVALID_TOKEN", "User no longer exists.");
    const school = user.schoolId ? await SchoolModel.findById(user.schoolId) : null;
    assertCanLogin(user, school);
    return sessionUser(user, school);
  },

  /**
   * Logged-in user changes their own password. Every other device is logged out
   * and a fresh token pair is returned for this one.
   */
  async changePassword(userId: string, input: ChangePasswordInput, info: ClientInfo) {
    const user = await UserModel.findById(userId).select("+passwordHash");
    if (!user) throw ApiError.unauthorized("INVALID_TOKEN", "User no longer exists.");

    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw ApiError.badRequest("WRONG_PASSWORD", "Current password is incorrect.", [
        { field: "currentPassword", message: "Current password is incorrect." },
      ]);
    }
    if (input.currentPassword === input.newPassword) {
      throw ApiError.badRequest("SAME_PASSWORD", "New password must be different from the current one.", [
        { field: "newPassword", message: "New password must be different from the current one." },
      ]);
    }

    await applyNewPassword(user, input.newPassword, { mustChange: false });
    const school = user.schoolId ? await SchoolModel.findById(user.schoolId) : null;
    return { user: await sessionUser(user, school), tokens: await issueTokens(user, info) };
  },

  /**
   * Emails a one-time reset link. Always answers the same way, so nobody can
   * find out which emails are registered.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<{ devResetToken?: string }> {
    // School users only — the platform owner recovers access from the server
    // (npm run super-admin -- reset-password ...), never by email.
    const school = await SchoolModel.findOne({ code: input.schoolCode });
    if (!school || school.status !== SCHOOL_STATUS.ACTIVE) return {};

    const user = await UserModel.findOne({ schoolId: school._id, email: input.email });
    if (!user || user.status !== USER_STATUS.ACTIVE) return {};

    // only the newest link works
    await PasswordResetModel.deleteMany({ userId: user._id });
    const token = crypto.randomBytes(32).toString("hex");
    await PasswordResetModel.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
    });

    const link = `${env.webAppUrl}/#/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Reset your InstituteOS password",
      text: [
        `Hello ${user.fullName},`,
        "",
        `We received a request to reset your password${school ? ` for ${school.name} (${school.code})` : ""}.`,
        `Open this link within ${RESET_TOKEN_TTL_MINUTES} minutes to choose a new password:`,
        link,
        "",
        "If you didn't ask for this, you can ignore this email — your password won't change.",
      ].join("\n"),
    });

    // lets Postman / local testing work without an email server
    return env.nodeEnv === "development" ? { devResetToken: token } : {};
  },

  /** Completes "forgot password" with the token from the email link. */
  async resetPassword(input: ResetPasswordInput) {
    const reset = await PasswordResetModel.findOneAndDelete({ tokenHash: hashToken(input.token) });
    if (!reset || reset.expiresAt < new Date()) {
      throw ApiError.badRequest("INVALID_RESET_TOKEN", "This reset link is invalid or has expired. Please request a new one.");
    }
    const user = await UserModel.findById(reset.userId);
    if (!user) throw ApiError.badRequest("INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");

    await applyNewPassword(user, input.newPassword, { mustChange: false });
  },
};

/**
 * Sets a password, logs the user out of every device and clears/sets the
 * "must change password" flag. Used by change/reset and by admins.
 */
export async function applyNewPassword(user: UserDoc, plain: string, opts: { mustChange: boolean }) {
  user.passwordHash = await hashPassword(plain);
  user.mustChangePassword = opts.mustChange;
  user.passwordChangedAt = new Date();
  await user.save();
  await Promise.all([
    RefreshTokenModel.deleteMany({ userId: user._id }),
    PasswordResetModel.deleteMany({ userId: user._id }),
  ]);
}
