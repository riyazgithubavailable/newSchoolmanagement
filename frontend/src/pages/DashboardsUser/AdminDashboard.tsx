// import { format } from "date-fns";
// import AppLayout from "@/components/AppLayout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   IndianRupee,
//   ShoppingCart,
//   BadgeIndianRupee,
//   Weight,
//   ClipboardList,
//   Trophy,
// } from "lucide-react";
// import { getProfileData } from "@/lib/auth";
// import { OutputCategoryAnalytic, SalesDashboardResponse } from "@/types/dashboard";
// import DashboardSkeleton from "@/common/DashboardSkeleton";
// import { useFetchSalesDashboard } from "@/hooks/useDashboard";
// import ErrorState from "@/common/ErrorState";
// import DashboardDateFilter from "@/components/dashboardComponents/DashboardDateFilter";
// import { useDashboardDate } from "@/hooks/useDashboardDate";
// // ─── Constants ────────────────────────────────────────────────────────────────

// const CATEGORY_COLORS = [
//   "#16a34a", "#3b82f6", "#8b5cf6", "#f97316",
//   "#14b8a6", "#6b7280", "#ec4899", "#eab308",
// ];

// const getCategoryColor = (index: number) =>
//   CATEGORY_COLORS[index % CATEGORY_COLORS.length];

// // Build a stable id→color map from categoryWiseSales
// const buildColorMap = (cats: OutputCategoryAnalytic[]) => {
//   const map: Record<number, string> = {};
//   cats.forEach((c, i) => { map[c.outputCategoryId] = getCategoryColor(i); });
//   return map;
// };

// // ─── Formatters ───────────────────────────────────────────────────────────────

// const fmtINR = (n: number) =>
//   new Intl.NumberFormat("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(n);

// const fmtTon = (n: number) => n.toFixed(2);

// // ─── Custom Tooltip for Bar ───────────────────────────────────────────────────

// const BarCustomTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
//       <p className="mb-1 font-semibold">{label}</p>
//       <p className="text-emerald-600">₹{fmtINR(payload[0].value)}</p>
//     </div>
//   );
// };

// // ─── Custom Tooltip for Pie ───────────────────────────────────────────────────

// const PieCustomTooltip = ({ active, payload }: any) => {
//   if (!active || !payload?.length) return null;
//   const d = payload[0];
//   return (
//     <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
//       <p className="font-semibold">{d.name}</p>
//       <p>{fmtTon(d.value)} ton ({d.payload.pct}%)</p>
//     </div>
//   );
// };

// // ─── Custom bar top label ─────────────────────────────────────────────────────

// const BarTopLabel = (props: any) => {
//   const { x, y, width, value } = props;
//   if (!value) return null;
//   const label = value >= 1000 ? `₹${(value / 1000).toFixed(1)}K` : `₹${fmtINR(value)}`;
//   return (
//     <text
//       x={x + width / 2}
//       y={y - 5}
//       textAnchor="middle"
//       fontSize={11}
//       fontWeight={600}
//       fill="#101011ff"
//     >
//       {label}
//     </text>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────

// const SalesDashboard = () => {
//   const {
//     fromDateStr,
//     toDateStr,
//     dateRangeLabel,
//     filterProps,
//   } = useDashboardDate();

//   const profileData = getProfileData<{ plantId: number }>();

//   const { data, isLoading, isError } = useFetchSalesDashboard(profileData?.plantId ?? 0, fromDateStr, toDateStr);


//   if (isLoading) {
//     return (
//       <AppLayout>
//         <DashboardSkeleton />
//       </AppLayout>
//     );
//   }
//   if (isError || !data) {
//     return (
//       <AppLayout>
//         <ErrorState message="Failed to load dashboard data." />
//       </AppLayout>
//     );
//   }


//   // ─── Derived ───────────────────────────────────────────────────────────────

//   const kpiCards = data?.data?.kpiCards;
//   const categoryWiseSales = data?.data?.outputCategoryAnalytics ?? [];
//   const recentSales = data?.data?.recentSales ?? [];

//   // Stable color map by outputCategoryId
//   const colorMap = buildColorMap(categoryWiseSales);

