// School setup routes — Principal and Admin of the school.
// Mounted at /api/v1/school

import { Router, type Request, type Response } from "express";
import { Types } from "mongoose";
import { ROLES, SCHOOL_MANAGER_ROLES, USER_STATUS } from "../../constants/roles.js";
import { currentSchoolId, requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { sendSuccess } from "../../utils/response.js";
import { UserModel } from "../users/user.model.js";
import {
  AcademicYearModel,
  ClassModel,
  SectionModel,
  SUBJECT_SUGGESTIONS,
  SubjectModel,
  TeachingAssignmentModel,
} from "./academics.models.js";
import {
  academicYearSchema,
  assignmentQuery,
  assignmentSchema,
  bulkSubjectsSchema,
  classTeacherSchema,
  classTemplateSchema,
  createClassSchema,
  createSectionSchema,
  schoolProfileSchema,
  subjectSchema,
  updateClassSchema,
  updateSectionSchema,
} from "./academics.schemas.js";
import {
  academicYearService,
  assignmentService,
  classService,
  schoolProfileService,
  sectionService,
  subjectService,
} from "./academics.service.js";

export const schoolRouter = Router();
schoolRouter.use(requireAuth, requireRole(...SCHOOL_MANAGER_ROLES));

const sid = (req: Request) => currentSchoolId(req);
const id = (req: Request) => String(req.params.id);

/* ------------------------------- Overview -------------------------------- */

/** GET /school/overview — dashboard numbers + setup checklist */
schoolRouter.get("/overview", async (req: Request, res: Response) => {
  const schoolId = sid(req);
  const [profile, year, users, classes, sections, sectionsWithoutCT, subjects] = await Promise.all([
    schoolProfileService.get(schoolId),
    AcademicYearModel.findOne({ schoolId, isCurrent: true }),
    UserModel.aggregate<{ _id: { role: string; status: string }; n: number }>([
      { $match: { schoolId: new Types.ObjectId(schoolId) } },
      { $group: { _id: { role: "$role", status: "$status" }, n: { $sum: 1 } } },
    ]),
    ClassModel.countDocuments({ schoolId }),
    SectionModel.countDocuments({ schoolId }),
    SectionModel.countDocuments({ schoolId, classTeacherId: null }),
    SubjectModel.countDocuments({ schoolId }),
  ]);
  const assignments = year ? await TeachingAssignmentModel.countDocuments({ schoolId, academicYearId: year._id }) : 0;

  const count = (role: string, status = USER_STATUS.ACTIVE) =>
    users.filter((u) => u._id.role === role && u._id.status === status).reduce((s, u) => s + u.n, 0);
  const teachers = count(ROLES.TEACHER);

  sendSuccess(res, {
    school: profile,
    academicYear: year ? { id: String(year._id), name: year.name } : null,
    counts: {
      teachers,
      admins: count(ROLES.ADMIN),
      pendingAccounts: users.filter((u) => u._id.status === USER_STATUS.PENDING).reduce((s, u) => s + u.n, 0),
      classes,
      sections,
      sectionsWithoutClassTeacher: sectionsWithoutCT,
      subjects,
      subjectAssignments: assignments,
    },
    /** what's left to do before teachers can start working */
    setup: {
      profile: !!profile.board && !!profile.phone,
      academicYear: !!year,
      classes: sections > 0,
      subjects: subjects > 0,
      staff: teachers > 0,
      classTeachers: sections > 0 && sectionsWithoutCT === 0,
      subjectTeachers: assignments > 0,
    },
  });
});

/* ------------------------------- Profile --------------------------------- */

schoolRouter.get("/profile", async (req, res) => sendSuccess(res, await schoolProfileService.get(sid(req))));
schoolRouter.patch("/profile", requireRole(ROLES.PRINCIPAL), validate(schoolProfileSchema), async (req, res) =>
  sendSuccess(res, await schoolProfileService.update(sid(req), req.body), { message: "School profile saved." }),
);

/* ---------------------------- Academic years ----------------------------- */

schoolRouter.get("/academic-years", async (req, res) => sendSuccess(res, await academicYearService.list(sid(req))));
schoolRouter.post("/academic-years", validate(academicYearSchema), async (req, res) =>
  sendSuccess(res, await academicYearService.create(sid(req), req.body), { status: 201, message: "Academic year added." }),
);
schoolRouter.post("/academic-years/:id/set-current", async (req, res) =>
  sendSuccess(res, await academicYearService.setCurrent(sid(req), id(req)), { message: "Current academic year updated." }),
);
schoolRouter.delete("/academic-years/:id", async (req, res) => {
  await academicYearService.remove(sid(req), id(req));
  sendSuccess(res, null, { message: "Academic year deleted." });
});

/* --------------------------- Classes & sections -------------------------- */

schoolRouter.get("/class-templates", (_req, res) => sendSuccess(res, classService.templates()));
schoolRouter.get("/classes", async (req, res) => sendSuccess(res, await classService.list(sid(req))));
schoolRouter.post("/classes", validate(createClassSchema), async (req, res) =>
  sendSuccess(res, await classService.create(sid(req), req.body), { status: 201, message: "Class added." }),
);
schoolRouter.post("/classes/from-template", validate(classTemplateSchema), async (req, res) => {
  const r = await classService.createFromTemplate(sid(req), req.body.templateId, req.body.sections);
  sendSuccess(res, r, {
    status: 201,
    message: `${r.created} class${r.created === 1 ? "" : "es"} added${r.skipped ? `, ${r.skipped} already existed` : ""}.`,
  });
});
schoolRouter.patch("/classes/:id", validate(updateClassSchema), async (req, res) =>
  sendSuccess(res, await classService.update(sid(req), id(req), req.body), { message: "Class updated." }),
);
schoolRouter.delete("/classes/:id", async (req, res) => {
  await classService.remove(sid(req), id(req));
  sendSuccess(res, null, { message: "Class deleted." });
});

schoolRouter.post("/sections", validate(createSectionSchema), async (req, res) =>
  sendSuccess(res, await sectionService.create(sid(req), req.body), { status: 201, message: "Section added." }),
);
schoolRouter.patch("/sections/:id", validate(updateSectionSchema), async (req, res) =>
  sendSuccess(res, await sectionService.update(sid(req), id(req), req.body), { message: "Section updated." }),
);
schoolRouter.delete("/sections/:id", async (req, res) => {
  await sectionService.remove(sid(req), id(req));
  sendSuccess(res, null, { message: "Section deleted." });
});
schoolRouter.put("/sections/:id/class-teacher", validate(classTeacherSchema), async (req, res) =>
  sendSuccess(res, await sectionService.setClassTeacher(sid(req), id(req), req.body.teacherId), {
    message: req.body.teacherId ? "Class teacher assigned." : "Class teacher removed.",
  }),
);

/* -------------------------------- Subjects ------------------------------- */

schoolRouter.get("/subject-suggestions", (_req, res) => sendSuccess(res, SUBJECT_SUGGESTIONS));
schoolRouter.get("/subjects", async (req, res) => sendSuccess(res, await subjectService.list(sid(req))));
schoolRouter.post("/subjects", validate(subjectSchema), async (req, res) =>
  sendSuccess(res, await subjectService.create(sid(req), req.body), { status: 201, message: "Subject added." }),
);
schoolRouter.post("/subjects/bulk", validate(bulkSubjectsSchema), async (req, res) => {
  const r = await subjectService.createMany(sid(req), req.body.names);
  sendSuccess(res, r, { status: 201, message: `${r.created} subject${r.created === 1 ? "" : "s"} added.` });
});
schoolRouter.patch("/subjects/:id", validate(subjectSchema), async (req, res) =>
  sendSuccess(res, await subjectService.update(sid(req), id(req), req.body), { message: "Subject updated." }),
);
schoolRouter.delete("/subjects/:id", async (req, res) => {
  await subjectService.remove(sid(req), id(req));
  sendSuccess(res, null, { message: "Subject deleted." });
});

/* ----------------------- Teaching assignments ---------------------------- */

schoolRouter.get("/assignments", validate(assignmentQuery, "query"), async (req, res) =>
  sendSuccess(res, await assignmentService.list(sid(req), res.locals.query)),
);
schoolRouter.put("/assignments", validate(assignmentSchema), async (req, res) =>
  sendSuccess(res, await assignmentService.upsert(sid(req), req.body), { message: "Subject teacher assigned." }),
);
schoolRouter.delete("/assignments/:id", async (req, res) => {
  await assignmentService.remove(sid(req), id(req));
  sendSuccess(res, null, { message: "Assignment removed." });
});
