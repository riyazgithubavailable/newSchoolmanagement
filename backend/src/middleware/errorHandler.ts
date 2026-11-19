// Converts every thrown error into the standard error shape:
//   { "success": false, "error": { "code", "message", "details"? } }

import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}

// Express recognises error handlers by their 4 arguments — keep `_next`.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong. Please try again.";
  let details: unknown;

  if (err instanceof ApiError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = err.issues[0]?.message ?? "Invalid input.";
    // field-level errors so forms can highlight the right input
    details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = "INVALID_ID";
    message = `Invalid ${err.path}.`;
  } else if (isDuplicateKey(err)) {
    status = 409;
    code = "DUPLICATE";
    message = "This record already exists.";
  } else if (isBodyParseError(err)) {
    status = 400;
    code = "INVALID_JSON";
    message = "Request body is not valid JSON.";
  }

  if (status >= 500) console.error("💥 Unhandled error:", err);

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(status >= 500 && !env.isProduction && err instanceof Error ? { debug: err.message } : {}),
    },
  });
}

const isDuplicateKey = (err: unknown) =>
  typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;

const isBodyParseError = (err: unknown) =>
  typeof err === "object" && err !== null && (err as { type?: string }).type === "entity.parse.failed";
