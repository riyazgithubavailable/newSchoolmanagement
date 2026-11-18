import { Types } from "mongoose";
import { ROLES, USER_STATUS } from "../../constants/roles.js";
import { ApiError } from "../../utils/ApiError.js";
import { hashPassword } from "../auth/auth.service.js";
import { RefreshTokenModel } from "../auth/refreshToken.model.js";
import { UserModel, type UserDoc } from "../users/user.model.js";
import { SCHOOL_STATUS, SchoolModel, type SchoolDoc } from "./school.model.js";
import type { CreateSchoolInput, ListSchoolsQuery, PrincipalInput } from "./schools.schemas.js";

type RoleCounts = Partial<Record<string, number>>;

// "PENDING" is also stored in RoleCounts, so totals must only add real roles
const ALL_SCHOOL_ROLES = [ROLES.PRINCIPAL, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT];

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function toPublicSchool(school: SchoolDoc, extra: { principals?: UserDoc[]; userCounts?: RoleCounts } = {}) {
  const counts = extra.userCounts ?? {};
  return {
    id: String(school._id),
    name: school.name,
    code: school.code,
    email: school.email ?? null,
    phone: school.phone ?? null,
    address: school.address ?? null,
    status: school.status,
    createdAt: (school as unknown as { createdAt: Date }).createdAt?.toISOString() ?? null,
    principals: (extra.principals ?? []).map((p) => ({
      id: String(p._id),
      fullName: p.fullName,
      email: p.email,
      phone: p.phone ?? null,
      status: p.status,
      lastLoginAt: p.lastLoginAt ?? null,
    })),
    userCounts: {
      total: ALL_SCHOOL_ROLES.reduce((sum, r) => sum + (counts[r] ?? 0), 0),
      principals: counts[ROLES.PRINCIPAL] ?? 0,
      admins: counts[ROLES.ADMIN] ?? 0,
      teachers: counts[ROLES.TEACHER] ?? 0,
      students: counts[ROLES.STUDENT] ?? 0,
      parents: counts[ROLES.PARENT] ?? 0,
      pending: counts.PENDING ?? 0,
    },
  };
}

/** { schoolId → { TEACHER: 12, PARENT: 30, PENDING: 3, ... } } */
async function countUsers(schoolIds: Types.ObjectId[]) {
  const rows = await UserModel.aggregate<{ _id: { schoolId: Types.ObjectId; role: string; status: string }; n: number }>([
    { $match: { schoolId: { $in: schoolIds } } },
    { $group: { _id: { schoolId: "$schoolId", role: "$role", status: "$status" }, n: { $sum: 1 } } },
  ]);
  const map = new Map<string, RoleCounts>();
  for (const { _id, n } of rows) {
    const key = String(_id.schoolId);
    const c = map.get(key) ?? {};
    c[_id.role] = (c[_id.role] ?? 0) + n;
    if (_id.status === USER_STATUS.PENDING) c.PENDING = (c.PENDING ?? 0) + n;
    map.set(key, c);
  }
  return map;
}

async function principalsOf(schoolIds: Types.ObjectId[]) {
  const list = await UserModel.find({ schoolId: { $in: schoolIds }, role: ROLES.PRINCIPAL }).sort({ createdAt: 1 });
  const map = new Map<string, UserDoc[]>();
  for (const p of list) {
    const key = String(p.schoolId);
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  return map;
}

async function createPrincipal(schoolId: Types.ObjectId, input: PrincipalInput) {
  const exists = await UserModel.exists({ schoolId, email: input.email });
  if (exists) throw ApiError.conflict("EMAIL_TAKEN", "A user with this email already exists in this school.");
  return UserModel.create({
    schoolId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    role: ROLES.PRINCIPAL,
    status: USER_STATUS.ACTIVE, // created by the platform owner → no approval needed
    passwordHash: await hashPassword(input.password),
  });
}

async function findSchoolOr404(id: string) {
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("INVALID_ID", "Invalid school id.");
  const school = await SchoolModel.findById(id);
  if (!school) throw ApiError.notFound("SCHOOL_NOT_FOUND", "School not found.");
  return school;
}

export const schoolsService = {
  /** Creates the school and its first principal together. */
  async create(input: CreateSchoolInput) {
    if (await SchoolModel.exists({ code: input.school.code })) {
      throw ApiError.conflict("SCHOOL_CODE_TAKEN", `School code ${input.school.code} is already in use. Choose another.`);
    }

    const school = await SchoolModel.create(input.school);
    let principal: UserDoc;
    try {
      principal = await createPrincipal(school._id, input.principal);
    } catch (err) {
      // don't leave a school without a principal behind
      await SchoolModel.deleteOne({ _id: school._id });
      throw err;
    }
    return toPublicSchool(school, { principals: [principal], userCounts: { [ROLES.PRINCIPAL]: 1 } });
  },

  async list(q: ListSchoolsQuery) {
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.search) {
      const rx = new RegExp(escapeRegex(q.search), "i");
      filter.$or = [{ name: rx }, { code: rx }, { email: rx }];
    }

    const [schools, total, active, suspended] = await Promise.all([
      SchoolModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      SchoolModel.countDocuments(filter),
      SchoolModel.countDocuments({ status: SCHOOL_STATUS.ACTIVE }),
      SchoolModel.countDocuments({ status: SCHOOL_STATUS.SUSPENDED }),
    ]);

    const ids = schools.map((s) => s._id);
    const [counts, principals] = await Promise.all([countUsers(ids), principalsOf(ids)]);

    return {
      items: schools.map((s) =>
        toPublicSchool(s, { principals: principals.get(String(s._id)), userCounts: counts.get(String(s._id)) }),
      ),
      meta: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
        // platform-wide totals for the dashboard cards (ignore filters)
        summary: { schools: active + suspended, active, suspended },
      },
    };
  },

  async get(id: string) {
    const school = await findSchoolOr404(id);
    const [counts, principals] = await Promise.all([countUsers([school._id]), principalsOf([school._id])]);
    return toPublicSchool(school, { principals: principals.get(id), userCounts: counts.get(id) });
  },

  /** Suspend → every user of the school is logged out and can't log in. */
  async setStatus(id: string, status: (typeof SCHOOL_STATUS)[keyof typeof SCHOOL_STATUS]) {
    const school = await findSchoolOr404(id);
    school.status = status;
    await school.save();

    if (status === SCHOOL_STATUS.SUSPENDED) {
      const userIds = await UserModel.find({ schoolId: school._id }).distinct("_id");
      await RefreshTokenModel.deleteMany({ userId: { $in: userIds } });
    }
    return this.get(id);
  },

  /** Add another principal (e.g. the principal changed). Existing accounts are untouched. */
  async addPrincipal(id: string, input: PrincipalInput) {
    const school = await findSchoolOr404(id);
    await createPrincipal(school._id, input);
    return this.get(id);
  },
};
