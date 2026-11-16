// import React from "react";
// import { format } from "date-fns";
// import AppLayout from "@/components/AppLayout";
// import { getProfileData } from "@/lib/auth.ts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import {
//     ChartConfig,
//     ChartContainer,
//     ChartTooltip,
//     ChartTooltipContent,
//     ChartLegend,
//     ChartLegendContent,
// } from "@/components/ui/chart";
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
// import {
//     Wind,
//     Droplets,
//     Blend,
//     Layers3,
//     PackageCheck,
//     ClipboardList,
//     Trash2,
//     CheckCircle2,
//     Clock,
//     TrendingUp,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useFetchPrimarySegregationDashboard } from "@/hooks/useDashboard";
// import DashboardSkeleton from "@/common/DashboardSkeleton";
// import ErrorState from "@/common/ErrorState";
// import DashboardDateFilter from "@/components/dashboardComponents/DashboardDateFilter";
// import { useDashboardDate } from "@/hooks/useDashboardDate";

// // ─── Chart Config ─────────────────────────────────────────────────────────────

// const chartConfig = {
//     segregatedTon: {
//         label: "Segregated (Ton)",
//         color: "#22c55e",
//     },
// } satisfies ChartConfig;

// // ─── Waste type meta ──────────────────────────────────────────────────────────

