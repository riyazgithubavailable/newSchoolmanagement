import { ReactNode } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface TrendSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface TrendChartProps<T extends Record<string, any>> {
  title: string;
  data: T[];

  xDataKey: keyof T;

  series: TrendSeries[];

  icon?: ReactNode;

  height?: number;

  className?: string;

  showGrid?: boolean;

  showLegend?: boolean;
}

const TrendChart = <T extends Record<string, any>>({
  title,
  data,
  xDataKey,
  series,
  icon,
  height = 320,
  className,
  showGrid = true,
  showLegend = true,
}: TrendChartProps<T>) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>

        {icon}
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />
              )}

              <XAxis dataKey={xDataKey as string} />

              <YAxis />

              <Tooltip />

              {showLegend && <Legend />}

              {series.map((item) => (
                <Line
                  key={item.dataKey}
                  type="monotone"
                  dataKey={item.dataKey}
                  name={item.name}
                  stroke={item.color}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendChart;