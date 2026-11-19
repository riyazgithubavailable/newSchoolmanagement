import { z } from "zod";
import { SCHOOL_BOARDS } from "../schools/school.model.js";

export const objectId = (label: string) =>
  z.string({ error: `${label} is required.` }).regex(/^[a-f0-9]{24}$/i, `Invalid ${label}.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const sectionName = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{1,10}$/, "Section names are 1–10 letters/numbers (e.g. A, B, ROSE).");

/* ------------------------------ School profile ----------------------------- */

export const schoolProfileSchema = z.object({
  name: z.string().trim().min(3, "School name is required.").max(150).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address."))
    .optional()
    .or(z.literal("").transform(() => null)),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("").transform(() => null)),
  address: optionalText(300),
  board: z.enum(SCHOOL_BOARDS).nullable().optional(),
  affiliationNo: optionalText(50),
  website: optionalText(200),
});

/* ------------------------------ Academic year ------------------------------ */

const isoDate = (label: string) =>
  z.coerce.date({ error: `${label} must be a valid date (YYYY-MM-DD).` });

export const academicYearSchema = z
  .object({
    name: z
      .string({ error: "Name is required." })
      .trim()
      .regex(/^\d{4}-\d{2}$/, 'Use the format "2026-27".'),
    startDate: isoDate("Start date"),
    endDate: isoDate("End date"),
    isCurrent: z.boolean().optional(),
  })
  .refine((v) => v.endDate > v.startDate, { message: "End date must be after start date.", path: ["endDate"] });

/* --------------------------------- Classes --------------------------------- */

export const createClassSchema = z.object({
  name: z.string({ error: "Class name is required." }).trim().min(1, "Class name is required.").max(40),
  order: z.coerce.number().int().min(0).max(100),
  stream: optionalText(40),
  sections: z.array(sectionName).max(26).default([]),
});

export const updateClassSchema = createClassSchema.omit({ sections: true }).partial();

export const classTemplateSchema = z.object({
  templateId: z.string({ error: "Choose a template." }).min(1, "Choose a template."),
  /** sections created in every new class, e.g. ["A"] or ["A", "B"] */
  sections: z.array(sectionName).min(1, "Add at least one section.").max(26).default(["A"]),
});

/* --------------------------------- Sections -------------------------------- */

export const createSectionSchema = z.object({
  classId: objectId("class id"),
  name: sectionName,
  roomNo: optionalText(20),
});

export const updateSectionSchema = z.object({
  name: sectionName.optional(),
  roomNo: optionalText(20),
});

export const classTeacherSchema = z.object({
  /** null removes the class teacher */
  teacherId: objectId("teacher id").nullable(),
});

/* --------------------------------- Subjects -------------------------------- */

export const subjectSchema = z.object({
  name: z.string({ error: "Subject name is required." }).trim().min(2, "Subject name is required.").max(60),
  code: optionalText(12),
});

export const bulkSubjectsSchema = z.object({
  names: z.array(z.string().trim().min(2).max(60)).min(1, "Pick at least one subject.").max(60),
});

/* ---------------------------- Teaching assignments -------------------------- */

export const assignmentSchema = z.object({
  sectionId: objectId("section id"),
  subjectId: objectId("subject id"),
  teacherId: objectId("teacher id"),
});

export const assignmentQuery = z.object({
  sectionId: objectId("section id").optional(),
  teacherId: objectId("teacher id").optional(),
});

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
