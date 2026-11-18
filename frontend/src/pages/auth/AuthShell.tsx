// Shared look for the small auth screens (forgot / reset / change password).

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { passwordProblems } from "@/services/authService";

export const authInput =
  "w-full px-3 py-2.5 text-[13.5px] rounded-[8px] border border-[#E4E1D8] bg-white placeholder:text-[#A8AAB0] focus:outline-none focus:ring-2 focus:ring-[#C6952F]/40 focus:border-[#C6952F] transition-colors";

export const authButton =
  "w-full flex items-center justify-center gap-2 bg-[#0F1B33] hover:bg-[#16274A] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13.5px] font-medium py-2.5 rounded-[8px] transition-colors";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FBF9F3] px-4 py-10 font-[Inter,system-ui,sans-serif]">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#0F1B33]">
            <GraduationCap className="h-[18px] w-[18px] text-[#C6952F]" />
          </div>
          <span className="text-[15px] font-medium text-[#0F1B33]">InstituteOS</span>
        </div>
        <div className="rounded-2xl border border-[#E8E4D9] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-[1.5rem] leading-tight text-[#0F1B33]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B7280]">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthAlert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "mb-4 rounded-[8px] border px-3 py-2 text-[12.5px]",
        kind === "error" && "border-red-200 bg-red-50 text-red-700",
        kind === "success" && "border-green-200 bg-green-50 text-green-800",
        kind === "info" && "border-[#E8E4D9] bg-[#F4F2EC] text-[#4B5563]",
      )}
    >
      {children}
    </p>
  );
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = "new-password",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-[#374151]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`${authInput} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8AAB0] hover:text-[#374151]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-[15px] w-[15px]" /> : <Eye className="h-[15px] w-[15px]" />}
        </button>
      </div>
    </div>
  );
}

/** Live checklist of the password rule */
export function PasswordRules({ value }: { value: string }) {
  const problems = passwordProblems(value);
  const rules = ["At least 8 characters", "At least one letter", "At least one number"];
  return (
    <ul className="space-y-0.5 text-[11.5px]">
      {rules.map((r) => {
        const ok = value.length > 0 && !problems.includes(r);
        return (
          <li key={r} className={ok ? "text-green-700" : "text-[#9CA3AF]"}>
            {ok ? "✓" : "○"} {r}
          </li>
        );
      })}
    </ul>
  );
}
