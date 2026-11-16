import * as React from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type ClassItem = {
  id: number;
  className: string;
  section: string;
  subject: string;
  studentCount: number;
  room: string;
  schedule: string;
  color: string;
  status: "Active" | "Upcoming";
};

const classesData: ClassItem[] = [
  {
    id: 1,
    className: "Class 1",
    section: "A",
    subject: "Mathematics",
    studentCount: 32,
    room: "Room 101",
    schedule: "Monday & Wednesday, 09:00 AM",
    color: "bg-blue-100 text-blue-700",
    status: "Active",
  },
  {
    id: 2,
    className: "Class 2",
    section: "B",
    subject: "Science",
    studentCount: 28,
    room: "Room 202",
    schedule: "Tuesday & Thursday, 10:00 AM",
    color: "bg-emerald-100 text-emerald-700",
    status: "Active",
  },
  {
    id: 3,
    className: "Class 3",
    section: "A",
    subject: "English",
    studentCount: 35,
    room: "Room 103",
    schedule: "Monday & Friday, 11:00 AM",
    color: "bg-purple-100 text-purple-700",
    status: "Active",
  },
  {
    id: 4,
    className: "Class 4",
    section: "C",
    subject: "Social Studies",
    studentCount: 30,
    room: "Room 204",
    schedule: "Wednesday & Friday, 12:00 PM",
    color: "bg-orange-100 text-orange-700",
    status: "Upcoming",
  },
  {
    id: 5,
    className: "Class 5",
    section: "A",
    subject: "Mathematics",
    studentCount: 34,
    room: "Room 105",
    schedule: "Tuesday & Thursday, 01:00 PM",
    color: "bg-pink-100 text-pink-700",
    status: "Active",
  },
  {
    id: 6,
    className: "Class 6",
    section: "B",
    subject: "Computer Science",
    studentCount: 26,
    room: "Computer Lab",
    schedule: "Monday & Thursday, 02:00 PM",
    color: "bg-cyan-100 text-cyan-700",
    status: "Upcoming",
  },
];

export default function TeacherClasses() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const subjects = Array.from(
    new Set(classesData.map((classItem) => classItem.subject))
  );

  const filteredClasses = classesData.filter((classItem) => {
    const searchValue = searchTerm.toLowerCase();

    const matchesSearch =
      classItem.className.toLowerCase().includes(searchValue) ||
      classItem.section.toLowerCase().includes(searchValue) ||
      classItem.subject.toLowerCase().includes(searchValue);

    const matchesSubject =
      subjectFilter === "all" || classItem.subject === subjectFilter;

    const matchesStatus =
      statusFilter === "all" || classItem.status === statusFilter;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleViewClass = (classItem: ClassItem) => {
    console.log("Selected class:", classItem);

    // Later, navigate to:
    // /teacher/classes/class-1-a
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>Teacher Workspace</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            My Classes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your assigned classes, students, and teaching schedule.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm shadow-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-medium">{classesData.length}</span>
          <span className="text-muted-foreground">Assigned Classes</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <p className="text-2xl font-semibold">{classesData.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-semibold">
                {classesData.reduce(
                  (total, classItem) => total + classItem.studentCount,
                  0
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Subjects</p>
              <p className="text-2xl font-semibold">{subjects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-700">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Active Classes</p>
              <p className="text-2xl font-semibold">
                {classesData.filter((item) => item.status === "Active").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by class, section, or subject..."
                className="pl-9"
              />
            </div>

            <Select
              value={subjectFilter}
              onValueChange={setSubjectFilter}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>

                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[170px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Assigned Classes</h2>
          <p className="text-sm text-muted-foreground">
            {filteredClasses.length} class
            {filteredClasses.length !== 1 ? "es" : ""} found
          </p>
        </div>
      </div>

      {filteredClasses.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <Card
              key={classItem.id}
              className="group overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${classItem.color}`}
                    >
                      {classItem.className.replace("Class ", "")}
                      {classItem.section}
                    </div>

                    <div>
                      <CardTitle className="text-lg">
                        {classItem.className} - {classItem.section}
                      </CardTitle>

                      <CardDescription>
                        {classItem.subject}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge
                    variant={
                      classItem.status === "Active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {classItem.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Students</span>
                    </div>

                    <p className="font-semibold">
                      {classItem.studentCount}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs">Room</span>
                    </div>

                    <p className="truncate text-sm font-semibold">
                      {classItem.room}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{classItem.schedule}</span>
                </div>

                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => handleViewClass(classItem)}
                >
                  View Class
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold">No classes found</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or filter options.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}