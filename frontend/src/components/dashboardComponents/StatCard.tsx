import { ReactNode } from "react";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Stat } from "@/types/dashboard";

interface StatCardProps {
  title: string;

  value: number | string;

  unit?: string;

  subtitle?: string;

  icon?: ReactNode;

  trend?: ReactNode;

  footer?: ReactNode;

  className?: string;

  valueClassName?: string;

  iconClassName?: string;
}

// const StatCard = ({
//   title,
//   value,
//   unit,
//   subtitle,
//   icon,
//   trend,
//   footer,
//   className,
//   valueClassName,
//   iconClassName,
// }: StatCardProps) => {
//   return (
//     <Card className={cn("shadow-sm", className)}>
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">
//           {title}
//         </CardTitle>

//         {icon && (
//           <div
//             className={cn(
//               "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
//               iconClassName
//             )}
//           >
//             {icon}
//           </div>
//         )}
//       </CardHeader>

//       <CardContent className="space-y-2">
//         <div className="flex items-end gap-1">
//           <span
//             className={cn(
//               "text-3xl font-bold tracking-tight",
//               valueClassName
//             )}
//           >
//             {value}
//           </span>

//           {unit && (
//             <span className="pb-1 text-sm text-muted-foreground">
//               {unit}
//             </span>
//           )}
//         </div>

//         {(subtitle || trend) && (
//           <div className="flex items-center justify-between">
//             {subtitle && (
//               <p className="text-xs text-muted-foreground">
//                 {subtitle}
//               </p>
//             )}

//             {trend}
//           </div>
//         )}

//         {footer}
//       </CardContent>
//     </Card>
//   );
// };
const StatCard = ({ stat }: { stat: Stat }) => {
  const Icon = stat.icon;

  return (
    <div className="bg-white border border-[#E8E4D9] rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-[#7A8190] font-medium">
            {stat.title}
          </p>

          <h3 className="mt-2 text-[26px] leading-none font-semibold text-[#0F1B33]">
            {stat.value}
          </h3>

          <p className="mt-2 text-[11px] text-[#9CA3AF]">
            {stat.subtitle}
          </p>
        </div>

        <div className="w-9 h-9 rounded-lg bg-[#F7F5EF] flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-[#C6952F]" />
        </div>
      </div>

      {stat.trend && (
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-green-600">
          <TrendingUp className="w-3 h-3" />
          {stat.trend}
        </div>
      )}
    </div>
  );
};

export default StatCard;