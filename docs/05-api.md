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
| POST | `/auth/login` | – | `{ schoolCode?, email, password, role? }` → `{ user, tokens }` |
| POST | `/auth/refresh` | – | `{ refreshToken }` → new pair |
| POST | `/auth/logout` | – | `{ refreshToken }` |
| GET | `/auth/me` | Bearer | current user |
| POST | `/auth/change-password` | Bearer | `{ currentPassword, newPassword }` → new tokens |
| POST | `/auth/forgot-password` | – | `{ schoolCode?, email }` → always 200 |
| POST | `/auth/reset-password` | – | `{ token, newPassword }` |

### School setup (Principal / Admin) — `/school`
| Method | Path | Purpose |
|---|---|---|
| GET | `/school/overview` | counts + setup checklist |
| GET / PATCH | `/school/profile` | school profile (PATCH: principal only) |
| GET / POST | `/school/academic-years` | list / add (first becomes current) |
| POST | `/school/academic-years/:id/set-current` | switch current year |
| DELETE | `/school/academic-years/:id` | delete unused, non-current year |
| GET | `/school/class-templates` | ready-made class lists |
| GET / POST | `/school/classes` | classes with sections, class teachers / add a class |
| POST | `/school/classes/from-template` | `{ templateId, sections }` |
| PATCH / DELETE | `/school/classes/:id` | edit / delete (only if unused) |
| POST | `/school/sections` | `{ classId, name, roomNo? }` |
| PATCH / DELETE | `/school/sections/:id` | edit / delete (only if unused) |
| PUT | `/school/sections/:id/class-teacher` | `{ teacherId }` or `{ teacherId: null }` |
| GET | `/school/subject-suggestions` | common subject names |
| GET / POST | `/school/subjects` | list / add one |
| POST | `/school/subjects/bulk` | `{ names: [...] }` |
| PATCH / DELETE | `/school/subjects/:id` | rename / delete (only if unused) |
| GET | `/school/assignments?sectionId=&teacherId=` | subject teachers (current year) |
| PUT | `/school/assignments` | `{ sectionId, subjectId, teacherId }` assign or replace |
| DELETE | `/school/assignments/:id` | remove |

### Staff (Principal / Admin)
| Method | Path | Purpose |
|---|---|---|
| GET | `/staff?role=&status=&search=` | principals, admins, teachers with class-teacher info |
| POST | `/staff` | create TEACHER (or ADMIN — principal only) with a temporary password |
| PATCH | `/staff/:id` | name, phone, HR details |

Teachers' `/auth/login` and `/auth/me` responses include `user.classTeacherOf` (or `null`).

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
| `EMAIL_TAKEN` / `SCHOOL_CODE_TAKEN` / `EMPLOYEE_ID_TAKEN` / `DUPLICATE` | duplicates |
| `IN_USE` | can't delete — still used (assignments, class teacher...) |
| `NO_ACADEMIC_YEAR` | add / set a current academic year first |
| `ALREADY_CLASS_TEACHER` / `TEACHER_NOT_ACTIVE` / `TEACHER_NOT_FOUND` | class/subject teacher rules |
| `SCHOOL_NOT_FOUND` / `USER_NOT_FOUND` / `NOT_FOUND` | missing records/routes |
| `TOO_MANY_ATTEMPTS` / `TOO_MANY_REQUESTS` | rate limit hit |
| `INTERNAL_ERROR` | server bug — check the backend log |
