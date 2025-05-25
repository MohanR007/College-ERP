import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarIcon,
  FileTextIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  ClockIcon,
  BookIcon,
  BarChart3Icon,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map faculty role to teacher for UI purposes
  const userRole = user?.role === "faculty" ? "teacher" : "student";

  const navigationItems = [
    {
      icon: <HomeIcon className="h-5 w-5" />,
      name: "Dashboard",
      href: `/${userRole}/dashboard`,
      active: location.pathname === `/${userRole}/dashboard`,
      showFor: ["student", "teacher"],
    },
    {
      icon: <CalendarIcon className="h-5 w-5" />,
      name: "Academic Calendar",
      href: "/academic-calendar",
      active: location.pathname === "/academic-calendar",
      showFor: ["student", "teacher"],
    },
    {
      icon: <FileTextIcon className="h-5 w-5" />,
      name: "Assignments",
      href: `/${userRole === "student" ? "student" : "teacher"}/assignments`,
      active: location.pathname.includes("/assignments"),
      showFor: ["student", "teacher"],
    },
    {
      icon: <ClockIcon className="h-5 w-5" />,
      name: "Attendance",
      href: `/${userRole === "student" ? "student" : "teacher"}/attendance`,
      active: location.pathname.includes("/attendance"),
      showFor: ["student", "teacher"],
    },
    {
      icon: <BarChart3Icon className="h-5 w-5" />,
      name: "Marks",
      href: `/${userRole === "student" ? "student" : "teacher"}/marks`,
      active: location.pathname.includes("/marks"),
      showFor: ["student", "teacher"],
    },
    {
      icon: <BookIcon className="h-5 w-5" />,
      name: "Timetable",
      href: `/${userRole === "student" ? "student" : "teacher"}/timetable`,
      active: location.pathname.includes("/timetable"),
      showFor: ["student", "teacher"],
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      name: "Leave Management",
      href: `/${userRole === "student" ? "student" : "teacher"}/leave`,
      active: location.pathname.includes("/leave"),
      showFor: ["student", "teacher"],
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter((item) =>
    item.showFor.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-edu-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold">College Erp</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>

        <div className="flex-1 py-5 flex flex-col justify-between">
          <nav className="px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.active
                    ? "bg-edu-primary text-white"
                    : "text-gray-700 hover:bg-edu-primary/10"
                }`}
              >
                <div
                  className={`mr-3 ${
                    item.active ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="px-3">
            <button
              onClick={logout}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOutIcon className="mr-3 h-5 w-5 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-edu-primary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold">College Erp</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg">
            <div className="h-full flex flex-col">
              <div className="p-5 border-b border-gray-200 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-edu-primary flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">College Erp</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>

              <div className="flex-1 py-5 flex flex-col justify-between">
                <nav className="px-3 space-y-1">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        item.active
                          ? "bg-edu-primary text-white"
                          : "text-gray-700 hover:bg-edu-primary/10"
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <div
                        className={`mr-3 ${
                          item.active ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="px-3">
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      logout();
                    }}
                    className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <LogOutIcon className="mr-3 h-5 w-5 text-gray-500" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-5 md:p-8 pt-20 md:pt-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
