import { CalendarDays } from "lucide-react";

import TimetableCard from "./TimetableCard";
import { TimetableItems } from "@/types/dummyData";

type TimetableGridProps = {
  selectedDay: string;
  schedule: TimetableItems[];
  onClearFilters: () => void;
};

export default function TimetableGrid({
  selectedDay,
  schedule,
  onClearFilters,
}: TimetableGridProps) {
  return (
    <section className="rounded-xl border border-[#E8E4D9] bg-white p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0F1B33]">
            {selectedDay}'s Schedule
          </h2>

          <p className="mt-1 text-sm text-[#8B867A]">
            All classes and activities planned for the day
          </p>
        </div>

        <span className="hidden rounded-full bg-[#F5F2EA] px-3 py-1.5 text-xs font-semibold text-[#5E6472] sm:inline-flex">
          {schedule.length} Sessions
        </span>
      </div>

      {schedule.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {schedule.map((item) => (
            <TimetableCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DCD6C9] bg-[#FBF9F3] px-5 text-center">
          <div className="rounded-full bg-white p-4 shadow-sm">
            <CalendarDays className="h-7 w-7 text-[#8B867A]" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-[#0F1B33]">
            No classes scheduled
          </h3>

          <p className="mt-1 max-w-sm text-sm text-[#8B867A]">
            There are no classes matching the selected filters for{" "}
            {selectedDay}.
          </p>

          <button
            type="button"
            onClick={onClearFilters}
            className="mt-4 text-sm font-semibold text-[#1E40AF] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}