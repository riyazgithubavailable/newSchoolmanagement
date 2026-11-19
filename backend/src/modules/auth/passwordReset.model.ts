// One-time "forgot password" tokens. Only a SHA-256 hash is stored.

import { Schema, model } from "mongoose";

const passwordResetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// MongoDB removes expired tokens automatically
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = model("PasswordReset", passwordResetSchema);

export const RESET_TOKEN_TTL_MINUTES = 30;
