import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { platformApi } from "@/api/platformApi";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PageShell,
  Panel,
  Pill,
  errorMessage,
  inputClass,
  secondaryBtn,
} from "@/components/PageKit";

const ACTIONS: Record<string, { label: string; tone: string }> = {
  PLATFORM_LOGIN: { label: "Signed in", tone: "bg-green-50 text-green-700" },
  PLATFORM_LOGIN_FAILED: { label: "Failed sign-in", tone: "bg-red-50 text-red-700" },
  PLATFORM_2FA_FAILED: { label: "Wrong 2FA code", tone: "bg-red-50 text-red-700" },
  PLATFORM_2FA_ENABLED: { label: "2FA turned on", tone: "bg-blue-50 text-blue-700" },
  SCHOOL_CREATED: { label: "School created", tone: "bg-emerald-50 text-emerald-700" },
  SCHOOL_STATUS_CHANGED: { label: "School status changed", tone: "bg-amber-50 text-amber-700" },
  PRINCIPAL_ADDED: { label: "Principal added", tone: "bg-[#F5F3ED] text-[#0F1B33]" },
  PRINCIPAL_PASSWORD_RESET: { label: "Principal password reset", tone: "bg-amber-50 text-amber-700" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const describe = (details: Record<string, unknown> | null) =>
  details
    ? Object.entries(details)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · ")
    : "";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["platform", "audit", page, action],
    queryFn: () => platformApi.auditLogs(page, action),
    placeholderData: keepPreviousData,
  });

  return (
    <PageShell>
      <PageHeader icon={<ScrollText size={25} />} title="Audit log" description="Every platform sign-in and change, newest first." />
      <Panel
        bodyClassName="p-0"
        actions={
          <select
            aria-label="Filter by action"
            className={`${inputClass} py-2 sm:w-60`}
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All actions</option>
            {Object.entries(ACTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={errorMessage(error)} onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState title="Nothing recorded yet" />
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE4] text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Who</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => {
                  const a = ACTIONS[e.action] ?? { label: e.action, tone: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={e.id} className="border-b border-[#F7F5EF] last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">{fmt(e.createdAt)}</td>
                      <td className="px-5 py-3">
                        <Pill className={a.tone}>{a.label}</Pill>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{e.actorEmail ?? "—"}</td>
                      <td className="max-w-[320px] truncate px-5 py-3 text-gray-500" title={describe(e.details)}>
                        {describe(e.details) || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-gray-500">{e.ip ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F0EDE4] px-5 py-3 text-sm text-gray-600">
            <span>
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <div className="flex gap-1">
              <button type="button" className={`${secondaryBtn} px-2.5 py-1.5`} disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={`${secondaryBtn} px-2.5 py-1.5`}
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Panel>
    </PageShell>
  );
}
