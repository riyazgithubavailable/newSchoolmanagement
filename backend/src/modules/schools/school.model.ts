import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const SCHOOL_STATUS = { ACTIVE: "ACTIVE", SUSPENDED: "SUSPENDED" } as const;

const schoolSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    /** Short unique code users type at login, e.g. "DPS01". Stored upper-case. */
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(SCHOOL_STATUS),
      default: SCHOOL_STATUS.ACTIVE,
    },
  },
  { timestamps: true },
);

export type School = InferSchemaType<typeof schoolSchema>;
export type SchoolDoc = HydratedDocument<School>;

export const SchoolModel = model("School", schoolSchema);
