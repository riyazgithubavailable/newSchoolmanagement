import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";


import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    Columns3,
    Download,
    CalendarIcon,
    Sheet,
    FileText,
} from "lucide-react";

import { formatToIST } from "@/helpers/dateTimeIST";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { toDateOnlyString } from "./dateUtils";

export const TH = "px-3 py-3 text-center align-middle whitespace-nowrap";
export const TD = "px-3 py-3 text-center align-middle whitespace-nowrap";
export const TD_LEFT = "px-3 py-3 text-left align-middle whitespace-normal";

type SortDirection = "asc" | "desc";

export interface SortState {
    key: string | null;
    dir: SortDirection;
}

export interface SortDropdownOption {
    key: string;
    label: string;
}

export interface ColumnType<T> {
    key: string;
    header: React.ReactNode;
    align?: "left" | "center" | "right";
    className?: string;
    tdClassName?: string;
    thClassName?: string;
    hideable?: boolean;
    defaultWidth?: number | string;
    minWidth?: number;
    maxWidth?: number;
    cell?: (row: T, idx: number) => React.ReactNode;
    sortValue?: (row: T, idx?: number) => unknown;
    exportValue?: (row: T, idx?: number) => unknown;
    exportable?: boolean;
    defaultVisible?: boolean;
}

interface ExportCustomArgs<T> {
    title?: string;
    description?: string;
    data: T[];
    columns: ColumnType<T>[];
    exportFileName: string;
    exportSheetName: string;
    exportTitleRow?: string | null;
    exportMetaRows?: Array<string | string[]>;
    sort: SortState;
    query: string;
}

interface AdvancedTableProps<T> {
    title?: React.ReactNode;
    description?: string;
    data?: T[];
    columns?: ColumnType<T>[];
    isLoading?: boolean;
    errorText?: string;
    emptyText?: string;
    initialPageSize?: number;
    rowClassName?: (row: T, idx: number) => string;
    defaultVisible?: boolean;
    pageSizeOptions?: number[];
    enableSearch?: boolean;
    searchPlaceholder?: string;
    searchKeys?: string[];
    enablePagination?: boolean;
    enableColumnToggle?: boolean;
    enableColumnResize?: boolean;
    stickyHeader?: boolean;
    headerRight?: React.ReactNode;
    rowKey?: (row: T, idx: number) => React.Key;
    onRowClick?: ((row: T) => void) | null;
    enableExport?: boolean;
    exportFileName?: string;
    exportSheetName?: string;
    exportScope?: "all" | "page";
    exportVisibleOnly?: boolean;
    exportTitleRow?: string | null;
    exportMetaRows?: Array<string | string[]>;
    exportDateRange?: string;
    onExportPDFCustom?: (params: any) => void;
    enablePDFExport?: boolean;
    onExportExcelCustom?: ((args: ExportCustomArgs<T>) => void) | null;
    initialSort?: SortState | null;
    sortState?: SortState | null;
    onSortStateChange?: ((next: SortState) => void) | null;
    enableSortDropdown?: boolean;
    sortDropdownOptions?: SortDropdownOption[];
    sortDropdownTitle?: string;
    enableDateFilter?: boolean;
    dateFilterKey?: string;
    dateRange?: DateRange;
    onDateChange?: (range: DateRange | undefined) => void;
}

function safeText(v: unknown): string {
    if (v === null || v === undefined) return "";
    return String(v);
}

function defaultTextSort(a: unknown, b: unknown): number {
    return safeText(a).localeCompare(safeText(b), undefined, {
        numeric: true,
        sensitivity: "base",
    });
}



function isDateLikeString(v: unknown): boolean {
    if (typeof v !== "string") return false;
    const s = v.trim();
    if (!s) return false;

    const looksIso =
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) ||
        /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(s) ||
        s.endsWith("Z") ||
        /[+-]\d{2}:?\d{2}$/.test(s);

    if (!looksIso) return false;

    const t = Date.parse(s);
    return Number.isFinite(t);
}

