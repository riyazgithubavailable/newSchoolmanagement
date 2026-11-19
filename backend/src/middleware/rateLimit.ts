import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

// automated tests send many requests from one IP
const skip = () => env.nodeEnv === "test";

const json = (code: string, message: string) => ({ success: false, error: { code, message } });

/** Slows down password guessing: 10 attempts / 15 min per IP (successful logins don't count) */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  skip,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json("TOO_MANY_ATTEMPTS", "Too many login attempts. Try again in 15 minutes."),
});

/** Stops reset-email spam and token guessing: 10 requests / hour per IP */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skip,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json("TOO_MANY_REQUESTS", "Too many password reset attempts. Try again later."),
});

