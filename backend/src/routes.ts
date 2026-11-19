// All API routes, mounted under /api/v1 in app.ts.

import { Router } from "express";
import { dbState } from "./config/db.js";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { schoolRouter } from "./modules/academics/academics.routes.js";
import { platformRouter } from "./modules/platform/platform.routes.js";
import { publicRouter } from "./modules/schools/public.routes.js";
import { staffRouter } from "./modules/staff/staff.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const apiRouter = Router();

/** Health check — used by Postman, mobile app and hosting provider */
apiRouter.get("/health", (_req, res) => {
  const database = dbState();
  res.status(database === "connected" ? 200 : 503).json({
    success: database === "connected",
    data: {
      status: database === "connected" ? "ok" : "degraded",
      database,
      environment: env.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

apiRouter.use("/public", publicRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
// platform owner only — used by the separate Platform Admin app
apiRouter.use("/platform", platformRouter);
apiRouter.use("/school", schoolRouter);
apiRouter.use("/staff", staffRouter);
