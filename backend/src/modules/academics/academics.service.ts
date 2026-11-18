// School setup logic. Every function receives the caller's schoolId and
// every query filters by it — one school can never touch another's data.

import { Types } from "mongoose";
import { ROLES, USER_STATUS } from "../../constants/roles.js";
import { ApiError } from "../../utils/ApiError.js";
import { SchoolModel } from "../schools/school.model.js";
import { UserModel } from "../users/user.model.js";
import {
  AcademicYearModel,
  CLASS_TEMPLATES,
  ClassModel,
  SectionModel,
  SubjectModel,
  TeachingAssignmentModel,
  type AcademicYearDoc,
} from "./academics.models.js";
import type {
  AcademicYearInput,
  AssignmentInput,
  CreateClassInput,
  CreateSectionInput,
  SchoolProfileInput,
  SubjectInput,
  UpdateClassInput,
  UpdateSectionInput,
} from "./academics.schemas.js";

const oid = (id: string) => new Types.ObjectId(id);

/** "Class 10" + "A" → "Class 10-A"; with stream → "Class 11 Science-A" */
export const sectionLabel = (cls: { name: string; stream?: string | null }, section: { name: string }) =>
  `${cls.name}${cls.stream ? ` ${cls.stream}` : ""}-${section.name}`;

async function findInSchool<T>(
  model: { findOne: (f: object) => { exec: () => Promise<T | null> } },
  schoolId: string,
  id: string,
  code: string,
  label: string,
) {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("INVALID_ID", `Invalid ${label} id.`);
  const doc = await model.findOne({ _id: id, schoolId }).exec();
  if (!doc) throw ApiError.notFound(code, `${label[0].toUpperCase()}${label.slice(1)} not found.`);
  return doc;
}

const publicYear = (y: AcademicYearDoc) => ({
  id: String(y._id),
  name: y.name,
  startDate: y.startDate.toISOString().slice(0, 10),
  endDate: y.endDate.toISOString().slice(0, 10),
  isCurrent: y.isCurrent,
});

/* ========================================================================== */
/* School profile                                                              */
/* ========================================================================== */

export const schoolProfileService = {
  async get(schoolId: string) {
    const s = await SchoolModel.findById(schoolId);
    if (!s) throw ApiError.notFound("SCHOOL_NOT_FOUND", "School not found.");
    return {
      id: String(s._id),
      name: s.name,
      code: s.code,
      email: s.email ?? null,
      phone: s.phone ?? null,
      address: s.address ?? null,
      board: s.board ?? null,
      affiliationNo: s.affiliationNo ?? null,
      website: s.website ?? null,
      status: s.status,
    };
  },

  /** Code and status are controlled by the platform owner, not the school. */
  async update(schoolId: string, input: SchoolProfileInput) {
    const patch = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    await SchoolModel.updateOne({ _id: schoolId }, { $set: patch });
    return this.get(schoolId);
  },
};

/* ========================================================================== */
/* Academic years                                                              */
/* ========================================================================== */

export async function currentYearOrThrow(schoolId: string) {
  const year = await AcademicYearModel.findOne({ schoolId, isCurrent: true });
  if (!year) {
    throw ApiError.badRequest("NO_ACADEMIC_YEAR", "Set up the current academic year first (School Setup → Academic Year).");
  }
  return year;
}

export const academicYearService = {
  async list(schoolId: string) {
    const years = await AcademicYearModel.find({ schoolId }).sort({ startDate: -1 });
    return years.map(publicYear);
  },

  async create(schoolId: string, input: AcademicYearInput) {
    if (await AcademicYearModel.exists({ schoolId, name: input.name })) {
      throw ApiError.conflict("DUPLICATE", `Academic year ${input.name} already exists.`);
    }
    const hasCurrent = await AcademicYearModel.exists({ schoolId, isCurrent: true });
    const makeCurrent = input.isCurrent || !hasCurrent; // the first year becomes current
    if (makeCurrent) await AcademicYearModel.updateMany({ schoolId }, { isCurrent: false });
    const year = await AcademicYearModel.create({ schoolId, ...input, isCurrent: makeCurrent });
    return publicYear(year);
  },

  async setCurrent(schoolId: string, id: string) {
    const year = await findInSchool(AcademicYearModel, schoolId, id, "NOT_FOUND", "academic year");
    await AcademicYearModel.updateMany({ schoolId }, { isCurrent: false });
    year.isCurrent = true;
    await year.save();
    return publicYear(year);
  },

  async remove(schoolId: string, id: string) {
    const year = await findInSchool(AcademicYearModel, schoolId, id, "NOT_FOUND", "academic year");
    if (year.isCurrent) throw ApiError.conflict("IN_USE", "You can't delete the current academic year.");
    if (await TeachingAssignmentModel.exists({ schoolId, academicYearId: year._id })) {
      throw ApiError.conflict("IN_USE", "This academic year already has teaching assignments.");
    }
    await year.deleteOne();
  },
};

