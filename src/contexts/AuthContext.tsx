
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface User {
  user_id: number;
  email: string;
  role: "student" | "faculty";
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // This would normally call the Supabase API
      // For demonstration purposes, we'll simulate authentication
      // Replace this with actual Supabase authentication when connected
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simulate successful login with mock data
      // In a real implementation, this would verify credentials against Supabase
      
      // Mock user data - this should come from your Supabase auth
      const mockUser = {
        user_id: email === "teacher@example.com" ? 1 : 2,
        email,
        role: email === "teacher@example.com" ? "faculty" : "student" as "faculty" | "student",
      };
      
      setUser(mockUser);
      localStorage.setItem("erpUser", JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${mockUser.role}!`,
      });
      
      // Redirect based on role
      navigate(mockUser.role === "faculty" ? "/teacher-dashboard" : "/student-dashboard");
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
    navigate("/");
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
