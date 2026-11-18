// npm run create-super-admin -- --email you@company.com --name "Your Name"
//
// Creates a platform owner (SUPER_ADMIN) account. This is the ONLY way to
// create one — there is deliberately no API for it.
//
// Password: typed at a hidden prompt, or (for CI / servers without a
// terminal) taken from the SUPERADMIN_PASSWORD environment variable.
// It is never accepted as a command-line argument, so it can't end up in
// your shell history.

import readline from "node:readline";
import { Writable } from "node:stream";
import { connectDB, disconnectDB } from "../config/db.js";
import { ROLES, USER_STATUS } from "../constants/roles.js";
import { passwordRule } from "../modules/auth/auth.schemas.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { UserModel } from "../modules/users/user.model.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1]?.trim() : undefined;
}

/** Reads a line without echoing it to the screen. */
function askHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function readPassword(): Promise<string> {
  if (process.env.SUPERADMIN_PASSWORD) return process.env.SUPERADMIN_PASSWORD;
  if (!process.stdin.isTTY) {
    throw new Error("No terminal available: set SUPERADMIN_PASSWORD in the environment.");
  }
  const first = await askHidden("Password (min 8, letter + number): ");
  const second = await askHidden("Repeat password: ");
  if (first !== second) throw new Error("Passwords don't match.");
  return first;
}

async function main() {
  const email = arg("email")?.toLowerCase();
  const fullName = arg("name") || "Platform Owner";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Usage: npm run create-super-admin -- --email you@company.com --name "Your Name"');
  }

  const password = await readPassword();
  const check = passwordRule.safeParse(password);
  if (!check.success) throw new Error(check.error.issues[0]?.message ?? "Password is too weak.");

  await connectDB();
  if (await UserModel.exists({ schoolId: null, email, role: ROLES.SUPER_ADMIN })) {
    throw new Error(`A super admin with ${email} already exists. Use "Forgot password" on the login page to reset it.`);
  }

  await UserModel.create({
    schoolId: null,
    fullName,
    email,
    role: ROLES.SUPER_ADMIN,
    status: USER_STATUS.ACTIVE,
    passwordHash: await hashPassword(password),
  });
  console.log(`✓ Super admin created → ${email}`);
  console.log('  Sign in on the web app with "Platform owner? Sign in here" (no school code).');
}

main()
  .catch((err) => {
    console.error(`❌ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
