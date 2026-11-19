import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Set before the app loads. dotenv never overrides these, so tests can
    // never touch the real Atlas database from .env.
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://in-memory-placeholder",
      JWT_ACCESS_SECRET: "test-access-secret-0123456789-abcdefghijklmnop",
      JWT_REFRESH_SECRET: "test-refresh-secret-0123456789-abcdefghijklmnop",
    },
    testTimeout: 30_000,
    hookTimeout: 120_000, // first run downloads a MongoDB binary
  },
});
