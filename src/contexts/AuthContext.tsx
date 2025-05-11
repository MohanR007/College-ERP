
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  user_id: number;
  email: string;
  role: "student" | "faculty";
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem("erpUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("erpUser");
      }
    }
    setLoading(false);
  }, []);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (user && location.pathname === "/login") {
      const redirectPath = user.role === "faculty" ? "/teacher/dashboard" : "/student/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Query the users table to find the user with matching email and password
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          user_id,
          email,
          role,
          students(name),
          faculty(name)
        `)
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error || !users) {
        throw new Error('Invalid email or password');
      }

      // Get the name based on the role
      const name = users.role === 'student' ? 
        users.students?.name : 
        users.faculty?.name;

      const userData = {
        user_id: users.user_id,
        email: users.email,
        role: users.role as "student" | "faculty",
        name: name
      };

      setUser(userData);
      localStorage.setItem("erpUser", JSON.stringify(userData));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${name || userData.email}!`,
      });
      
      // Redirect based on role
      navigate(userData.role === "faculty" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("erpUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
