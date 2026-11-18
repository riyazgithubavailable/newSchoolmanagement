import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { ROLES, USER_STATUS, type Role } from "../../constants/roles.js";
import { ApiError } from "../../utils/ApiError.js";
import { SCHOOL_STATUS, SchoolModel, type SchoolDoc } from "../schools/school.model.js";
import { UserModel, type UserDoc } from "../users/user.model.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
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
  };
}

const invalidCredentials = () =>
  ApiError.unauthorized("INVALID_CREDENTIALS", "School code, email or password is incorrect.");

async function issueTokens(user: UserDoc, info: ClientInfo) {
  const accessToken = signAccessToken({
    sub: String(user._id),
    role: user.role as Role,
    schoolId: user.schoolId ? String(user.schoolId) : null,
  });
  const refresh = signRefreshToken(String(user._id));
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
  /** Self sign-up for Teacher / Parent / Student. Account stays PENDING until approved. */
  async register(input: RegisterInput) {
    const school = await SchoolModel.findOne({ code: input.schoolCode });
    if (!school || school.status !== SCHOOL_STATUS.ACTIVE) {
      throw ApiError.notFound("SCHOOL_NOT_FOUND", "No active school found with this school code.");
    }

    const exists = await UserModel.exists({ schoolId: school._id, email: input.email });
    if (exists) {
      throw ApiError.conflict("EMAIL_TAKEN", "An account with this email already exists in this school.");
    }

    const user = await UserModel.create({
      schoolId: school._id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      status: USER_STATUS.PENDING,
    });

    return toPublicUser(user, school);
  },

  async login(input: LoginInput, info: ClientInfo) {
    let school: SchoolDoc | null = null;
    if (input.schoolCode) {
      school = await SchoolModel.findOne({ code: input.schoolCode });
    }

    // No school code → only the platform super admin can log in
    const user =
      input.schoolCode && !school
        ? null
        : await UserModel.findOne(
            school
              ? { schoolId: school._id, email: input.email }
              : { schoolId: null, email: input.email, role: ROLES.SUPER_ADMIN },
          ).select("+passwordHash");

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

    return { user: toPublicUser(user, school), tokens: await issueTokens(user, info) };
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

    return { user: toPublicUser(user, school), tokens: await issueTokens(user, info) };
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
    return toPublicUser(user, school);
  },
};
