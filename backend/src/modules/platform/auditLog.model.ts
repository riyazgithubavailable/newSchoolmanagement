// Who did what — kept for platform-level (and later school-level) actions.

import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String, default: null },
    actorRole: { type: String, default: null },
    action: { type: String, required: true, index: true }, // e.g. SCHOOL_CREATED
    schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null, index: true },
    targetType: { type: String, default: null }, // School, User...
    targetId: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = model("AuditLog", auditLogSchema);

export const AUDIT = {
  PLATFORM_LOGIN: "PLATFORM_LOGIN",
  PLATFORM_LOGIN_FAILED: "PLATFORM_LOGIN_FAILED",
  PLATFORM_2FA_FAILED: "PLATFORM_2FA_FAILED",
  PLATFORM_2FA_ENABLED: "PLATFORM_2FA_ENABLED",
  SCHOOL_CREATED: "SCHOOL_CREATED",
  SCHOOL_STATUS_CHANGED: "SCHOOL_STATUS_CHANGED",
  PRINCIPAL_ADDED: "PRINCIPAL_ADDED",
  PRINCIPAL_PASSWORD_RESET: "PRINCIPAL_PASSWORD_RESET",
} as const;

export interface AuditEntry {
  action: (typeof AUDIT)[keyof typeof AUDIT];
  actor?: { id?: string | null; email?: string | null; role?: string | null };
  schoolId?: string | null;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/** Never throws — an audit failure must not break the action itself. */
export async function audit(e: AuditEntry) {
  try {
    await AuditLogModel.create({
      actorId: e.actor?.id ?? null,
      actorEmail: e.actor?.email ?? null,
      actorRole: e.actor?.role ?? null,
      action: e.action,
      schoolId: e.schoolId ?? null,
      targetType: e.targetType ?? null,
      targetId: e.targetId ?? null,
      details: e.details ?? null,
      ip: e.ip ?? null,
      userAgent: e.userAgent?.slice(0, 300) ?? null,
    });
  } catch (err) {
    console.error("⚠️  audit log failed:", err instanceof Error ? err.message : err);
  }
}
