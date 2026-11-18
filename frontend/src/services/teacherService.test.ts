import { describe, expect, it } from "vitest";
import { countLeaveDays, gradeFromPercent, teacherService } from "./teacherService";
import { attentionReasons, performanceBand } from "@/components/teacher/classTeacher/progressUtils";
import type { StudentProgress } from "@/types/school";

const iso = (offsetDays: number, { skipSunday = false } = {}) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  if (skipSunday && d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday has no working day
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

describe("countLeaveDays", () => {
  it("excludes Sundays", () => {
    // 2026-11-14 is a Saturday, 2026-11-16 a Monday → Sat + Mon = 2
    expect(countLeaveDays("2026-11-14", "2026-11-16", false)).toBe(2);
  });
  it("counts a half day as 0.5", () => {
    expect(countLeaveDays("2026-11-16", "2026-11-16", true)).toBe(0.5);
  });
  it("returns 0 when end is before start", () => {
    expect(countLeaveDays("2026-11-16", "2026-11-10", false)).toBe(0);
  });
});

describe("gradeFromPercent", () => {
  it.each([
    [95, "A1"],
    [81, "A2"],
    [70, "B2"],
    [33, "D"],
    [20, "E"],
  ])("%i%% → %s", (p, g) => expect(gradeFromPercent(p)).toBe(g));
});

describe("teacherService.applyLeave", () => {
  it("rejects requests that overlap an existing pending/approved leave", async () => {
    // mock DB has a pending casual leave 6–7 days from today
    await expect(
      teacherService.applyLeave({ type: "Casual Leave", fromDate: iso(7), toDate: iso(7), halfDay: false, reason: "test" }),
    ).rejects.toThrow(/already have a leave/);
  });

  it("rejects when balance is insufficient", async () => {
    await expect(
      teacherService.applyLeave({ type: "Sick Leave", fromDate: iso(30), toDate: iso(45), halfDay: false, reason: "test" }),
    ).rejects.toThrow(/Not enough Sick Leave/);
  });

  it("creates a pending request and it can be cancelled", async () => {
    const req = await teacherService.applyLeave({
      type: "Unpaid Leave",
      fromDate: iso(60, { skipSunday: true }),
      toDate: iso(60, { skipSunday: true }),
      halfDay: false,
      reason: "personal",
    });
    expect(req.status).toBe("Pending");
    const cancelled = await teacherService.cancelLeave(req.id);
    expect(cancelled.status).toBe("Cancelled");
  });
});

describe("teacherService check-in", () => {
  it("does not allow checking in twice", async () => {
    if (new Date().getDay() === 0) return; // Sunday: no check-in
    await teacherService.checkIn();
    await expect(teacherService.checkIn()).rejects.toThrow(/already checked in/);
  });
});

describe("progress helpers", () => {
  const base = {
    attendancePercent: 95,
    averagePercent: 88,
    assignmentCompletion: 95,
    trend: "steady",
  } as StudentProgress;

  it("flags low attendance as at risk", () => {
    const p = { ...base, attendancePercent: 70 };
    expect(attentionReasons(p)).toContain("Attendance 70%");
    expect(performanceBand(p)).toBe("At Risk");
  });

  it("a dropping trend alone is flagged but not at risk", () => {
    const p = { ...base, trend: "down" as const };
    expect(attentionReasons(p)).toEqual(["Marks dropping"]);
    expect(performanceBand(p)).toBe("Excellent");
  });
});
