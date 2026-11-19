// One document per logged-in device (web browser, Android phone...).
// Only a SHA-256 hash of the token is stored, so a DB leak can't be replayed.

import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    /** "web", "android", or whatever the client sends in X-Client */
    client: { type: String, default: "unknown" },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// MongoDB deletes expired tokens automatically
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = model("RefreshToken", refreshTokenSchema);
