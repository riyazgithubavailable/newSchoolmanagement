// Super admin: platform login + onboarding a school (mocked backend).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "@/App";
import { clearSession, saveSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

const owner = {
  id: "o1",
  fullName: "Platform Owner",
  email: "superadmin@instituteos.local",
  phone: null,
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  schoolId: null,
  school: null,
  lastLoginAt: null,
};

const school = (over: Record<string, unknown> = {}) => ({
  id: "s1",
  name: "Demo Public School",
  code: "DEMO01",
  email: null,
  phone: null,
  address: "Bhubaneswar",
  status: "ACTIVE",
  createdAt: "2026-11-17T10:00:00.000Z",
  principals: [{ id: "p1", fullName: "Dr. R. K. Mishra", email: "principal@demo.school", phone: null, status: "ACTIVE", lastLoginAt: null }],
  userCounts: { total: 3, principals: 1, admins: 1, teachers: 1, students: 0, parents: 0, pending: 0 },
  ...over,
});

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

let fetchMock: ReturnType<typeof vi.fn>;

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

const listResponse = (items: unknown[]) =>
  json(200, {
    success: true,
    data: items,
    meta: { page: 1, limit: 10, total: items.length, totalPages: 1, summary: { schools: items.length, active: items.length, suspended: 0 } },
  });

it("platform owner signs in without a school code and lands on Schools", async () => {
  fetchMock.mockImplementation((url: string) => {
    if (url.endsWith("/auth/login"))
      return json(200, { success: true, data: { user: owner, tokens: { accessToken: "a", refreshToken: "r", expiresIn: 900 } } });
    if (url.includes("/schools")) return listResponse([school()]);
    return json(200, { success: true, data: { user: owner } });
  });

  window.location.hash = "#/";
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /platform owner\? sign in here/i }));

  expect(screen.queryByLabelText(/school id/i)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/email \/ username/i), { target: { value: "superadmin@instituteos.local" } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "SuperAdmin@123" } });
  fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

  await waitFor(() => expect(window.location.hash).toBe("#/super-admin/dashboard"));
  expect(await screen.findByText("Demo Public School")).toBeInTheDocument();

  const loginCall = fetchMock.mock.calls.find(([u]) => String(u).endsWith("/auth/login"))!;
  expect(JSON.parse(String((loginCall[1] as RequestInit).body))).toEqual({
    email: "superadmin@instituteos.local",
    password: "SuperAdmin@123",
  });
});

describe("Schools page", () => {
  beforeEach(() => {
    saveSession(
      {
        accessToken: "a",
        refreshToken: "r",
        user: { id: "o1", fullName: "Platform Owner", email: owner.email, role: "SUPER_ADMIN", schoolCode: "" },
      },
      false,
    );
    window.location.hash = "#/super-admin/dashboard";
  });

  it("creates a school + principal and shows the login details to share", async () => {
    let created = false;
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url.endsWith("/schools") && init.method === "POST") {
        created = true;
        return json(201, { success: true, data: school({ id: "s2", name: "Delhi Public School", code: "DPS01" }) });
      }
      if (url.includes("/schools")) return listResponse(created ? [school(), school({ id: "s2", name: "Delhi Public School", code: "DPS01" })] : [school()]);
      return json(200, { success: true, data: { user: owner } });
    });

    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /add school/i }));
    const dialog = screen.getByRole("dialog", { name: "Add School" });
    const field = (label: RegExp) => within(dialog).getAllByLabelText(label)[0];

    fireEvent.change(field(/school name/i), { target: { value: "Delhi Public School" } });
    expect(field(/school code/i)).toHaveValue("DPS"); // suggested from the name
    fireEvent.change(field(/school code/i), { target: { value: "dps01" } });
    fireEvent.change(within(dialog).getByLabelText(/^full name/i), { target: { value: "Anita Rao" } });
    fireEvent.change(within(dialog).getByLabelText(/email \(login\)/i), { target: { value: "principal@dps.edu" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /create school/i }));

    const creds = await screen.findByRole("dialog", { name: "School created" });
    expect(creds).toHaveTextContent("School code: DPS01");
    expect(creds).toHaveTextContent("Email: principal@dps.edu");

    const post = fetchMock.mock.calls.find(([u, i]) => String(u).endsWith("/schools") && (i as RequestInit).method === "POST")!;
    const body = JSON.parse(String((post[1] as RequestInit).body));
    expect(body.school).toEqual({ name: "Delhi Public School", code: "DPS01", address: undefined, email: undefined, phone: undefined });
    expect(body.principal).toMatchObject({ fullName: "Anita Rao", email: "principal@dps.edu" });
    expect(body.principal.password).toMatch(/^(?=.*[A-Za-z])(?=.*\d).{12}$/); // generated password
  });

  it("shows the backend error under the school code field", async () => {
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url.endsWith("/schools") && init.method === "POST")
        return json(409, { success: false, error: { code: "SCHOOL_CODE_TAKEN", message: "School code DEMO01 is already in use." } });
      if (url.includes("/schools")) return listResponse([school()]);
      return json(200, { success: true, data: { user: owner } });
    });

    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /add school/i }));
    const dialog = screen.getByRole("dialog", { name: "Add School" });
    fireEvent.change(within(dialog).getAllByLabelText(/school name/i)[0], { target: { value: "Another School" } });
    fireEvent.change(within(dialog).getAllByLabelText(/school code/i)[0], { target: { value: "DEMO01" } });
    fireEvent.change(within(dialog).getByLabelText(/^full name/i), { target: { value: "Someone" } });
    fireEvent.change(within(dialog).getByLabelText(/email \(login\)/i), { target: { value: "x@y.com" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /create school/i }));

    expect(await within(dialog).findByText("School code DEMO01 is already in use.")).toBeInTheDocument();
  });
});
