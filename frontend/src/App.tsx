import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { PublicOnly, RequireClassTeacher, RequireLogin, RequireRole } from "@/routes/guards";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ChangePassword from "@/pages/auth/ChangePassword";
import AppLayouts from "@/layout/AppLayouts";

import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

/* Dashboards */
import TeacherDashboard from "@/pages/DashboardsUser/TeacherDashboard";
import ParentDashboard from "@/pages/DashboardsUser/ParentDashboard";
import StudentDashboard from "@/pages/DashboardsUser/StudentDashboard";

/* Principal & office admin */
import SchoolDashboard from "@/pages/school/SchoolDashboard";
import SchoolSetup from "@/pages/school/SchoolSetup";
import StaffPage from "@/pages/school/StaffPage";
import AssignmentsPage from "@/pages/school/AssignmentsPage";

/* Teacher */
import TeacherTimetable from "@/pages/TeacherSection/TeacherTimetable";
import TeacherClassesPage from "@/pages/TeacherSection/TeacherClassesPage";
import TeacherAttendance from "@/components/teacher/TeacherAttendance";
import TeacherAttendanceHistory from "@/components/teacher/TeacherAttendanceHistory";
import TeacherAssignments from "@/components/teacher/TeacherAssignments";
import CreateAssignment from "@/components/teacher/CreateAssignment";
import AssignmentSubmissions from "@/components/teacher/AssignmentSubmissions";
import TeacherExamSchedule from "@/components/teacher/TeacherExamSchedule";
import TeacherEnterMarks from "@/components/teacher/TeacherEnterMarks";
import TeacherResults from "@/components/teacher/TeacherResults";
import TeacherStudents from "@/components/teacher/TeacherStudents";
import TeacherStudyMaterials from "@/components/teacher/TeacherStudyMaterials";
import TeacherNotices from "@/components/teacher/TeacherNotices";
import TeacherProfile from "@/components/teacher/TeacherProfile";
import TeacherMyAttendance from "@/components/teacher/TeacherMyAttendance";
import TeacherLeave from "@/components/teacher/TeacherLeave";
import TeacherMessages from "@/components/teacher/TeacherMessages";

/* Class teacher */
import ClassOverview from "@/components/teacher/classTeacher/ClassOverview";
import StudentProgressPage from "@/components/teacher/classTeacher/StudentProgress";
import ParentCommunication from "@/components/teacher/classTeacher/ParentCommunication";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route element={<PublicOnly />}>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Route>
    <Route path="/login" element={<Navigate to="/" replace />} />
    {/* opened from the email link — works whether or not someone is signed in */}
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Any signed-in user (forced after a temporary password) */}
    <Route element={<RequireLogin />}>
      <Route path="/change-password" element={<ChangePassword />} />
    </Route>

    {/* Teacher */}
    <Route element={<RequireRole roles={["TEACHER"]} />}>
      <Route element={<AppLayouts />}>
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/classes" element={<TeacherClassesPage />} />

        <Route path="/teacher/attendance/mark" element={<TeacherAttendance />} />
        <Route path="/teacher/attendance/history" element={<TeacherAttendanceHistory />} />

        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/assignments/create" element={<CreateAssignment />} />
        <Route path="/teacher/assignments/submissions" element={<AssignmentSubmissions />} />

        <Route path="/teacher/exams/schedule" element={<TeacherExamSchedule />} />
        <Route path="/teacher/exams/marks" element={<TeacherEnterMarks />} />
        <Route path="/teacher/exams/results" element={<TeacherResults />} />

        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/study-materials" element={<TeacherStudyMaterials />} />
        <Route path="/teacher/notices" element={<TeacherNotices />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />
        <Route path="/teacher/my-attendance" element={<TeacherMyAttendance />} />
        <Route path="/teacher/leave" element={<TeacherLeave />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />

        <Route element={<RequireClassTeacher />}>
          <Route path="/teacher/class-teacher" element={<Navigate to="/teacher/class-teacher/overview" replace />} />
          <Route path="/teacher/class-teacher/overview" element={<ClassOverview />} />
          <Route path="/teacher/class-teacher/progress" element={<StudentProgressPage />} />
          <Route path="/teacher/class-teacher/parents" element={<ParentCommunication />} />
        </Route>
      </Route>
    </Route>

    {/* Principal and office admin share the school management pages */}
    {(["PRINCIPAL", "ADMIN"] as const).map((role) => {
      const base = role === "PRINCIPAL" ? "/principal" : "/admin";
      return (
        <Route key={role} element={<RequireRole roles={[role]} />}>
          <Route element={<AppLayouts />}>
            <Route path={`${base}/dashboard`} element={<SchoolDashboard />} />
            <Route path={`${base}/setup`} element={<SchoolSetup />} />
            <Route path={`${base}/staff`} element={<StaffPage />} />
            <Route path={`${base}/assignments`} element={<AssignmentsPage />} />
          </Route>
        </Route>
      );
    })}


    {/* Parent */}
    <Route element={<RequireRole roles={["PARENT"]} />}>
      <Route element={<AppLayouts />}>
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
      </Route>
    </Route>

    {/* Student */}
    <Route element={<RequireRole roles={["STUDENT"]} />}>
      <Route element={<AppLayouts />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-right" />
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
