import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], serif: ["Lora", "Georgia", "serif"] },
    },
  },
  plugins: [],
} satisfies Config;
