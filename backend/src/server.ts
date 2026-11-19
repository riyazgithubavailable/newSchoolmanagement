// Entry point: connect to MongoDB first, then start the HTTP server.

import { app } from "./app.js";
import { connectDB, DbConnectionError, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`🚀 API running on http://localhost:${env.port}  (health: /api/v1/health)`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  // connection errors are already explained by connectDB(); print anything else
  if (!(err instanceof DbConnectionError)) console.error("❌ Server failed to start:", err);
  process.exit(1);
});
