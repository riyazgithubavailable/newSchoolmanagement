// School setup data: academic years, classes, sections, subjects and
// who teaches what. Every document belongs to one school (schoolId).

import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const opts = { timestamps: true } as const;

/* ------------------------------ Academic year ------------------------------ */

const academicYearSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true }, // "2026-27"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    /** exactly one current year per school (enforced in the service) */
    isCurrent: { type: Boolean, default: false },
  },
  opts,
);
academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });
export const AcademicYearModel = model("AcademicYear", academicYearSchema);
export type AcademicYearDoc = HydratedDocument<InferSchemaType<typeof academicYearSchema>>;

/* ---------------------------------- Class ---------------------------------- */

const classSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true }, // "Nursery", "Class 10"
    /** sort / promotion order: Nursery 1, LKG 2, UKG 3, Class 1 = 4 ... Class 12 = 15 */
    order: { type: Number, required: true },
    /** only for 11–12: "Science", "Commerce", "Arts" */
    stream: { type: String, trim: true, default: null },
  },
  opts,
);
classSchema.index({ schoolId: 1, name: 1, stream: 1 }, { unique: true });
export const ClassModel = model("Class", classSchema);
export type ClassDoc = HydratedDocument<InferSchemaType<typeof classSchema>>;

/* --------------------------------- Section --------------------------------- */

const sectionSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    name: { type: String, required: true, trim: true, uppercase: true }, // "A"
    roomNo: { type: String, trim: true, default: null },
    classTeacherId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  opts,
);
sectionSchema.index({ schoolId: 1, classId: 1, name: 1 }, { unique: true });
// a teacher can be class teacher of only one section
sectionSchema.index(
  { schoolId: 1, classTeacherId: 1 },
  { unique: true, partialFilterExpression: { classTeacherId: { $type: "objectId" } } },
);
export const SectionModel = model("Section", sectionSchema);
export type SectionDoc = HydratedDocument<InferSchemaType<typeof sectionSchema>>;

/* --------------------------------- Subject --------------------------------- */

const subjectSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true, default: null },
  },
  opts,
);
subjectSchema.index({ schoolId: 1, name: 1 }, { unique: true });
export const SubjectModel = model("Subject", subjectSchema);

/* ---------------------------- Teaching assignment --------------------------- */
// "Teacher X teaches Subject Y to Section Z in academic year W"

const teachingAssignmentSchema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  opts,
);
// one teacher per subject per section per year
teachingAssignmentSchema.index({ academicYearId: 1, sectionId: 1, subjectId: 1 }, { unique: true });
export const TeachingAssignmentModel = model("TeachingAssignment", teachingAssignmentSchema);

/* --------------------------------- Templates -------------------------------- */

export const STANDARD_CLASSES = [
  { name: "Nursery", order: 1 },
  { name: "LKG", order: 2 },
  { name: "UKG", order: 3 },
  ...Array.from({ length: 12 }, (_, i) => ({ name: `Class ${i + 1}`, order: i + 4 })),
];

const range = (from: string, to: string) => {
  const a = STANDARD_CLASSES.findIndex((c) => c.name === from);
  const b = STANDARD_CLASSES.findIndex((c) => c.name === to);
  return STANDARD_CLASSES.slice(a, b + 1);
};

/** Quick-start sets of classes shown during school setup (web + Android). */
export const CLASS_TEMPLATES = [
  { id: "PRE_PRIMARY", label: "Pre-primary (Nursery – UKG)", classes: range("Nursery", "UKG") },
  { id: "PRIMARY", label: "Primary (Nursery – Class 5)", classes: range("Nursery", "Class 5") },
  { id: "UPTO_8", label: "Up to Class 8 (Nursery – 8)", classes: range("Nursery", "Class 8") },
  { id: "UPTO_10", label: "Up to Class 10 (Nursery – 10)", classes: range("Nursery", "Class 10") },
  { id: "UPTO_12", label: "Up to Class 12 (Nursery – 12)", classes: range("Nursery", "Class 12") },
  { id: "CLASS_1_10", label: "Class 1 – 10", classes: range("Class 1", "Class 10") },
  { id: "CLASS_1_12", label: "Class 1 – 12", classes: range("Class 1", "Class 12") },
] as const;

export const SUBJECT_SUGGESTIONS = [
  "English",
  "Hindi",
  "Mathematics",
  "Science",
  "Social Science",
  "Computer Science",
  "Sanskrit",
  "Odia",
  "Environmental Studies",
  "General Knowledge",
  "Physical Education",
  "Art & Craft",
  "Music",
  "Physics",
  "Chemistry",
  "Biology",
  "Accountancy",
  "Business Studies",
  "Economics",
  "History",
  "Geography",
  "Political Science",
];
