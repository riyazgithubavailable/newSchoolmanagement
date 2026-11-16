import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

export default function TodaySchedule() {
  return (
    <aside className="space-y-6">
      {/* Today's Overview */}
      <section className="rounded-xl border border-[#E8E4D9] bg-[#0F1B33] p-5 text-white">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-[#D6B76C]" />

          <h2 className="text-base font-semibold">
            Today's Overview
          </h2>
        </div>

        <p className="mt-2 text-sm text-white/60">
          Monday, September 14, 2026
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs text-white/60">Sessions</p>
            <p className="mt-1 text-2xl font-bold text-[#D6B76C]">3</p>
          </div>

          <div className="rounded-lg bg-white/10 p-3">
            <p className="text-xs text-white/60">
              Teaching Hours
            </p>
            <p className="mt-1 text-2xl font-bold text-[#D6B76C]">2.75</p>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">First class</span>
            <span className="font-medium">08:00 AM</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-white/60">Last class</span>
            <span className="font-medium">12:00 PM</span>
          </div>
        </div>
      </section>

      {/* Next Class */}
      <section className="rounded-xl border border-[#E8E4D9] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0F1B33]">
            Next Class
          </h2>

          <Clock3 className="h-5 w-5 text-[#8B867A]" />
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700">
            Starts in 25 minutes
          </p>

          <h3 className="mt-2 text-lg font-bold text-[#0F1B33]">
            Mathematics
          </h3>

          <div className="mt-3 space-y-2 text-sm text-[#5E6472]">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>09:00 AM - 09:45 AM</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Class 9 - Section B</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Room 201</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-[#0F1B33] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1D2B49]"
          >
            View Class Details
          </button>
        </div>
      </section>

      {/* Legend */}
      <section className="rounded-xl border border-[#E8E4D9] bg-white p-5">
        <h2 className="text-base font-semibold text-[#0F1B33]">
          Schedule Legend
        </h2>

        <div className="mt-4 space-y-3">
          <LegendItem
            label="Lecture"
            dotClass="bg-blue-600"
            badgeClass="bg-blue-50 text-blue-700 border-blue-100"
          />

          <LegendItem
            label="Practical"
            dotClass="bg-emerald-600"
            badgeClass="bg-emerald-50 text-emerald-700 border-emerald-100"
          />

          <LegendItem
            label="Activity"
            dotClass="bg-pink-600"
            badgeClass="bg-pink-50 text-pink-700 border-pink-100"
          />

          <LegendItem
            label="Meeting"
            dotClass="bg-amber-600"
            badgeClass="bg-amber-50 text-amber-700 border-amber-100"
          />
        </div>
      </section>
    </aside>
  );
}

type LegendItemProps = {
  label: string;
  dotClass: string;
  badgeClass: string;
};

function LegendItem({
  label,
  dotClass,
  badgeClass,
}: LegendItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-sm text-[#5E6472]">
          {label}
        </span>
      </div>

      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    </div>
  );
}