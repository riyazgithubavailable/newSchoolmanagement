// All API routes, mounted under /api/v1 in app.ts.

import { Router } from "express";
import { dbState } from "./config/db.js";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { schoolsRouter } from "./modules/schools/schools.routes.js";
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

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/schools", schoolsRouter);
