import React, { useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useHierarchy } from "@/hooks/useHeirarchy";

type SelectedHierarchy = {
    divisionId: number | null;
    districtId: number | null;
    ulbId: number | null;
    label: string;
};

type Props = {
    onChange?: (value: SelectedHierarchy) => void;
    scopeNameWithTag?: string; // Add this prop to receive the scope name with tag
};

const menuClass = cn(
    "absolute z-[99999] rounded-xl border shadow-2xl overflow-y-auto",

    // ✅ RESPONSIVE WIDTH
    "w-[170px] sm:w-[190px] md:w-[220px] xl:w-[236px]",

    // ✅ RESPONSIVE HEIGHT
    "max-h-[220px] sm:max-h-[260px] xl:max-h-[320px]",

    "border-slate-200 bg-white text-slate-800",
    "dark:border-emerald-900/40 dark:bg-[#03140e] dark:text-emerald-50"
);

const itemClass = cn(
    // ✅ RESPONSIVE PADDING + FONT
    "flex items-center justify-between",
    "px-2 py-1.5 text-xs",
    "sm:px-3 sm:py-2 sm:text-sm",

    "cursor-pointer whitespace-nowrap transition-colors",
    "hover:bg-slate-100 dark:hover:bg-emerald-900/30"
);

const HierarchyDropdown = ({ onChange,scopeNameWithTag }: Props) => {
    const { data = [], isLoading } = useHierarchy();

    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    const [open, setOpen] = useState(false);

    const [activeDivision, setActiveDivision] = useState<any>(null);

    const [activeDistrict, setActiveDistrict] = useState<any>(null);

    const [selected, setSelected] = useState<SelectedHierarchy>({
        divisionId: null,
        districtId: null,
        ulbId: null,
        label: "",
    });

    const clearCloseTimer = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    const startCloseTimer = () => {
        clearCloseTimer();

        closeTimer.current = setTimeout(() => {
            setOpen(false);
            setActiveDivision(null);
            setActiveDistrict(null);
        }, 300);
    };

    const handleSelect = (value: SelectedHierarchy) => {
        setSelected(value);

        onChange?.(value);

        setOpen(false);

        setActiveDivision(null);

        setActiveDistrict(null);
    };

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={startCloseTimer}
        >
            {/* BUTTON */}
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                className={cn(
                    // ✅ RESPONSIVE BUTTON
                    "min-w-[170px] sm:min-w-[220px] xl:min-w-[240px]",
                    "rounded-xl border px-3 py-2 text-left",
                    "text-xs sm:text-sm shadow-sm",

                    "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                    "dark:border-emerald-900/40 dark:bg-[#03140e]",
                    "dark:text-emerald-50 dark:hover:bg-emerald-900/20"
                )}
            >
                <span className="truncate block">
                    {selected.label || scopeNameWithTag}
                </span>
            </button>

            {open && (
                <>
                    {/* DIVISION PANEL */}
                    <div
                        className={cn(
                            menuClass,
                            "top-full left-0 mt-1"
                        )}
                    >
                        {data.map((division: any) => (
                            <div
                                key={division.divisionId}
                                className={itemClass}
                                onMouseEnter={() => {
                                    setActiveDivision(division);
                                    setActiveDistrict(null);
                                }}
                                onClick={() =>
                                    handleSelect({
                                        divisionId: division.divisionId,
                                        districtId: null,
                                        ulbId: null,
                                        label: division.divisionName,
                                    })
                                }
                            >
                                <span className="truncate">
                                    {division.divisionName}
                                </span>

                                {division?.districts?.length > 0 && (
                                    <>
                                        {/* MOBILE/TABLET */}
                                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70 xl:hidden shrink-0" />

                                        {/* XL+ */}
                                        <ChevronLeft className="hidden xl:block h-4 w-4 opacity-70 shrink-0" />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* DISTRICT PANEL */}
                    {activeDivision?.districts?.length > 0 && (
                        <div
                            className={cn(
                                menuClass,

                                // ✅ RESPONSIVE POSITION
                                "top-full mt-1",

                                // mobile
                                "left-[170px]",

                                // sm
                                "sm:left-[190px]",

                                // md
                                "md:left-[220px]",

                                // xl reverse
                                "xl:left-[-236px]"
                            )}
                            onMouseEnter={clearCloseTimer}
                        >
                            {activeDivision.districts.map((district: any) => (
                                <div
                                    key={district.districtId}
                                    className={itemClass}
                                    onMouseEnter={() => {
                                        setActiveDistrict(district);
                                    }}
                                    onClick={() =>
                                        handleSelect({
                                            divisionId:
                                                activeDivision.divisionId,
                                            districtId:
                                                district.districtId,
                                            ulbId: null,
                                            label: district.districtName,
                                        })
                                    }
                                >
                                    <span className="truncate">
                                        {district.districtName}
                                    </span>

                                    {district?.ulbs?.length > 0 && (
                                        <>
                                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70 xl:hidden shrink-0" />

                                            <ChevronLeft className="hidden xl:block h-4 w-4 opacity-70 shrink-0" />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ULB PANEL */}
                  {/* ULB PANEL */}
{activeDistrict?.ulbs?.length > 0 && (
    <div
        className={cn(
            menuClass,

            // ✅ MOBILE/TABLET
            // district panel ke niche open hoga
            "left-[170px] top-[calc(100%+220px)]",

            // ✅ SM
            "sm:left-[190px] sm:top-[calc(100%+260px)]",

            // ✅ MD
            "md:left-[220px] md:top-[calc(100%+260px)]",

            // ✅ XL DESKTOP
            "xl:left-[-472px] xl:top-full"
        )}
        onMouseEnter={clearCloseTimer}
    >
        {activeDistrict.ulbs.map((ulb: any) => (
            <div
                key={ulb.ulbId}
                className={itemClass}
                onClick={() =>
                    handleSelect({
                        divisionId:
                            activeDivision.divisionId,
                        districtId:
                            activeDistrict.districtId,
                        ulbId: ulb.ulbId,
                        label: ulb.ulbName,
                    })
                }
            >
                <span className="truncate">
                    {ulb.ulbName}
                </span>
            </div>
        ))}
    </div>
)}
                </>
            )}
        </div>
    );
};

export default HierarchyDropdown;