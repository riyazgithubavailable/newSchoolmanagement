import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Platform Admin runs on its own port / domain (e.g. admin.yourdomain.com),
// separate from the school app.
export default defineConfig({
  server: { host: "::", port: 8081 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