//   const totalQty = categoryWiseSales.reduce((s, c) => s + c.quantitySoldTon, 0);

//   // Bar chart data
//   const barData = categoryWiseSales.map((c) => ({
//     name: c.outputCategory,
//     amount: c.totalSalesAmount,
//     color: colorMap[c.outputCategoryId],
//   }));

//   // Pie chart data
//   const pieData = categoryWiseSales.map((c) => ({
//     name: c.outputCategory,
//     value: c.quantitySoldTon,
//     color: colorMap[c.outputCategoryId],
//     pct: totalQty > 0 ? ((c.quantitySoldTon / totalQty) * 100).toFixed(1) : "0.0",
//   }));

//   // KPI definitions
//   const kpis = [
//     {
//       title: "Total Sales Amount",
//       value: `₹${fmtINR(kpiCards.totalSalesAmount)}`,
//       sub: "Total revenue generated",
//       icon: <BadgeIndianRupee className="h-4 w-4" />,
//       iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
//       valueClass: "text-emerald-600 dark:text-emerald-400",
//       accentBar: "bg-emerald-500",
//     },
//     {
//       title: "Total Quantity Sold",
//       value: `${fmtTon(kpiCards.totalQuantitySoldTon)} ton`,
//       sub: "Total quantity sold",
//       icon: <ShoppingCart className="h-4 w-4" />,
//       iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
//       valueClass: "text-blue-600 dark:text-blue-400",
//       accentBar: "bg-blue-500",
//     },
//     {
//       title: "Today's Sales Amount",
//       value: `₹${fmtINR(kpiCards.todaySalesAmount)}`,
//       sub: "Revenue generated today",
//       icon: <IndianRupee className="h-4 w-4" />,
//       iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300",
//       valueClass: "text-violet-600 dark:text-violet-400",
//       accentBar: "bg-violet-500",
//     },
//     {
//       title: "Today's Quantity Sold",
//       value: `${fmtTon(kpiCards.todayQuantitySoldTon)} ton`,
//       sub: "Quantity sold today",
//       icon: <Weight className="h-4 w-4" />,
//       iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
//       valueClass: "text-orange-600 dark:text-orange-400",
//       accentBar: "bg-orange-500",
//     },
//     {
//       title: "Total Transactions",
//       value: kpiCards.totalSalesTransactions,
//       sub: "Total sale transactions",
//       icon: <ClipboardList className="h-4 w-4" />,
//       iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300",
//       valueClass: "text-teal-600 dark:text-teal-400",
//       accentBar: "bg-teal-500",
//     },
//   ];

//   // ─── Render ────────────────────────────────────────────────────────────────

//   return (
//     <AppLayout>
//       <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">

//         {/* ── Header ─────────────────────────────────────────────────────── */}
//         <div className="flex shrink-0 items-center justify-end">
//           <DashboardDateFilter
//             {...filterProps}
//             label={dateRangeLabel}
//           />
//         </div>

//         {/* ── KPI Row ─────────────────────────────────────────────────────── */}
//         <div className="grid shrink-0 grid-cols-12 gap-3">

//           {/* 5 KPI cards at col-span-2 each */}
//           {kpis.map((k) => (
//             <Card key={k.title} className="col-span-2 py-0 overflow-hidden">
//               <CardContent className="p-0">

//                 {/* Colored top accent bar */}
//                 <div className={`h-1 w-full ${k.accentBar}`} />

//                 <div className="px-4 pt-3 pb-4">
//                   {/* Icon + Title row */}
//                   <div className="flex items-center justify-between mb-8">
//                     <p className="text-[12px] font-bold uppercase tracking-widest text-foreground leading-tight max-w-[70%]">
//                       {k.title}
//                     </p>
//                     <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${k.iconBg}`}>
//                       {k.icon}
//                     </span>
//                   </div>



//                   {/* Value */}
//                   <p className={`text-[24px] font-extrabold leading-none tracking-tight ${k.valueClass}`}>
//                     {k.value}
//                   </p>

//                   {/* Subtitle */}
//                   <p className="mt-4 text-[12px] text-foreground">{k.sub}</p>
//                 </div>

