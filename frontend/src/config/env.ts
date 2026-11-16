// src/config/env.ts
// Vite: set VITE_API_URL in .env, otherwise fallback below.
export const API_URL =
    (import.meta as any).env?.VITE_API_URL?.toString()?.replace(/\/$/, "")
export const API_KEY =
    (import.meta as any).env?.VITE_API_KEY?.toString()
export const ANPR_AI_URL =
    (import.meta as any).env?.VITE_ANPR_AI_URL?.toString()?.replace(/\/$/, "")