function formatExportDate(v: unknown): string {
    const d = v instanceof Date ? v : new Date(String(v));
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hours = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hh = String(hours % 12 || 12).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min} ${ampm}`;
}

function normalizeExportCellValue(v: unknown, isNumeric = false): unknown {
    if (v === null || v === undefined) return "";

    const str = String(v).trim();

    if (!isNumeric && (str === "" || str === "0")) {
        return "";
    }

    // ✅ Already a Date object
    if (v instanceof Date) {
        return formatExportDate(v);
    }

    // ✅ Strict ISO string check only — won't match plain text
    if (typeof v === "string" && isDateLikeString(v)) {
        return formatExportDate(v);
    }

    return v;
}
export default function AdvancedTable<T>({
    title,
    description,
    data = [],
    columns = [],
    isLoading = false,
    errorText = "",
    rowClassName,
    emptyText = "No data found.",
    initialPageSize = 5,
    pageSizeOptions = [5, 10, 20, 50, 100],
    enableSearch = true,
    searchPlaceholder = "Search...",
    searchKeys = [],
    enablePagination = true,
    enableColumnToggle = true,
    enableColumnResize = true,
    stickyHeader = true,
    headerRight = null,
    rowKey = (_row, idx) => idx,
    onRowClick = null,
    enableExport = false,
    exportFileName = "export.xlsx",
    exportSheetName = "Sheet1",
    exportScope = "all",
    exportVisibleOnly = true,
    exportTitleRow = null,
    exportMetaRows = [],
    exportDateRange = "",
    onExportExcelCustom = null,
    onExportPDFCustom = null,
    enablePDFExport = false,
    initialSort = null,
    sortState = null,
    onSortStateChange = null,
    enableSortDropdown = false,
    sortDropdownOptions = [],
    sortDropdownTitle = "Sort",
    enableDateFilter = false,
    dateFilterKey = "",
    dateRange,
    onDateChange
}: AdvancedTableProps<T>) {
    const [q, setQ] = useState<string>("");
    const [pageSize, setPageSize] = useState<number>(initialPageSize);
    const [page, setPage] = useState<number>(1);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [sortInternal, setSortInternal] = useState<SortState>(
        initialSort || { key: null, dir: "asc" }
    );

    const sort = sortState || sortInternal;

    const setSort = (next: SortState | ((prev: SortState) => SortState)) => {
        const resolved = typeof next === "function" ? next(sort) : next;
        if (typeof onSortStateChange === "function") onSortStateChange(resolved);
        else setSortInternal(resolved);
    };

    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const canResizeColumns = enableColumnResize && !isMobileView;
    const defaultVisible = useMemo<Record<string, boolean>>(() => {
        const map: Record<string, boolean> = {};
        columns.forEach((c) => {
            map[c.key] = c.defaultVisible !== false; // true unless explicitly set to false
        });
        return map;
    }, [columns]);;

    const [visible, setVisible] = useState<Record<string, boolean>>(defaultVisible);

    const defaultColumnWidths = useMemo<Record<string, number | string>>(() => {
        const map: Record<string, number | string> = {};
        columns.forEach((c) => {
            map[c.key] = c.defaultWidth ?? 180;
        });
        return map;
    }, [columns]);

    const [columnWidths, setColumnWidths] = useState<Record<string, number | string>>(defaultColumnWidths);
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>(dateRange);
    // ✅ Single clean useEffect — replaces BOTH broken ones
    useEffect(() => {
        setVisible((prev) => {
            const next: Record<string, boolean> = {};
            columns.forEach((c) => {
                if (c.key in prev) {
                    next[c.key] = prev[c.key]; // keep user's toggle choice
                } else {
                    next[c.key] = c.defaultVisible !== false; // new column uses default
                }
            });
            return next;
        });
    }, [columns]);

    useEffect(() => {
        setColumnWidths((prev) => {
            const next = { ...defaultColumnWidths, ...prev };
            Object.keys(next).forEach((k) => {
                if (!columns.some((c) => c.key === k)) delete next[k];
            });
            return next;
        });
    }, [defaultColumnWidths, columns]);

    useEffect(() => {
        if (!sortState && initialSort?.key) {
            setSortInternal(initialSort);
        }
    }, [initialSort?.key, initialSort?.dir, sortState, dateRange]);

    const visibleColumnsForUI = useMemo(() => {
        return columns.filter((c) => visible[c.key] !== false);
    }, [columns, visible]);

    const visibleColumnsForExport = useMemo(() => {
        return columns
            .filter((c) => (exportVisibleOnly ? visible[c.key] !== false : true))
            .filter((c) => c.exportable !== false)   // 🔥 THIS LINE FIXES YOUR ISSUE
            .filter((c) => c?.key);
    }, [columns, visible, exportVisibleOnly]);

    // const filtered = useMemo(() => {
    //     const base = Array.isArray(data) ? data : [];
    //     const query = q.trim().toLowerCase();
    //     if (!enableSearch || !query) return base;

    //     const keysToSearch = (
    //         searchKeys?.length ? searchKeys : columns.map((c) => c.key)
    //     ).filter(Boolean);

    //     return base.filter((row) => {
    //         return keysToSearch.some((k) => {
    //             const col = columns.find((c) => c.key === k);
    //             if (!col) return false;

    //             const raw =
    //                 typeof col.sortValue === "function"
    //                     ? col.sortValue(row)
    //                     : (row as Record<string, unknown>)?.[k];

    //             return safeText(raw).toLowerCase().includes(query);
    //         });
    //     });


    // }, [data, q, enableSearch, searchKeys, columns]);
    const filtered = useMemo(() => {
        const base = Array.isArray(data) ? data : [];

        return base.filter((row) => {
            // 🔍 SEARCH FILTER
            const matchesSearch = (() => {
                const query = q.trim().toLowerCase();
                if (!enableSearch || !query) return true;

                const keysToSearch = (
                    searchKeys?.length ? searchKeys : columns.map((c) => c.key)
                ).filter(Boolean);

                return keysToSearch.some((k) => {
                    const col = columns.find((c) => c.key === k);
                    if (!col) return false;

                    const raw =
                        typeof col.sortValue === "function"
                            ? col.sortValue(row)
                            : (row as any)?.[k];

                    return String(raw).toLowerCase().includes(query);
                });
            })();

            // 📅 DATE RANGE FILTER
            const matchesDate = (() => {
                if (!enableDateFilter || !dateFilterKey) return true;

                const value = (row as any)[dateFilterKey];
                if (!value) return true;

                const rowStr = toDateOnlyString(value);
                const fromStr = dateRange?.from
                    ? toDateOnlyString(dateRange.from)
                    : null;
                const toStr = dateRange?.to
                    ? toDateOnlyString(dateRange.to)
                    : null;

                return (
                    (!fromStr || rowStr >= fromStr) &&
                    (!toStr || rowStr <= toStr)
                );
            })();

            return matchesSearch && matchesDate;
        });
    }, [
        data,
        q,
        columns,
        searchKeys,
        enableSearch,
        enableDateFilter,
        dateFilterKey,
        dateRange,
    ]);

    const sorted = useMemo(() => {
        if (!sort?.key) return filtered;

        const col = columns.find((c) => c.key === sort.key);
        if (!col) return filtered;

        const getter =
            col.sortValue ||
            ((row: T) => ((row as Record<string, unknown>)?.[col.key] ?? ""));

        const copy = [...filtered];

        copy.sort((ra, rb) => {
            const va = getter(ra);
            const vb = getter(rb);

            const na = Number(va);
            const nb = Number(vb);
            const bothNum = Number.isFinite(na) && Number.isFinite(nb);

            const cmp = bothNum ? na - nb : defaultTextSort(va, vb);
            return sort.dir === "asc" ? cmp : -cmp;
        });

        return copy;
    }, [filtered, sort, columns]);

    const total = sorted.length;
    const totalPages = enablePagination ? Math.max(1, Math.ceil(total / pageSize)) : 1;

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
        if (page < 1) setPage(1);
    }, [page, totalPages]);

    const paged = useMemo(() => {
        if (!enablePagination) return sorted;
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, enablePagination, page, pageSize]);

    const handleSort = (key: string) => {
        setSort((prev) => {
            const p = prev || { key: null, dir: "asc" };
            if (p.key !== key) return { key, dir: "asc" };
            return { key, dir: p.dir === "asc" ? "desc" : "asc" };
        });
    };

    useEffect(() => {
        setPage(1);
    }, [q, pageSize, sort?.key, sort?.dir]);

    const exportRows = exportScope === "page" ? paged : sorted;

    const getTextFromReactNode = (node: React.ReactNode): string => {
        if (!node) return "";

        if (typeof node === "string" || typeof node === "number") {
            return String(node);
        }

        if (Array.isArray(node)) {
            return node.map(getTextFromReactNode).join(" ");
        }

        if (typeof node === "object" && "props" in node) {
            return getTextFromReactNode(node.props.children);
        }

        return "";
    };

    const onExportExcel = async () => {
        try {
            const ExcelJS = await import("exceljs");
            const { saveAs } = await import("file-saver");

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(exportSheetName);

            let currentRowNum = 1;
            const PAD_COUNT = 1;
            const padding = Array(PAD_COUNT).fill("");

            const colAlignments = [
                "center",
                ...visibleColumnsForExport.map((c) => {
                    const sampleRow = exportRows[0];
                    if (!sampleRow) return "center";

                    const v =
                        typeof c.exportValue === "function"
                            ? c.exportValue(sampleRow, 0)
                            : (sampleRow as Record<string, unknown>)?.[c.key];

                    const strVal = String(v ?? "").trim();
                    return strVal !== "" && isNaN(Number(strVal)) ? "left" : "center";
                }),
            ];

            const applyCellStyle = (row: any, isHeader = false) => {
                row.eachCell((cell: any, colNumber: number) => {
                    if (colNumber <= PAD_COUNT) return;

                    const colIdx = colNumber - PAD_COUNT - 1;
                    const align = colAlignments[colIdx] || "center";

                    cell.alignment = {
                        horizontal: align,
                        vertical: "middle",
                        wrapText: true,
                        ...(align === "left" && { indent: 1 }),
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                    if (isHeader) {
                        cell.font = { bold: true, size: 14 };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFE7E7E7" },
                        };
                    } else {
                        cell.font = { size: 12 };
                    }
                });
                row.height = isHeader ? 25 : 20;
            };

            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, "0");
            const ampm = now.getHours() >= 12 ? "PM" : "AM";
            const hrs = now.getHours() % 12 || 12;

            const totalCols = PAD_COUNT + 1 + visibleColumnsForExport.length;

            // ── Row 1: Downloaded on (right-aligned) ──
            const topRow = worksheet.addRow([]);
            const rightCell = worksheet.getCell(currentRowNum, totalCols);
            rightCell.value = `Downloaded on : ${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} | ${pad(hrs)}:${pad(now.getMinutes())} ${ampm}`;
            rightCell.font = { bold: true, size: 12 };
            rightCell.alignment = { horizontal: "right", vertical: "middle" };
            topRow.height = 25;
            currentRowNum++;

            // ── Row 2: Spacer ──
            worksheet.addRow([]);
            currentRowNum++;

            // ── Row 3: Report Title ──
            const reportTitle = (
                typeof title === "string"
                    ? title
                    : getTextFromReactNode(title) || "Report"
            ).trim();

            const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
            const timeStr = `${pad(hrs)}-${pad(now.getMinutes())}_${ampm}`;
            const finalExportFileName = `${reportTitle.replace(/\s+/g, "_")}_${dateStr}_${timeStr}.xlsx`;

            if (reportTitle) {
                worksheet.mergeCells(currentRowNum, PAD_COUNT + 1, currentRowNum, totalCols);
                const titleCell = worksheet.getCell(currentRowNum, PAD_COUNT + 1);
                titleCell.value = reportTitle;
                titleCell.font = { bold: true, size: 16 };
                titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                worksheet.getRow(currentRowNum).height = 30;
                currentRowNum++;

                worksheet.addRow([]);
                currentRowNum++;
            }

            // ── Date Range Row ──
            if (dateRange?.from) {
                const fmt = (d: Date) =>
                    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                const rangeStr = dateRange.to
                    ? `Date Range : ${fmt(dateRange.from)} - ${fmt(dateRange.to)}`
                    : `Date : ${fmt(dateRange.from)}`;

                const rangeRow = worksheet.addRow([...padding, rangeStr]);
                rangeRow.getCell(PAD_COUNT + 1).font = { bold: true, size: 12 };
                rangeRow.getCell(PAD_COUNT + 1).alignment = { horizontal: "left", vertical: "middle" };
                currentRowNum++;

                worksheet.addRow([]);
                currentRowNum++;
            }

            // ── Meta Rows ──
            if (Array.isArray(exportMetaRows) && exportMetaRows.length > 0) {
                exportMetaRows.forEach((r) => {
                    const rowData = Array.isArray(r) ? r.map(safeText) : [safeText(r)];
                    worksheet.addRow([...padding, ...rowData]);
                    currentRowNum++;
                });
                worksheet.addRow([]);
                currentRowNum++;
            }

            // ── Header Row ──
            const headerNames = [
                "Sr No.",
                ...visibleColumnsForExport.map((c) => safeText(c.header ?? c.key)),
            ];
            const headerRow = worksheet.addRow([...padding, ...headerNames]);
            applyCellStyle(headerRow, true);
            currentRowNum++;

            // ── Data Rows ──
            const rows = exportRows.map((row, idx) => {
                const cellValues = visibleColumnsForExport.map((c) => {
                    const v =
                        typeof c.exportValue === "function"
                            ? c.exportValue(row, idx)
                            : (row as Record<string, unknown>)?.[c.key];

                    const isNumeric =
                        typeof v === "number" ||
                        (!isNaN(Number(v)) && String(v).trim() !== "");

                    return normalizeExportCellValue(v, isNumeric);
                });

                return [...padding, idx + 1, ...cellValues];
            });

            rows.forEach((rowData) => {
                const dataRow = worksheet.addRow(rowData);
                applyCellStyle(dataRow, false);
                currentRowNum++;
            });

            // ── Column Widths ──
            worksheet.columns = [
                ...padding.map(() => ({ width: 10 })),
                { width: 10 },
                ...visibleColumnsForExport.map((c) => {
                    const h = safeText(c.header ?? c.key);
                    const charCount = Math.min(60, Math.max(18, h.length + 25));
                    return { width: charCount };
                }),
            ];

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), finalExportFileName);

        } catch (e) {
            console.error("Excel export failed:", e);
        }
    };

    const onExportPDF = () => {
        const doc = new jsPDF("l", "mm", "a3");
        const pageWidth = doc.internal.pageSize.getWidth();

        const now = new Date();
        const formattedDate = format(now, "dd-MM-yyyy");
        const formattedTime = format(now, "hh:mm a");

        const reportTitle = (
            typeof title === "string"
                ? title
                : getTextFromReactNode(title) || "Report"
        ).trim();

        const pad = (n: number) => n.toString().padStart(2, "0");
        const fmt = (d: Date) =>
            `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        // ── Title ──
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(reportTitle, pageWidth / 2, 14, { align: "center" });

        // ── Downloaded on (right) ──
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(
            `Downloaded on: ${formattedDate} ${formattedTime}`,
            pageWidth - 10,
            20,
            { align: "right" }
        );

        // ── Date Range (left) ──
        let tableStartY = 24;

        if (dateRange?.from) {
            const rangeStr = dateRange.to
                ? `Date Range : ${fmt(dateRange.from)} - ${fmt(dateRange.to)}`
                : `Date : ${fmt(dateRange.from)}`;

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(rangeStr, 10, 20, { align: "left" });

            tableStartY = 28; // push table down to avoid overlap
        }

        /* ===== TABLE ===== */
        const exportColumns = visibleColumnsForExport.filter(
            (c) => c.exportable !== false
        );

        autoTable(doc, {
            startY: tableStartY, // 👈 dynamic start

            head: [
                ["Sr No.", ...exportColumns.map((c) => String(c.header))]
            ],

            body: exportRows.map((row, i) => [
                i + 1,
                ...exportColumns.map((col) => {
                    const val =
                        typeof col.exportValue === "function"
                            ? col.exportValue(row, i)
                            : (row as Record<string, unknown>)?.[col.key];

                    const isNumeric =
                        typeof val === "number" ||
                        (!isNaN(Number(val)) && String(val).trim() !== "");

                    return normalizeExportCellValue(val, isNumeric);
                }),
            ]),

            theme: "grid",

            styles: {
                fontSize: 12,
                valign: "middle",
                textColor: 0,
            },

            headStyles: {
                fillColor: [220, 220, 220],
                fontStyle: "bold",
                textColor: 0,
            },

            didParseCell: function (data) {
                const colIndex = data.column.index;

                if (colIndex === 0) {
                    data.cell.styles.halign = "center";
                    return;
                }

                if (data.section === "head") {
                    const col = exportColumns[colIndex - 1];
                    const sampleRow = exportRows[0];
                    if (!sampleRow) return;

                    const value =
                        typeof col.exportValue === "function"
                            ? col.exportValue(sampleRow, 0)
                            : (sampleRow as Record<string, unknown>)?.[col.key];

                    const isNumber =
                        typeof value === "number" ||
                        (!isNaN(Number(value)) && value !== "");

                    data.cell.styles.halign = isNumber ? "center" : "left";
                    return;
                }

                if (data.section === "body") {
                    const value = data.cell.raw;
                    const isNumber =
                        typeof value === "number" ||
                        (!isNaN(Number(value)) && value !== "");

                    data.cell.styles.halign = isNumber ? "center" : "left";
                }
            },
        });

        doc.save(
            `${reportTitle.replace(/\s+/g, "_")}_${formattedDate}_${formattedTime.replace(/:/g, "-")}.pdf`
        );
    };


    const startResize = (e: React.MouseEvent<HTMLDivElement>, column: ColumnType<T>) => {
        if (!canResizeColumns) return;

        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const currentWidth = columnWidths[column.key];
        const initialWidth =
            typeof currentWidth === "number"
                ? currentWidth
                : Number.parseInt(String(currentWidth), 10) || 180;

        const minWidth = column.minWidth ?? 100;
        const maxWidth = column.maxWidth ?? 600;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const diff = moveEvent.clientX - startX;
            const nextWidth = Math.min(maxWidth, Math.max(minWidth, initialWidth + diff));
            setColumnWidths((prev) => ({
                ...prev,
                [column.key]: nextWidth,
            }));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };


    return (
        <Card className="rounded-xl  flex flex-col">
            <div className="p-6 pb-3 space-y-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        {title ? <div className="text-lg font-semibold">{title}</div> : null}
                        {description ? (
                            <div className="text-sm text-muted-foreground">{description}</div>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">{headerRight}</div>
                </div>



                <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2">
                        {enableSearch ? (
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full md:w-[320px]"
                            />
                        ) : null}

                        <Badge variant="secondary">
                            Rows: <span className="ml-1 font-semibold">{total}</span>
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center  gap-2">
                        {enableDateFilter && (
                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {dateRange?.from
                                            ? dateRange.to
                                                ? `${format(dateRange.from, "dd-MM-yyyy")} - ${format(dateRange.to, "dd-MM-yyyy")}`
                                                : format(dateRange.from, "dd-MM-yyyy")
                                            : "Select Date"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="range"
                                        selected={pendingRange}
                                        onSelect={(range) => setPendingRange(range)}
                                        numberOfMonths={2}
                                    />

                                    <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setPendingRange(undefined);
                                                onDateChange?.(undefined);
                                                setIsOpen(false);
                                            }}
                                        >
                                            Clear
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onDateChange?.(pendingRange);
                                                setIsOpen(false); // 🔥 key line
                                            }}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        {enableExport ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (typeof onExportExcelCustom === "function") {
                                        onExportExcelCustom({
                                            title:
                                                typeof title === "string"
                                                    ? title
                                                    : String(title ?? "Export Data"),
                                            description,
                                            data: exportRows,
                                            columns: visibleColumnsForExport,
                                            exportFileName,
                                            exportSheetName,
                                            exportTitleRow,
                                            exportMetaRows,
                                            sort,
                                            query: q,
                                        });
                                        return;
                                    }
                                    onExportExcel();
                                }}
                                disabled={isLoading || total === 0}
                            >
                                <Sheet className="h-4 w-4 mr-2" />
                                Excel

                            </Button>
                        ) : null}


                        {enablePDFExport ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (typeof onExportPDFCustom === "function") {
                                        onExportPDFCustom({
                                            title:
                                                typeof title === "string"
                                                    ? title
                                                    : String(title ?? "Export Data"),
                                            description,
                                            data: exportRows,
                                            columns: visibleColumnsForExport,
                                            exportFileName,
                                            sort,
                                            query: q,
                                        });
                                        return;
                                    }

                                    onExportPDF(); // ✅ correct fallback
                                }}
                                disabled={isLoading || total === 0}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        ) : null}


                        {/* {enableSortDropdown &&
                            Array.isArray(sortDropdownOptions) &&
                            sortDropdownOptions.length > 0 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        {sortDropdownTitle}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-64">
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                                        Sort column
                                    </div>

                                    <DropdownMenuRadioGroup
                                        value={sort?.key ?? ""}
                                        onValueChange={(k) => {
                                            if (!k) {
                                                setSort({ key: null, dir: "asc" });
                                                return;
                                            }
                                            setSort((prev) => ({ key: k, dir: prev?.dir || "asc" }));
                                        }}
                                    >
                                        <DropdownMenuRadioItem value="">None</DropdownMenuRadioItem>
                                        {sortDropdownOptions.map((op) => (
                                            <DropdownMenuRadioItem key={op.key} value={op.key}>
                                                {op.label}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>

                                    <DropdownMenuSeparator />

                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                                        Order
                                    </div>

                                    <DropdownMenuRadioGroup
                                        value={sort?.dir || "asc"}
                                        onValueChange={(dir) => {
                                            setSort((prev) => ({
                                                key: prev?.key ?? null,
                                                dir: (dir as SortDirection) || "asc",
                                            }));
                                        }}
                                    >
                                        <DropdownMenuRadioItem value="asc">A → Z</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="desc">Z → A</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null} */}

                        {enableColumnToggle ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Columns3 className="h-4 w-4 mr-2" />
                                        Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {columns
                                        .filter((c) => c.hideable !== false)
                                        .map((c) => (
                                            <DropdownMenuCheckboxItem
                                                key={c.key}
                                                checked={visible[c.key] !== false}
                                                onCheckedChange={(checked) => {
                                                    setVisible((prev) => ({ ...prev, [c.key]: !!checked }));
                                                }}
                                            >
                                                {c.header}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col min-h-[500px]">
                <div className="w-full flex-1 overflow-x-auto overflow-y-visible rounded-lg border min-h-[300px]">
                    <table className="w-full text-sm table-fixed">
                        <thead
                            className={`${stickyHeader
                                ? "sticky top-0 z-30 bg-background"
                                : "bg-background"
                                }`}
                        >
                            <tr >
                                {visibleColumnsForUI.map((c) => (
                                    <th
                                        key={c.key}
                                        className={`relative ${TH} ${c.className || ""} ${c.thClassName || ""}`}
                                        style={{ width: columnWidths[c.key] }}
                                    >
                                        <button
                                            type="button"
                                            className={`inline-flex items-center w-full gap-1 hover:underline ${c.align === "left" ? "justify-start" : "justify-center"
                                                }`}
                                            onClick={() => handleSort(c.key)}
                                            title="Sort"
                                        >
                                            {c.header}
                                            <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                                        </button>

                                        {canResizeColumns ? (
                                            <div
                                                onMouseDown={(e) => startResize(e, c)}
                                                className="absolute right-0 top-0 hidden h-full w-1.5 cursor-col-resize select-none bg-transparent hover:bg-primary/30 md:block"
                                                title="Resize Column"
                                            />
                                        ) : null}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="border-t">
                                        {visibleColumnsForUI.map((c) => (
                                            <td
                                                key={c.key}
                                                className={TD}
                                                style={{ width: columnWidths[c.key] }}
                                            >
                                                <Skeleton className="h-4 w-24 mx-auto" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : errorText ? (
                                <tr className="border-t">
                                    <td
                                        colSpan={visibleColumnsForUI.length}
                                        className="p-6 text-center text-destructive"
                                    >
                                        {errorText}
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr className="border-t">
                                    <td
                                        colSpan={visibleColumnsForUI.length}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        {emptyText}
                                    </td>
                                </tr>
                            ) : (
                                paged.map((row, idx) => (
                                    <tr
                                        key={rowKey(row, idx)}
                                        className={`border-t hover:bg-muted/20 ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row, idx) ?? ""}`}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {visibleColumnsForUI.map((c) => (
                                            <td
                                                key={c.key}
                                                className={c.tdClassName || TD}
                                                style={{ width: columnWidths[c.key] }}
                                            >
                                                {typeof c.cell === "function"
                                                    ? c.cell(row, idx)
                                                    : safeText((row as Record<string, unknown>)?.[c.key])}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {enablePagination ? (
                    <div
                        className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium text-foreground">
                                {total === 0 ? 0 : (page - 1) * pageSize + 1}
                            </span>{" "}
                            –{" "}
                            <span className="font-medium text-foreground">
                                {Math.min(page * pageSize, total)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">{total}</span> records
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Rows:</span>
                                <select
                                    className="h-9 min-w-[72px] rounded-md border bg-background px-2 text-sm text-foreground shadow-sm outline-none ring-0 transition focus:border-primary"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    {pageSizeOptions.map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => setPage(1)}
                                disabled={page <= 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Previous
                            </Button>

                            <div className="px-2 text-sm text-muted-foreground">
                                Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                                <span className="font-semibold text-foreground">{totalPages}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() => setPage(totalPages)}
                                disabled={page >= totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </Card>
    );
}