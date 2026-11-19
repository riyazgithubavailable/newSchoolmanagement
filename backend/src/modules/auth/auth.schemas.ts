import { z } from "zod";
import { ALL_ROLES } from "../../constants/roles.js";

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

export const loginSchema = z.object({
  schoolCode,
  email,
  password: z.string({ error: "Password is required." }).min(1, "Password is required."),
  /** Role tab chosen on the login screen — optional, checked if sent */
  role: z.enum(ALL_ROLES).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string({ error: "refreshToken is required." }).min(10, "refreshToken is required."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Current password is required." }).min(1, "Current password is required."),
  newPassword: passwordRule,
});

export const forgotPasswordSchema = z.object({
  schoolCode,
  email,
});

export const resetPasswordSchema = z.object({
  token: z.string({ error: "Reset token is required." }).min(20, "Invalid reset link."),
  newPassword: passwordRule,
});

/** Principal/Admin (or super admin) setting a temporary password for someone else */
export const adminSetPasswordSchema = z.object({
  newPassword: passwordRule,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
