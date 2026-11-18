import { Building2 } from "lucide-react";
import PagePlaceholder from "@/common/PagePlaceholder";

export default function AdminDashboard() {
  return (
    <PagePlaceholder
      title="School Office Dashboard"
      description="Day-to-day school operations: fees, admissions and staff records."
      icon={<Building2 size={26} />}
      upcoming={[
        "Fee collection & receipts",
        "Fee dues & defaulters list",
        "Admissions & student records",
        "Staff records & payroll",
        "Transport management",
        "Library & inventory",
        "Certificates (TC, bonafide)",
        "Office notices",
      ]}
    />
  );
}
