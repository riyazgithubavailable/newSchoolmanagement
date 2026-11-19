// Staff accounts (teachers, office admins) created by the school itself.
// Routes: /api/v1/staff — Principal and Admin.

import { Router, type Request, type Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { ROLES, SCHOOL_MANAGER_ROLES, USER_STATUS, type Role } from "../../constants/roles.js";
import { currentSchoolId, requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { passwordRule } from "../auth/auth.schemas.js";
import { hashPassword } from "../auth/auth.service.js";
import { AcademicYearModel, ClassModel, SectionModel, TeachingAssignmentModel } from "../academics/academics.models.js";
import { sectionLabel } from "../academics/academics.service.js";
import { UserModel, type UserDoc } from "../users/user.model.js";

const STAFF_ROLES = [ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.TEACHER];

/* -------------------------------- Schemas -------------------------------- */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined));

const profileSchema = z.object({
  employeeId: optionalText(30),
  designation: optionalText(60),
  qualification: optionalText(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable().transform((v) => v ?? undefined),
  joiningDate: z.coerce.date().optional().nullable().transform((v) => v ?? undefined),
});

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{10,15}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createStaffSchema = z.object({
  fullName: z.string({ error: "Full name is required." }).trim().min(2, "Full name is required.").max(100),
  email: z.string({ error: "Email is required." }).trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  phone,
  role: z.enum([ROLES.TEACHER, ROLES.ADMIN], { error: "Role must be TEACHER or ADMIN." }),
  /** temporary password — the person must change it at first sign in */
  password: passwordRule,
  profile: profileSchema.prefault({}),
});

export const updateStaffSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(100).optional(),
  phone,
  profile: profileSchema.optional(),
});

const listQuery = z.object({
  role: z.enum([ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.TEACHER]).optional(),
  status: z.enum(Object.values(USER_STATUS) as [string, ...string[]]).optional(),
  search: z.string().trim().max(100).optional(),
});

/* -------------------------------- Service -------------------------------- */

async function toStaff(users: UserDoc[], schoolId: string) {
  const ids = users.map((u) => u._id);
  const [sections, year] = await Promise.all([
    SectionModel.find({ schoolId, classTeacherId: { $in: ids } }),
    AcademicYearModel.findOne({ schoolId, isCurrent: true }),
  ]);
  const classes = new Map((await ClassModel.find({ schoolId })).map((c) => [String(c._id), c] as const));
  const counts = new Map<string, number>();
  if (year) {
    const rows = await TeachingAssignmentModel.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { schoolId: new Types.ObjectId(schoolId), academicYearId: year._id, teacherId: { $in: ids } } },
      { $group: { _id: "$teacherId", n: { $sum: 1 } } },
    ]);
    rows.forEach((r) => counts.set(String(r._id), r.n));
  }

  return users.map((u) => {
    const ct = sections.find((s) => String(s.classTeacherId) === String(u._id));
    const cls = ct ? classes.get(String(ct.classId)) : undefined;
    const p = u.staffProfile;
    return {
      id: String(u._id),
      fullName: u.fullName,
      email: u.email,
      phone: u.phone ?? null,
      role: u.role as Role,
      status: u.status,
      mustChangePassword: !!u.mustChangePassword,
      lastLoginAt: u.lastLoginAt ?? null,
      profile: {
        employeeId: p?.employeeId ?? null,
        designation: p?.designation ?? null,
        qualification: p?.qualification ?? null,
        gender: p?.gender ?? null,
        joiningDate: p?.joiningDate ? p.joiningDate.toISOString().slice(0, 10) : null,
      },
      classTeacherOf: ct && cls ? { sectionId: String(ct._id), label: sectionLabel(cls, ct) } : null,
      subjectAssignments: counts.get(String(u._id)) ?? 0,
    };
  });
}

async function assertEmployeeIdFree(schoolId: string, employeeId: string | undefined, exceptId?: Types.ObjectId) {
  if (!employeeId) return;
  const clash = await UserModel.exists({
    schoolId,
    "staffProfile.employeeId": employeeId,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (clash) throw ApiError.conflict("EMPLOYEE_ID_TAKEN", `Employee ID ${employeeId} is already used.`);
}

export const staffService = {
  async list(schoolId: string, q: z.infer<typeof listQuery>) {
    const filter: Record<string, unknown> = { schoolId, role: q.role ?? { $in: STAFF_ROLES } };
    if (q.status) filter.status = q.status;
    if (q.search) {
      const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ fullName: rx }, { email: rx }, { "staffProfile.employeeId": rx }];
    }
    const users = await UserModel.find(filter).sort({ role: 1, fullName: 1 });
    return toStaff(users, schoolId);
  },

  async create(schoolId: string, actorRole: Role, input: z.infer<typeof createStaffSchema>) {
    if (input.role === ROLES.ADMIN && actorRole !== ROLES.PRINCIPAL) {
      throw ApiError.forbidden("FORBIDDEN", "Only the principal can create office admin accounts.");
    }
    if (await UserModel.exists({ schoolId, email: input.email })) {
      throw ApiError.conflict("EMAIL_TAKEN", "An account with this email already exists in your school.");
    }
    await assertEmployeeIdFree(schoolId, input.profile.employeeId);

    const user = await UserModel.create({
      schoolId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      role: input.role,
      status: USER_STATUS.ACTIVE,
      mustChangePassword: true,
      passwordHash: await hashPassword(input.password),
      staffProfile: input.profile,
    });
    return (await toStaff([user], schoolId))[0];
  },

  async update(schoolId: string, actorRole: Role, id: string, input: z.infer<typeof updateStaffSchema>) {
    if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("INVALID_ID", "Invalid staff id.");
    const user = await UserModel.findOne({ _id: id, schoolId, role: { $in: STAFF_ROLES } });
    if (!user) throw ApiError.notFound("USER_NOT_FOUND", "Staff member not found in your school.");
    if (user.role !== ROLES.TEACHER && actorRole !== ROLES.PRINCIPAL) {
      throw ApiError.forbidden("FORBIDDEN", "Only the principal can edit admin and principal accounts.");
    }
    if (input.profile) await assertEmployeeIdFree(schoolId, input.profile.employeeId, user._id);

    if (input.fullName) user.fullName = input.fullName;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.profile) {
      user.set("staffProfile", { ...(user.staffProfile ?? {}), ...input.profile });
    }
    await user.save();
    return (await toStaff([user], schoolId))[0];
  },
};

/* -------------------------------- Routes --------------------------------- */

export const staffRouter = Router();
staffRouter.use(requireAuth, requireRole(...SCHOOL_MANAGER_ROLES));

staffRouter.get("/", validate(listQuery, "query"), async (req: Request, res: Response) => {
  sendSuccess(res, await staffService.list(currentSchoolId(req), res.locals.query));
});

staffRouter.post("/", validate(createStaffSchema), async (req: Request, res: Response) => {
  const staff = await staffService.create(currentSchoolId(req), req.auth!.role, req.body);
  sendSuccess(res, staff, {
    status: 201,
    message: "Account created. Share the school code, email and temporary password with the staff member.",
  });
});

staffRouter.patch("/:id", validate(updateStaffSchema), async (req: Request, res: Response) => {
  sendSuccess(res, await staffService.update(currentSchoolId(req), req.auth!.role, String(req.params.id), req.body), {
    message: "Saved.",
  });
});
