import PagePlaceholder from "@/common/PagePlaceholder";

export default function StudentDashboard() {
  return (
    <PagePlaceholder
      title="Student Dashboard"
      description="Your timetable, assignments and results in one place."
      upcoming={[
        "Today's timetable",
        "Assignments & submissions",
        "Study materials",
        "Exam schedule & results",
        "My attendance",
        "Class notices",
      ]}
    />
  );
}
