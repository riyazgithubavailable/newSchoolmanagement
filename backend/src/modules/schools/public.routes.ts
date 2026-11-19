// Public, unauthenticated look-ups used by the login screen.
// Mounted at /api/v1/public. Returns only what's printed on the school gate anyway.

import { Router, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { SCHOOL_STATUS, SchoolModel } from "./school.model.js";

export const publicRouter = Router();

// enough for typing, too slow for scanning every possible code
const lookupLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  skip: () => env.nodeEnv === "test",
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Slow down a little." } },
});

/** GET /api/v1/public/schools/:code → { code, name } of an ACTIVE school */
publicRouter.get("/schools/:code", lookupLimiter, async (req: Request, res: Response) => {
  const code = String(req.params.code).trim().toUpperCase();
  if (!/^[A-Z0-9-]{2,20}$/.test(code)) throw ApiError.notFound("SCHOOL_NOT_FOUND", "No school with this code.");
  const school = await SchoolModel.findOne({ code, status: SCHOOL_STATUS.ACTIVE }).select("code name").lean();
  if (!school) throw ApiError.notFound("SCHOOL_NOT_FOUND", "No school with this code.");
  sendSuccess(res, { code: school.code, name: school.name });
});
