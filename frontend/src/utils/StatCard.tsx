import React from "react";
import {useNavigate} from "react-router-dom";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";

type Variant =
    | "primary"
    | "secondary"
    | "accent"
    | "warning"
    | "destructive";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    to?: string;
    className?: string;
    variant?: Variant;
    rightSlot?: React.ReactNode;
}

const VARIANTS: Record<
    Variant,
    {
        lightTint: string;
        darkTint: string;
        iconWrap: string;
        icon: string;
        hoverShadow: string;
    }
> = {
    primary: {
        lightTint: "from-emerald-100/90 via-white to-green-50",
        darkTint: "dark:from-emerald-500/10 dark:via-[#041a12] dark:to-[#06251a]",
        iconWrap:
            "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/20",
        icon: "text-emerald-600 dark:text-emerald-300",
        hoverShadow:
            "hover:shadow-[0_12px_30px_rgba(16,185,129,0.10)] dark:hover:shadow-[0_14px_36px_rgba(16,185,129,0.14)]",
    },
    secondary: {
        lightTint: "from-green-100/90 via-white to-emerald-50",
        darkTint: "dark:from-green-500/10 dark:via-[#04170f] dark:to-[#072219]",
        iconWrap:
            "bg-green-50 ring-1 ring-green-200 dark:bg-green-500/10 dark:ring-green-500/20",
        icon: "text-green-600 dark:text-green-300",
        hoverShadow:
            "hover:shadow-[0_12px_30px_rgba(34,197,94,0.10)] dark:hover:shadow-[0_14px_36px_rgba(34,197,94,0.14)]",
    },
    accent: {
        lightTint: "from-teal-100/90 via-white to-emerald-50",
        darkTint: "dark:from-teal-500/10 dark:via-[#041814] dark:to-[#07241d]",
        iconWrap:
            "bg-teal-50 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:ring-teal-500/20",
        icon: "text-teal-600 dark:text-teal-300",
        hoverShadow:
            "hover:shadow-[0_12px_30px_rgba(20,184,166,0.10)] dark:hover:shadow-[0_14px_36px_rgba(20,184,166,0.14)]",
    },
    warning: {
        lightTint: "from-amber-100/90 via-white to-yellow-50",
        darkTint: "dark:from-amber-500/10 dark:via-[#181205] dark:to-[#231907]",
        iconWrap:
            "bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/20",
        icon: "text-amber-600 dark:text-amber-300",
        hoverShadow:
            "hover:shadow-[0_12px_30px_rgba(245,158,11,0.10)] dark:hover:shadow-[0_14px_36px_rgba(245,158,11,0.14)]",
    },
    destructive: {
        lightTint: "from-rose-100/90 via-white to-red-50",
        darkTint: "dark:from-rose-500/10 dark:via-[#18060a] dark:to-[#24080f]",
        iconWrap:
            "bg-rose-50 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:ring-rose-500/20",
        icon: "text-rose-600 dark:text-rose-300",
        hoverShadow:
            "hover:shadow-[0_12px_30px_rgba(244,63,94,0.10)] dark:hover:shadow-[0_14px_36px_rgba(244,63,94,0.14)]",
    },
};

export default function StatCard({
                                     title,
                                     value,
                                     subtitle,
                                     Icon,
                                     to,
                                     className,
                                     variant = "primary",
                                     rightSlot,
                                 }: StatCardProps) {
    const navigate = useNavigate();
    const clickable = Boolean(to);
    const v = VARIANTS[variant];

    const onClick = () => {
        if (to) navigate(to);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!to) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate(to);
        }
    };

    return (
        <Card
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? onClick : undefined}
            onKeyDown={clickable ? onKeyDown : undefined}
            className={cn(
                `
          group rounded-3xl border transition-all duration-300 backdrop-blur-sm
          border-emerald-200/70
          bg-gradient-to-br
          shadow-[0_10px_24px_rgba(16,24,40,0.08)]

          dark:border-emerald-900/35
          dark:shadow-[0_10px_26px_rgba(0,0,0,0.26)]
        `,
                v.lightTint,
                v.darkTint,
                v.hoverShadow,
                clickable && "cursor-pointer hover:-translate-y-0.5 active:scale-[0.99]",
                className
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                        <p className="break-words text-sm font-semibold leading-5 text-slate-700 dark:text-emerald-50">
                            {title}
                        </p>

                        <div className="flex items-center gap-2">
                            <p className="truncate text-3xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
                                {value}
                            </p>
                            {rightSlot}
                        </div>

                        {subtitle ? (
                            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-emerald-100/65">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>

                    {Icon ? (
                        <div
                            className={cn(
                                "shrink-0 rounded-2xl p-3 transition-transform duration-300 group-hover:scale-105",
                                v.iconWrap
                            )}
                        >
                            <Icon className={cn("h-5 w-5", v.icon)}/>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}