// Account management inside a school (Principal / Admin only).

import { Router, type Request, type Response } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { ALL_ROLES, ROLES, SCHOOL_MANAGER_ROLES, USER_STATUS } from "../../constants/roles.js";
import { currentSchoolId, requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { adminSetPasswordSchema } from "../auth/auth.schemas.js";
import { applyNewPassword } from "../auth/auth.service.js";
import { RefreshTokenModel } from "../auth/refreshToken.model.js";
import { UserModel, toObjectId } from "./user.model.js";

export const usersRouter = Router();
usersRouter.use(requireAuth, requireRole(...SCHOOL_MANAGER_ROLES));

const listQuery = z.object({
  status: z.enum(Object.values(USER_STATUS) as [string, ...string[]]).optional(),
  role: z.enum(ALL_ROLES).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** GET /api/v1/users?status=PENDING&role=TEACHER&search=neha&page=1&limit=20 */
usersRouter.get("/", validate(listQuery, "query"), async (req: Request, res: Response) => {
  const q = res.locals.query as z.infer<typeof listQuery>;
  const filter: Record<string, unknown> = { schoolId: currentSchoolId(req) };
  if (q.status) filter.status = q.status;
  if (q.role) filter.role = q.role;
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), "i");
    filter.$or = [{ fullName: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    UserModel.countDocuments(filter),
  ]);

  sendSuccess(res, items, {
    meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
  });
});

const statusBody = z.object({
  status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.REJECTED, USER_STATUS.DISABLED], {
    error: "status must be ACTIVE, REJECTED or DISABLED.",
  }),
});

/** PATCH /api/v1/users/:id/status  { "status": "ACTIVE" } — approve / reject / disable */
usersRouter.patch("/:id/status", validate(statusBody), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!isValidObjectId(id)) throw ApiError.badRequest("INVALID_ID", "Invalid user id.");
  const { status } = req.body as z.infer<typeof statusBody>;

  if (id === req.auth!.sub) {
    throw ApiError.forbidden("CANNOT_CHANGE_SELF", "You can't change your own account status.");
  }

  // schoolId in the filter = a principal can never touch another school's users
  const user = await UserModel.findOne({ _id: id, schoolId: currentSchoolId(req) });
  if (!user) throw ApiError.notFound("USER_NOT_FOUND", "User not found in your school.");

  if (user.role === ROLES.PRINCIPAL && req.auth!.role !== ROLES.PRINCIPAL) {
    throw ApiError.forbidden("FORBIDDEN", "Only a principal can change another principal's account.");
  }

  user.status = status;
  user.reviewedBy = toObjectId(req.auth!.sub);
  user.reviewedAt = new Date();
  await user.save();

  // a disabled / rejected user is logged out of every device immediately
  if (status !== USER_STATUS.ACTIVE) await RefreshTokenModel.deleteMany({ userId: user._id });

  sendSuccess(res, user, { message: `Account ${status.toLowerCase()}.` });
});

/**
 * POST /api/v1/users/:id/reset-password  { "newPassword": "Temp1234" }
 * Sets a temporary password; the user must change it at next login.
 */
usersRouter.post("/:id/reset-password", validate(adminSetPasswordSchema), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!isValidObjectId(id)) throw ApiError.badRequest("INVALID_ID", "Invalid user id.");
  if (id === req.auth!.sub) {
    throw ApiError.badRequest("USE_CHANGE_PASSWORD", "To change your own password use /auth/change-password.");
  }

  const user = await UserModel.findOne({ _id: id, schoolId: currentSchoolId(req) });
  if (!user) throw ApiError.notFound("USER_NOT_FOUND", "User not found in your school.");
  if (user.role === ROLES.PRINCIPAL && req.auth!.role !== ROLES.PRINCIPAL) {
    throw ApiError.forbidden("FORBIDDEN", "Only a principal can reset another principal's password.");
  }

  await applyNewPassword(user, req.body.newPassword, { mustChange: true });
  sendSuccess(res, user, { message: "Temporary password set. The user must change it at next sign in." });
});