/* ========================================================================== */
/* Classes & sections                                                          */
/* ========================================================================== */

export const classService = {
  templates: () => CLASS_TEMPLATES,

  /** All classes with their sections, class teachers and subject counts. */
  async list(schoolId: string) {
    const [classes, sections, year] = await Promise.all([
      ClassModel.find({ schoolId }).sort({ order: 1, stream: 1 }),
      SectionModel.find({ schoolId }).sort({ name: 1 }).populate<{ classTeacherId: { _id: Types.ObjectId; fullName: string } | null }>(
        "classTeacherId",
        "fullName",
      ),
      AcademicYearModel.findOne({ schoolId, isCurrent: true }),
    ]);

    const counts = new Map<string, number>();
    if (year) {
      const rows = await TeachingAssignmentModel.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { schoolId: oid(schoolId), academicYearId: year._id } },
        { $group: { _id: "$sectionId", n: { $sum: 1 } } },
      ]);
      rows.forEach((r) => counts.set(String(r._id), r.n));
    }

    return classes.map((c) => ({
      id: String(c._id),
      name: c.name,
      order: c.order,
      stream: c.stream ?? null,
      sections: sections
        .filter((s) => String(s.classId) === String(c._id))
        .map((s) => ({
          id: String(s._id),
          name: s.name,
          label: sectionLabel(c, s),
          roomNo: s.roomNo ?? null,
          classTeacher: s.classTeacherId ? { id: String(s.classTeacherId._id), fullName: s.classTeacherId.fullName } : null,
          subjectCount: counts.get(String(s._id)) ?? 0,
        })),
    }));
  },

  async create(schoolId: string, input: CreateClassInput) {
    if (await ClassModel.exists({ schoolId, name: input.name, stream: input.stream ?? null })) {
      throw ApiError.conflict("DUPLICATE", `${input.name}${input.stream ? ` (${input.stream})` : ""} already exists.`);
    }
    const cls = await ClassModel.create({ schoolId, name: input.name, order: input.order, stream: input.stream ?? null });
    const unique = [...new Set(input.sections)];
    if (unique.length) await SectionModel.insertMany(unique.map((name) => ({ schoolId, classId: cls._id, name })));
    return { id: String(cls._id) };
  },

  /** Creates the template's classes that don't exist yet, each with the given sections. */
  async createFromTemplate(schoolId: string, templateId: string, sections: string[]) {
    const template = CLASS_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw ApiError.badRequest("INVALID_TEMPLATE", "Unknown class template.");

    let created = 0;
    let skipped = 0;
    for (const c of template.classes) {
      if (await ClassModel.exists({ schoolId, name: c.name, stream: null })) {
        skipped++;
        continue;
      }
      await this.create(schoolId, { name: c.name, order: c.order, stream: null, sections });
      created++;
    }
    return { created, skipped };
  },

  async update(schoolId: string, id: string, input: UpdateClassInput) {
    const cls = await findInSchool(ClassModel, schoolId, id, "CLASS_NOT_FOUND", "class");
    const name = input.name ?? cls.name;
    const stream = input.stream === undefined ? (cls.stream ?? null) : input.stream;
    if ((name !== cls.name || stream !== (cls.stream ?? null)) && (await ClassModel.exists({ schoolId, name, stream }))) {
      throw ApiError.conflict("DUPLICATE", `${name}${stream ? ` (${stream})` : ""} already exists.`);
    }
    cls.name = name;
    cls.stream = stream;
    if (input.order !== undefined) cls.order = input.order;
    await cls.save();
    return { id: String(cls._id) };
  },

  /** Only empty classes can be deleted (no class teacher, no subject teachers). */
  async remove(schoolId: string, id: string) {
    const cls = await findInSchool(ClassModel, schoolId, id, "CLASS_NOT_FOUND", "class");
    const sectionIds = await SectionModel.find({ schoolId, classId: cls._id }).distinct("_id");
    if (
      (await SectionModel.exists({ _id: { $in: sectionIds }, classTeacherId: { $ne: null } })) ||
      (await TeachingAssignmentModel.exists({ schoolId, sectionId: { $in: sectionIds } }))
    ) {
      throw ApiError.conflict("IN_USE", "Remove the class teachers and subject teachers of this class first.");
    }
    await SectionModel.deleteMany({ schoolId, classId: cls._id });
    await cls.deleteOne();
  },
};

