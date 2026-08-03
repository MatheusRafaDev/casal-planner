import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { usuarioService } from "@/services/usuario";

type Theme = "light" | "dark";
const STORAGE_KEY = "cp_theme";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const { usuario, setUsuario } = useAuth();

  // hidrata a partir do localStorage após montar (evita hydration mismatch)
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    }
  }, []);

  // sincroniza com preferência do backend quando login carrega
  useEffect(() => {
    if (usuario?.modoEscuro !== undefined) {
      const t: Theme = usuario.modoEscuro ? "dark" : "light";
      setThemeState(t);
    }
  }, [usuario?.modoEscuro]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (usuario?.id) {
      usuarioService
        .toggleModoEscuro(usuario.id, t === "dark")
        .then(() => {
          setUsuario((prev) =>
            prev ? { ...prev, modoEscuro: t === "dark" } : prev,
          );
        })
        .catch(() => {});
    }
  };

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
