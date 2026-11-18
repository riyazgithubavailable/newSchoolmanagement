# 06 — Roadmap

Order matters: each phase builds the data the next one needs.

| Phase | Scope | Status |
|---|---|---|
| 0 | Git branch & commits, Swagger/OpenAPI docs, project docs | ✅ Done |
| 1 | Change password, forced first-login change, forgot/reset via email, admin & platform password resets | ✅ Done |
| 2 | **School setup**: academic year, classes & sections, subjects, staff accounts created by principal/admin, teaching assignments, class teacher | ⏳ Next |
| 3 | Students & parents: admission records, parent accounts linked to children, bulk Excel import | Planned |
| 4 | Timetable (admin builds it, teachers/students read it) | Planned |
| 5 | Teacher APIs: attendance, homework/assignments, marks/results, notices, leave, messages — replace frontend mocks | Planned |
| 6 | Student & parent views (web + Android) | Planned |
| 7 | SaaS business: plans/subscriptions, trial & expiry, file uploads, push notifications (FCM), audit log | Planned |
| 8 | Deployment: production cluster, hosting, backups, monitoring | Planned |

## Known gaps / decisions to revisit
- Access tokens of a disabled user stay valid for up to 15 minutes (refresh and `/auth/me` stop at once).
- Teacher pages still use mock data; the class-teacher flag is faked for every teacher until Phase 2.
- No email provider configured yet — set `SMTP_*` before going live.
- `schoolId` filtering is done by hand in each query; a shared helper/plugin should enforce it (Phase 2).
- Self sign-up will be restricted once staff/admissions exist (Phases 2–3).
