// Express application (no listening here — see server.ts).

import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi.js";
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

// API documentation (Swagger UI) — for the web and Android developers
app.get("/api/docs.json", (_req, res) => {
  res.json(openApiDocument);
});
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "InstituteOS API",
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);
