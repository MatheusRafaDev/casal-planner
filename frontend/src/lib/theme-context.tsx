/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "cp_theme";

interface ThemeCtx {
  theme: Theme;
  actualTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || "system"
  );
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const applyTheme = theme === "system" ? (isSystemDark ? "dark" : "light") : theme;

    root.classList.remove("light", "dark");
    root.classList.add(applyTheme);
    setActualTheme(applyTheme);

  }, [theme]);

  // Listener for system preference changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      const newTheme = e.matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      setActualTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  const toggle = () => {
    const current = actualTheme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
