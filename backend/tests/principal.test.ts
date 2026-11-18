// Principal section: school profile, academic years, classes & sections,
// subjects, staff, class teachers and subject teachers.

import { beforeEach, describe, expect, it } from "vitest";
import { PASSWORD, api, bearer, clearDb, login, passwordHash, useTestDb } from "./helpers.js";
import { SchoolModel } from "../src/modules/schools/school.model.js";
import { UserModel } from "../src/modules/users/user.model.js";

useTestDb();

beforeEach(async () => {
  await clearDb();
  const [a, b] = await SchoolModel.create([
    { code: "AAA01", name: "School A" },
    { code: "BBB01", name: "School B" },
  ]);
  const hash = await passwordHash();
  await UserModel.create([
    { schoolId: a._id, fullName: "Principal A", email: "p@a.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash: hash },
    { schoolId: a._id, fullName: "Office A", email: "admin@a.com", role: "ADMIN", status: "ACTIVE", passwordHash: hash },
    { schoolId: b._id, fullName: "Principal B", email: "p@b.com", role: "PRINCIPAL", status: "ACTIVE", passwordHash: hash },
  ]);
});

const tokenFor = async (code: string, email: string, password = PASSWORD) =>
  (await login({ schoolCode: code, email, password })).body.data.tokens.accessToken as string;
const principalA = () => tokenFor("AAA01", "p@a.com");

const get = (t: string, url: string) => api().get(`/api/v1${url}`).set(bearer(t));
const post = (t: string, url: string, body: object) => api().post(`/api/v1${url}`).set(bearer(t)).send(body);
const put = (t: string, url: string, body: object) => api().put(`/api/v1${url}`).set(bearer(t)).send(body);
const patch = (t: string, url: string, body: object) => api().patch(`/api/v1${url}`).set(bearer(t)).send(body);
const del = (t: string, url: string) => api().delete(`/api/v1${url}`).set(bearer(t));

/** creates a teacher via the API and logs them in with a changed password */
async function addTeacher(t: string, name: string, email: string) {
  const res = await post(t, "/staff", { fullName: name, email, role: "TEACHER", password: "Temp12345" });
  expect(res.status).toBe(201);
  return res.body.data.id as string;
}

async function setupBasics(t: string) {
  await post(t, "/school/academic-years", { name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31" });
  await post(t, "/school/classes/from-template", { templateId: "CLASS_1_12", sections: ["A", "B"] });
  await post(t, "/school/subjects/bulk", { names: ["English", "Mathematics", "Science"] });
  const classes = (await get(t, "/school/classes")).body.data;
  const subjects = (await get(t, "/school/subjects")).body.data;
  const c10 = classes.find((c: { name: string }) => c.name === "Class 10");
  return {
    s10A: c10.sections.find((s: { name: string }) => s.name === "A").id as string,
    s10B: c10.sections.find((s: { name: string }) => s.name === "B").id as string,
    maths: subjects.find((s: { name: string }) => s.name === "Mathematics").id as string,
  };
}

describe("overview & profile", () => {
  it("setup checklist fills in as the school is configured", async () => {
    const t = await principalA();
    let o = (await get(t, "/school/overview")).body.data;
    expect(o.setup).toEqual({
      profile: false,
      academicYear: false,
      classes: false,
      subjects: false,
      staff: false,
      classTeachers: false,
      subjectTeachers: false,
    });

    await patch(t, "/school/profile", { board: "CBSE", phone: "9876543210" });
    const ids = await setupBasics(t);
    const teacherId = await addTeacher(t, "Neha Verma", "neha@a.com");
    await put(t, `/school/sections/${ids.s10A}/class-teacher`, { teacherId });
    await put(t, "/school/assignments", { sectionId: ids.s10A, subjectId: ids.maths, teacherId });

    o = (await get(t, "/school/overview")).body.data;
    expect(o.academicYear.name).toBe("2026-27");
    expect(o.counts).toMatchObject({ teachers: 1, admins: 1, classes: 12, sections: 24, subjects: 3, subjectAssignments: 1 });
    expect(o.counts.sectionsWithoutClassTeacher).toBe(23);
    expect(o.setup).toMatchObject({ profile: true, academicYear: true, classes: true, subjects: true, staff: true, classTeachers: false, subjectTeachers: true });
  });

  it("only the principal edits the profile; code and status can't be changed", async () => {
    const admin = await tokenFor("AAA01", "admin@a.com");
    expect((await patch(admin, "/school/profile", { board: "ICSE" })).status).toBe(403);

    const t = await principalA();
    const res = await patch(t, "/school/profile", { name: "School A Prime", board: "ICSE", code: "HACK", status: "SUSPENDED" });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: "School A Prime", board: "ICSE", code: "AAA01", status: "ACTIVE" });
  });
});

describe("academic years", () => {
  it("first year becomes current; switching current; can't delete the current year", async () => {
    const t = await principalA();
    const y1 = await post(t, "/school/academic-years", { name: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31" });
    expect(y1.body.data.isCurrent).toBe(true);
    const y2 = await post(t, "/school/academic-years", { name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: true });
    expect(y2.body.data.isCurrent).toBe(true);

    const list = (await get(t, "/school/academic-years")).body.data;
    expect(list.filter((y: { isCurrent: boolean }) => y.isCurrent)).toHaveLength(1);

    expect((await del(t, `/school/academic-years/${y2.body.data.id}`)).body.error.code).toBe("IN_USE");
    expect((await del(t, `/school/academic-years/${y1.body.data.id}`)).status).toBe(200);
  });

  it("validates the name format and dates", async () => {
    const t = await principalA();
    const res = await post(t, "/school/academic-years", { name: "2026", startDate: "2026-04-01", endDate: "2026-01-01" });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toEqual(expect.arrayContaining(["name"]));
  });
});

describe("classes, sections, subjects", () => {
  it("creates classes from a template once; running it again skips existing ones", async () => {
    const t = await principalA();
    const first = await post(t, "/school/classes/from-template", { templateId: "UPTO_10", sections: ["A"] });
    expect(first.body.data).toEqual({ created: 13, skipped: 0 });
    const again = await post(t, "/school/classes/from-template", { templateId: "PRIMARY", sections: ["A"] });
    expect(again.body.data).toEqual({ created: 0, skipped: 8 });

    const classes = (await get(t, "/school/classes")).body.data;
    expect(classes.map((c: { name: string }) => c.name).slice(0, 4)).toEqual(["Nursery", "LKG", "UKG", "Class 1"]);
  });

  it("supports streams for class 11/12 and blocks duplicates", async () => {
    const t = await principalA();
    const sci = await post(t, "/school/classes", { name: "Class 11", order: 14, stream: "Science", sections: ["A"] });
    expect(sci.status).toBe(201);
    expect((await post(t, "/school/classes", { name: "Class 11", order: 14, stream: "Commerce" })).status).toBe(201);
    expect((await post(t, "/school/classes", { name: "Class 11", order: 14, stream: "Science" })).status).toBe(409);

    const classes = (await get(t, "/school/classes")).body.data;
    expect(classes.map((c: { stream: string }) => c.stream)).toEqual(["Commerce", "Science"]);
    const label = classes.find((c: { stream: string }) => c.stream === "Science").sections[0].label;
    expect(label).toBe("Class 11 Science-A");
  });

  it("adds subjects in bulk, case-insensitive duplicates are skipped", async () => {
    const t = await principalA();
    await post(t, "/school/subjects", { name: "English" });
    const res = await post(t, "/school/subjects/bulk", { names: ["english", "Hindi", "Hindi", "Mathematics"] });
    expect(res.body.data).toEqual({ created: 2, skipped: 2 });
    expect((await post(t, "/school/subjects", { name: "ENGLISH" })).status).toBe(409);
  });
});

describe("staff", () => {
  it("principal creates a teacher who must change the temporary password", async () => {
    const t = await principalA();
    const res = await post(t, "/staff", {
      fullName: "Neha Verma",
      email: "Neha@A.com",
      role: "TEACHER",
      password: "Temp12345",
      profile: { employeeId: "EMP-01", designation: "TGT", joiningDate: "2024-06-01", gender: "FEMALE" },
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      email: "neha@a.com",
      role: "TEACHER",
      status: "ACTIVE",
      mustChangePassword: true,
      profile: { employeeId: "EMP-01", joiningDate: "2024-06-01" },
    });

    const teacher = await login({ schoolCode: "AAA01", email: "neha@a.com", password: "Temp12345" });
    expect(teacher.body.data.user.mustChangePassword).toBe(true);

    // employee id and email are unique inside the school
    const dupId = await post(t, "/staff", { fullName: "Xavier", email: "x@a.com", role: "TEACHER", password: "Temp12345", profile: { employeeId: "EMP-01" } });
    expect(dupId.body.error.code).toBe("EMPLOYEE_ID_TAKEN");
    const dupEmail = await post(t, "/staff", { fullName: "Xavier", email: "neha@a.com", role: "TEACHER", password: "Temp12345" });
    expect(dupEmail.body.error.code).toBe("EMAIL_TAKEN");
  });

  it("only the principal can create an office admin; nobody can create a principal here", async () => {
    const admin = await tokenFor("AAA01", "admin@a.com");
    expect((await post(admin, "/staff", { fullName: "A2", email: "a2@a.com", role: "ADMIN", password: "Temp12345" })).status).toBe(403);
    expect((await post(admin, "/staff", { fullName: "T2", email: "t2@a.com", role: "TEACHER", password: "Temp12345" })).status).toBe(201);

    const t = await principalA();
    expect((await post(t, "/staff", { fullName: "P2", email: "p2@a.com", role: "PRINCIPAL", password: "Temp12345" })).status).toBe(400);
    expect((await post(t, "/staff", { fullName: "A3", email: "a3@a.com", role: "ADMIN", password: "Temp12345" })).status).toBe(201);
  });

  it("lists and edits staff; teachers can't use these endpoints", async () => {
    const t = await principalA();
    const id = await addTeacher(t, "Neha Verma", "neha@a.com");
    const edited = await patch(t, `/staff/${id}`, { phone: "9876543210", profile: { designation: "PGT" } });
    expect(edited.body.data).toMatchObject({ phone: "9876543210", profile: { designation: "PGT" } });

    const list = (await get(t, "/staff?role=TEACHER")).body.data;
    expect(list).toHaveLength(1);

    // teacher (after setting own password) is refused
    const tl = await login({ schoolCode: "AAA01", email: "neha@a.com", password: "Temp12345" });
    const changed = await api()
      .post("/api/v1/auth/change-password")
      .set(bearer(tl.body.data.tokens.accessToken))
      .send({ currentPassword: "Temp12345", newPassword: "Neha12345" });
    const teacherToken = changed.body.data.tokens.accessToken;
    expect((await get(teacherToken, "/staff")).status).toBe(403);
    expect((await get(teacherToken, "/school/classes")).status).toBe(403);
  });
});

describe("class teachers & subject teachers", () => {
  it("assigns a class teacher; one section per teacher; shows up on the teacher's session", async () => {
    const t = await principalA();
    const ids = await setupBasics(t);
    const neha = await addTeacher(t, "Neha Verma", "neha@a.com");

    expect((await put(t, `/school/sections/${ids.s10A}/class-teacher`, { teacherId: neha })).status).toBe(200);
    const clash = await put(t, `/school/sections/${ids.s10B}/class-teacher`, { teacherId: neha });
    expect(clash.body.error.code).toBe("ALREADY_CLASS_TEACHER");
    expect(clash.body.error.message).toContain("Class 10-A");

    const session = await login({ schoolCode: "AAA01", email: "neha@a.com", password: "Temp12345" });
    expect(session.body.data.user.classTeacherOf).toMatchObject({ className: "Class 10", section: "A", label: "Class 10-A" });

    // remove → the teacher is free again
    await put(t, `/school/sections/${ids.s10A}/class-teacher`, { teacherId: null });
    expect((await put(t, `/school/sections/${ids.s10B}/class-teacher`, { teacherId: neha })).status).toBe(200);
  });

  it("subject teachers need an academic year; re-assigning replaces the teacher", async () => {
    const t = await principalA();
    await post(t, "/school/classes/from-template", { templateId: "CLASS_1_10", sections: ["A"] });
    await post(t, "/school/subjects", { name: "Mathematics" });
    const section = (await get(t, "/school/classes")).body.data[0].sections[0].id;
    const maths = (await get(t, "/school/subjects")).body.data[0].id;
    const neha = await addTeacher(t, "Neha", "neha@a.com");
    const ravi = await addTeacher(t, "Ravi", "ravi@a.com");

    const noYear = await put(t, "/school/assignments", { sectionId: section, subjectId: maths, teacherId: neha });
    expect(noYear.body.error.code).toBe("NO_ACADEMIC_YEAR");

    await post(t, "/school/academic-years", { name: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31" });
    await put(t, "/school/assignments", { sectionId: section, subjectId: maths, teacherId: neha });
    await put(t, "/school/assignments", { sectionId: section, subjectId: maths, teacherId: ravi });

    const rows = (await get(t, `/school/assignments?sectionId=${section}`)).body.data;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ subject: { name: "Mathematics" }, teacher: { fullName: "Ravi" }, section: { label: "Class 1-A" } });
  });

  it("things in use can't be deleted", async () => {
    const t = await principalA();
    const ids = await setupBasics(t);
    const neha = await addTeacher(t, "Neha", "neha@a.com");
    await put(t, "/school/assignments", { sectionId: ids.s10A, subjectId: ids.maths, teacherId: neha });

    expect((await del(t, `/school/subjects/${ids.maths}`)).body.error.code).toBe("IN_USE");
    expect((await del(t, `/school/sections/${ids.s10A}`)).body.error.code).toBe("IN_USE");
    const c10 = (await get(t, "/school/classes")).body.data.find((c: { name: string }) => c.name === "Class 10");
    expect((await del(t, `/school/classes/${c10.id}`)).body.error.code).toBe("IN_USE");
    // an unused section can go
    expect((await del(t, `/school/sections/${ids.s10B}`)).status).toBe(200);
  });

  it("a disabled teacher can't be assigned", async () => {
    const t = await principalA();
    const ids = await setupBasics(t);
    const neha = await addTeacher(t, "Neha", "neha@a.com");
    await patch(t, `/users/${neha}/status`, { status: "DISABLED" });
    const res = await put(t, `/school/sections/${ids.s10A}/class-teacher`, { teacherId: neha });
    expect(res.body.error.code).toBe("TEACHER_NOT_ACTIVE");
  });
});

describe("school isolation", () => {
  it("principal of school B can't see or touch school A's setup or staff", async () => {
    const a = await principalA();
    const ids = await setupBasics(a);
    const neha = await addTeacher(a, "Neha", "neha@a.com");
    const b = await tokenFor("BBB01", "p@b.com");

    expect((await get(b, "/school/classes")).body.data).toEqual([]);
    expect((await get(b, "/staff")).body.data.map((s: { email: string }) => s.email)).toEqual(["p@b.com"]);

    expect((await put(b, `/school/sections/${ids.s10A}/class-teacher`, { teacherId: null })).status).toBe(404);
    expect((await del(b, `/school/subjects/${ids.maths}`)).status).toBe(404);
    expect((await patch(b, `/staff/${neha}`, { fullName: "Hacked" })).status).toBe(404);

    // and school B can't use school A's teacher
    await post(b, "/school/classes", { name: "Class 1", order: 4, sections: ["A"] });
    const bSection = (await get(b, "/school/classes")).body.data[0].sections[0].id;
    expect((await put(b, `/school/sections/${bSection}/class-teacher`, { teacherId: neha })).body.error.code).toBe("TEACHER_NOT_FOUND");
  });
});