export const sectionService = {
  async create(schoolId: string, input: CreateSectionInput) {
    const cls = await findInSchool(ClassModel, schoolId, input.classId, "CLASS_NOT_FOUND", "class");
    if (await SectionModel.exists({ schoolId, classId: cls._id, name: input.name })) {
      throw ApiError.conflict("DUPLICATE", `Section ${input.name} already exists in ${cls.name}.`);
    }
    const s = await SectionModel.create({ schoolId, classId: cls._id, name: input.name, roomNo: input.roomNo ?? null });
    return { id: String(s._id) };
  },

  async update(schoolId: string, id: string, input: UpdateSectionInput) {
    const s = await findInSchool(SectionModel, schoolId, id, "SECTION_NOT_FOUND", "section");
    if (input.name && input.name !== s.name && (await SectionModel.exists({ schoolId, classId: s.classId, name: input.name }))) {
      throw ApiError.conflict("DUPLICATE", `Section ${input.name} already exists in this class.`);
    }
    if (input.name) s.name = input.name;
    if (input.roomNo !== undefined) s.roomNo = input.roomNo;
    await s.save();
    return { id: String(s._id) };
  },

  async remove(schoolId: string, id: string) {
    const s = await findInSchool(SectionModel, schoolId, id, "SECTION_NOT_FOUND", "section");
    if (s.classTeacherId || (await TeachingAssignmentModel.exists({ schoolId, sectionId: s._id }))) {
      throw ApiError.conflict("IN_USE", "Remove the class teacher and subject teachers of this section first.");
    }
    await s.deleteOne();
  },

  /** teacherId null → remove the class teacher. */
  async setClassTeacher(schoolId: string, id: string, teacherId: string | null) {
    const s = await findInSchool(SectionModel, schoolId, id, "SECTION_NOT_FOUND", "section");
    if (teacherId) {
      const teacher = await activeTeacher(schoolId, teacherId);
      const other = await SectionModel.findOne({ schoolId, classTeacherId: teacher._id, _id: { $ne: s._id } });
      if (other) {
        const cls = await ClassModel.findById(other.classId);
        throw ApiError.conflict(
          "ALREADY_CLASS_TEACHER",
          `${teacher.fullName} is already class teacher of ${cls ? sectionLabel(cls, other) : "another section"}.`,
        );
      }
      s.classTeacherId = teacher._id;
    } else {
      s.classTeacherId = null;
    }
    await s.save();
    return { id: String(s._id) };
  },
};

/** The user must be an ACTIVE teacher of this school. */
async function activeTeacher(schoolId: string, teacherId: string) {
  if (!Types.ObjectId.isValid(teacherId)) throw ApiError.badRequest("INVALID_ID", "Invalid teacher id.");
  const teacher = await UserModel.findOne({ _id: teacherId, schoolId, role: ROLES.TEACHER });
  if (!teacher) throw ApiError.notFound("TEACHER_NOT_FOUND", "Teacher not found in your school.");
  if (teacher.status !== USER_STATUS.ACTIVE) {
    throw ApiError.badRequest("TEACHER_NOT_ACTIVE", `${teacher.fullName}'s account is not active.`);
  }
  return teacher;
}

/* ========================================================================== */
/* Subjects                                                                    */
/* ========================================================================== */

