// npm run seed
// Creates (once) the platform super admin, a demo school and its principal.
// Safe to run again: existing records are left untouched.
//
// DEVELOPMENT ONLY. For a live server use `npm run create-super-admin`.
//
// Override the defaults in .env:
//   SEED_SUPERADMIN_EMAIL, SEED_SUPERADMIN_PASSWORD, SEED_PRINCIPAL_PASSWORD

import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { ROLES, USER_STATUS, type Role } from "../constants/roles.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { SchoolModel } from "../modules/schools/school.model.js";
import { UserModel } from "../modules/users/user.model.js";
import type { Types } from "mongoose";

const cfg = {
  superAdmin: {
    email: process.env.SEED_SUPERADMIN_EMAIL ?? "superadmin@instituteos.local",
    password: process.env.SEED_SUPERADMIN_PASSWORD ?? "SuperAdmin@123",
  },
  school: { code: "DEMO01", name: "Demo Public School", email: "office@demo.school", address: "Bhubaneswar, Odisha" },
  principal: {
    fullName: "Dr. R. K. Mishra",
    email: "principal@demo.school",
    password: process.env.SEED_PRINCIPAL_PASSWORD ?? "Principal@123",
  },
  /** extra demo staff — development only, never created in production */
  demoStaff: [
    { fullName: "Sunil Pattnaik", email: "admin@demo.school", password: "Admin@123", role: ROLES.ADMIN },
    { fullName: "Neha Verma", email: "teacher@demo.school", password: "Teacher@123", role: ROLES.TEACHER },
  ] as const,
};

async function ensureUser(
  label: string,
  data: { schoolId: Types.ObjectId | null; fullName: string; email: string; password: string; role: Role },
) {
  const existing = await UserModel.findOne({ schoolId: data.schoolId, email: data.email });
  if (existing) {
    console.log(`• ${label} already exists (${data.email}) — unchanged`);
    return;
  }
  await UserModel.create({
    schoolId: data.schoolId,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    status: USER_STATUS.ACTIVE,
    passwordHash: await hashPassword(data.password),
  });
  console.log(`✓ ${label} created → ${data.email} / ${data.password}`);
}

async function main() {
  if (env.isProduction) {
    // the seed creates a fake "Demo Public School" — never put that in a live database
    throw new Error(
      "The seed is for development only. On production run: npm run create-super-admin -- --email you@company.com --name \"Your Name\"",
    );
  }

  await connectDB();
  // make sure unique indexes exist before inserting
  await Promise.all([SchoolModel.syncIndexes(), UserModel.syncIndexes()]);

  await ensureUser("Super admin", {
    schoolId: null,
    fullName: "Platform Owner",
    email: cfg.superAdmin.email,
    password: cfg.superAdmin.password,
    role: ROLES.SUPER_ADMIN,
  });

  let school = await SchoolModel.findOne({ code: cfg.school.code });
  if (school) {
    console.log(`• School ${cfg.school.code} already exists — unchanged`);
  } else {
    school = await SchoolModel.create(cfg.school);
    console.log(`✓ School created → ${school.code} (${school.name})`);
  }

  await ensureUser("Principal", {
    schoolId: school._id,
    fullName: cfg.principal.fullName,
    email: cfg.principal.email,
    password: cfg.principal.password,
    role: ROLES.PRINCIPAL,
  });

  if (!env.isProduction) {
    for (const s of cfg.demoStaff) {
      await ensureUser(`Demo ${s.role.toLowerCase()}`, { schoolId: school._id, ...s });
    }
  }

  console.log("\nDone. ⚠️  Change the default passwords before going live.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
