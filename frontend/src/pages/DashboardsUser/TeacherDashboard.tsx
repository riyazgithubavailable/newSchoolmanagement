import DonutChart from "@/components/dashboardComponents/DonutChart";
import { SectionHeader } from "@/components/dashboardComponents/SectionHeader";
import StatCard from "@/components/dashboardComponents/StatCard";
import { StatusBadge } from "@/components/dashboardComponents/StatusBage";
import { Announcement, Homework, Stat, Task, TeacherClass, TimetableItem } from "@/types/dashboard";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Users,
  AlertCircle,
  TrendingUp,
  BookMarked,
  Circle,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { classLabel } from "@/services/teacherService";

const greetingFor = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
const stats: Stat[] = [
  {
    title: "My Classes",
    value: "5",
    subtitle: "Active classes",
    icon: GraduationCap,
  },
  {
    title: "Total Students",
    value: "128",
    subtitle: "Across all classes",
    icon: Users,
    trend: "+4 this month",
  },
  {
    title: "Attendance Today",
    value: "92%",
    subtitle: "Average attendance",
    icon: CalendarCheck,
    trend: "+2.4%",
  },
  {
    title: "Today's Classes",
    value: "4",
    subtitle: "2 completed",
    icon: Clock,
  },
  {
    title: "Pending Tasks",
    value: "8",
    subtitle: "Need your attention",
    icon: ClipboardCheck,
  },
];

const timetable: TimetableItem[] = [
  {
    id: 1,
    time: "08:00 AM",
    duration: "08:00 - 08:45",
    className: "Class 10-A",
    subject: "Mathematics",
    room: "Room 204",
    status: "Completed",
  },
  {
    id: 2,
    time: "09:00 AM",
    duration: "09:00 - 09:45",
    className: "Class 9-B",
    subject: "Mathematics",
    room: "Room 108",
    status: "Ongoing",
  },
  {
    id: 3,
    time: "11:00 AM",
    duration: "11:00 - 11:45",
    className: "Class 8-A",
    subject: "Mathematics",
    room: "Room 105",
    status: "Upcoming",
  },
  {
    id: 4,
    time: "01:00 PM",
    duration: "01:00 - 01:45",
    className: "Class 10-B",
    subject: "Mathematics",
    room: "Room 204",
    status: "Upcoming",
  },
];

const announcements: Announcement[] = [
  {
    id: 1,
    title: "Unit Test Schedule Released",
    description:
      "Unit Test 1 for Classes 9 and 10 will begin from 2nd June.",
    time: "2 hours ago",
    type: "exam",
  },
  {
    id: 2,
    title: "School Holiday Notice",
    description:
      "School will remain closed on Saturday, 31st May.",
    time: "Yesterday",
    type: "notice",
  },
  {
    id: 3,
    title: "Parent Teacher Meeting",
    description:
      "PTM for Class 10 is scheduled for 5th June.",
    time: "2 days ago",
    type: "event",
  },
];

const tasks: Task[] = [
  {
    id: 1,
    title: "Enter marks for Unit Test 1",
    className: "Class 9-A",
    due: "Due today",
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Submit attendance",
    className: "Class 8-A",
    due: "Due today",
    priority: "High",
    completed: false,
  },
  {
    id: 3,
    title: "Review homework submissions",
    className: "Class 10-B",
    due: "Due tomorrow",
    priority: "Medium",
    completed: false,
  },
  {
    id: 4,
    title: "Prepare lesson plan",
    className: "Class 10-B",
    due: "Due tomorrow",
    priority: "Low",
    completed: false,
  },
];

const homework: Homework[] = [
  {
    id: 1,
    className: "Class 9-A",
    title: "Quadratic Equations Worksheet",
    submitted: 24,
    total: 28,
  },
  {
    id: 2,
    className: "Class 10-B",
    title: "Real Numbers Assignment",
    submitted: 18,
    total: 30,
  },
  {
    id: 3,
    className: "Class 8-A",
    title: "Linear Equations Worksheet",
    submitted: 25,
    total: 28,
  },
];