export const subjectService = {
  async list(schoolId: string) {
    const subjects = await SubjectModel.find({ schoolId }).sort({ name: 1 });
    return subjects.map((s) => ({ id: String(s._id), name: s.name, code: s.code ?? null }));
  },

  async create(schoolId: string, input: SubjectInput) {
    if (await SubjectModel.exists({ schoolId, name: new RegExp(`^${escape(input.name)}$`, "i") })) {
      throw ApiError.conflict("DUPLICATE", `${input.name} already exists.`);
    }
    const s = await SubjectModel.create({ schoolId, name: input.name, code: input.code ?? null });
    return { id: String(s._id), name: s.name, code: s.code ?? null };
  },

  /** Adds several subjects at once; existing names are skipped. */
  async createMany(schoolId: string, names: string[]) {
    const existing = new Set((await SubjectModel.find({ schoolId }).distinct("name")).map((n: string) => n.toLowerCase()));
    const fresh = [...new Map(names.map((n) => [n.toLowerCase(), n])).values()].filter((n) => !existing.has(n.toLowerCase()));
    if (fresh.length) await SubjectModel.insertMany(fresh.map((name) => ({ schoolId, name })));
    return { created: fresh.length, skipped: names.length - fresh.length };
  },

  async update(schoolId: string, id: string, input: SubjectInput) {
    const s = await findInSchool(SubjectModel, schoolId, id, "SUBJECT_NOT_FOUND", "subject");
    if (
      input.name.toLowerCase() !== s.name.toLowerCase() &&
      (await SubjectModel.exists({ schoolId, name: new RegExp(`^${escape(input.name)}$`, "i") }))
    ) {
      throw ApiError.conflict("DUPLICATE", `${input.name} already exists.`);
    }
    s.name = input.name;
    s.code = input.code ?? null;
    await s.save();
    return { id: String(s._id), name: s.name, code: s.code ?? null };
  },

  async remove(schoolId: string, id: string) {
    const s = await findInSchool(SubjectModel, schoolId, id, "SUBJECT_NOT_FOUND", "subject");
    if (await TeachingAssignmentModel.exists({ schoolId, subjectId: s._id })) {
      throw ApiError.conflict("IN_USE", `${s.name} is assigned to teachers. Remove those assignments first.`);
    }
    await s.deleteOne();
  },
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ========================================================================== */
/* Teaching assignments (current academic year)                                */
/* ========================================================================== */

export const assignmentService = {
  async list(schoolId: string, q: { sectionId?: string; teacherId?: string }) {
    const year = await AcademicYearModel.findOne({ schoolId, isCurrent: true });
    if (!year) return [];
    const filter: Record<string, unknown> = { schoolId, academicYearId: year._id };
    if (q.sectionId) filter.sectionId = q.sectionId;
    if (q.teacherId) filter.teacherId = q.teacherId;

    const rows = await TeachingAssignmentModel.find(filter)
      .populate<{ subjectId: { _id: Types.ObjectId; name: string } }>("subjectId", "name")
      .populate<{ teacherId: { _id: Types.ObjectId; fullName: string } }>("teacherId", "fullName")
      .populate<{ sectionId: { _id: Types.ObjectId; name: string; classId: Types.ObjectId } }>("sectionId", "name classId");

    const classes = new Map(
      (await ClassModel.find({ schoolId })).map((c) => [String(c._id), c] as const),
    );
    return rows.map((r) => {
      const cls = classes.get(String(r.sectionId.classId));
      return {
        id: String(r._id),
        section: { id: String(r.sectionId._id), label: cls ? sectionLabel(cls, r.sectionId) : r.sectionId.name },
        subject: { id: String(r.subjectId._id), name: r.subjectId.name },
        teacher: { id: String(r.teacherId._id), fullName: r.teacherId.fullName },
      };
    });
  },

  /** Assigns (or re-assigns) the teacher for a subject in a section. */
  async upsert(schoolId: string, input: AssignmentInput) {
    const year = await currentYearOrThrow(schoolId);
    await findInSchool(SectionModel, schoolId, input.sectionId, "SECTION_NOT_FOUND", "section");
    await findInSchool(SubjectModel, schoolId, input.subjectId, "SUBJECT_NOT_FOUND", "subject");
    await activeTeacher(schoolId, input.teacherId);

    const doc = await TeachingAssignmentModel.findOneAndUpdate(
      { schoolId, academicYearId: year._id, sectionId: input.sectionId, subjectId: input.subjectId },
      { $set: { teacherId: input.teacherId } },
      { upsert: true, new: true },
    );
    return { id: String(doc._id) };
  },

  async remove(schoolId: string, id: string) {
    const a = await findInSchool(TeachingAssignmentModel, schoolId, id, "NOT_FOUND", "assignment");
    await a.deleteOne();
  },
};

/** For login / me: the section a teacher is class teacher of (if any). */
export async function classTeacherOf(schoolId: string, teacherId: string) {
  const s = await SectionModel.findOne({ schoolId, classTeacherId: teacherId });
  if (!s) return null;
  const cls = await ClassModel.findById(s.classId);
  if (!cls) return null;
  return {
    sectionId: String(s._id),
    classId: String(cls._id),
    className: cls.name,
    stream: cls.stream ?? null,
    section: s.name,
    label: sectionLabel(cls, s),
  };
}
