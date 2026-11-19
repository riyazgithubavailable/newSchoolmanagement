# 06 — Roadmap

Order matters: each phase builds the data the next one needs.

| Phase | Scope | Status |
|---|---|---|
| 0 | Git branch & commits, Swagger/OpenAPI docs, project docs | ✅ Done |
| 1 | Change password, forced first-login change, forgot/reset via email, admin & platform password resets | ✅ Done |
| 2 | **School setup**: school profile, academic year, classes & sections (templates, streams), subjects, staff accounts created by principal/admin, class teachers, subject teachers; self sign-up removed | ✅ Done |
| 2b | **Platform security**: separate Platform Admin project (`platform-admin/`), separate API, mandatory 2FA, IP allowlist, short sessions, audit log, server-only recovery; new school login page (school-name look-up, no role tabs) | ✅ Done |
| 3 | Students & parents: admission records, parent accounts linked to children, parent activation (admission no. + DOB), bulk Excel import | ⏳ Next |
| 4 | Timetable (admin builds it, teachers/students read it) | Planned |
| 5 | Teacher APIs: attendance, homework/assignments, marks/results, notices, leave, messages — replace frontend mocks | Planned |
| 6 | Student & parent views (web + Android) | Planned |
| 7 | SaaS business: plans/subscriptions, trial & expiry, file uploads, push notifications (FCM), audit log | Planned |
| 8 | Deployment: production cluster, hosting, backups, monitoring — `render.yaml` + [07 — Deployment](07-deployment.md) ready | 🟡 Config ready |

## Known gaps / decisions to revisit
- Access tokens of a disabled user stay valid for up to 15 minutes (refresh and `/auth/me` stop at once).
- Teacher pages still use mock data (Phase 5). The class-teacher flag now comes from the real section assignment.
- Sections are not yet per academic year: at year rollover class teachers carry over until changed.
- No email provider configured yet — set `SMTP_*` before going live.
- Deploy the Platform Admin app on its own address and set `CORS_ORIGIN`, `ENCRYPTION_KEY` and (ideally) `PLATFORM_ALLOWED_IPS` in production.
- `schoolId` filtering is written in each service (`findInSchool`, `currentSchoolId`) and covered by isolation tests in `backend/tests`; a Mongoose plugin could enforce it automatically later.
