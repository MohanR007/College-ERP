import React, { useState } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Calendar, LayoutDashboard, Users, Book, FileText, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

const navLinkClasses = (isActive: boolean) =>
  cn(
    "group relative flex items-center gap-2 rounded-md px-4 py-2 font-medium transition-colors hover:bg-gray-100",
    isActive
      ? "bg-gray-100 text-gray-900"
      : "text-gray-500 hover:text-gray-900"
  );

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="lg:hidden absolute top-4 left-4 z-50">
            <LayoutDashboard className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="text-left px-4 pt-4">
            <SheetTitle>Dashboard Menu</SheetTitle>
            <SheetDescription>
              Navigate through your options.
            </SheetDescription>
          </SheetHeader>
          <nav className="mt-6 px-4 space-y-1">
            {role === 'student' ? (
              <>
                <NavLink to="/student/dashboard" className={({ isActive }) => navLinkClasses(isActive)}>
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </NavLink>
                <NavLink to="/student/courses" className={({ isActive }) => navLinkClasses(isActive)}>
                  <Book className="h-5 w-5 mr-2" />
                  Courses
                </NavLink>
                <NavLink to="/student/assignments" className={({ isActive }) => navLinkClasses(isActive)}>
                  <FileText className="h-5 w-5 mr-2" />
                  Assignments
                </NavLink>
                <NavLink to="/student/leave" className={({ isActive }) => navLinkClasses(isActive)}>
                  <FileText className="h-5 w-5 mr-2" />
                  Leave Application
                </NavLink>
                <NavLink to="/academic-calendar" className={({ isActive }) => navLinkClasses(isActive)}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Academic Calendar
                </NavLink>
              </>
            ) : role === 'teacher' ? (
              <>
                <NavLink to="/teacher/dashboard" className={({ isActive }) => navLinkClasses(isActive)}>
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </NavLink>
                <NavLink to="/teacher/courses" className={({ isActive }) => navLinkClasses(isActive)}>
                  <Book className="h-5 w-5 mr-2" />
                  Courses
                </NavLink>
                <NavLink to="/teacher/assignments" className={({ isActive }) => navLinkClasses(isActive)}>
                  <FileText className="h-5 w-5 mr-2" />
                  Assignments
                </NavLink>
                <NavLink to="/teacher/students" className={({ isActive }) => navLinkClasses(isActive)}>
                  <Users className="h-5 w-5 mr-2" />
                  Students
                </NavLink>
                <NavLink to="/teacher/Leave" className={({ isActive }) => navLinkClasses(isActive)}>
                  <FileText className="h-5 w-5 mr-2" />
                  Leave Management
                </NavLink>
                <NavLink to="/academic-calendar" className={({ isActive }) => navLinkClasses(isActive)}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Academic Calendar
                </NavLink>
              </>
            ) : null}
          </nav>
          <Button variant="ghost" className="absolute bottom-4 left-4" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </SheetContent>
      </Sheet>

      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-lg font-semibold">EduSync</span>
          <ModeToggle />
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {role === 'student' ? (
            <>
              <NavLink to="/student/dashboard" className={({ isActive }) => navLinkClasses(isActive)}>
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Dashboard
              </NavLink>
              <NavLink to="/student/courses" className={({ isActive }) => navLinkClasses(isActive)}>
                <Book className="h-5 w-5 mr-2" />
                Courses
              </NavLink>
              <NavLink to="/student/assignments" className={({ isActive }) => navLinkClasses(isActive)}>
                <FileText className="h-5 w-5 mr-2" />
                Assignments
              </NavLink>
              <NavLink to="/student/leave" className={({ isActive }) => navLinkClasses(isActive)}>
                <FileText className="h-5 w-5 mr-2" />
                Leave Application
              </NavLink>
              <NavLink to="/academic-calendar" className={({ isActive }) => navLinkClasses(isActive)}>
                <Calendar className="h-5 w-5 mr-2" />
                Academic Calendar
              </NavLink>
            </>
          ) : role === 'teacher' ? (
            <>
              <NavLink to="/teacher/dashboard" className={({ isActive }) => navLinkClasses(isActive)}>
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Dashboard
              </NavLink>
              <NavLink to="/teacher/courses" className={({ isActive }) => navLinkClasses(isActive)}>
                <Book className="h-5 w-5 mr-2" />
                Courses
              </NavLink>
              <NavLink to="/teacher/assignments" className={({ isActive }) => navLinkClasses(isActive)}>
                <FileText className="h-5 w-5 mr-2" />
                Assignments
              </NavLink>
              <NavLink to="/teacher/students" className={({ isActive }) => navLinkClasses(isActive)}>
                <Users className="h-5 w-5 mr-2" />
                Students
              </NavLink>
              <NavLink to="/teacher/Leave" className={({ isActive }) => navLinkClasses(isActive)}>
                <FileText className="h-5 w-5 mr-2" />
                Leave Management
              </NavLink>
              <NavLink to="/academic-calendar" className={({ isActive }) => navLinkClasses(isActive)}>
                <Calendar className="h-5 w-5 mr-2" />
                Academic Calendar
              </NavLink>
            </>
          ) : null}
        </nav>
        <Button variant="ghost" className="absolute bottom-4 left-4" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </aside>

      <div className="flex flex-col flex-1 overflow-x-hidden">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
