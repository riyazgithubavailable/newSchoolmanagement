import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // full-App integration tests: the first render in each file compiles a lot
    testTimeout: 15_000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
