// Sends emails through SMTP when configured (SMTP_HOST in .env),
// otherwise prints them to the console — handy in development.

import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

let transporter: Transporter | null = null;

function getTransporter() {
  if (!env.mail.smtpHost) return null;
  transporter ??= nodemailer.createTransport({
    host: env.mail.smtpHost,
    port: env.mail.smtpPort,
    secure: env.mail.smtpPort === 465,
    auth: env.mail.smtpUser ? { user: env.mail.smtpUser, pass: env.mail.smtpPass } : undefined,
  });
  return transporter;
}

/** Never throws: a failed email must not break the request that triggered it. */
export async function sendMail(mail: Mail): Promise<void> {
  const t = getTransporter();
  if (!t) {
    if (env.nodeEnv !== "test") {
      console.log(`\n📧 [email not sent — SMTP not configured]\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`);
    }
    return;
  }
  try {
    await t.sendMail({ from: env.mail.from, ...mail });
  } catch (err) {
    console.error(`❌ Failed to send email to ${mail.to}:`, err instanceof Error ? err.message : err);
  }
}
