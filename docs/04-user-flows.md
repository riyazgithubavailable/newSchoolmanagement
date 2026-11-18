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

## Setting up the school (principal / office admin)
After the first sign in the dashboard shows a **setup checklist**; each step links to the right page.

1. **School profile** (*School Setup → School Profile*, principal only) — board, phone, address, affiliation no.
2. **Academic year** — e.g. `2026-27`, 1 Apr – 31 Mar. The first year added becomes *current*.
3. **Classes & sections** — *Add from template* (Pre-primary, Primary, up to 8 / 10 / 12, Class 1–10, 1–12)
   and choose sections (A, B...). Use *Custom class* for streams (Class 11 Science). Every class has an
   *order* number (Nursery 1 … Class 12 = 15) used for sorting and next year's promotion.
4. **Subjects** — tap suggestions or type your own.
5. **Staff** — *Add Staff*: name, email, role (Teacher; *Office admin* only for the principal), HR details.
   A temporary password is generated; the login details box appears once — copy and send it.
   The person must choose their own password at first sign in.
6. **Class teachers** — *Class & Subject Teachers* → pick a section → choose its class teacher
   (one section per teacher).
7. **Subject teachers** — same page: choose the teacher for each subject of the section (needs a current
   academic year). Changes save immediately.

Things in use can't be deleted (a subject with teachers assigned, a section with a class teacher, ...).

## How people get accounts
| Who | Created by |
|---|---|
| Super admin | server command `npm run create-super-admin` |
| Principal | platform owner (*Schools → Add School*) |
| Office admin | principal (*Staff → Add Staff*) |
| Teacher | principal or office admin |
| Students & parents | *(Phase 3)* from admissions; parents will activate with admission no. + date of birth |

There is **no public sign-up**. Older accounts that are still *PENDING* can be approved or rejected under
*Staff → Pending approval*.

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
