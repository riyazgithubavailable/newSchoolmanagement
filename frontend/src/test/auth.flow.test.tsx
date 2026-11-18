// Login / signup / token-refresh flow against a mocked backend.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { apiRequest } from "@/lib/api";
import { clearSession, getSession, saveSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { users } from "@/mock/db";

const apiUser = {
  id: "u1",
  fullName: "Neha Verma",
  email: "teacher@demo.school",
  phone: null,
  role: "TEACHER",
  status: "ACTIVE",
  schoolId: "s1",
  school: { id: "s1", code: "DEMO01", name: "Demo Public School" },
  lastLoginAt: null,
};

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const tokens = (n: number) => ({ accessToken: `access-${n}`, refreshToken: `refresh-${n}`, tokenType: "Bearer", expiresIn: 900 });

let fetchMock: ReturnType<typeof vi.fn>;
const calls = () => fetchMock.mock.calls.map(([url, init]) => ({ url: String(url), init: init as RequestInit }));

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  clearSession();
  queryClient.clear();
  vi.unstubAllGlobals();
});

function fillLogin() {
  window.location.hash = "#/";
  render(<App />);
  fireEvent.change(screen.getByLabelText(/school id/i), { target: { value: "demo01" } });
  fireEvent.change(screen.getByLabelText(/email \/ username/i), { target: { value: "teacher@demo.school" } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Teacher@123" } });
}

describe("login screen", () => {
  it("signs in through the API and opens the teacher dashboard", async () => {
    fetchMock.mockImplementation((url: string) =>
      url.endsWith("/auth/login") ? json(200, { success: true, data: { user: apiUser, tokens: tokens(1) } }) : json(200, { success: true, data: { user: apiUser } }),
    );
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(window.location.hash).toBe("#/teacher/dashboard"));

    const login = calls().find((c) => c.url.endsWith("/auth/login"))!;
    expect(login.url).toBe("http://localhost:5000/api/v1/auth/login");
    expect(JSON.parse(String(login.init.body))).toEqual({
      schoolCode: "demo01",
      email: "teacher@demo.school",
      password: "Teacher@123",
      role: "TEACHER",
    });
    expect((login.init.headers as Record<string, string>)["X-Client"]).toBe("web");
    expect(getSession()).toMatchObject({ accessToken: "access-1", refreshToken: "refresh-1", user: { schoolCode: "DEMO01" } });
  });

  it("shows the backend's message, e.g. account waiting for approval", async () => {
    fetchMock.mockImplementation(() =>
      json(403, {
        success: false,
        error: { code: "ACCOUNT_PENDING", message: "Your account is waiting for approval from the school." },
      }),
    );
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("waiting for approval");
    expect(getSession()).toBeNull();
  });

  it("explains when the server is unreachable", async () => {
    fetchMock.mockImplementation(() => Promise.reject(new TypeError("Failed to fetch")));
    fillLogin();
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/can't reach the server/i);
  });
});

describe("no self sign-up", () => {
  it("the login page has no create-account option", () => {
    window.location.hash = "#/";
    render(<App />);
    expect(screen.queryByRole("button", { name: /create an account/i })).not.toBeInTheDocument();
    expect(screen.getByText(/school office or principal creates it/i)).toBeInTheDocument();
  });
});

describe("token refresh (lib/api)", () => {
  beforeEach(() => {
    saveSession({ accessToken: "access-0", refreshToken: "refresh-0", user: users.TEACHER }, false);
  });

  it("refreshes ONCE for parallel expired requests, then retries them", async () => {
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      const auth = (init.headers as Record<string, string>).Authorization;
      if (url.endsWith("/auth/refresh")) return json(200, { success: true, data: { user: apiUser, tokens: tokens(1) } });
      if (auth === "Bearer access-0") return json(401, { success: false, error: { code: "TOKEN_EXPIRED", message: "expired" } });
      return json(200, { success: true, data: { ok: url } });
    });

    const results = await Promise.all([apiRequest("/a"), apiRequest("/b"), apiRequest("/c")]);

    expect(results.map((r) => (r as { ok: string }).ok.slice(-2))).toEqual(["/a", "/b", "/c"]);
    expect(calls().filter((c) => c.url.endsWith("/auth/refresh"))).toHaveLength(1);
    expect(getSession()).toMatchObject({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("ends the session and returns to login when the refresh token is rejected", async () => {
    fetchMock.mockImplementation((url: string) =>
      url.endsWith("/auth/refresh")
        ? json(401, { success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "Session expired." } })
        : json(401, { success: false, error: { code: "TOKEN_EXPIRED", message: "expired" } }),
    );
    window.location.hash = "#/teacher/notices";
    render(<App />); // start-up /auth/me → expired → refresh rejected

    await waitFor(() => expect(window.location.hash).toBe("#/"));
    expect(getSession()).toBeNull();
  });
});
