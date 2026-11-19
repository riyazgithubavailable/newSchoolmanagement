// Platform owner (SUPER_ADMIN) accounts are managed ONLY from the server
// terminal — there is deliberately no API, sign-up page or email reset.
//
//   npm run super-admin -- create         --email you@company.com --name "Your Name"
//   npm run super-admin -- reset-password --email you@company.com
//   npm run super-admin -- reset-2fa      --email you@company.com   (lost phone)
//
// Passwords are typed at a hidden prompt, or (servers without a terminal)
// read from SUPERADMIN_PASSWORD. Never accepted as a command-line argument,
// so they can't end up in your shell history.

import readline from "node:readline";
import { Writable } from "node:stream";
import { connectDB, disconnectDB } from "../config/db.js";
import { ROLES, USER_STATUS } from "../constants/roles.js";
import { passwordRule } from "../modules/auth/auth.schemas.js";
import { applyNewPassword, hashPassword } from "../modules/auth/auth.service.js";
import { RefreshTokenModel } from "../modules/auth/refreshToken.model.js";
import { UserModel } from "../modules/users/user.model.js";

const COMMANDS = ["create", "reset-password", "reset-2fa"] as const;
type Command = (typeof COMMANDS)[number];

const USAGE = [
  "Usage:",
  '  npm run super-admin -- create         --email you@company.com --name "Your Name"',
  "  npm run super-admin -- reset-password --email you@company.com",
  "  npm run super-admin -- reset-2fa      --email you@company.com",
].join("\n");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1]?.trim() : undefined;
}

function command(): Command | undefined {
  const args = process.argv.slice(2);
  const found = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  return COMMANDS.find((c) => c === found);
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

async function strongPassword(): Promise<string> {
  let password = process.env.SUPERADMIN_PASSWORD;
  if (!password) {
    if (!process.stdin.isTTY) throw new Error("No terminal available: set SUPERADMIN_PASSWORD in the environment.");
    const first = await askHidden("Password (min 8, letter + number): ");
    const second = await askHidden("Repeat password: ");
    if (first !== second) throw new Error("Passwords don't match.");
    password = first;
  }
  const check = passwordRule.safeParse(password);
  if (!check.success) throw new Error(check.error.issues[0]?.message ?? "Password is too weak.");
  return password;
}

async function findOwner(email: string) {
  const user = await UserModel.findOne({ schoolId: null, email, role: ROLES.SUPER_ADMIN });
  if (!user) throw new Error(`No super admin with ${email}.`);
  return user;
}

async function main() {
  const cmd = command();
  const email = arg("email")?.toLowerCase();
  if (!cmd || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(USAGE);

  if (cmd === "reset-password") {
    const password = await strongPassword();
    await connectDB();
    await applyNewPassword(await findOwner(email), password, { mustChange: false });
    console.log(`✓ Password changed for ${email}. All sessions were signed out.`);
    return;
  }

  if (cmd === "reset-2fa") {
    await connectDB();
    const user = await findOwner(email);
    user.set("twoFactor", undefined);
    await user.save();
    await RefreshTokenModel.deleteMany({ userId: user._id });
    console.log(`✓ 2-step verification removed for ${email}. It must be set up again at the next sign in.`);
    return;
  }

  // create
  const fullName = arg("name") || "Platform Owner";
  const password = await strongPassword();
  await connectDB();
  if (await UserModel.exists({ schoolId: null, email, role: ROLES.SUPER_ADMIN })) {
    throw new Error(`A super admin with ${email} already exists. To reset it: npm run super-admin -- reset-password --email ${email}`);
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
  console.log("  Sign in on the Platform Admin app — you'll be asked to set up 2-step verification.");
}

main()
  .catch((err) => {
    console.error(`❌ ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
