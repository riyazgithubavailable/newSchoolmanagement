# 01 — Overview

## How the SaaS works

```
Platform owner (SUPER_ADMIN)
 └── School A (code DPS01)            ← each school is a "tenant"
 │    ├── Principal(s)
 │    ├── Admin(s) — school office
 │    ├── Teachers
 │    ├── Students
 │    └── Parents
 └── School B (code KV02)
      └── ...
```

- All schools live in **one database**. Every school-owned record carries a `schoolId`, and the API
  always filters by the signed-in user's school, so one school can never see another's data.
- Users sign in with **school code + email + password**. The same email may exist in two schools.
- The platform owner signs in without a school code.

## Roles

| Role | Who | Main jobs |
|---|---|---|
| `SUPER_ADMIN` | You, the platform owner | Onboard schools, create principals, suspend/activate schools, reset principal passwords |
| `PRINCIPAL` | Head of a school | Academic head and approver: staff, classes, class teachers, approvals, results |
| `ADMIN` | School office staff | Day-to-day operations: admissions, fees, records |
| `TEACHER` | Teaching staff | Attendance, homework, marks, notices; **class teacher** of one section if assigned |
| `STUDENT` | Learner | View timetable, homework, results |
| `PARENT` | Guardian | Follow their children, talk to teachers |

Nobody signs up on their own — each account is created by the level above (see [04 — User flows](04-user-flows.md)).

Class teacher is not a separate role: it's a teacher who is assigned to one section and gets extra pages
(My Class, Student Progress, Parent Communication).

## Tech stack

| Part | Technology |
|---|---|
| API | Node.js 20+, Express 5, TypeScript, Zod (validation) |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT access token (15 min) + rotating refresh token (30 days), bcrypt password hashes |
| Web app | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Android app | Kotlin (separate repo / developer) — uses the same API |
| Tests | Vitest (+ in-memory MongoDB for the API, Testing Library for the web) |
| API docs | OpenAPI 3.1 generated from the Zod schemas, Swagger UI at `/api/docs` |

## Repository layout

```
newSchoolmanagement/
├── backend/            REST API
│   ├── src/
│   │   ├── config/     env + MongoDB connection
│   │   ├── constants/  roles, statuses
│   │   ├── middleware/ auth, validation, rate limits, errors
│   │   ├── modules/    auth, users, schools (one folder per feature)
│   │   ├── services/   shared services (mailer)
│   │   ├── docs/       OpenAPI document
│   │   └── scripts/    seed script
│   ├── tests/          API tests
│   └── postman/        Postman collection
├── frontend/           React web app
│   └── src/
│       ├── config/     roles, sidebar menu
│       ├── contexts/   AuthContext
│       ├── lib/        api client, session storage
│       ├── services/   API calls (+ mock services for pages without APIs yet)
│       ├── hooks/      TanStack Query hooks
│       ├── pages/      screens (auth, dashboards...)
│       ├── components/ teacher pages, shared UI kit
│       └── test/       web tests
└── docs/               this documentation
```
