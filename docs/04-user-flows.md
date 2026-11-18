# 04 — User flows

## Creating the platform owner (once)
Super admins are created only from the server terminal:
`npm run create-super-admin -- --email you@company.com --name "Your Name"` (see [02-setup](02-setup.md)).

## Onboarding a new school (platform owner)
1. Sign in → login page → **Platform owner? Sign in here** (no school code).
2. **Schools → Add School**: school name, code (suggested from the name, e.g. *Delhi Public School* → `DPS`),
   contact details, and the principal's name, email and a generated password.
3. A box shows the login details — **Copy details** and send them to the principal. The password is not
   shown again.
4. The school code is permanent; users type it at every sign in.

## Principal's first sign in
1. Signs in with the school code, email and the password received.
2. Because someone else chose that password, the app opens **Set your own password** and nothing else
   works until it's changed (enforced by the API too).
3. After saving, other devices are signed out and the dashboard opens.

## Self sign-up (Teacher / Student / Parent)
1. Login page → **Create an account** → role, name, school code, email, password.
2. The account is created as **PENDING**; signing in shows *waiting for approval*.
3. Principal or Admin approves (`ACTIVE`) or rejects it.

> Planned change (Phase 2–3): staff will be added by the principal/admin, and parent accounts will be
> created/linked from student admissions. Self sign-up will stay only with verification.

## Forgot password
1. Login → **Forgot password?** → school code + email (platform owner: no school code).
2. The answer is always the same, so nobody can discover registered emails.
3. An email with a link valid for **30 minutes** is sent (in development it is printed in the backend
   terminal, and the page shows a *dev only* link).
4. The link opens **Choose a new password**; afterwards all devices are signed out.

## Password reset by an administrator
| Who | Can reset | Result |
|---|---|---|
| Principal | anyone in their school | temporary password, user must change it |
| Admin | anyone except principals | same |
| Platform owner | a school's principal (Schools → details → Reset password) | same |

## Changing your own password
Header menu → **Change Password** (teachers also in *My Profile → Security*). Other devices are
signed out; this one stays signed in.

## Suspending a school
Schools page → ⏸. Every user of that school is signed out at once and sees
*"Your school's account is suspended"* when signing in. ▶ re-activates it.
