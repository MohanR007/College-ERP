
import React, { createContext, useContext, useEffect, useState } from "react";

// Define available theme options
type Theme = "dark" | "light" | "system";

/**
 * Props for the ThemeProvider component
 */
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

/**
 * Context state definition for theme management
 */
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Create context with default values
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * ThemeProvider component that manages theme settings and applies them to the document
 * 
 * @param children - Child components
 * @param defaultTheme - Initial theme if none is saved in storage
 * @param storageKey - Key to use for saving theme preference in localStorage
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  // Initialize theme from localStorage or use default
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  // Apply theme class to document root element
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Handle system theme preference
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
        
      root.classList.add(systemTheme);
      return;
    }
    
    // Apply selected theme
    root.classList.add(theme);
  }, [theme]);

  // Create context value with current theme and setter
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Custom hook to access theme context
 * @returns ThemeProviderState with current theme and setter function
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
