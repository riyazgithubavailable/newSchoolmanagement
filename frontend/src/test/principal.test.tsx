// Principal section against a mocked backend.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "@/App";
import { clearSession, saveSession } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
const ok = (data: unknown) => json(200, { success: true, data });

const principal = {
  id: "p1",
  fullName: "Anita Rao",
  email: "anita@dps.edu",
  phone: null,
  role: "PRINCIPAL",
  status: "ACTIVE",
  schoolId: "s1",
  school: { id: "s1", code: "DPS01", name: "Delhi Public School" },
  lastLoginAt: null,
  mustChangePassword: false,
  classTeacherOf: null,
};

const overview = (setup: Partial<Record<string, boolean>> = {}) => ({
  school: { id: "s1", name: "Delhi Public School", code: "DPS01", board: null, phone: null, email: null, address: null, affiliationNo: null, website: null, status: "ACTIVE" },
  academicYear: setup.academicYear ? { id: "y1", name: "2026-27" } : null,
  counts: { teachers: 0, admins: 0, pendingAccounts: 2, classes: 0, sections: 0, sectionsWithoutClassTeacher: 0, subjects: 0, subjectAssignments: 0 },
  setup: { profile: false, academicYear: false, classes: false, subjects: false, staff: false, classTeachers: false, subjectTeachers: false, ...setup },
});

let fetchMock: ReturnType<typeof vi.fn>;
const calls = (method: string, path: string) =>
  fetchMock.mock.calls.filter(([u, i]) => String(u).includes(path) && ((i as RequestInit).method ?? "GET") === method);

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  saveSession(
    { accessToken: "a", refreshToken: "r", user: { id: "p1", fullName: "Anita Rao", email: "anita@dps.edu", role: "PRINCIPAL", schoolCode: "DPS01", schoolName: "Delhi Public School" } },
    false,
  );
});

afterEach(() => {
  cleanup();
  clearSession();
  queryClient.clear();
  vi.unstubAllGlobals();
});

describe("principal dashboard", () => {
  it("shows the setup checklist and pending approvals", async () => {
    fetchMock.mockImplementation((url: string) =>
      url.endsWith("/school/overview") ? ok(overview({ academicYear: true })) : ok({ user: principal }),
    );
    window.location.hash = "#/principal/dashboard";
    render(<App />);

    expect(await screen.findByText("1 / 7 done", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /2 accounts are waiting for your approval/i })).toHaveAttribute("href", "#/principal/staff?status=PENDING");
    // done steps have no button, pending ones link to the right tab
    expect(screen.getByRole("link", { name: "Add classes" })).toHaveAttribute("href", "#/principal/setup?tab=classes");
    expect(screen.queryByRole("link", { name: "Add year" })).not.toBeInTheDocument();
    // sidebar
    expect(screen.getAllByRole("link", { name: /class & subject teachers/i }).length).toBeGreaterThan(0);
  });
});

describe("staff", () => {
  it("creates a teacher and shows the login details to share", async () => {
    const created = {
      id: "t1",
      fullName: "Neha Verma",
      email: "neha@dps.edu",
      phone: null,
      role: "TEACHER",
      status: "ACTIVE",
      mustChangePassword: true,
      lastLoginAt: null,
      profile: { employeeId: "EMP-01", designation: null, qualification: null, gender: null, joiningDate: null },
      classTeacherOf: null,
      subjectAssignments: 0,
    };
    fetchMock.mockImplementation((url: string, init: RequestInit) => {
      if (url.includes("/staff") && init.method === "POST") return json(201, { success: true, data: created });
      if (url.includes("/staff")) return ok([]);
      return ok({ user: principal });
    });
    window.location.hash = "#/principal/staff";
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /add staff/i }));
    const dialog = screen.getByRole("dialog", { name: "Add Staff" });
    // principal may create office admins
    expect(within(dialog).getByRole("option", { name: "Office admin" })).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText(/full name/i), { target: { value: "Neha Verma" } });
    fireEvent.change(within(dialog).getByLabelText(/email \(login\)/i), { target: { value: "neha@dps.edu" } });
    fireEvent.change(within(dialog).getByLabelText(/employee id/i), { target: { value: "EMP-01" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /create account/i }));

    const creds = await screen.findByRole("dialog", { name: "Staff account created" });
    expect(creds).toHaveTextContent("School code: DPS01");
    expect(creds).toHaveTextContent("Role: Teacher");

    const body = JSON.parse(String((calls("POST", "/staff")[0][1] as RequestInit).body));
    expect(body).toMatchObject({ fullName: "Neha Verma", email: "neha@dps.edu", role: "TEACHER", profile: { employeeId: "EMP-01" } });
    expect(body.password).toMatch(/^.{12}$/);
  });
});

describe("class & subject teachers", () => {
  it("assigns a class teacher for the selected section", async () => {
    const classes = [
      {
        id: "c10",
        name: "Class 10",
        order: 13,
        stream: null,
        sections: [{ id: "sec10a", name: "A", label: "Class 10-A", roomNo: null, classTeacher: null, subjectCount: 0 }],
      },
    ];
    const teachers = [
      {
        id: "t1",
        fullName: "Neha Verma",
        email: "n@x.y",
        phone: null,
        role: "TEACHER",
        status: "ACTIVE",
        mustChangePassword: false,
        lastLoginAt: null,
        profile: {},
        classTeacherOf: null,
        subjectAssignments: 0,
      },
    ];
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith("/school/classes")) return ok(classes);
      if (url.includes("/staff")) return ok(teachers);
      if (url.endsWith("/school/subjects")) return ok([{ id: "m", name: "Mathematics", code: null }]);
      if (url.includes("/school/assignments")) return ok([]);
      if (url.endsWith("/school/overview")) return ok(overview({ academicYear: true }));
      if (url.includes("/class-teacher")) return ok({ id: "sec10a" });
      return ok({ user: principal });
    });
    window.location.hash = "#/principal/assignments";
    render(<App />);

    const select = await screen.findByLabelText(/class teacher/i);
    await screen.findAllByRole("option", { name: "Neha Verma" });
    fireEvent.change(select, { target: { value: "t1" } });

    await waitFor(() => expect(calls("PUT", "/school/sections/sec10a/class-teacher")).toHaveLength(1));
    expect(JSON.parse(String((calls("PUT", "/class-teacher")[0][1] as RequestInit).body))).toEqual({ teacherId: "t1" });
    expect(await screen.findByLabelText("Teacher for Mathematics")).toBeInTheDocument();
  });
});
