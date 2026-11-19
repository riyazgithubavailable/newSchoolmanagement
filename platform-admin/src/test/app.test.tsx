// Platform Admin app (separate build): password → 2FA code → Schools,
// and first sign-in → mandatory 2FA setup.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

// jsdom has no canvas — the real library draws the QR code into one
vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn(async () => "data:image/png;base64,QR") } }));

import PlatformApp from "@/App";
import { clearSession, getSession } from "@/lib/session";
import { queryClient } from "@/lib/queryClient";

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
const ok = (data: unknown) => json(200, { success: true, data });

const owner = (twoFactorEnabled: boolean) => ({
  id: "o1",
  fullName: "Platform Owner",
  email: "owner@instituteos.com",
  phone: null,
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  schoolId: null,
  school: null,
  lastLoginAt: null,
  mustChangePassword: false,
  classTeacherOf: null,
  twoFactorEnabled,
});
const tokens = { accessToken: "a1", refreshToken: "r1", expiresIn: 900 };
const schools = (url: string) =>
  url.includes("/platform/schools")
    ? json(200, { success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, summary: { schools: 0, active: 0, suspended: 0 } } })
    : null;

let fetchMock: ReturnType<typeof vi.fn>;
const bodyOf = (path: string) => {
  const c = fetchMock.mock.calls.find(([u]) => String(u).endsWith(path));
  return c ? JSON.parse(String((c[1] as RequestInit).body)) : undefined;
};

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  window.location.hash = "#/";
});

afterEach(() => {
  cleanup();
  clearSession();
  queryClient.clear();
  vi.unstubAllGlobals();
});

const signIn = () => {
  fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "owner@instituteos.com" } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Owner12345" } });
  fireEvent.click(screen.getByRole("button", { name: /continue/i }));
};

describe("platform sign-in", () => {
  it("asks for the authenticator code after the password, then opens Schools", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/platform/auth/login")) return ok({ twoFactorRequired: true, challengeToken: "challenge-1" });
      if (url.endsWith("/platform/auth/verify-2fa")) return ok({ user: owner(true), tokens });
      return schools(url) ?? ok({ user: owner(true) });
    });
    render(<PlatformApp />);
    expect(screen.queryByLabelText(/school code/i)).not.toBeInTheDocument();
    signIn();

    const code = await screen.findByLabelText(/6-digit code/i);
    expect(getSession()).toBeNull(); // nothing stored until the code is verified
    fireEvent.change(code, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify & sign in/i }));

    await waitFor(() => expect(window.location.hash).toBe("#/schools"));
    expect(bodyOf("/platform/auth/verify-2fa")).toEqual({ challengeToken: "challenge-1", code: "123456" });
    // platform sessions are never kept after the browser closes
    expect(getSession()?.accessToken).toBe("a1");
    expect(sessionStorage.getItem("iosp_session")).toContain("a1");
    expect(localStorage.length).toBe(0);
  });

  it("first sign-in goes to the 2FA setup with a QR code", async () => {
    let enabled = false;
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/platform/auth/login")) return ok({ twoFactorRequired: false, user: owner(false), tokens });
      if (url.endsWith("/platform/2fa/setup")) return ok({ secret: "ABCDEFGHIJKLMNOP", otpauthUrl: "otpauth://totp/x" });
      if (url.endsWith("/platform/2fa/enable")) {
        enabled = true;
        return ok({ user: owner(true), tokens: { ...tokens, accessToken: "a2" } });
      }
      return schools(url) ?? ok({ user: owner(enabled) });
    });
    render(<PlatformApp />);
    signIn();

    expect(await screen.findByRole("img", { name: /qr code/i })).toHaveAttribute("src", "data:image/png;base64,QR");
    expect(screen.getByText("ABCDEFGHIJKLMNOP")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/6-digit code/i), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: /turn on 2-step verification/i }));

    await waitFor(() => expect(window.location.hash).toBe("#/schools"));
    expect(bodyOf("/platform/2fa/enable")).toEqual({ code: "654321" });
  });

  it("shows the server's error for a wrong password", async () => {
    fetchMock.mockImplementation(() =>
      json(401, { success: false, error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } }),
    );
    render(<PlatformApp />);
    signIn();
    expect(await screen.findByRole("alert")).toHaveTextContent(/email or password is incorrect/i);
  });
});
