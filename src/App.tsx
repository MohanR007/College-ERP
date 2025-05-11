
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Index from "./pages/Index";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentLeave from "./pages/student/Leave";
import TeacherLeave from "./pages/teacher/Leave";
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import AcademicCalendarPage from './pages/AcademicCalendarPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/academic-calendar" element={
                <ProtectedRoute>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <AcademicCalendarPage />
                  </React.Suspense>
                </ProtectedRoute>
              } />
              {/* Student routes */}
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
              </Route>
              {/* Teacher routes */}
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
              </Route>
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
