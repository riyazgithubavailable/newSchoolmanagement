import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export type DetailValue = React.ReactNode;

export interface DetailItemConfig {
    label: string;
    value: DetailValue;
    className?: string;
}

export interface DetailSectionConfig {
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    items: DetailItemConfig[];
    columns?: "2" | "3" | "4";
}

export interface SummaryCardItem {
    label: string;
    value: React.ReactNode;
}

interface CommonDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    subtitle?: string;
    titleIcon?: React.ReactNode;
    statusBadge?: React.ReactNode;
    summaryCards?: SummaryCardItem[];
    sections: DetailSectionConfig[];
    maxWidthClass?: string;
}

function DetailItem({
    label,
    value,
    className = "",
}: {
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={[
                "group rounded-2xl border px-4 py-3.5 transition-all",
                "bg-emerald-50/80 border-emerald-200 shadow-sm",
                "dark:bg-emerald-950/40 dark:border-emerald-900",
                "hover:border-emerald-400 dark:hover:border-emerald-500",
                className,
            ].join(" ")}
        >
            <div className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-400">
                {label}
            </div>

            <div className="mt-1.5 text-sm font-semibold text-foreground">
                {value ?? "-"}
            </div>
        </div>
    );
}

function getGridClass(columns?: "2" | "3" | "4") {
    switch (columns) {
        case "3":
            return "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3";
        case "4":
            return "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4";
        case "2":
        default:
            return "grid grid-cols-1 gap-3 md:grid-cols-2";
    }
}

function SectionCard({
    icon,
    title,
    subtitle,
    items,
    columns = "2",
}: DetailSectionConfig) {
    return (
        <Card
            className={[
                "overflow-hidden rounded-3xl border shadow-sm",
                "bg-white/95 border-slate-200",
                "dark:bg-slate-950/70 dark:border-slate-800 dark:shadow-none",
            ].join(" ")}
        >
            <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex items-start gap-3">
                    {icon ? (
                        <div
                            className={[
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                                "bg-primary/10 text-primary",
                                "dark:bg-primary/15 dark:text-primary",
                                "border border-primary/10 dark:border-primary/20",
                            ].join(" ")}
                        >
                            {icon}
                        </div>
                    ) : null}

                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {title}
                        </h3>

                        {subtitle ? (
                            <p className="mt-1 text-sm font-medium leading-5 text-slate-600 dark:text-slate-400">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                </div>

                <Separator className="mb-4 bg-slate-200 dark:bg-slate-800" />

                <div className={getGridClass(columns)}>
                    {items.map((item, idx) => (
                        <DetailItem
                            key={`${item.label}-${idx}`}
                            label={item.label}
                            value={item.value}
                            className={item.className}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function CommonDetailsModal({
    open,
    onOpenChange,
    title,
    subtitle,
    titleIcon,
    statusBadge,
    summaryCards = [],
    sections,
    maxWidthClass = "max-w-5xl",
}: CommonDetailsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={[
                    `w-[96vw] ${maxWidthClass} h-[85vh] p-0 overflow-hidden rounded-3xl`,
                    "border border-slate-200 bg-slate-50 shadow-2xl",
                    "dark:border-slate-800 dark:bg-slate-950",
                ].join(" ")}
            >
                <div className="flex h-full min-h-0 flex-col">
                    <div
                        className={[
                            "relative shrink-0 rounded-t-3xl border-b",
                            "bg-gradient-to-r from-white via-slate-50 to-white border-slate-200",
                            "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800",
                        ].join(" ")}
                    >
                        <DialogHeader className="px-6 py-5 pr-16">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="flex items-start gap-4">
                                    {titleIcon ? (
                                        <div
                                            className={[
                                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
                                                "bg-primary/10 text-primary border border-primary/10",
                                                "dark:bg-primary/15 dark:text-primary dark:border-primary/20 dark:shadow-none",
                                            ].join(" ")}
                                        >
                                            {titleIcon}
                                        </div>
                                    ) : null}

                                    <div className="min-w-0">
                                        <DialogTitle
                                            className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                                            {title}
                                        </DialogTitle>

                                        {subtitle ? (
                                            <p className="mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-400">
                                                {subtitle}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                {statusBadge ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {statusBadge}
                                    </div>
                                ) : null}
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto bg-transparent p-6">
                        <div className="space-y-6">
                            {summaryCards.length > 0 ? (
                                <Card
                                    className={[
                                        "rounded-3xl border shadow-sm",
                                        "bg-white/95 border-slate-200",
                                        "dark:bg-slate-950/70 dark:border-slate-800 dark:shadow-none",
                                    ].join(" ")}
                                >
                                    <CardContent className="p-5 md:p-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            {summaryCards.map((card, idx) => (
                                                <div
                                                    key={`${card.label}-${idx}`}
                                                    className={[
                                                        "rounded-2xl border px-4 py-3.5",
                                                        "bg-slate-50 border-slate-200",
                                                        "dark:bg-slate-900/80 dark:border-slate-800",
                                                    ].join(" ")}
                                                >
                                                    <div
                                                        className="text-xs font-bold capitalize tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                                        {card.label}
                                                    </div>
                                                    <div
                                                        className="mt-1.5 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
                                                        {card.value ?? "-"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {sections.map((section, idx) => (
                                <SectionCard key={`${section.title}-${idx}`} {...section} />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function StatusPill({ active }: { active?: boolean }) {
    return (
        <Badge
            variant={active ? "default" : "destructive"}
            className="rounded-full px-3 py-1 text-xs font-bold shadow-sm dark:shadow-none"
        >
            {active ? "Active" : "Inactive"}
        </Badge>
    );
}

export function BooleanBadge({
    value,
    trueLabel = "Yes",
    falseLabel = "No",
}: {
    value?: boolean;
    trueLabel?: string;
    falseLabel?: string;
}) {
    return (
        <Badge
            variant={value ? "default" : "secondary"}
            className="rounded-full px-3 py-1 font-semibold"
        >
            {value ? trueLabel : falseLabel}
        </Badge>
    );
}