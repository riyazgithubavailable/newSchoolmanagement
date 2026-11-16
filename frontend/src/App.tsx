import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, HashRouter, useNavigate, useLocation } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "@/pages/Login";


import NotFound from "@/pages/NotFound";

import { queryClient } from "./lib/queryClient";
import { canAccessRoute } from "./utils/routePermission";
import { getHomeRoute } from "./utils/getRoutePermission";
import TeacherDashboard from "./pages/DashboardsUser/TeacherDashboard";
import ParentDashboard from "./pages/DashboardsUser/ParentDashboard";
import AdminDashboard from "./pages/DashboardsUser/AdminDashboard";
import TeacherTimetable from "./pages/TeacherSection/TeacherTimetable";
import TeacherAttendance from "./components/teacher/TeacherAttendance";
import TeacherAttendanceHistory from "./components/teacher/TeacherAttendanceHistory";
import TeacherAssignments from "./components/teacher/TeacherAssignments";
import CreateAssignment from "./components/teacher/CreateAssignment";
import AssignmentSubmissions from "./components/teacher/AssignmentSubmissions";
import TeacherExamSchedule from "./components/teacher/TeacherExamSchedule";
import TeacherEnterMarks from "./components/teacher/TeacherEnterMarks";
import TeacherResults from "./components/teacher/TeacherResults";
import TeacherStudents from "./components/teacher/TeacherStudents";
import TeacherStudyMaterials from "./components/teacher/TeacherStudyMaterials";
import TeacherNotices from "./components/teacher/TeacherNotices";
import TeacherProfile from "./components/teacher/TeacherProfile";
import TeacherClassesPage from "./pages/TeacherSection/TeacherClassesPage";
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const { isAuthenticated, logout, profileData } = useAuth();
//     const { token } = useToken()
//     const navigate = useNavigate();
//     const location = useLocation();
//     //     useEffect(() => {
//     //   if (import.meta.env.DEV) {
//     //     localStorage.removeItem("dwpps_token");
//     //   }
//     // }, []);
//     // useEffect(() => {
//     //     if (!token) return;

//     //     try {
//     //         const decoded: any = jwtDecode(token);
//     //         const expiryTime = decoded.exp * 1000 - Date.now();

//     //         if (expiryTime <= 0) {
//     //             clearAuthStorage();
//     //             logout();
//     //             navigate("/login", { replace: true });
//     //             return;
//     //         }

//     //         const timer = setTimeout(() => {
//     //             clearAuthStorage();
//     //             logout();
//     //             navigate("/login", { replace: true });
//     //         }, expiryTime);

//     //         return () => clearTimeout(timer);
//     //     } catch {
//     //         logout();
//     //         navigate("/login");
//     //     }
//     // }, [token, logout, navigate]);

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }


//     const role = profileData?.roleName ?? "";

//     const isAllowed = canAccessRoute(location.pathname, role);

//     if (!isAllowed) {
//         return <Navigate to={getHomeRoute(role)} replace />;
//     }
//     return <>{children}</>;
// }

// function PublicLoginRoute({ component: Component = Login }: { component?: React.ComponentType }) {
//     const { isAuthenticated, profileData } = useAuth();
//     // ⛔ wait for profile data
//     if (isAuthenticated && !profileData) {
//         return <div className="text-white">Loading...</div>; // ya loader dikha
//     }

//     if (!isAuthenticated) {
//         return <Component />;
//     }

//     const homeRoute = getHomeRoute(profileData?.roleName);
//     return <Navigate to={homeRoute} replace />;
// }

const AppRoutes = () => (
    <Routes>
        {/* Public */}
        {/* <Route path="/" element={<PublicLoginRoute />} />
        <Route path="/login" element={<PublicLoginRoute component={Login} />} /> */}
        {/* <Route path="/admin-login" element={<PublicLoginRoute component={AdminLogin} />} /> */}
        {/* Dashboard */}
        <Route
            path="/"
            element={
                <Login />
            }
        />
    
        <Route
            path="/teacher/dashboard"
            element={

                <TeacherDashboard />

            }
        />
        <Route
            path="/teacher/timetable"
            element={<TeacherTimetable />}
        />
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />


  <Route
    path="/teacher/attendance/mark"
    element={<TeacherAttendance />}
  />

  <Route
    path="/teacher/attendance/history"
    element={<TeacherAttendanceHistory />}
  />

  <Route
    path="/teacher/assignments"
    element={<TeacherAssignments />}
  />

  <Route
    path="/teacher/assignments/create"
    element={<CreateAssignment />}
  />

  <Route
    path="/teacher/assignments/submissions"
    element={<AssignmentSubmissions />}
  />

  <Route
    path="/teacher/exams/schedule"
    element={<TeacherExamSchedule />}
  />

  <Route
    path="/teacher/exams/marks"
    element={<TeacherEnterMarks />}
  />

  <Route
    path="/teacher/exams/results"
    element={<TeacherResults />}
  />

  <Route
    path="/teacher/students"
    element={<TeacherStudents />}
  />

  <Route
    path="/teacher/study-materials"
    element={<TeacherStudyMaterials />}
  />

  <Route
    path="/teacher/notices"
    element={<TeacherNotices />}
  />

  <Route
    path="/teacher/profile"
    element={<TeacherProfile />}
  />
        <Route
            path="/parent/dashboard"
            element={

                <ParentDashboard />

            }
        />
        <Route
            path="/admin/dashboard"
            element={

                <AdminDashboard />

            }
        />


        <Route path="*" element={<NotFound />} />
    </Routes>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </HashRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;