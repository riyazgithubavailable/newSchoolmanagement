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
    role: { type: String, enum: ALL_ROLES, required: true },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING,
      index: true,
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

export type User = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<User>;

export const UserModel = model("User", userSchema);

export const toObjectId = (id: string) => new Types.ObjectId(id);
