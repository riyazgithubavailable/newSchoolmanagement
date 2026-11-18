# InstituteOS Backend

REST API for the school management system — used by both the React web app and the Kotlin Android app.

**Stack:** Node.js (≥ 20) · Express 5 · TypeScript · MongoDB Atlas (Mongoose)

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then put your Atlas connection string in MONGODB_URI
npm run dev               # starts on http://localhost:5000 with auto-reload
```

Check it works: open http://localhost:5000/api/v1/health — `"database": "connected"` means MongoDB is connected.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run with auto-reload (development) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build (production) |
| `npm run typecheck` | Type-check without building |

## Atlas checklist
- **Security → Database Access:** each developer has their own database user.
- **Security → Network Access:** add your current IP address.
- Never commit `.env` (it is git-ignored). Only `.env.example` goes to git.

## API conventions (web + mobile)
- All routes are under `/api/v1`.
- Success: `{ "success": true, "data": ... }` · Error: `{ "success": false, "error": { "code", "message" } }`

## Platform owner account
```bash
npm run create-super-admin -- --email you@company.com --name "Your Name"   # asks for the password
```
Use this on production. `npm run seed` is development-only.

## First run: demo data

```bash
npm run seed
```
Creates (only if missing) the platform super admin, demo school **DEMO01** and its principal:

| Account | School code | Email | Password |
|---|---|---|---|
| Super Admin | *(none)* | superadmin@instituteos.local | SuperAdmin@123 |
| Principal | DEMO01 | principal@demo.school | Principal@123 |

Change these before going live (see `SEED_*` in `.env.example`).

## Postman
Import `postman/InstituteOS.postman_collection.json`. Run **Login** first — the access/refresh tokens are saved
into collection variables and used by every other request automatically.

## Auth API (`/api/v1/auth`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/login` | – | `{ schoolCode, email, password, role? }` → `{ user, tokens }`. Super admin omits `schoolCode`. |
| POST | `/refresh` | – | `{ refreshToken }` → new token pair. The old refresh token stops working. |
| POST | `/logout` | – | `{ refreshToken }` → logs out this device only. |
| GET | `/me` | Bearer | Current user. |

## Users API (`/api/v1/users`) — Principal / Admin only

| Method | Path | Purpose |
|---|---|---|
| GET | `/?status=PENDING&role=TEACHER&search=&page=1&limit=20` | List accounts of **your** school |
| PATCH | `/:id/status` | `{ "status": "ACTIVE" \| "REJECTED" \| "DISABLED" }` — approve / reject / disable |

## Notes for web & Android clients
- Send `Authorization: Bearer <accessToken>` and `X-Client: web` / `X-Client: android`.
- Access token lives **15 min** (`expiresIn` seconds in the login response). On `401 TOKEN_EXPIRED`, call
  `/auth/refresh` once and retry the request.
- Only **one refresh call at a time** per device: a refresh token works exactly once. Re-using an old one is
  treated as theft and logs the user out on all devices.
- Error codes to handle on the login screen: `INVALID_CREDENTIALS`, `ROLE_MISMATCH`, `ACCOUNT_PENDING`,
  `ACCOUNT_REJECTED`, `ACCOUNT_DISABLED`, `SCHOOL_SUSPENDED`, `TOO_MANY_ATTEMPTS`, `VALIDATION_ERROR`
  (field errors in `error.details`).

## Schools API (`/api/v1/schools`) — Super Admin only

| Method | Path | Purpose |
|---|---|---|
| POST | `/` | `{ school: { name, code, email?, phone?, address? }, principal: { fullName, email, phone?, password } }` — creates the school **and** an ACTIVE principal |
| GET | `/?status=ACTIVE&search=&page=1&limit=20` | List with principals, user counts; `meta.summary` = platform totals |
| GET | `/:id` | One school |
| PATCH | `/:id/status` | `{ "status": "ACTIVE" \| "SUSPENDED" }` — suspending logs every user of that school out |
| POST | `/:id/principals` | Add another principal account |

School codes are 3–12 letters/numbers/dashes, stored upper-case, unique across the platform.

## School setup & staff (Principal / Admin)
See [docs/05-api.md](../docs/05-api.md) or http://localhost:5000/api/docs — `/school/*` and `/staff`.
