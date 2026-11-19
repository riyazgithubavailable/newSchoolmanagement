import type { StudentProgress } from "@/types/school";

export const ATTENDANCE_THRESHOLD = 75; // % — board exam eligibility
export const MARKS_THRESHOLD = 50; // % average
export const ASSIGNMENT_THRESHOLD = 60; // % completion

/** Human readable reasons a student is flagged; empty = on track */
export function attentionReasons(p: StudentProgress): string[] {
  const out: string[] = [];
  if (p.attendancePercent < ATTENDANCE_THRESHOLD) out.push(`Attendance ${p.attendancePercent}%`);
  if (p.averagePercent < MARKS_THRESHOLD) out.push(`Average ${p.averagePercent}%`);
  if (p.assignmentCompletion < ASSIGNMENT_THRESHOLD) out.push(`Assignments ${p.assignmentCompletion}%`);
  if (p.trend === "down") out.push("Marks dropping");
  return out;
}

export type Band = "Excellent" | "Good" | "Average" | "At Risk";

export function performanceBand(p: StudentProgress): Band {
  if (attentionReasons(p).some((r) => !r.startsWith("Marks dropping"))) return "At Risk";
  if (p.averagePercent >= 85) return "Excellent";
  if (p.averagePercent >= 65) return "Good";
  return "Average";
}

export const BAND_STYLE: Record<Band, string> = {
  Excellent: "bg-green-50 text-green-700",
  Good: "bg-blue-50 text-blue-700",
  Average: "bg-amber-50 text-amber-700",
  "At Risk": "bg-red-50 text-red-700",
};

/** colour a % value: green ≥ good, amber ≥ warn, red below */
export function pctTone(value: number, warn: number, good: number) {
  if (value >= good) return "text-green-700";
  if (value >= warn) return "text-amber-700";
  return "text-red-600";
}
