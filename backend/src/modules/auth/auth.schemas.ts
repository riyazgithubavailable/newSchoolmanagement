import { z } from "zod";
import { ALL_ROLES, SELF_REGISTER_ROLES } from "../../constants/roles.js";

const schoolCode = z
  .string({ error: "School code is required." })
  .trim()
  .min(2, "School code is required.")
  .max(20)
  .transform((v) => v.toUpperCase());

const email = z
  .string({ error: "Email is required." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const passwordRule = z
  .string({ error: "Password is required." })
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.") // bcrypt limit
  .regex(/[A-Za-z]/, "Password must contain a letter.")
  .regex(/\d/, "Password must contain a number.");

export const registerSchema = z.object({
  schoolCode,
  fullName: z.string({ error: "Full name is required." }).trim().min(2, "Full name is required.").max(100),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number.")
    .optional(),
  password: passwordRule,
  role: z.enum(SELF_REGISTER_ROLES, {
    error: `Role must be one of: ${SELF_REGISTER_ROLES.join(", ")}. Principal/Admin accounts are created by the school.`,
  }),
});

export const loginSchema = z.object({
  /** Omit only for SUPER_ADMIN (platform) login */
  schoolCode: schoolCode.optional(),
  email,
  password: z.string({ error: "Password is required." }).min(1, "Password is required."),
  /** Role tab chosen on the login screen — optional, checked if sent */
  role: z.enum(ALL_ROLES).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string({ error: "refreshToken is required." }).min(10, "refreshToken is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
