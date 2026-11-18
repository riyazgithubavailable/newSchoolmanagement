# 02 — Local setup

## 1. Requirements
- **Node.js 20 or newer** (22 LTS recommended)
- A **MongoDB Atlas** account (the free M0 cluster is enough for development)
- Git, VS Code, Postman (optional)

## 2. MongoDB Atlas
1. Create a project and a cluster (e.g. `school-dev`).
2. **Security → Database Access → Add New Database User** — one user per developer, role *Read and write to any database*.
3. **Security → Network Access → Add IP Address → Add Current IP Address.**
   Your home/office IP changes from time to time; when the API says
   *"IP that isn't whitelisted"*, add the new IP again. For the **development** cluster only you may allow
   `0.0.0.0/0` — never on production.
4. **Connect → Drivers** → copy the connection string.

Sharing with another developer: invite them under **Project Identity & Access** with the
*Project Data Access Read/Write* role (not Project Owner) and give them their own database user.

## 3. Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env`:

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | Atlas connection string (replace `<db_password>`) |
| `MONGODB_DB_NAME` | database name, e.g. `school_dev` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | long random strings — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `WEB_APP_URL` | web address used in email links (`http://localhost:8080`) |
| `SMTP_*`, `MAIL_FROM` | optional; without `SMTP_HOST` emails are printed in the terminal |

```bash
npm run seed   # demo school + accounts (safe to run again)
npm run dev    # http://localhost:5000, auto-reload on save
```
Check: http://localhost:5000/api/v1/health → `"database": "connected"`.

### Demo accounts (development)
| Account | School code | Email | Password |
|---|---|---|---|
| Super Admin | — | superadmin@instituteos.local | SuperAdmin@123 |
| Principal | DEMO01 | principal@demo.school | Principal@123 |
| Admin | DEMO01 | admin@demo.school | Admin@123 |
| Teacher | DEMO01 | teacher@demo.school | Teacher@123 |

### Your own super admin account
The seed creates a demo super admin for development. To create your real platform-owner account
(and **always** on a live server — the seed refuses to run in production because it adds a demo school):

```bash
cd backend
npm run create-super-admin -- --email you@company.com --name "Your Name"
# you are asked for the password (hidden). On a server without a terminal:
#   SUPERADMIN_PASSWORD=... npm run create-super-admin -- --email ...
```
There is intentionally **no API or sign-up page** for super admins. Run the command again with another
email to add a second owner (e.g. a co-founder). Forgot the password? Use *Forgot password* on the
login page with *Platform owner* selected.

## 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api/v1
npm run dev            # http://localhost:8080
```
Restart `npm run dev` after changing `.env`. In development the login page shows a **Fill demo** button.

## 5. Tests
```bash
cd backend && npm test    # uses a temporary in-memory MongoDB — never touches Atlas
cd frontend && npm test   # network calls are mocked
```

## 6. Troubleshooting
| Symptom | Fix |
|---|---|
| `IP that isn't whitelisted` | Atlas → Network Access → add current IP |
| `Cluster address not found` | copy the connection string again from Atlas |
| `bad auth` | wrong database user/password in `MONGODB_URI` |
| `Missing required environment variable` | create `backend/.env` from `.env.example` |
| Web shows *Can't reach the server* | backend not running, or wrong `VITE_API_URL` |
| Vite error about a missing package after uninstalling something | stop the dev server, delete `frontend/node_modules/.vite`, start again |