//               </CardContent>
//             </Card>
//           ))}

//           {/* Top 3 Categories — col-span-2 */}
//           <Card className="col-span-2 py-0 overflow-hidden">
//             <CardContent className="p-0">
//               <div className="h-1 w-full bg-amber-500" />
//               <div className="px-4 pt-3 pb-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <p className="text-[12px] font-bold uppercase tracking-widest text-foreground">
//                     Top 3 Categories
//                   </p>
//                   <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
//                     <Trophy className="h-4 w-4 text-amber-500" />
//                   </span>
//                 </div>

//                 <div className="space-y-2">
//                   {(kpiCards.topSellingCategories ?? []).map((cat, i) => (
//                     <div key={cat.outputCategoryId} className="flex items-center gap-2">
//                       {/* Rank badge */}
//                       <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
//                         {i + 1}
//                       </span>
//                       {/* Color dot + name */}
//                       <div className="flex items-center gap-1.5 min-w-0 flex-1">
//                         <span
//                           className="h-2 w-2 shrink-0 rounded-full"
//                           style={{ background: colorMap[cat.outputCategoryId] ?? getCategoryColor(i) }}
//                         />
//                         <span className="truncate text-[11px] font-medium">{cat.outputCategory}</span>
//                       </div>
//                       {/* Amount */}
//                       <span className="shrink-0 text-[11px] font-bold text-emerald-600">
//                         ₹{fmtINR(cat.totalSalesAmount)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 <p className="mt-3 text-[11px] text-muted-foreground border-t pt-2">
//                   By revenue generated
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* ── Charts Row ──────────────────────────────────────────────────── */}
//         <div className="grid shrink-0 grid-cols-12 gap-3">

//           {/* Bar Chart — Revenue by Category */}
//           <Card className="col-span-7 py-0">
//             <CardHeader className="px-4 pt-3 pb-2">
//               <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black">
//                 <span className="inline-block h-4 w-1 rounded-full bg-emerald-500" />
//                 Revenue by Output Category
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-2 pb-3 pt-0">
//               {barData.length === 0 ? (
//                 <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
//                   No sales data for this period.
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height={220}>
//                   <BarChart data={barData} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                     <XAxis
//                       dataKey="name"
//                       tickLine={false}
//                       axisLine={false}
//                       tick={{ fontSize: 10 }}
//                       tickMargin={6}
//                     />
//                     <YAxis
//                       tickLine={false}
//                       axisLine={false}
//                       tick={{ fontSize: 10 }}
//                       tickMargin={4}
//                       width={40}
//                       tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
//                     />
//                     <Tooltip content={<BarCustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
//                     <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={30} label={<BarTopLabel />}>
//                       {barData.map((entry, i) => (
//                         <Cell key={i} fill={entry.color} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>

//           {/* Donut Chart — Quantity by Category */}
//           <Card className="col-span-5 py-0">
//             <CardHeader className="px-4 pt-3 pb-2">
//               <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black">
//                 <span className="inline-block h-3.5 w-3.5 rounded-full border-4 border-blue-500" />
//                 Quantity Sold by Category
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-4 pt-0">
//               {pieData.length === 0 ? (
//                 <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
//                   No quantity data for this period.
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-4">

//                   {/* ── Donut ── */}
//                   <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={pieData}
//                           cx="50%"
//                           cy="50%"
//                           innerRadius={52}
//                           outerRadius={80}
//                           dataKey="value"
//                           strokeWidth={2}
//                           stroke="var(--background)"
//                           paddingAngle={3}
//                         >
//                           {pieData.map((entry, i) => (
//                             <Cell key={i} fill={entry.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip content={<PieCustomTooltip />} />
//                       </PieChart>
//                     </ResponsiveContainer>

//                     {/* Center label — absolutely positioned over the donut hole */}
//                     <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
//                       <span className="text-lg font-bold leading-none">{fmtTon(totalQty)}</span>
//                       <span className="mt-0.5 text-[10px] text-muted-foreground">ton</span>
//                     </div>
//                   </div>

