
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLeave from "./pages/student/Leave";
import TeacherLeave from "./pages/teacher/Leave";
import StudentTimetable from "./pages/student/Timetable";
import StudentMarks from "./pages/student/Marks";
import StudentAttendance from "./pages/student/Attendance";
import StudentAssignments from "./pages/student/Assignments";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherMarks from "./pages/teacher/Marks";
import TeacherAssignments from "./pages/teacher/Assignments";
import TeacherTimetable from "./pages/teacher/Timetable";
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import AcademicCalendarPage from './pages/AcademicCalendarPage';

// Initialize React Query client
const queryClient = new QueryClient();

/**
 * Main App component that sets up:
 * - React Query for data fetching
 * - Theme provider for light/dark mode
 * - Authentication context
 * - Routing structure for the application
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* Academic Calendar - Available to all authenticated users */}
              <Route path="/academic-calendar" element={
                <ProtectedRoute>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <AcademicCalendarPage />
                  </React.Suspense>
                </ProtectedRoute>
              } />
              
              {/* Student Routes */}
              <Route path="/student">
                <Route path="dashboard" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentDashboard />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="leave" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentLeave />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="timetable" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentTimetable />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="marks" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentMarks />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="attendance" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentAttendance />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="assignments" element={
                  <ProtectedRoute role="student">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <StudentAssignments />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Teacher Routes */}
              <Route path="/teacher">
                <Route path="dashboard" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherDashboard />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="leave" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherLeave />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="attendance" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherAttendance />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="marks" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherMarks />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="assignments" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherAssignments />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
                <Route path="timetable" element={
                  <ProtectedRoute role="teacher">
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <TeacherTimetable />
                    </React.Suspense>
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
