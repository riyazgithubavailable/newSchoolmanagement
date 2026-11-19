# InstituteOS Platform Admin

Private console for the **platform owner** (SUPER_ADMIN): onboard schools and their principals,
suspend / activate schools, reset principal passwords, and read the audit log.

It is a separate project from the school app (`../frontend`) and must be deployed on its own
address (e.g. `admin.yourdomain.com`). Nothing links to it; `noindex` and `robots.txt` keep it out
of search engines.

## Run

```bash
cd platform-admin
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api/v1
npm run dev               # http://localhost:8081
```

The backend must be running (`cd ../backend && npm run dev`).

## First sign-in

1. Email + password of a platform owner account.
   Development: `superadmin@instituteos.local` / `SuperAdmin@123` (created by `npm run seed` in the backend).
   Real accounts: `cd ../backend && npm run super-admin -- create --email you@company.com --name "Your Name"`.
2. Install Google Authenticator / Microsoft Authenticator / Authy, scan the QR code, type the 6-digit code.
   2-step verification is mandatory; after that every sign-in asks for the code.

Forgot password or lost phone → on the server:
`npm run super-admin -- reset-password --email ...` / `npm run super-admin -- reset-2fa --email ...`

## Security
- Separate API: `/api/v1/platform/*` (the school login never accepts the platform owner)
- 2-step verification (TOTP), codes can't be replayed, secrets encrypted in the database
- 5 failed attempts / 15 minutes, 1-day sessions kept only until the browser closes
- Optional IP allowlist on the backend: `PLATFORM_ALLOWED_IPS`
- Every sign-in and change is recorded in the audit log

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on port 8081 |
| `npm run build` | type-check + production build to `dist/` |
| `npm test` | tests (network mocked) |

## Structure

```
src/
  App.tsx              routes + top bar
  main.tsx
  lib/                 api client (token refresh), session (sessionStorage), utils
  api/                 platformApi (login, 2FA, audit) · schoolsApi
  auth/PlatformAuth    session context + route guards
  hooks/useSchools     TanStack Query hooks
  components/          PageKit UI, credentials box
  pages/               PlatformLogin · SetupTwoFactor · SchoolsPage · AuditLogPage
  test/
```

When deploying, add this app's address to the backend `CORS_ORIGIN`.
