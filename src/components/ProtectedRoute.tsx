
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Props for the ProtectedRoute component
 * @property {React.ReactNode} children - The components to render when access is granted
 * @property {string} [role] - Optional role requirement ('student' or 'teacher')
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "student" | "teacher";
}

/**
 * ProtectedRoute component that handles authentication and role-based access control
 * 
 * This component:
 * 1. Checks if user is authenticated
 * 2. Verifies user role if specified
 * 3. Redirects to appropriate pages based on authentication status and role
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  role 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-t-edu-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Map faculty role to 'teacher' for consistency in route protection
  const userRole = user.role === "faculty" ? "teacher" : "student";

  // Check if user has required role
  if (role && userRole !== role) {
    // Redirect to appropriate dashboard based on user's actual role
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  // User is authenticated and has required role (or no role specified)
  return <>{children}</>;
};

export default ProtectedRoute;