const classes: TeacherClass[] = [
  {
    id: 1,
    className: "Class 10",
    section: "A",
    subject: "Mathematics",
    students: 32,
    attendance: 94,
  },
  {
    id: 2,
    className: "Class 10",
    section: "B",
    subject: "Mathematics",
    students: 30,
    attendance: 91,
  },
  {
    id: 3,
    className: "Class 9",
    section: "A",
    subject: "Mathematics",
    students: 28,
    attendance: 93,
  },
  {
    id: 4,
    className: "Class 9",
    section: "B",
    subject: "Mathematics",
    students: 25,
    attendance: 90,
  },
  {
    id: 5,
    className: "Class 8",
    section: "A",
    subject: "Mathematics",
    students: 13,
    attendance: 92,
  },
];

const attendanceData = [
  {
    name: "Present",
    value: 118,
    color: "#0F1B33",
  },
  {
    name: "Absent",
    value: 8,
    color: "#C6952F",
  },
  {
    name: "Leave",
    value: 2,
    color: "#D1D5DB",
  },
];

export default function TeacherDashboard() {
  const today = new Date();
  const { user } = useAuth();
  const greeting = greetingFor(today.getHours());
  const firstName = user?.fullName.split(" ")[0] ?? "Teacher";

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <>
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>
          <p className="text-[11px] font-medium text-[#C6952F] uppercase tracking-wider">
            Teacher Workspace
          </p>

          <h1 className="mt-1 text-[25px] sm:text-[28px] font-semibold tracking-tight text-[#0F1B33]">
            {greeting}, {firstName}
          </h1>

          <p className="mt-1 text-[13px] text-[#7A8190]">
            Here's what's happening in your classes today.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#667085]">
          <Calendar className="w-4 h-4 text-[#C6952F]" />
          {formattedDate}
        </div>

      </div>

      {/* =====================================================
          CLASS TEACHER BANNER
      ===================================================== */}

      {user?.isClassTeacher && user.classTeacherOf && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E8E4D9] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#0F1B33]">
                You are the class teacher of {classLabel(user.classTeacherOf)}
              </p>
              <p className="text-[12px] text-[#7A8190]">
                Track your section's attendance, progress and parent communication.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/teacher/class-teacher/overview"
              className="rounded-xl bg-[#0F1B33] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1c3154]"
            >
              My Class
            </Link>
            <Link
              to="/teacher/class-teacher/progress"
              className="rounded-xl border border-[#E8E4D9] px-4 py-2 text-[13px] font-semibold text-[#0F1B33] hover:bg-[#F5F3ED]"
            >
              Student Progress
            </Link>
          </div>
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <div className="bg-[#0F1B33] rounded-xl p-5 sm:p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <p className="text-white font-semibold text-[14px]">
              Quick Actions
            </p>

            <p className="text-[#AEB6C7] text-[11px] mt-1">
              Common tasks you can access quickly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">

            {[
              {
                label: "Take Attendance",
                icon: ClipboardCheck,
              },
              {
                label: "Create Lesson",
                icon: BookOpen,
              },
              {
                label: "Assign Homework",
                icon: FileText,
              },
              {
                label: "Assignment",
                icon: BookMarked,
              },
              {
                label: "Enter Marks",
                icon: GraduationCap,
              },
              {
                label: "Apply Leave",
                icon: Calendar,
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  className="flex flex-col items-center justify-center gap-2 min-w-[100px] px-3 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#C6952F]" />

                  <span className="text-[10px] text-[#E4E7EC] text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6">

        {/* ===================================================
            TODAY'S TIMETABLE
        =================================================== */}

        <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">

          <SectionHeader
            title="Today's Timetable"
            subtitle="Your classes scheduled for today"
            action="View full timetable"
          />

          <div className="space-y-2">

            {timetable.map((item) => (
              <div
                key={item.id}
                className={`
                  flex flex-col sm:flex-row sm:items-center gap-3
                  p-3.5 rounded-lg border
                  transition-colors

                  ${
                    item.status === "Ongoing"
                      ? "border-[#C6952F]/40 bg-[#FFFDF7]"
                      : "border-[#EEEAE2] hover:bg-[#FAF9F6]"
                  }
                `}
              >

                {/* Time */}

                <div className="sm:w-[105px] shrink-0">

                  <p className="text-[12px] font-semibold text-[#0F1B33]">
                    {item.time}
                  </p>

                  <p className="text-[10px] text-[#A0A5AE] mt-0.5">
                    {item.duration}
                  </p>

                </div>

                {/* Class */}

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2">

                    <p className="text-[12px] font-semibold text-[#0F1B33]">
                      {item.className}
                    </p>

                    <span className="text-[#D1D5DB]">
                      •
                    </span>

                    <p className="text-[11px] text-[#667085]">
                      {item.subject}
                    </p>

                  </div>

                  <p className="text-[10px] text-[#9CA3AF] mt-1">
                    {item.room}
                  </p>

                </div>

                {/* Status */}

                <StatusBadge status={item.status} />

              </div>
            ))}

          </div>

        </section>

        {/* ===================================================
            ATTENDANCE
        =================================================== */}

      <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">
  <DonutChart
    title="Attendance Overview"
    description="Today's attendance across your classes"
    data={attendanceData}
    total={128}
    centerLabel="Average"
    height={180}
    innerRadius={48}
    outerRadius={65}
  />
</section>

      </div>

      {/* =====================================================
          SECOND ROW
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ===================================================
            PENDING TASKS
        =================================================== */}

        <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">

          <SectionHeader
            title="Pending Tasks"
            subtitle="Things that need your attention"
            action="View all"
          />

          <div className="space-y-1">

            {tasks.map((task) => (

              <div
                key={task.id}
                className="flex items-center gap-3 py-3 border-b border-[#F0EEE8] last:border-0"
              >

                <button className="w-5 h-5 rounded-full border border-[#D1D5DB] flex items-center justify-center hover:border-[#C6952F] shrink-0">
                  {task.completed && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">

                  <p className="text-[11.5px] font-medium text-[#0F1B33] truncate">
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="text-[9.5px] text-[#9CA3AF]">
                      {task.className}
                    </span>

                    <span className="text-[#D1D5DB]">
                      •
                    </span>

                    <span className="text-[9.5px] text-[#9CA3AF]">
                      {task.due}
                    </span>

                  </div>

                </div>

                <span
                  className={`
                    px-2 py-1 rounded-full text-[9px] font-medium shrink-0

                    ${
                      task.priority === "High"
                        ? "bg-red-50 text-red-600"
                        : task.priority === "Medium"
                        ? "bg-[#FFF7E5] text-[#A36D00]"
                        : "bg-gray-50 text-gray-500"
                    }
                  `}
                >
                  {task.priority}
                </span>

              </div>

            ))}

          </div>

        </section>

        {/* ===================================================
            ANNOUNCEMENTS
        =================================================== */}

        <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">

          <SectionHeader
            title="Recent Announcements"
            subtitle="Latest updates from your school"
            action="View all"
          />

          <div className="space-y-1">

            {announcements.map((announcement) => (

              <div
                key={announcement.id}
                className="flex gap-3 py-3 border-b border-[#F0EEE8] last:border-0"
              >

                <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center shrink-0">

                  {announcement.type === "exam" ? (
                    <GraduationCap className="w-4 h-4 text-[#C6952F]" />
                  ) : announcement.type === "event" ? (
                    <Calendar className="w-4 h-4 text-[#C6952F]" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#C6952F]" />
                  )}

                </div>

                <div className="flex-1 min-w-0">

                  <div className="flex justify-between gap-2">

                    <p className="text-[11.5px] font-medium text-[#0F1B33]">
                      {announcement.title}
                    </p>

                    <span className="text-[9px] text-[#A0A5AE] whitespace-nowrap">
                      {announcement.time}
                    </span>

                  </div>

                  <p className="text-[10px] text-[#7A8190] mt-1 leading-relaxed">
                    {announcement.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

      {/* =====================================================
          HOMEWORK + MY CLASSES
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.25fr] gap-6">

        {/* ===================================================
            HOMEWORK
        =================================================== */}

        <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">

          <SectionHeader
            title="Homework & Assignments"
            subtitle="Submission progress"
            action="View all"
          />

          <div className="space-y-5">

            {homework.map((item) => {

              const percentage = Math.round(
                (item.submitted / item.total) * 100
              );

              return (
                <div key={item.id}>

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-[10px] text-[#C6952F] font-medium">
                        {item.className}
                      </p>

                      <p className="text-[11.5px] font-medium text-[#0F1B33] mt-1 truncate">
                        {item.title}
                      </p>

                    </div>

                    <span className="text-[10px] text-[#667085] whitespace-nowrap">
                      {item.submitted}/{item.total}
                    </span>

                  </div>

                  <div className="mt-2 h-1.5 bg-[#F0EEE8] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#0F1B33] rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                  <p className="text-[9px] text-[#9CA3AF] mt-1">
                    {percentage}% submitted
                  </p>

                </div>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            MY CLASSES
        =================================================== */}

        <section className="bg-white border border-[#E8E4D9] rounded-xl p-5">

          <SectionHeader
            title="My Classes"
            subtitle="Classes assigned to you"
            action="View all"
          />

          <div className="overflow-x-auto">

            <table className="w-full min-w-[560px]">

              <thead>

                <tr className="border-b border-[#EEEAE2]">

                  <th className="text-left pb-3 text-[9px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                    Class
                  </th>

                  <th className="text-left pb-3 text-[9px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                    Subject
                  </th>

                  <th className="text-left pb-3 text-[9px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                    Students
                  </th>

                  <th className="text-left pb-3 text-[9px] uppercase tracking-wider font-semibold text-[#9CA3AF]">
                    Attendance
                  </th>

                  <th className="pb-3" />

                </tr>

              </thead>

              <tbody>

                {classes.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b border-[#F3F1EA] last:border-0 hover:bg-[#FAF9F6]"
                  >

                    <td className="py-3">

                      <div className="flex items-center gap-2">

                        <div className="w-7 h-7 rounded-md bg-[#F7F5EF] flex items-center justify-center">

                          <GraduationCap className="w-3.5 h-3.5 text-[#C6952F]" />

                        </div>

                        <div>

                          <p className="text-[11px] font-semibold text-[#0F1B33]">
                            {item.className}-{item.section}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="text-[10.5px] text-[#667085]">
                      {item.subject}
                    </td>

                    <td className="text-[10.5px] text-[#667085]">
                      {item.students}
                    </td>

                    <td>

                      <span
                        className={`
                          text-[10px] font-medium
                          ${
                            item.attendance >= 90
                              ? "text-green-600"
                              : "text-[#A36D00]"
                          }
                        `}
                      >
                        {item.attendance}%
                      </span>

                    </td>

                    <td>

                      <button className="p-1.5 rounded-md hover:bg-[#F0EEE8]">

                        <MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" />

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* =====================================================
          FOOTER INFO
      ===================================================== */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2">

        <p className="text-[10px] text-[#A0A5AE]">
          InstituteOS Teacher Workspace
        </p>

        <p className="text-[10px] text-[#A0A5AE]">
          School Code: DPS-NGP
        </p>

      </div>

    </div>
    </>
  );
}
