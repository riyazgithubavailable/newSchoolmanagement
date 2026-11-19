// Renders every teacher route through the real <App /> as a logged-in
// class teacher and checks the page heading appears (no crash, guards OK).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { saveSession, clearSession } from "@/lib/auth";
import type { AuthUser } from "@/types/school";
import { users } from "@/mock/db";
import { queryClient } from "@/lib/queryClient";

const saveAuth = (user: AuthUser) => saveSession({ accessToken: "test-access", refreshToken: "test-refresh", user }, false);
const loginAs = (role: keyof typeof users) => saveAuth(users[role]);

// Never hit a real backend from tests: every request fails like "offline",
// which keeps the stored session (see AuthContext start-up check).
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
});

afterEach(() => {
  cleanup();
  clearSession();
  queryClient.clear();
  vi.unstubAllGlobals();
});

const PAGES: [string, RegExp][] = [
  ["/teacher/notices", /^Notices$/],
  ["/teacher/messages", /^Messages$/],
  ["/teacher/my-attendance", /^My Attendance$/],
  ["/teacher/leave", /^Leave$/],
  ["/teacher/profile", /^My Profile$/],
  ["/teacher/class-teacher/overview", /^My Class · 10-A$/],
  ["/teacher/class-teacher/progress", /^Student Progress$/],
  ["/teacher/class-teacher/parents", /^Parent Communication$/],
];

describe("teacher pages", () => {
  it.each(PAGES)("%s renders", async (path, heading) => {
    loginAs("TEACHER");
    window.location.hash = `#${path}`;
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: heading }, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe("route guards", () => {
  it("redirects anonymous users to login", async () => {
    window.location.hash = "#/teacher/leave";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /^sign in$/i })).toBeInTheDocument();
  });

  it("keeps a parent out of teacher pages", async () => {
    loginAs("PARENT");
    window.location.hash = "#/teacher/notices";
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "Parent Dashboard" })).toBeInTheDocument();
  });

  it.each(["#/principal/dashboard", "#/teacher/dashboard"])("keeps admin out of %s", async (hash) => {
    loginAs("ADMIN");
    window.location.hash = hash;
    render(<App />);
    await waitFor(() => expect(window.location.hash).toBe("#/admin/dashboard"));
    expect((await screen.findAllByText("School Office")).length).toBeGreaterThan(0); // sidebar workspace label
  });

  it("hides class teacher pages from non class teachers", async () => {
    saveAuth({ ...users.TEACHER, isClassTeacher: false, classTeacherOf: null });
    window.location.hash = "#/teacher/class-teacher/overview";
    render(<App />);
    expect(await screen.findByText(/Teacher Workspace/, { selector: "p.text-\\[11px\\]" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/teacher/dashboard");
  });
});
