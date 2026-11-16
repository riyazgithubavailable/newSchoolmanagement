import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  children?: React.ReactNode;
  className?: string;
};

/**
 * InstituteOS dashboard header.
 * - Serif for the title (matches the brief's "Inter + elegant serif headings")
 * - Solid gold CTA, no gradient — the brief explicitly asks to avoid gradients
 * - `children` slot is for secondary controls (date range, filters, etc.)
 */
export function DashboardHeader({
  title,
  subtitle,
  ctaLabel,
  onCta,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      {/* TITLE */}
      <div className="min-w-0">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      {/* ACTIONS */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
        {ctaLabel ? (
          <Button
            onClick={onCta}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full px-5 py-2 sm:w-auto",
              "bg-accent text-accent-foreground shadow-sm transition-transform",
              "hover:bg-accent/90 active:scale-[0.98]"
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}

        {children ? (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}