// Every successful response has the same shape:
//   { "success": true, "data": ..., "message"?: "...", "meta"?: {...} }

import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  opts: { status?: number; message?: string; meta?: Record<string, unknown> } = {},
) {
  return res.status(opts.status ?? 200).json({
    success: true,
    ...(opts.message ? { message: opts.message } : {}),
    data,
    ...(opts.meta ? { meta: opts.meta } : {}),
  });
}
