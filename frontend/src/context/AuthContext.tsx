import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type Usuario } from "@/services/authService";
import { extractApiError } from "@/lib/api";

interface AuthContextValue {
  usuario: Usuario | null;
  loading: boolean;
  estaAutenticado: boolean;
  isCasal: boolean;
  pessoaQueLogou: "pessoa1" | "pessoa2" | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<Usuario | null>;
  setUsuario: (u: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await authService.getUsuario();
        setUsuario(u);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const u = await authService.login({ email, senha });
      setUsuario(u);
      return { success: true };
    } catch (error) {
      return { success: false, error: extractApiError(error, "Erro ao fazer login") };
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUsuario(null);
  }, []);

  const refresh = useCallback(async () => {
    authService.clearCache();
    const u = await authService.fetchMe();
    setUsuario(u);
    return u;
  }, []);

  const isCasal = Boolean(usuario?.isCasal);
  const pessoaQueLogou = usuario?.pessoaQueLogou ?? null;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        estaAutenticado: !!usuario,
        isCasal,
        pessoaQueLogou,
        login,
        logout,
        refresh,
        setUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
