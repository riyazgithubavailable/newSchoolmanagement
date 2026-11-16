export type Stat = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
};

export type TimetableItem = {
  id: number;
  time: string;
  duration: string;
  className: string;
  subject: string;
  room: string;
  status: "Completed" | "Ongoing" | "Upcoming";
};

export type Announcement = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: "exam" | "notice" | "event";
};

export type Task = {
  id: number;
  title: string;
  className: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
};

export type Homework = {
  id: number;
  className: string;
  title: string;
  submitted: number;
  total: number;
};

export type TeacherClass = {
  id: number;
  className: string;
  section: string;
  subject: string;
  students: number;
  attendance: number;
};