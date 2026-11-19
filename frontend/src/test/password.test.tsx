// Phase 1: forced password change, forgot / reset password (mocked backend).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "@/App";
import { clearSession, getSession, saveSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const principal = (mustChangePassword: boolean) => ({
  id: "p1",
  fullName: "Anita Rao",
  email: "anita@dps.edu",
  phone: null,
  role: "PRINCIPAL",
  status: "ACTIVE",
  schoolId: "s1",
  school: { id: "s1", code: "DPS01", name: "Delhi Public School" },
  lastLoginAt: null,
  mustChangePassword,
});

let fetchMock: ReturnType<typeof vi.fn>;
const bodyOf = (path: string) => {
  const call = fetchMock.mock.calls.find(([u]) => String(u).endsWith(path));
  return call ? JSON.parse(String((call[1] as RequestInit).body)) : undefined;
};

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

const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("temporary password", () => {
  it("forces the change-password screen, then opens the dashboard", async () => {
    saveSession(
      {
        accessToken: "a0",
        refreshToken: "r0",
        user: { id: "p1", fullName: "Anita Rao", email: "anita@dps.edu", role: "PRINCIPAL", schoolCode: "DPS01", mustChangePassword: true },
      },
      false,
    );
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/auth/change-password"))
        return json(200, { success: true, data: { user: principal(false), tokens: { accessToken: "a1", refreshToken: "r1", expiresIn: 900 } } });
      return json(200, { success: true, data: { user: principal(true) } }); // /auth/me
    });

    window.location.hash = "#/principal/dashboard";
    render(<App />);

    // can't reach the dashboard yet
    expect(await screen.findByRole("heading", { name: "Set your own password" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/change-password");

    type(/temporary password/i, "Temp12345");
    type(/^new password$/i, "MyNewPass1");
    type(/confirm new password/i, "MyNewPass1");
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    await waitFor(() => expect(window.location.hash).toBe("#/principal/dashboard"));
    expect(bodyOf("/auth/change-password")).toEqual({ currentPassword: "Temp12345", newPassword: "MyNewPass1" });
    expect(getSession()).toMatchObject({ accessToken: "a1", refreshToken: "r1", user: { mustChangePassword: false } });
  });

  it("checks the password rule before calling the API", async () => {
    saveSession(
      { accessToken: "a0", refreshToken: "r0", user: { id: "p1", fullName: "A", email: "a@b.c", role: "PRINCIPAL", schoolCode: "X", mustChangePassword: true } },
      false,
    );
    fetchMock.mockImplementation(() => json(200, { success: true, data: { user: principal(true) } }));
    window.location.hash = "#/change-password";
    render(<App />);

    type(/temporary password/i, "Temp12345");
    type(/^new password$/i, "short");
    type(/confirm new password/i, "short");
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/doesn't meet the rules/i);
    expect(bodyOf("/auth/change-password")).toBeUndefined();
  });
});

describe("forgot & reset password", () => {
  it("login → forgot password → confirmation (same message whether or not the email exists)", async () => {
    fetchMock.mockImplementation(() =>
      json(200, { success: true, message: "If an account exists...", data: {} }),
    );
    window.location.hash = "#/";
    render(<App />);
    fireEvent.click(screen.getByRole("link", { name: /forgot password/i }));

    expect(await screen.findByRole("heading", { name: "Forgot password?" })).toBeInTheDocument();
    type(/school id/i, "dps01");
    type(/^email$/i, "anita@dps.edu");
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/if an account exists/i);
    expect(bodyOf("/auth/forgot-password")).toEqual({ schoolCode: "dps01", email: "anita@dps.edu" });
  });

  it("reset link sets a new password", async () => {
    fetchMock.mockImplementation(() => json(200, { success: true, data: null }));
    window.location.hash = "#/reset-password?token=abc123abc123abc123abc123";
    render(<App />);

    type(/^new password$/i, "BrandNew99");
    type(/confirm new password/i, "BrandNew99");
    fireEvent.click(screen.getByRole("button", { name: /set new password/i }));

    expect(await screen.findByText(/your password has been updated/i)).toBeInTheDocument();
    expect(bodyOf("/auth/reset-password")).toEqual({ token: "abc123abc123abc123abc123", newPassword: "BrandNew99" });
  });

  it("explains an expired link and offers a new one", async () => {
    fetchMock.mockImplementation(() =>
      json(400, { success: false, error: { code: "INVALID_RESET_TOKEN", message: "This reset link is invalid or has expired." } }),
    );
    window.location.hash = "#/reset-password?token=oldtokenoldtokenoldtoken";
    render(<App />);
    type(/^new password$/i, "BrandNew99");
    type(/confirm new password/i, "BrandNew99");
    fireEvent.click(screen.getByRole("button", { name: /set new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/expired/i);
    expect(screen.getByRole("link", { name: /request a new link/i })).toBeInTheDocument();
  });
});
