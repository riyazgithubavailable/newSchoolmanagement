import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Plus,
  Users,
  ChevronDown,
} from "lucide-react";

import TimetableGrid from "@/components/teacher/TimetableGrid";
import TimetableFilters from "@/components/teacher/TimetableFilters";
import TodaySchedule from "@/components/teacher/TodaySchedule";

import {
  timetableData,
} from "@/types/dummyData";

export default function TeacherTimetable() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedClass, setSelectedClass] =
    useState("All Classes");
  const [selectedType, setSelectedType] =
    useState("All Types");

  const filteredSchedule = useMemo(() => {
    return timetableData.filter((item) => {
      const matchesDay = item.day === selectedDay;

      const matchesClass =
        selectedClass === "All Classes" ||
        item.className === selectedClass;

      const matchesType =
        selectedType === "All Types" ||
        item.type === selectedType;

      return matchesDay && matchesClass && matchesType;
    });
  }, [selectedDay, selectedClass, selectedType]);

  const totalClasses = timetableData.length;

  const lectureCount = timetableData.filter(
    (item) => item.type === "Lecture"
  ).length;

  const practicalCount = timetableData.filter(
    (item) => item.type === "Practical"
  ).length;

  const clearFilters = () => {
    setSelectedClass("All Classes");
    setSelectedType("All Types");
  };

  return (
    <>
    <div className="min-h-screen bg-[#FBF9F3] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Page Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#8B867A]">
              <CalendarDays className="h-4 w-4" />
              <span>Teacher Portal</span>
              <span>/</span>
              <span className="text-[#5E6472]">
                My Timetable
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F1B33] sm:text-3xl">
              My Timetable
            </h1>

            <p className="mt-1 text-sm text-[#6B7280]">
              View and manage your weekly teaching schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-[#DCD6C9] bg-white px-4 py-2.5 text-sm font-medium text-[#0F1B33] transition hover:bg-[#F5F2EA]"
            >
              <CalendarDays className="h-4 w-4" />
              Academic Year 2026-27
              <ChevronDown className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F1B33] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1D2B49]"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Weekly Classes"
            value={totalClasses}
            subtitle="Scheduled this week"
            icon={<CalendarDays className="h-5 w-5" />}
            iconClass="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            title="Lecture Classes"
            value={lectureCount}
            subtitle="Regular teaching sessions"
            icon={<BookOpen className="h-5 w-5" />}
            iconClass="bg-violet-50 text-violet-700"
          />

          <SummaryCard
            title="Practical Sessions"
            value={practicalCount}
            subtitle="Lab and activity sessions"
            icon={<Clock3 className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            title="Selected Day"
            value={filteredSchedule.length}
            subtitle={`Classes on ${selectedDay}`}
            icon={<Users className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-700"
          />
        </div>

        {/* Filters */}
        <TimetableFilters
          selectedDay={selectedDay}
          selectedClass={selectedClass}
          selectedType={selectedType}
          scheduleCount={filteredSchedule.length}
          onDayChange={setSelectedDay}
          onClassChange={setSelectedClass}
          onTypeChange={setSelectedType}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <TimetableGrid
            selectedDay={selectedDay}
            schedule={filteredSchedule}
            onClearFilters={clearFilters}
          />

          <TodaySchedule />
        </div>
      </div>
    </div>
    </>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-[#E8E4D9] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8B867A]">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#0F1B33]">
            {value}
          </h2>

          <p className="mt-1 text-xs text-[#8B867A]">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-lg p-2.5 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}