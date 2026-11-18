import PagePlaceholder from "@/common/PagePlaceholder";

export default function PrincipalDashboard() {
  return (
    <PagePlaceholder
      title="Principal Dashboard"
      description="School-wide overview for the principal / admin."
      upcoming={[
        "Students & admissions",
        "Teachers & staff management",
        "Classes, sections & subjects",
        "Assign class teachers",
        "Teacher leave approvals",
        "Exams, results & report cards",
        "Fees & reports",
        "School-wide notices",
      ]}
    />
  );
}
