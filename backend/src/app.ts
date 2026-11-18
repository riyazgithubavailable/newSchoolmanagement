// Express application (no listening here — see server.ts).

import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes.js";

export const app = express();

// behind a proxy (Render, Railway, Nginx...) so rate limiting sees the real client IP
if (env.isProduction) app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    // in development allow any origin so Postman / emulator / web all work
    origin: env.isProduction ? env.corsOrigins : true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
