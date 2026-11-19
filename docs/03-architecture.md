# 03 — Architecture

## Backend request flow

```
HTTP request
  → cors, express.json
  → /api/v1 router → module router (public | auth | users | platform | school | staff)
      → rate limit (login, password reset)
      → requireAuth        verifies the JWT, blocks users who must change their password
      → requireRole(...)   e.g. PRINCIPAL, ADMIN
      → validate(schema)   Zod: trims, lower-cases emails, rejects bad input with field errors
      → handler → service  business rules + MongoDB
  → sendSuccess()  { success: true, data, message?, meta? }
  → errorHandler   { success: false, error: { code, message, details? } }
```

Each feature lives in `backend/src/modules/<feature>/`:

| File | Purpose |
|---|---|
| `*.model.ts` | Mongoose schema |
| `*.schemas.ts` | Zod input rules (also used to generate the API docs) |
| `*.service.ts` | business logic, no Express objects |
| `*.routes.ts` / `*.controller.ts` | HTTP layer |

## Multi-school isolation (very important)
- Every school-owned document has `schoolId`.
- The access token carries the user's `schoolId`; `currentSchoolId(req)` reads it.
- **Every query on school data must include `schoolId: currentSchoolId(req)`.** Example:
  `UserModel.findOne({ _id: id, schoolId: currentSchoolId(req) })` — a principal of school B gets
  `404` for a user of school A.
- Tests in `backend/tests` check this for every feature.

## Authentication

| Item | Detail |
|---|---|
| Passwords | bcrypt (12 rounds in production) |
| Access token | JWT, 15 minutes, payload `{ sub, role, schoolId, mustChangePassword? }` |
| Refresh token | JWT, 30 days, **stored as a SHA-256 hash** in `refreshtokens` (one per device), rotated on every use |
| Token reuse | presenting an already-used refresh token logs the user out on all devices (theft protection) |
| Temporary passwords | accounts created/reset by someone else get `mustChangePassword: true`; the API answers `403 PASSWORD_CHANGE_REQUIRED` everywhere except `/auth/me` and `/auth/change-password` |
| Password reset | random 32-byte token, SHA-256 hash stored, valid 30 minutes, single use, newest link only |
| Suspension | suspending a school or disabling a user deletes their refresh tokens immediately |

## Platform owner security
| Layer | What |
|---|---|
| Separate app | Platform Admin is its own project (`platform-admin/`) and deployment, `noindex` + `robots.txt`; the school app contains none of its code |
| Separate API | `/api/v1/platform/*`; the school `/auth/login` never accepts a super admin (school code required) |
| 2-step verification | TOTP (RFC 6238, Google Authenticator compatible). Mandatory: until it's set up the session gets `403 MFA_SETUP_REQUIRED` everywhere except 2FA setup |
| Secret storage | 2FA secrets AES-256-GCM encrypted (`ENCRYPTION_KEY`); a used code can't be replayed (`twoFactor.lastUsedStep`) |
| Login challenge | after the password a 5-minute `challengeToken` (different JWT audience) — it is not an access token |
| Limits | 5 failed attempts / 15 min per IP; refresh token 1 day; session in sessionStorage only |
| IP allowlist | `PLATFORM_ALLOWED_IPS` — other IPs get a plain 404 |
| Recovery | password / 2FA reset only via `npm run super-admin` on the server, never by email |
| Audit log | `auditlogs`: sign-ins (success/failure), 2FA, school created/suspended, principal added/reset — with IP and user agent |

## Collections (so far)

| Collection | Key fields |
|---|---|
| `schools` | `name`, `code` (unique), `status` (ACTIVE/SUSPENDED) |
| `users` | `schoolId` (null for super admin), `email` (unique per school), `role`, `status` (PENDING/ACTIVE/REJECTED/DISABLED), `passwordHash`, `mustChangePassword` |
| `refreshtokens` | `userId`, `tokenHash`, `client` (web/android), `expiresAt` (TTL) |
| `passwordresets` | `userId`, `tokenHash`, `expiresAt` (TTL) |
| `auditlogs` | `actorId`, `actorEmail`, `action`, `schoolId`, `targetType`, `targetId`, `details`, `ip`, `userAgent`, `createdAt` |
| `academicyears` | `schoolId`, `name` ("2026-27", unique per school), `startDate`, `endDate`, `isCurrent` (one per school) |
| `classes` | `schoolId`, `name`, `order`, `stream` (11–12) — unique (`name`, `stream`) per school |
| `sections` | `schoolId`, `classId`, `name` ("A"), `roomNo`, `classTeacherId` (unique per school: one section per teacher) |
| `subjects` | `schoolId`, `name` (unique per school), `code` |
| `teachingassignments` | `schoolId`, `academicYearId`, `sectionId`, `subjectId`, `teacherId` — one teacher per subject per section per year |

`users.staffProfile` holds HR details for staff (`employeeId` unique per school, designation, qualification,
gender, joining date).

## Frontend structure

```
pages / components  →  hooks (TanStack Query)  →  services  →  lib/api.ts  →  API
```

- `lib/api.ts` adds the bearer token, unwraps `{ success, data }`, throws `ApiError(code, message, details)`
  and, on `401 TOKEN_EXPIRED`, refreshes **once** (shared by parallel requests) and retries.
- `lib/auth.ts` stores the session (localStorage with *Stay signed in*, otherwise sessionStorage).
- `contexts/AuthContext.tsx` exposes `user`, `login`, `logout`, `changePassword`, and
  re-checks `/auth/me` on start-up (catches disabled accounts / suspended schools).
- `routes/guards.tsx`: `RequireRole`, `RequireClassTeacher`, `RequireLogin`, `PublicOnly`; any user with a
  temporary password is sent to `/change-password`.
- **Mock vs real:** auth, passwords, the Schools page and the whole principal/admin section use the real API. Teacher pages still read
  `services/teacherService.ts`, which returns mock data from `mock/db.ts`; every function has a
  `TODO(API)` note naming the endpoint that will replace it.
