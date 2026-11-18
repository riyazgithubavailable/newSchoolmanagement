# 05 — API guide (web & Android)

**Interactive docs:** `http://localhost:5000/api/docs` · **OpenAPI JSON:** `/api/docs.json`
(import into Postman, or generate Kotlin models with *openapi-generator*). A ready Postman collection
is in `backend/postman/`.

## Conventions
- Base URL: `/api/v1`. Breaking changes will go to `/api/v2`; old app versions keep working.
- Send `Content-Type: application/json`, `Authorization: Bearer <accessToken>`, and
  `X-Client: web` or `X-Client: android`.
- Success: `{ "success": true, "data": ..., "message"?: "...", "meta"?: { page, limit, total, totalPages } }`
- Error: `{ "success": false, "error": { "code": "EMAIL_TAKEN", "message": "...", "details"?: [{ "field", "message" }] } }`
- Switch on `error.code` (stable); `message` is already user-friendly English.
- Dates are ISO-8601 UTC strings. Enum values are `UPPER_SNAKE` (`TEACHER`, `PENDING`).
- Lists: `?page=1&limit=20&search=...`.

## Token rules for clients
1. Save `accessToken` and `refreshToken` after login.
2. On `401 TOKEN_EXPIRED`: call `POST /auth/refresh` with the refresh token **once** (queue other requests
   meanwhile), save the new pair, retry.
3. If refresh fails → go to the login screen.
4. If `user.mustChangePassword` is true (or any call returns `403 PASSWORD_CHANGE_REQUIRED`) → show the
   change-password screen.
5. On logout call `POST /auth/logout` with the refresh token.

## Endpoints

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | self sign-up (TEACHER/PARENT/STUDENT) → PENDING |
| POST | `/auth/login` | – | `{ schoolCode?, email, password, role? }` → `{ user, tokens }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` → new pair |
| POST | `/auth/logout` | – | `{ refreshToken }` |
| GET | `/auth/me` | Bearer | current user |
| POST | `/auth/change-password` | Bearer | `{ currentPassword, newPassword }` → new tokens |
| POST | `/auth/forgot-password` | – | `{ schoolCode?, email }` → always 200 |
| POST | `/auth/reset-password` | – | `{ token, newPassword }` |

### Users (Principal / Admin)
| Method | Path | Purpose |
|---|---|---|
| GET | `/users?status=&role=&search=&page=&limit=` | accounts of your school |
| PATCH | `/users/:id/status` | `{ status: ACTIVE \| REJECTED \| DISABLED }` |
| POST | `/users/:id/reset-password` | `{ newPassword }` temporary password |

### Schools (Super Admin)
| Method | Path | Purpose |
|---|---|---|
| POST | `/schools` | `{ school: {...}, principal: {...} }` |
| GET | `/schools?status=&search=&page=&limit=` | list; `meta.summary` = totals |
| GET | `/schools/:id` | one school |
| PATCH | `/schools/:id/status` | `{ status: ACTIVE \| SUSPENDED }` |
| POST | `/schools/:id/principals` | add a principal |
| POST | `/schools/:id/principals/:userId/reset-password` | temporary password |

## Error codes
| Code | When |
|---|---|
| `VALIDATION_ERROR` | bad input — see `details[].field` |
| `INVALID_CREDENTIALS` | wrong school code / email / password |
| `ROLE_MISMATCH` | account exists but under another role |
| `ACCOUNT_PENDING` / `ACCOUNT_REJECTED` / `ACCOUNT_DISABLED` | account state |
| `SCHOOL_SUSPENDED` | school suspended by the platform |
| `UNAUTHORIZED` / `INVALID_TOKEN` / `TOKEN_EXPIRED` | access token problems |
| `INVALID_REFRESH_TOKEN` | session over → sign in again |
| `PASSWORD_CHANGE_REQUIRED` | temporary password must be changed |
| `WRONG_PASSWORD` / `SAME_PASSWORD` | change-password problems |
| `INVALID_RESET_TOKEN` | reset link expired/used |
| `FORBIDDEN` | role not allowed |
| `EMAIL_TAKEN` / `SCHOOL_CODE_TAKEN` | duplicates |
| `SCHOOL_NOT_FOUND` / `USER_NOT_FOUND` / `NOT_FOUND` | missing records/routes |
| `TOO_MANY_ATTEMPTS` / `TOO_MANY_REQUESTS` | rate limit hit |
| `INTERNAL_ERROR` | server bug — check the backend log |
