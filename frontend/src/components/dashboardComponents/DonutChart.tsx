// import { ReactNode } from "react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export interface DonutChartItem {
//   name: string;
//   value: number;
//   color: string;
// }

// interface DonutChartProps {
//   title: string;
//   data: DonutChartItem[];
//   total?: number | string;
//   centerLabel?: string;
//   icon?: ReactNode;
//   height?: number;
// }

// const DonutChart = ({
//   title,
//   data,
//   total,
//   centerLabel = "Total",
//   icon,
//   height = 320,
// }: DonutChartProps) => {
//   const calculatedTotal =
//     typeof total === "number"
//       ? total
//       : data.reduce((sum, item) => sum + item.value, 0);

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle>{title}</CardTitle>

//         {icon}
//       </CardHeader>

//       <CardContent>
//         <div
//           className="relative"
//           style={{ height }}
//         >
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie
//                 data={data}
//                 dataKey="value"
//                 nameKey="name"
//                 innerRadius={70}
//                 outerRadius={95}
//                 paddingAngle={2}
//               >
//                 {data.map((entry) => (
//                   <Cell
//                     key={entry.name}
//                     fill={entry.color}
//                   />
//                 ))}
//               </Pie>

//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>

//           {/* Center Text */}
//           <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
//             <p className="text-xs text-muted-foreground">
//               {centerLabel}
//             </p>

//             <p className="text-2xl font-bold">
//               {calculatedTotal}
//             </p>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="mt-4 space-y-2">
//           {data.map((item) => (
//             <div
//               key={item.name}
//               className="flex items-center justify-between"
//             >
//               <div className="flex items-center gap-2">
//                 <span
//                   className="h-3 w-3 rounded-full"
//                   style={{
//                     background: item.color,
//                   }}
//                 />

//                 <span className="text-sm">
//                   {item.name}
//                 </span>
//               </div>

//               <span className="font-medium">
//                 {item.value}
//               </span>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default DonutChart;
import { ReactNode } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  description?: string;
  data: DonutChartItem[];
  total?: number | string;
  centerLabel?: string;
  icon?: ReactNode;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const DonutChart = ({
  title,
  description,
  data,
  total,
  centerLabel = "Total",
  icon,
  height = 300,
  showLegend = true,
  showTooltip = true,
  innerRadius = 70,
  outerRadius = 95,
}: DonutChartProps) => {
  const calculatedTotal =
    total !== undefined
      ? total
      : data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">
            {title}
          </CardTitle>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div
          className="relative w-full"
          style={{ height }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              {showTooltip && (
                <Tooltip
                  content={<CustomTooltip />}
                />
              )}

              {!showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>

          {/* Center */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">
              {centerLabel}
            </span>

            <span className="text-2xl font-bold text-foreground">
              {calculatedTotal}
            </span>
          </div>
        </div>

        {/* Custom Legend */}
        {showLegend && (
          <div className="mt-2 space-y-2">
            {data.map((item) => {
              const percentage =
                calculatedTotal &&
                typeof calculatedTotal === "number"
                  ? ((item.value / calculatedTotal) * 100).toFixed(1)
                  : null;

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="text-sm text-muted-foreground">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {item.value}
                    </span>

                    {percentage && (
                      <span className="text-xs text-muted-foreground">
                        ({percentage}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

const CustomTooltip = ({
  active,
  payload,
}: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: item.payload.color,
          }}
        />

        <span className="text-xs font-medium">
          {item.name}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold">
        {item.value}
      </p>
    </div>
  );
};

export default DonutChart;