// src/config/env.ts
// Set VITE_API_URL in frontend/.env once the backend is running, e.g.
//   VITE_API_URL=http://localhost:5000/api
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "").toString().replace(/\/$/, "");
