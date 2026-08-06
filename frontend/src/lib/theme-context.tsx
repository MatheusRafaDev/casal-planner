import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-context";
type Theme = "light" | "dark";
const STORAGE_KEY = "cp_theme";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  // Força o modo escuro no HTML ao carregar
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const setTheme = (t: Theme) => {};
  const toggle = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
