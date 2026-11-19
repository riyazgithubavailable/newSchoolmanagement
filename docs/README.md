# InstituteOS — Project Documentation

InstituteOS is a multi-school (SaaS) school management system. One platform owner sells it to many
schools; every school gets its own principal, office admins, teachers, students and parents.
A React web app and a Kotlin Android app share one Node.js API.

| Document | What's inside |
|---|---|
| [01 — Overview](01-overview.md) | Roles, how the SaaS works, tech stack, folder layout |
| [02 — Local setup](02-setup.md) | Install, MongoDB Atlas, `.env`, seed data, running, tests |
| [03 — Architecture](03-architecture.md) | Backend/frontend structure, multi-school isolation, auth & tokens |
| [04 — User flows](04-user-flows.md) | Onboarding a school, first login, sign-up approval, passwords, suspension |
| [05 — API guide](05-api.md) | Conventions, endpoints, error codes, rules for web & Android clients |
| [06 — Roadmap](06-roadmap.md) | What's done, what's next, known gaps |

**Quick start**

```bash
cd backend && npm install && cp .env.example .env   # put your Atlas URL in .env
npm run seed && npm run dev                          # API on http://localhost:5000
cd ../frontend && npm install && npm run dev         # school app on http://localhost:8080
cd ../platform-admin && npm install && npm run dev  # Platform Admin app on http://localhost:8081
```

Interactive API docs: **http://localhost:5000/api/docs**
