import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { ALL_ROLES, USER_STATUS } from "../../constants/roles.js";

const userSchema = new Schema(
  {
    /** null only for SUPER_ADMIN (platform owner) */
    schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    /** bcrypt hash — never returned by queries unless explicitly selected */
    passwordHash: { type: String, required: true, select: false },
    /** true when someone else set the password (account created / reset by admin) */
    mustChangePassword: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: null },
    role: { type: String, enum: ALL_ROLES, required: true },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
      index: true,
    },
    /** 2-step verification (required for SUPER_ADMIN). Secrets are AES-encrypted. */
    twoFactor: {
      type: new Schema(
        {
          enabled: { type: Boolean, default: false },
          secret: { type: String, select: false },
          pendingSecret: { type: String, select: false },
          /** last accepted 30-second step — a code can't be used twice */
          lastUsedStep: { type: Number, default: 0 },
          enabledAt: { type: Date },
        },
        { _id: false },
      ),
      default: undefined,
    },
    /** HR details for staff (principal, admin, teacher) */
    staffProfile: {
      type: new Schema(
        {
          employeeId: { type: String, trim: true },
          designation: { type: String, trim: true },
          qualification: { type: String, trim: true },
          gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
          joiningDate: { type: Date },
        },
        { _id: false },
      ),
      default: undefined,
    },
    /** who approved / rejected a self-registered account */
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      // never leak internal fields to clients
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

// Same email can exist in two different schools, but only once per school.
userSchema.index({ schoolId: 1, email: 1 }, { unique: true });
// employee ids are unique inside a school (only when set)
userSchema.index(
  { schoolId: 1, "staffProfile.employeeId": 1 },
  { unique: true, partialFilterExpression: { "staffProfile.employeeId": { $type: "string" } } },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<User>;

export const UserModel = model("User", userSchema);

export const toObjectId = (id: string) => new Types.ObjectId(id);
