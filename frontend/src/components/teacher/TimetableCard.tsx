import {TimetableItems } from "@/types/dummyData";
import {
  Clock3,
  MapPin,
  Users,
} from "lucide-react";


const typeStyles = {
  Lecture: {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  Practical: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  Activity: {
    badge: "bg-pink-50 text-pink-700 border-pink-100",
  },
  Meeting: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

type TimetableCardProps = {
  item: TimetableItems;
};

export default function TimetableCard({
  item,
}: TimetableCardProps) {
  const styles = typeStyles[item.type];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E8E4D9] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9C1AF] hover:shadow-md">
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: item.color }}
      />

      <div className="pl-2">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#8B867A]">
              <Clock3 className="h-3.5 w-3.5" />
              <span>
                {item.startTime} - {item.endTime}
              </span>
            </div>

            <h3 className="mt-2 text-base font-semibold text-[#0F1B33]">
              {item.subject}
            </h3>
          </div>

          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${styles.badge}`}
          >
            {item.type}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-[#5E6472]">
            <Users className="h-4 w-4 text-[#8B867A]" />
            <span>
              {item.className}
              {item.section && ` - Section ${item.section}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#5E6472]">
            <MapPin className="h-4 w-4 text-[#8B867A]" />
            <span>{item.room}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#F0EDE6] pt-3">
          <span className="text-xs text-[#8B867A]">
            Scheduled class
          </span>

          <button
            type="button"
            className="text-xs font-semibold text-[#1E40AF] opacity-0 transition-opacity group-hover:opacity-100"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}