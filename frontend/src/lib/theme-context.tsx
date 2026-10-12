/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";

type Theme = "light" | "dark" | "system";
export type Persona = 1 | 2 | null;
const THEME_STORAGE_KEY = "cp_theme";
const PERSONA_STORAGE_KEY = "cp_persona_ativa";

interface ThemeCtx {
  theme: Theme;
  actualTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
  persona: Persona;
  setPersona: (p: Persona) => void;
  alternarPersona: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { usuario, isAuthenticated } = useAuth();

  const [theme, setThemeState] = useState<Theme>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(THEME_STORAGE_KEY) as Theme)
        : "light") || "light",
  );
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Persona é estritamente vinculada ao usuário logado (não pode mudar manualmente)
  const persona: Persona =
    !isAuthenticated || !usuario
      ? null
      : usuario.tipoConta === "Casal"
        ? usuario.pessoaLogada === 2
          ? 2
          : 1
        : 1;

  // Garante modo claro e sincroniza data-persona com o usuário autenticado
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    if (typeof window !== "undefined") {
      localStorage.removeItem(THEME_STORAGE_KEY);
      localStorage.removeItem(PERSONA_STORAGE_KEY);
    }
    setActualTheme("light");

    if (!isAuthenticated || !usuario) {
      root.removeAttribute("data-persona");
    } else if (usuario.tipoConta === "Casal") {
      root.setAttribute("data-persona", usuario.pessoaLogada === 2 ? "p2" : "p1");
    } else {
      root.setAttribute("data-persona", "p1");
    }
  }, [isAuthenticated, usuario]);

  // Funções de troca bloqueadas: cada um usa estritamente sua própria conta logada
  const setPersona = (_p: Persona) => {};
  const alternarPersona = () => {};

  const setTheme = (_newTheme: Theme) => {
    setThemeState("light");
  };

  const toggle = () => {
    setThemeState("light");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        setTheme,
        toggle,
        persona,
        setPersona,
        alternarPersona,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
