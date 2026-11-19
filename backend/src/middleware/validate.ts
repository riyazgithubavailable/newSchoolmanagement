// Validates req.body / req.query / req.params with a Zod schema.
// On success the parsed (trimmed, defaulted) values replace the originals
// and are available as res.locals.body / query / params.

import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Part = "body" | "query" | "params";

export const validate =
  (schema: ZodType, part: Part = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    // ZodError is turned into a 400 VALIDATION_ERROR by errorHandler
    const parsed = schema.parse(req[part] ?? {});
    res.locals[part] = parsed;
    if (part === "body") req.body = parsed;
    next();
  };
