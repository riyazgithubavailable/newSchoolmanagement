import PagePlaceholder from "@/common/PagePlaceholder";

export default function ParentDashboard() {
  return (
    <PagePlaceholder
      title="Parent Dashboard"
      description="Track your child's attendance, homework and results."
      upcoming={[
        "Child's attendance",
        "Homework & assignments",
        "Exam results & report cards",
        "Messages with class teacher",
        "PTM invitations & RSVP",
        "Fees",
      ]}
    />
  );
}
