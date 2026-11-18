import { z } from "zod";
import { passwordRule } from "../auth/auth.schemas.js";
import { SCHOOL_STATUS } from "./school.model.js";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal("").transform(() => undefined));

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

export const principalInput = z.object({
  fullName: z.string({ error: "Principal name is required." }).trim().min(2, "Principal name is required.").max(100),
  email,
  phone,
  password: passwordRule,
});

export const createSchoolSchema = z.object({
  school: z.object({
    name: z.string({ error: "School name is required." }).trim().min(3, "School name is required.").max(150),
    /** what users type at login — letters, numbers and dashes only */
    code: z
      .string({ error: "School code is required." })
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,12}$/, "School code must be 3–12 letters, numbers or dashes (e.g. DPS01)."),
    email: email.optional().or(z.literal("").transform(() => undefined)),
    phone,
    address: optionalText(300),
  }),
  principal: principalInput,
});

export const listSchoolsQuery = z.object({
  status: z.enum([SCHOOL_STATUS.ACTIVE, SCHOOL_STATUS.SUSPENDED]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const schoolStatusSchema = z.object({
  status: z.enum([SCHOOL_STATUS.ACTIVE, SCHOOL_STATUS.SUSPENDED], {
    error: "status must be ACTIVE or SUSPENDED.",
  }),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type PrincipalInput = z.infer<typeof principalInput>;
export type ListSchoolsQuery = z.infer<typeof listSchoolsQuery>;
