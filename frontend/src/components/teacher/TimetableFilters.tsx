import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Filter,
} from "lucide-react";

import {
  classOptions,
  timetableTypes,
  weekDays,
  type TimetableType,
} from "@/types/dummyData";

type TimetableFiltersProps = {
  selectedDay: string;
  selectedClass: string;
  selectedType: string;
  scheduleCount: number;
  onDayChange: (day: string) => void;
  onClassChange: (className: string) => void;
  onTypeChange: (type: string) => void;
};

export default function TimetableFilters({
  selectedDay,
  selectedClass,
  selectedType,
  scheduleCount,
  onDayChange,
  onClassChange,
  onTypeChange,
}: TimetableFiltersProps) {
  return (
    <>
      {/* Week Navigation and Day Selector */}
      <div className="mb-6 rounded-xl border border-[#E8E4D9] bg-white p-4 sm:p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-[#0F1B33]">
              Weekly Schedule
            </h2>

            <p className="mt-1 text-sm text-[#8B867A]">
              September 14 - September 19, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-[#DCD6C9] p-2 text-[#5E6472] transition hover:bg-[#F5F2EA]"
              aria-label="Previous week"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="rounded-lg border border-[#DCD6C9] px-3 py-2 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
            >
              Today
            </button>

            <button
              type="button"
              className="rounded-lg border border-[#DCD6C9] p-2 text-[#5E6472] transition hover:bg-[#F5F2EA]"
              aria-label="Next week"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {weekDays.map((day) => {
            const isSelected = selectedDay === day.day;

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => onDayChange(day.day)}
                className={`rounded-xl border px-2 py-3 text-center transition-all ${
                  isSelected
                    ? "border-[#0F1B33] bg-[#0F1B33] text-white shadow-sm"
                    : "border-[#E8E4D9] bg-[#FBF9F3] text-[#5E6472] hover:border-[#BDB5A5] hover:bg-white"
                }`}
              >
                <p
                  className={`text-xs font-medium ${
                    isSelected
                      ? "text-white/70"
                      : "text-[#8B867A]"
                  }`}
                >
                  {day.shortDay}
                </p>

                <p className={`mt-1 text-lg font-bold ${isSelected ? "text-white" : "text-[#0F1B33]"}`}>
                  {day.date}
                </p>

                <p
                  className={`mt-1 text-[10px] ${
                    isSelected
                      ? "text-white/70"
                      : "text-[#8B867A]"
                  }`}
                >
                  {day.day}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#E8E4D9] bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F1B33]">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        <div className="relative">
          <select
            value={selectedClass}
            onChange={(event) => onClassChange(event.target.value)}
            className="appearance-none rounded-lg border border-[#DCD6C9] bg-white py-2 pl-3 pr-9 text-sm text-[#5E6472] outline-none transition focus:border-[#0F1B33]"
          >
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
        </div>

        <div className="relative">
          <select
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value)}
            className="appearance-none rounded-lg border border-[#DCD6C9] bg-white py-2 pl-3 pr-9 text-sm text-[#5E6472] outline-none transition focus:border-[#0F1B33]"
          >
            <option value="All Types">All Types</option>

            {timetableTypes.map((type: TimetableType) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B867A]" />
        </div>

        <div className="sm:ml-auto">
          <span className="text-sm text-[#8B867A]">
            Showing{" "}
            <span className="font-semibold text-[#0F1B33]">
              {scheduleCount}
            </span>{" "}
            schedule items
          </span>
        </div>
      </div>
    </>
  );
}