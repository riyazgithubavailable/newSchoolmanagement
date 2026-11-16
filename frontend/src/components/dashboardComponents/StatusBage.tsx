import { TimetableItem } from "@/types/dashboard";
import { CheckCircle2, Clock } from "lucide-react";

export const StatusBadge = ({
  status,
}: {
  status: TimetableItem["status"];
}) => {
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }

  if (status === "Ongoing") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF7E5] text-[#A36D00] text-[10px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C6952F] animate-pulse" />
        Ongoing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#F3F4F6] text-[#667085] text-[10px] font-medium">
      <Clock className="w-3 h-3" />
      Upcoming
    </span>
  );
};