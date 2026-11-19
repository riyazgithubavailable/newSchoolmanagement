// src/components/teacher/shared/PageKit.tsx
// Small building blocks that give every teacher page the same look
// (cream background, navy headings, white rounded cards).

import { useEffect, type ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-[#E4E1D8] bg-white px-3 py-2.5 text-sm text-[#0F1B33] placeholder:text-gray-400 focus:border-[#C6952F] focus:outline-none focus:ring-2 focus:ring-[#C6952F]/30 disabled:bg-gray-50 disabled:text-gray-500";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F1B33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c3154] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E4D9] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F1B33] transition hover:bg-[#F5F3ED] disabled:cursor-not-allowed disabled:opacity-60";

/* ------------------------------------------------------------------ */

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-[#FBF9F3] p-4 md:p-6 lg:p-8">{children}</div>;
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-[#0F1B33]">
          {icon}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SummaryCard({
  title,
  value,
  icon,
  color,
  hint,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  color: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8E4D9] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-[#0F1B33]">{value}</h3>
          {hint && <p className="mt-1 truncate text-xs text-gray-400">{hint}</p>}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", color)}>{icon}</div>
      </div>
    </div>
  );
}

export function SummaryGrid({ children }: { children: ReactNode }) {
  return <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-[#E8E4D9] bg-white shadow-sm", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0EDE4] px-4 py-4 md:px-5">
          <div>
            {title && <h2 className="text-base font-bold text-[#0F1B33]">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-4 md:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* --------------------------- states -------------------------------- */

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center gap-2 text-sm text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-red-700">{message || "Something went wrong while loading data."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={secondaryBtn}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F3ED] text-gray-500">
        <Inbox size={22} />
      </div>
      <p className="font-semibold text-[#0F1B33]">{title}</p>
      {description && <p className="max-w-sm text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* --------------------------- modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#F0EDE4] px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F1B33]">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#F0EDE4] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------- form bits ------------------------------ */

export function Field({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>
      )}
    </label>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T;
  onChange: (v: NoInfer<T>) => void;
  tabs: { value: NoInfer<T>; label: string; count?: number }[];
}) {
  return (
    <div className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E8E4D9] bg-white p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition",
            value === t.value ? "bg-[#0F1B33] text-white" : "text-gray-600 hover:bg-[#F5F3ED]",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px]",
                value === t.value ? "bg-white/20 text-white" : "bg-[#F5F3ED] text-gray-600",
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* --------------------------- formatting ----------------------------- */

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString("en-IN", opts);

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

/** "Today 09:15", "Yesterday", "12 Nov" */
export function fmtRelative(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return `Today ${fmtTime(iso)}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString("en-IN", { weekday: "long" });
  return fmtDate(iso, { day: "2-digit", month: "short" });
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");
