// OpenAPI 3.1 description of the API, served at /api/docs (Swagger UI) and
// /api/docs.json (import into Postman, or generate Kotlin/TS models from it).
// Request bodies are generated from the same Zod schemas the API validates
// with, so the docs can't drift from the real rules.

import { z, type ZodType } from "zod";
import { ALL_ROLES, USER_STATUS } from "../constants/roles.js";
import {
  adminSetPasswordSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from "../modules/auth/auth.schemas.js";
import { createSchoolSchema, principalInput, schoolStatusSchema } from "../modules/schools/schools.schemas.js";

type Json = Record<string, unknown>;

const schema = (s: ZodType): Json => {
  const { $schema: _drop, ...rest } = z.toJSONSchema(s, { io: "input", unrepresentable: "any" }) as Json;
  return rest;
};

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const ok = (description: string, data: Json | null, extra: Json = {}) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean", const: true },
          message: { type: "string" },
          data: data ?? { type: "null" },
          ...extra,
        },
      },
    },
  },
});

const err = (description: string, codes: string[]) => ({
  description: `${description} — error.code: ${codes.join(", ")}`,
  content: { "application/json": { schema: ref("Error") } },
});

const body = (s: ZodType, example?: Json) => ({
  required: true,
  content: { "application/json": { schema: schema(s), ...(example ? { example } : {}) } },
});

const idParam = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string", pattern: "^[a-f0-9]{24}$" },
  description,
});

const secured = [{ bearerAuth: [] }];
const validation = err("Invalid input (see error.details for each field)", ["VALIDATION_ERROR"]);
const unauthorized = err("Missing / invalid / expired access token", ["UNAUTHORIZED", "INVALID_TOKEN", "TOKEN_EXPIRED"]);
const forbidden = err("Not allowed", ["FORBIDDEN", "PASSWORD_CHANGE_REQUIRED"]);