// const wasteTypeMeta = {
//     dry: {
//         label: "Dry",
//         icon: <Wind className="h-3.5 w-3.5 text-amber-500" />,
//         pill: "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800",
//         text: "text-amber-700 dark:text-amber-300",
//         bar: "bg-amber-400",
//     },
//     wet: {
//         label: "Wet",
//         icon: <Droplets className="h-3.5 w-3.5 text-blue-500" />,
//         pill: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
//         text: "text-blue-700 dark:text-blue-300",
//         bar: "bg-blue-400",
//     },
//     mixed: {
//         label: "Mixed",
//         icon: <Blend className="h-3.5 w-3.5 text-violet-500" />,
//         pill: "bg-violet-50 border-violet-200 dark:bg-violet-950/50 dark:border-violet-800",
//         text: "text-violet-700 dark:text-violet-300",
//         bar: "bg-violet-400",
//     },
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const PrimarySegregationDashboard = () => {
//     const profileData = getProfileData<{ plantId?: number }>();
//     const plantId = profileData?.plantId ?? 1;
//     const {
//         fromDateStr,
//         toDateStr,
//         dateRangeLabel,
//         filterProps,
//     } = useDashboardDate();

//     const {
//         data: response,
//         isLoading,
//         error,
//     } = useFetchPrimarySegregationDashboard(plantId, fromDateStr, toDateStr);

//     const d = response?.data;

//     // ─── Loading ───────────────────────────────────────────────────────────────

//     if (isLoading) {
//         return (
//             <AppLayout>
//                 <DashboardSkeleton />
//             </AppLayout>
//         );
//     }

//     if (error || !d) {
//         return (
//             <AppLayout>
//                 <ErrorState message="Failed to load dashboard data." />

//             </AppLayout>
//         );
//     }

//     // ─── Derived values ────────────────────────────────────────────────────────

//     const totalBatches = d?.batchStatus?.pending + d?.batchStatus?.completed;
//     const completionPct =
//         totalBatches > 0
//             ? Math.round((d?.batchStatus?.completed / totalBatches) * 100)
//             : 0;



//     const compositionItems = [
//         {
//             label: "Dry",
//             ton: d?.wasteComposition?.dry?.ton,
//             color: d?.wasteComposition?.dry?.color,
//             textClass: "text-amber-700 dark:text-amber-300",
//         },
//         {
//             label: "Wet",
//             ton: d?.wasteComposition?.wet?.ton,
//             color: d?.wasteComposition?.wet?.color,
//             textClass: "text-blue-700 dark:text-blue-300",
//         },
//         {
//             label: "Hazardous",
//             ton: d?.wasteComposition?.hazardous?.ton,
//             color: d?.wasteComposition?.hazardous?.color,
//             textClass: "text-red-700 dark:text-red-300",
//         },
//         {
//             label: "Bio-Medical",
//             ton: d?.wasteComposition?.bioMedical?.ton,
//             color: d?.wasteComposition?.bioMedical?.color,
//             textClass: "text-green-700 dark:text-green-300",
//         },
//     ];

//     const trendData = d?.segregationTrend?.chartData.map((pt) => ({
//         ...pt,
//         date: format(new Date(pt.date), "dd MMM"),
//     }));

//     const trendTotal = d?.segregationTrend?.chartData.reduce(
//         (s, p) => s + p.segregatedTon,
//         0
//     );
//     const trendAvg =
//         d?.segregationTrend?.chartData.length > 0
//             ? (trendTotal / d?.segregationTrend?.chartData.length).toFixed(3)
//             : "0.00";
//     const trendPeak = Math.max(
//         ...d?.segregationTrend?.chartData.map((p) => p.segregatedTon),
//         0
//     );

//     const isResidueHigh = d?.totalResidueTon > 1;

//     // ─── Render ────────────────────────────────────────────────────────────────

//     return (
//         <AppLayout>
//             <div className="space-y-2 p-2">

//                 {/* ── Date Range Picker (top-right, identical to WeighBridge) ── */}
//                 <div className="flex flex-wrap items-center justify-end">
//                     <DashboardDateFilter
//                         {...filterProps}
//                         label={dateRangeLabel}
//                     />
//                 </div>

//                 {/* ══════════════════════════════════════════════════════════════
//             ROW 1 — 4 KPI Cards
//         ══════════════════════════════════════════════════════════════ */}
//                 <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
//                     {/* KPI 1 — Available for Segregation */}
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-black">
//                                 Available Stock
//                                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900">
//                                     <Layers3 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
//                                 </span>
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6 pt-6">
//                             <div>
//                                 <p className="text-xs text-muted-foreground">Available for Segregation</p>
//                                 <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">
//                                     {d?.availableForSegregation?.totalTon?.toFixed(3)}{" "}
//                                     <span className="text-base font-medium">Ton</span>
//                                 </p>
//                             </div>
//                             <div className="flex gap-2">
//                                 {(["dry", "wet", "mixed"] as const).map((type) => {
//                                     const meta = wasteTypeMeta[type];
//                                     const val = d?.availableForSegregation?.[type];
//                                     return (
//                                         <div
//                                             key={type}
//                                             className={`flex flex-1 flex-col items-center rounded-lg border py-2 ${meta.pill}`}
//                                         >
//                                             <span className="mb-1">{meta.icon}</span>
//                                             <p className={`text-sm font-bold ${meta.text}`}>
//                                                 {val.toFixed(3)}
//                                             </p>
//                                             <p className={`text-[11px] ${meta.text} opacity-70`}>
//                                                 {meta.label}
//                                             </p>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </CardContent>
//                     </Card>

//                     {/* KPI 2 — Segregated Today */}
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-black">
//                                 Segregated Today
//                                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
//                                     <PackageCheck className="h-4 w-4 text-teal-600 dark:text-teal-300" />
//                                 </span>
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6 pt-6">
//                             <div>
//                                 <p className="text-xs text-muted-foreground">
//                                     <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-black">
//                                         {dateRangeLabel}
//                                     </span>
//                                 </p>
//                                 <p className="mt-1 text-3xl font-bold text-teal-700 dark:text-teal-300">
//                                     {d?.totalSegregatedToday?.toFixed(3)}{" "}
//                                     <span className="text-base font-medium">Ton</span>
//                                 </p>
//                             </div>
//                             <div
//                                 className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${d?.totalSegregatedToday > 0
//                                     ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
//                                     : "border-muted bg-muted/30 text-muted-foreground"
//                                     }`}
//                             >
//                                 <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
//                                 {d?.totalSegregatedToday > 0
//                                     ? "Batches processed today"
//                                     : "No batches processed today"}
//                             </div>
//                         </CardContent>
//                     </Card>

//                     {/* KPI 3 — Batch Status */}
//                     {/* <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-black">
//                                 Batch Status
//                                 <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
//                                     <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-300" />
//                                 </span>
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6 pt-6">
//                             <div className="flex items-start justify-between">
//                                 <div>
//                                     <p className="text-xs text-muted-foreground">Total Batches</p>
//                                     <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
//                                         {totalBatches}
//                                     </p>
//                                 </div>
//                                 <Badge
//                                     variant="outline"
//                                     className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
//                                 >
//                                     {completionPct}% done
//                                 </Badge>
//                             </div>
//                             <div className="space-y-1.5">
//                                 <div className="flex items-center justify-between text-xs">
//                                     <span className="flex items-center gap-1 text-muted-foreground">
//                                         <Clock className="h-3 w-3" /> Pending
//                                     </span>
//                                     <span className="font-semibold text-amber-700 dark:text-amber-300">
//                                         {d?.batchStatus?.pending}
//                                     </span>
//                                 </div>
//                                 <div className="flex items-center justify-between text-xs">
//                                     <span className="flex items-center gap-1 text-muted-foreground">
//                                         <CheckCircle2 className="h-3 w-3" /> Completed
//                                     </span>
//                                     <span className="font-semibold text-green-700 dark:text-green-300">
//                                         {d?.batchStatus?.completed}
//                                     </span>
//                                 </div>
//                                 <Progress value={completionPct} className="mt-1 h-1.5" />
//                             </div>
//                         </CardContent>
//                     </Card> */}

//                     {/* KPI 4 — Residue */}
//                     <Card>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-black">
//                                 Total Residue
//                                 <span
//                                     className={`flex h-8 w-8 items-center justify-center rounded-full ${isResidueHigh
//                                         ? "bg-red-100 dark:bg-red-900"
//                                         : "bg-green-100 dark:bg-green-900"
//                                         }`}
//                                 >
//                                     <Trash2
//                                         className={`h-4 w-4 ${isResidueHigh
//                                             ? "text-red-600 dark:text-red-300"
//                                             : "text-green-600 dark:text-green-300"
//                                             }`}
//                                     />
//                                 </span>
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-6 pt-6">
//                             <div>
//                                 <p className="text-xs text-muted-foreground">Residue Generated</p>
//                                 <p
//                                     className={`text-3xl font-bold ${isResidueHigh
//                                         ? "text-red-700 dark:text-red-300"
//                                         : "text-green-700 dark:text-green-300"
//                                         }`}
//                                 >
//                                     {d?.totalResidueTon?.toFixed(3)}{" "}
//                                     <span className="text-base font-medium">Ton</span>
//                                 </p>
//                             </div>
//                             <div
//                                 className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${isResidueHigh
//                                     ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
//                                     : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
//                                     }`}
//                             >
//                                 {isResidueHigh ? (
//                                     <>
//                                         <Trash2 className="h-3.5 w-3.5 shrink-0" />
//                                         Residue above threshold
//                                     </>
//                                 ) : (
//                                     <>
//                                         <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
//                                         Within normal range
//                                     </>
//                                 )}
//                             </div>
//                         </CardContent>
//                     </Card>

//                     {/* Waste Composition */}
//                     <Card>
//                         <CardHeader className="pb-3">
//                             <CardTitle className="text-sm font-semibold uppercase tracking-wide text-black">
//                                 Waste Composition
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent className="space-y-1 ">
//                             <div className="flex items-start justify-between">
//                                 <div>
//                                     <p className="text-xs text-muted-foreground">Total Composed</p>
//                                     <p className="text-2xl font-bold text-foreground">
//                                         {d?.wasteComposition?.totalTon?.toFixed(3)}{" "}
//                                         <span className="text-sm font-medium text-muted-foreground">Ton</span>
//                                     </p>
//                                 </div>
//                                 {d?.wasteComposition?.totalTon === 0 && (
//                                     <Badge variant="secondary" className="text-[10px]">
//                                         No data yet
//                                     </Badge>
//                                 )}
//                             </div>
//                             <div className="space-y-2.5">
//                                 {compositionItems.map((item) => {
//                                     const pct =
//                                         d?.wasteComposition?.totalTon > 0
//                                             ? Math.round((item.ton / d?.wasteComposition?.totalTon) * 100)
//                                             : 0;
//                                     return (
//                                         <div key={item.label} className="space-y-1">
//                                             <div className="flex items-center justify-between text-xs">
//                                                 <span className="flex items-center gap-1.5 text-black">
//                                                     <span
//                                                         className="inline-block h-2 w-2 rounded-full"
//                                                         style={{ background: item.color }}
//                                                     />
//                                                     {item.label}
//                                                 </span>
//                                                 <span className={`font-semibold ${item.textClass}`}>
//                                                     {item?.ton?.toFixed(3)} Ton
//                                                 </span>
//                                             </div>
//                                             <Progress value={pct} className="h-1.5" />
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* ══════════════════════════════════════════════════════════════
//             ROW 2 — Trend Chart + Summary panel
//         ══════════════════════════════════════════════════════════════ */}
//                 <div className="grid gap-2 xl:grid-cols-12">

//                     {/* Segregation Trend Area Chart */}
//                     <Card className="xl:col-span-7">
//                         <CardHeader>
//                             <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-black">
//                                 <TrendingUp className="h-4 w-4" />
//                                 Segregation Trend
//                                 <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] normal-case font-normal tracking-normal text-black">
//                                     {dateRangeLabel}
//                                 </span>
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <ChartContainer config={chartConfig} className="h-[280px] w-full">
//                                 <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
//                                     <defs>
//                                         <linearGradient id="segGradient" x1="0" y1="0" x2="0" y2="1">
//                                             <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
//                                             <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
//                                         </linearGradient>
//                                     </defs>
//                                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                                     <XAxis
//                                         dataKey="date"
//                                         tickLine={false}
//                                         axisLine={false}
//                                         tickMargin={8}
//                                         tick={{ fontSize: 11 }}
//                                     />
//                                     <YAxis
//                                         tickLine={false}
//                                         axisLine={false}
//                                         tickMargin={8}
//                                         tick={{ fontSize: 11 }}
//                                         unit=" T"
//                                     />
//                                     <ChartTooltip content={<ChartTooltipContent />} />
//                                     <ChartLegend content={<ChartLegendContent />} />
//                                     <Area
//                                         type="monotone"
//                                         dataKey="segregatedTon"
//                                         stroke="var(--color-segregatedTon)"
//                                         strokeWidth={2.5}
//                                         fill="url(#segGradient)"
//                                         dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
//                                         activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
//                                     />
//                                 </AreaChart>
//                             </ChartContainer>

//                             {/* Trend stat pills — identical pattern to WeighBridge summary rows */}
//                             <div className="mt-4 grid grid-cols-3 gap-2">
//                                 {[
//                                     { label: "Period Total", value: `${trendTotal.toFixed(3)} Ton` },
//                                     { label: "Daily Avg", value: `${trendAvg} Ton`, valueClass: "text-green-600" },
//                                     { label: "Peak Day", value: `${trendPeak.toFixed(3)} Ton`, valueClass: "text-violet-600" },
//                                 ].map((stat) => (
//                                     <div
//                                         key={stat.label}
//                                         className="rounded-lg border bg-muted/30 px-3 py-2 text-center"
//                                     >
//                                         <p className="text-[10px] text-muted-foreground">{stat.label}</p>
//                                         <p className={`mt-0.5 text-sm font-bold ${stat.valueClass ?? ""}`}>
//                                             {stat.value}
//                                         </p>
//                                     </div>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>

//                     {/* Summary Panel — same list pattern as WeighBridge */}
//                     <Card className="xl:col-span-5">
//                         <CardHeader>
//                             <CardTitle className="text-sm font-medium uppercase tracking-wide text-black">
//                                 Summary
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="space-y-3 text-sm">
//                                 {[
//                                     {
//                                         label: "Available for Segregation",
//                                         value: `${d?.availableForSegregation?.totalTon?.toFixed(3)} Ton`,
//                                         valueClass: "text-violet-600",
//                                     },
//                                     {
//                                         label: "Segregated (Selected Period)",
//                                         value: `${d?.totalSegregatedToday?.toFixed(3)} Ton`,
//                                         valueClass: "text-teal-600",
//                                     },
//                                     {
//                                         label: "Total Residue",
//                                         value: `${d?.totalResidueTon?.toFixed(3)} Ton`,
//                                         valueClass: isResidueHigh ? "text-red-600" : "text-green-600",
//                                     },
//                                     // {
//                                     //     label: "Batches — Pending",
//                                     //     value: d?.batchStatus?.pending,
//                                     //     valueClass: "text-amber-600",
//                                     // },
//                                     // {
//                                     //     label: "Batches — Completed",
//                                     //     value: d?.batchStatus?.completed,
//                                     //     valueClass: "text-green-600",
//                                     // },
//                                     {
//                                         label: "Dry Available",
//                                         value: `${d?.availableForSegregation?.dry?.toFixed(3)} Ton`,
//                                     },
//                                     {
//                                         label: "Wet Available",
//                                         value: `${d?.availableForSegregation?.wet?.toFixed(3)} Ton`,
//                                     },
//                                     {
//                                         label: "Mixed Available",
//                                         value: `${d?.availableForSegregation?.mixed?.toFixed(3)} Ton`,
//                                     },
//                                 ].map((row, i, arr) => (
//                                     <React.Fragment key={row.label}>
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-black">{row.label}</span>
//                                             <span className={`font-semibold ${row.valueClass ?? ""}`}>
//                                                 {row.value}
//                                             </span>
//                                         </div>
//                                         {i < arr.length - 1 && <Separator />}
//                                     </React.Fragment>
//                                 ))}
//                             </div>
//                         </CardContent>
//                     </Card>



//                 </div>

//                 <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
//                 </div>

//             </div>
//         </AppLayout>
//     );
// };

// export default PrimarySegregationDashboard;
import React from 'react'

const ParentDashboard = () => {
  return (
    <div>
        <h1>Parent Dashboard</h1>
    </div>
  )
}

export default ParentDashboard