//                   {/* ── Legend ── */}
//                   <div className="flex flex-1 flex-col gap-2 min-w-0">
//                     {/* Header row */}
//                     <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground pb-1 border-b">
//                       <span>Category</span>
//                       <div className="flex items-center gap-4 shrink-0">
//                         <span>%</span>
//                         <span className="w-14 text-right">Qty (T)</span>
//                       </div>
//                     </div>

//                     {/* Data rows */}
//                     {pieData.map((entry) => (
//                       <div key={entry.name} className="flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <span
//                             className="h-2.5 w-2.5 shrink-0 rounded-full"
//                             style={{ background: entry.color }}
//                           />
//                           <span className="truncate text-xs text-foreground">
//                             {entry.name}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-4 shrink-0">
//                           <span className="text-xs font-semibold w-10 text-right">
//                             {entry.pct}%
//                           </span>
//                           <span className="text-xs text-black font-semibold w-14 text-right">
//                             {fmtTon(entry.value)} Ton
//                           </span>
//                         </div>
//                       </div>
//                     ))}

//                     {/* Total row */}
//                     <div className="flex items-center justify-between gap-2 border-t pt-1.5 mt-0.5">
//                       <span className="text-xs font-semibold">Total</span>
//                       <div className="flex items-center gap-4 shrink-0">
//                         <span className="text-xs font-semibold w-10 text-right">100%</span>
//                         <span className="text-xs font-bold text-emerald-600 w-14 text-right">
//                           {fmtTon(totalQty)} Ton
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* ── Recent Sales Table ───────────────────────────────────────────── */}
//         <Card className="shrink-0 py-0">
//           <CardHeader className="px-4 pt-3 pb-2">
//             <CardTitle className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-black">
//               <span className="flex items-center gap-2">
//                 <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
//                 Recent Sales
//               </span>
//               <span className="text-[10px] normal-case font-normal text-muted-foreground">
//                 Showing {recentSales.length} of latest sales
//               </span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             {recentSales.length === 0 ? (
//               <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
//                 No recent sales.
//               </div>
//             ) : (
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-muted/40">
//                     <TableHead className="px-4 w-8 text-[11px]">#</TableHead>
//                     <TableHead className="px-4 text-[11px]">Sale Date</TableHead>
//                     <TableHead className="px-4 text-[11px]">Output Category</TableHead>
//                     <TableHead className="px-4 text-right text-[11px]">Qty Sold (ton)</TableHead>
//                     <TableHead className="px-4 text-right text-[11px]">Rate (₹/ton)</TableHead>
//                     <TableHead className="px-4 text-right text-[11px]">Total Amount (₹)</TableHead>
//                     <TableHead className="px-4 text-[11px]">Sold By</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {recentSales.map((sale, i) => {
//                     const color = colorMap[sale.outputCategoryId] ?? getCategoryColor(i);
//                     return (
//                       <TableRow key={sale.saleId}>
//                         <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{i + 1}</TableCell>
//                         <TableCell className="px-4 py-2.5 text-xs">
//                           <div className="font-medium">{format(new Date(sale.saleDate), "dd-MM-yyyy")}</div>
//                           <div className="text-[10px] text-muted-foreground">{format(new Date(sale.saleDate), "hh:mm a")}</div>
//                         </TableCell>
//                         <TableCell className="px-4 py-2.5 text-xs">
//                           <div className="flex items-center gap-1.5">
//                             <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
//                             <span className="font-medium">{sale.outputCategory}</span>
//                           </div>
//                         </TableCell>
//                         <TableCell className="px-4 py-2.5 text-right text-xs font-medium">{fmtTon(sale.quantitySoldTon)}</TableCell>
//                         <TableCell className="px-4 py-2.5 text-right text-xs">₹{fmtINR(sale.ratePerTon)}</TableCell>
//                         <TableCell className="px-4 py-2.5 text-right text-xs font-semibold text-emerald-600">₹{fmtINR(sale.totalAmount)}</TableCell>
//                         <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">{sale.soldBy}</TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>

//       </div>
//     </AppLayout>
//   );
// };

// export default SalesDashboard;
import React from 'react'

const AdminDashboard = () => {
  return (
    <div>AdminDashboard</div>
  )
}

export default AdminDashboard