const listQuery = (extra: Json[] = []) => [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  { name: "search", in: "query", schema: { type: "string" } },
  ...extra,
];

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "InstituteOS API",
    version: "1.0.0",
    description: [
      "REST API for the InstituteOS school management platform — used by the web app and the Android app.",
      "",
      "**Auth:** call `POST /auth/login`, then send `Authorization: Bearer <accessToken>`. Access tokens live 15 minutes;",
      "on `401 TOKEN_EXPIRED` call `POST /auth/refresh` **once** and retry. A refresh token works only once.",
      "",
      "**Clients** should send `X-Client: web` or `X-Client: android`.",
      "",
      "**Temporary passwords:** if `user.mustChangePassword` is true, every endpoint except `/auth/me` and",
      "`/auth/change-password` returns `403 PASSWORD_CHANGE_REQUIRED`.",
      "",
      "**Responses:** success → `{ success: true, data, message?, meta? }`; error → `{ success: false, error: { code, message, details? } }`.",
    ].join("\n"),
  },
  servers: [{ url: "/api/v1", description: "This server" }],
  tags: [
    { name: "Health" },
    { name: "Auth", description: "Sign in, tokens and passwords" },
    { name: "Users", description: "Accounts inside a school — Principal / Admin only" },
    { name: "Schools", description: "Platform owner (SUPER_ADMIN) only" },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", const: false },
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", examples: ["INVALID_CREDENTIALS"] },
              message: { type: "string" },
              details: {
                type: "array",
                items: { type: "object", properties: { field: { type: "string" }, message: { type: "string" } } },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          fullName: { type: "string" },
          email: { type: "string" },
          phone: { type: ["string", "null"] },
          role: { type: "string", enum: ALL_ROLES },
          status: { type: "string", enum: Object.values(USER_STATUS) },
          schoolId: { type: ["string", "null"] },
          school: {
            oneOf: [
              { type: "null" },
              { type: "object", properties: { id: { type: "string" }, code: { type: "string" }, name: { type: "string" } } },
            ],
          },
          lastLoginAt: { type: ["string", "null"], format: "date-time" },
          mustChangePassword: { type: "boolean" },
        },
      },
      Tokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          tokenType: { type: "string", const: "Bearer" },
          expiresIn: { type: "integer", description: "seconds until the access token expires" },
          refreshExpiresAt: { type: "string", format: "date-time" },
        },
      },
      Session: { type: "object", properties: { user: ref("User"), tokens: ref("Tokens") } },
      School: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          code: { type: "string" },
          email: { type: ["string", "null"] },
          phone: { type: ["string", "null"] },
          address: { type: ["string", "null"] },
          status: { type: "string", enum: ["ACTIVE", "SUSPENDED"] },
          createdAt: { type: ["string", "null"], format: "date-time" },
          principals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                fullName: { type: "string" },
                email: { type: "string" },
                phone: { type: ["string", "null"] },
                status: { type: "string" },
                lastLoginAt: { type: ["string", "null"] },
              },
            },
          },
          userCounts: {
            type: "object",
            properties: Object.fromEntries(
              ["total", "principals", "admins", "teachers", "students", "parents", "pending"].map((k) => [k, { type: "integer" }]),
            ),
          },
        },
      },
      PageMeta: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Server and database status",
        responses: { 200: ok("Healthy", { type: "object" }), 503: { description: "Database not connected" } },
      },
    },

    /* ------------------------------- Auth ------------------------------ */
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Self sign-up (Teacher / Parent / Student) — account stays PENDING until approved",
        requestBody: body(registerSchema, {
          schoolCode: "DEMO01",
          fullName: "Neha Verma",
          email: "neha@demo.school",
          password: "Teacher123",
          role: "TEACHER",
        }),
        responses: {
          201: ok("Created", { type: "object", properties: { user: ref("User") } }),
          400: validation,
          404: err("Unknown school code", ["SCHOOL_NOT_FOUND"]),
          409: err("Email already used in this school", ["EMAIL_TAKEN"]),
          429: err("Too many sign-ups", ["TOO_MANY_REQUESTS"]),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in (omit schoolCode for the platform super admin)",
        requestBody: body(loginSchema, {
          schoolCode: "DEMO01",
          email: "principal@demo.school",
          password: "Principal@123",
          role: "PRINCIPAL",
        }),
        responses: {
          200: ok("Signed in", ref("Session")),
          400: validation,
          401: err("Wrong school code / email / password", ["INVALID_CREDENTIALS"]),
          403: err("Can't sign in", ["ROLE_MISMATCH", "ACCOUNT_PENDING", "ACCOUNT_REJECTED", "ACCOUNT_DISABLED", "SCHOOL_SUSPENDED"]),
          429: err("Too many failed attempts", ["TOO_MANY_ATTEMPTS"]),
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Exchange a refresh token for a new pair (the old one stops working)",
        requestBody: body(refreshSchema),
        responses: { 200: ok("New tokens", ref("Session")), 401: err("Refresh token invalid / reused", ["INVALID_REFRESH_TOKEN"]) },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Sign out this device",
        requestBody: body(refreshSchema),
        responses: { 200: ok("Signed out", null) },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Current user (also allowed while a password change is required)",
        security: secured,
        responses: { 200: ok("Current user", { type: "object", properties: { user: ref("User") } }), 401: unauthorized },
      },
    },
    "/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change own password — signs out other devices and returns new tokens",
        security: secured,
        requestBody: body(changePasswordSchema, { currentPassword: "Temp12345", newPassword: "MyNewPass1" }),
        responses: {
          200: ok("Changed", ref("Session")),
          400: err("Rejected", ["VALIDATION_ERROR", "WRONG_PASSWORD", "SAME_PASSWORD"]),
          401: unauthorized,
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Email a password reset link (always answers 200)",
        description: "In development (NODE_ENV=development) the response also contains `devResetToken` for testing.",
        requestBody: body(forgotPasswordSchema, { schoolCode: "DEMO01", email: "teacher@demo.school" }),
        responses: { 200: ok("Accepted", { type: "object", properties: { devResetToken: { type: "string" } } }), 400: validation },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Set a new password with the token from the email link",
        requestBody: body(resetPasswordSchema),
        responses: { 200: ok("Updated", null), 400: err("Invalid / expired link", ["INVALID_RESET_TOKEN", "VALIDATION_ERROR"]) },
      },
    },

    /* ------------------------------- Users ----------------------------- */
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List accounts of your school",
        security: secured,
        parameters: listQuery([
          { name: "status", in: "query", schema: { type: "string", enum: Object.values(USER_STATUS) } },
          { name: "role", in: "query", schema: { type: "string", enum: ALL_ROLES } },
        ]),
        responses: {
          200: ok("Users", { type: "array", items: ref("User") }, { meta: ref("PageMeta") }),
          401: unauthorized,
          403: forbidden,
        },
      },
    },
    "/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Approve / reject / disable an account",
        security: secured,
        parameters: [idParam("id", "User id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["status"], properties: { status: { enum: ["ACTIVE", "REJECTED", "DISABLED"] } } },
              example: { status: "ACTIVE" },
            },
          },
        },
        responses: {
          200: ok("Updated", ref("User")),
          403: err("Not allowed", ["FORBIDDEN", "CANNOT_CHANGE_SELF"]),
          404: err("Not in your school", ["USER_NOT_FOUND"]),
        },
      },
    },
    "/users/{id}/reset-password": {
      post: {
        tags: ["Users"],
        summary: "Set a temporary password (user must change it at next sign in)",
        security: secured,
        parameters: [idParam("id", "User id")],
        requestBody: body(adminSetPasswordSchema, { newPassword: "TempPass11" }),
        responses: { 200: ok("Done", ref("User")), 403: forbidden, 404: err("Not in your school", ["USER_NOT_FOUND"]) },
      },
    },

    /* ------------------------------ Schools ---------------------------- */
    "/schools": {
      post: {
        tags: ["Schools"],
        summary: "Create a school and its first principal",
        security: secured,
        requestBody: body(createSchoolSchema, {
          school: { name: "Delhi Public School", code: "DPS01", phone: "9876543210", address: "Bhubaneswar" },
          principal: { fullName: "Anita Rao", email: "principal@dps.edu", password: "Principal123" },
        }),
        responses: {
          201: ok("Created", ref("School")),
          400: validation,
          403: forbidden,
          409: err("Duplicate", ["SCHOOL_CODE_TAKEN", "EMAIL_TAKEN"]),
        },
      },
      get: {
        tags: ["Schools"],
        summary: "List schools (meta.summary has platform totals)",
        security: secured,
        parameters: listQuery([{ name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "SUSPENDED"] } }]),
        responses: { 200: ok("Schools", { type: "array", items: ref("School") }, { meta: ref("PageMeta") }), 403: forbidden },
      },
    },
    "/schools/{id}": {
      get: {
        tags: ["Schools"],
        summary: "One school",
        security: secured,
        parameters: [idParam("id", "School id")],
        responses: { 200: ok("School", ref("School")), 404: err("Not found", ["SCHOOL_NOT_FOUND"]) },
      },
    },
    "/schools/{id}/status": {
      patch: {
        tags: ["Schools"],
        summary: "Suspend (logs every user out) or activate a school",
        security: secured,
        parameters: [idParam("id", "School id")],
        requestBody: body(schoolStatusSchema, { status: "SUSPENDED" }),
        responses: { 200: ok("Updated", ref("School")), 404: err("Not found", ["SCHOOL_NOT_FOUND"]) },
      },
    },
    "/schools/{id}/principals": {
      post: {
        tags: ["Schools"],
        summary: "Add another principal account",
        security: secured,
        parameters: [idParam("id", "School id")],
        requestBody: body(principalInput),
        responses: { 201: ok("Created", ref("School")), 409: err("Duplicate email", ["EMAIL_TAKEN"]) },
      },
    },
    "/schools/{id}/principals/{userId}/reset-password": {
      post: {
        tags: ["Schools"],
        summary: "Set a temporary password for a principal",
        security: secured,
        parameters: [idParam("id", "School id"), idParam("userId", "Principal's user id")],
        requestBody: body(adminSetPasswordSchema, { newPassword: "TempPass22" }),
        responses: { 200: ok("Done", null), 404: err("Not found", ["SCHOOL_NOT_FOUND", "USER_NOT_FOUND"]) },
      },
    },
  },
};
