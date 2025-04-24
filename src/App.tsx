
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Teacher feature pages
import TeacherTimetable from "./pages/teacher/Timetable";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherLeave from "./pages/teacher/Leave";
import TeacherMarks from "./pages/teacher/Marks";

// Student feature pages
import StudentTimetable from "./pages/student/Timetable";
import StudentAttendance from "./pages/student/Attendance";
import StudentAssignments from "./pages/student/Assignments";
import StudentLeave from "./pages/student/Leave";
import StudentMarks from "./pages/student/Marks";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />
            
            {/* Teacher Routes */}
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard/timetable" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherTimetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard/attendance" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard/assignments" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherAssignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard/leave" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherLeave />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard/marks" 
              element={
                <ProtectedRoute allowedRoles={["faculty"]}>
                  <TeacherMarks />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/timetable" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentTimetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/attendance" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/assignments" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentAssignments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/leave" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentLeave />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student-dashboard/marks" 
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentMarks />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
