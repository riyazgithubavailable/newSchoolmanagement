// Platform Admin app (platform owner only) — built and deployed separately
// from the school app, e.g. admin.instituteos.com.
//   npm run dev:platform     → http://localhost:8081
//   npm run build:platform   → dist-platform/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "platform"),
  publicDir: false,
  envDir: __dirname,
  server: { host: "::", port: 8081, fs: { allow: [__dirname] } },
  plugins: [
    react(),
    {
      // ship robots.txt next to index.html
      name: "platform-robots",
      generateBundle() {
        this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\nDisallow: /\n" });
      },
    },
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  css: { postcss: path.resolve(__dirname) },
  build: { outDir: path.resolve(__dirname, "dist-platform"), emptyOutDir: true },
});
