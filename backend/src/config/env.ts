// Loads .env once and exposes typed, validated settings.
// The server refuses to start if a required value is missing.

import dotenv from "dotenv";

dotenv.config({ quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`❌ Missing required environment variable ${name}.`);
    console.error("   → Copy backend/.env.example to backend/.env and fill it in.");
    process.exit(1);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

/** JWT secrets must be long and must not be the placeholder from .env.example */
function secret(name: string): string {
  const value = required(name);
  if (value.startsWith("change-me") || value.length < 32) {
    if (nodeEnv === "production") {
      console.error(`❌ ${name} is too weak. Generate a long random secret for production.`);
      process.exit(1);
    }
    console.warn(`⚠️  ${name} is weak — fine for local testing only.`);
  }
  return value;
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 5000,
  mongoUri: required("MONGODB_URI"),
  mongoDbName: process.env.MONGODB_DB_NAME?.trim() || "school_dev",
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  jwt: {
    accessSecret: secret("JWT_ACCESS_SECRET"),
    refreshSecret: secret("JWT_REFRESH_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN?.trim() || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN?.trim() || "30d",
  },
  /** Web app address — used in links inside emails (password reset...) */
  webAppUrl: (process.env.WEB_APP_URL?.trim() || "http://localhost:8080").replace(/\/$/, ""),
  mail: {
    from: process.env.MAIL_FROM?.trim() || "InstituteOS <no-reply@instituteos.local>",
    /** when SMTP_HOST is empty, emails are printed to the console instead of sent */
    smtpHost: process.env.SMTP_HOST?.trim() || "",
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER?.trim() || "",
    smtpPass: process.env.SMTP_PASS?.trim() || "",
  },
} as const;
