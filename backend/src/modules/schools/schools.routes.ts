// Platform owner (SUPER_ADMIN) only: onboard and manage schools.
// Mounted at /api/v1/platform/schools (see platform.routes.ts).

import { Router, type Request, type Response } from "express";
import { ROLES } from "../../constants/roles.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { sendSuccess } from "../../utils/response.js";
import { adminSetPasswordSchema } from "../auth/auth.schemas.js";
import { AUDIT, audit, type AuditEntry } from "../platform/auditLog.model.js";
import {
  createSchoolSchema,
  listSchoolsQuery,
  principalInput,
  schoolStatusSchema,
  type CreateSchoolInput,
  type ListSchoolsQuery,
  type PrincipalInput,
} from "./schools.schemas.js";
import { schoolsService } from "./schools.service.js";

export const schoolsRouter = Router();

const log = (req: Request, e: Omit<AuditEntry, "actor" | "ip" | "userAgent">) =>
  audit({ ...e, actor: { id: req.auth!.sub, role: req.auth!.role }, ip: req.ip, userAgent: String(req.headers["user-agent"] ?? "") });
schoolsRouter.use(requireAuth, requireRole(ROLES.SUPER_ADMIN));

/** POST /api/v1/schools  { school: {...}, principal: {...} } */
schoolsRouter.post("/", validate(createSchoolSchema), async (req: Request, res: Response) => {
  const school = await schoolsService.create(req.body as CreateSchoolInput);
  await log(req, { action: AUDIT.SCHOOL_CREATED, schoolId: school.id, targetType: "School", targetId: school.id, details: { code: school.code, principal: school.principals[0]?.email } });
  sendSuccess(res, school, {
    status: 201,
    message: `School ${school.code} created. Share the school code, principal email and password with the principal.`,
  });
});

/** GET /api/v1/schools?status=ACTIVE&search=dps&page=1&limit=20 */
schoolsRouter.get("/", validate(listSchoolsQuery, "query"), async (_req: Request, res: Response) => {
  const { items, meta } = await schoolsService.list(res.locals.query as ListSchoolsQuery);
  sendSuccess(res, items, { meta });
});

/** GET /api/v1/schools/:id */
schoolsRouter.get("/:id", async (req: Request, res: Response) => {
  sendSuccess(res, await schoolsService.get(String(req.params.id)));
});

/** PATCH /api/v1/schools/:id/status  { "status": "SUSPENDED" | "ACTIVE" } */
schoolsRouter.patch("/:id/status", validate(schoolStatusSchema), async (req: Request, res: Response) => {
  const school = await schoolsService.setStatus(String(req.params.id), req.body.status);
  await log(req, { action: AUDIT.SCHOOL_STATUS_CHANGED, schoolId: school.id, targetType: "School", targetId: school.id, details: { code: school.code, status: school.status } });
  sendSuccess(res, school, { message: `School ${school.code} is now ${school.status.toLowerCase()}.` });
});

/** POST /api/v1/schools/:id/principals  { fullName, email, phone?, password } */
schoolsRouter.post("/:id/principals", validate(principalInput), async (req: Request, res: Response) => {
  const school = await schoolsService.addPrincipal(String(req.params.id), req.body as PrincipalInput);
  await log(req, { action: AUDIT.PRINCIPAL_ADDED, schoolId: school.id, targetType: "User", details: { code: school.code, email: (req.body as PrincipalInput).email } });
  sendSuccess(res, school, { status: 201, message: "Principal account created." });
});

/** POST /api/v1/schools/:id/principals/:userId/reset-password  { "newPassword": "Temp1234" } */
schoolsRouter.post(
  "/:id/principals/:userId/reset-password",
  validate(adminSetPasswordSchema),
  async (req: Request, res: Response) => {
    await schoolsService.resetPrincipalPassword(String(req.params.id), String(req.params.userId), req.body.newPassword);
    await log(req, { action: AUDIT.PRINCIPAL_PASSWORD_RESET, schoolId: String(req.params.id), targetType: "User", targetId: String(req.params.userId) });
    sendSuccess(res, null, { message: "Temporary password set. The principal must change it at next sign in." });
  },
);
