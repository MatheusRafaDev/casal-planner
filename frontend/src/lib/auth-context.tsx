import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth";
import { setToken, TOKEN_STORAGE_KEY } from "@/lib/api";
import type { Usuario } from "@/services/types";

interface AuthState {
  usuario: Usuario | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  loginComGoogle: (token: string) => Promise<Usuario>;
  logout: () => void;
  setUsuario: (u: Usuario | null | ((prev: Usuario | null) => Usuario | null)) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

type PessoaLike = NonNullable<Usuario["casalInfo"]>["pessoa1"];

function normalizarPessoa(pessoaRaw: unknown): PessoaLike {
  const p = (pessoaRaw ?? {}) as Record<string, unknown>;
  const nome =
    typeof p.nome === "string" && p.nome.trim()
      ? p.nome
      : typeof p.nomeCompleto === "string" && p.nomeCompleto.trim()
        ? p.nomeCompleto
        : "";

  return {
    nome,
    email: (typeof p.email === "string" ? p.email : "") ?? "",
    dataNascimento: p.dataNascimento as string | null | undefined,
    avatar: p.avatar as string | null | undefined,
  };
}

export function normalizarUsuario(raw: unknown): Usuario {
  const r = (raw ?? {}) as Record<string, unknown> & {
    casalInfo?: Usuario["casalInfo"];
    pessoa1?: unknown;
    pessoa2?: unknown;
    pessoaLogada?: unknown;
  };
  const casalInfoRaw = r.casalInfo as Record<string, unknown> | undefined;
  const pessoa1Raw = casalInfoRaw?.pessoa1 ?? r.pessoa1;
  const pessoa2Raw = casalInfoRaw?.pessoa2 ?? r.pessoa2;
  const casalInfo =
    pessoa1Raw && pessoa2Raw
      ? {
          pessoa1: normalizarPessoa(pessoa1Raw),
          pessoa2: normalizarPessoa(pessoa2Raw),
        }
      : null;
  const pl = r.pessoaLogada;
  const pessoaLogada: 1 | 2 | undefined =
    pl === 2 || pl === "pessoa2" || pl === "2"
      ? 2
      : pl === 1 || pl === "pessoa1" || pl === "1"
        ? 1
        : undefined;
  return { ...(raw as Usuario), casalInfo, pessoaLogada };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const u = await authService.me();
      setUsuarioState(normalizarUsuario(u));
    } catch {
      setToken(null);
      setUsuarioState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, senha: string) => {
    const res = await authService.login(email, senha);
    setToken(res.token);
    const u = normalizarUsuario(res.usuario);
    setUsuarioState(u);
    return u;
  }, []);

  const loginComGoogle = useCallback(async (token: string) => {
    const res = await authService.loginComGoogle(token);
    setToken(res.token);
    const u = normalizarUsuario(res.usuario);
    setUsuarioState(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuarioState(null);
    authService.logout().catch(() => {});
  }, []);

  const setUsuario = useCallback((u: Usuario | null | ((prev: Usuario | null) => Usuario | null)) => {
    setUsuarioState(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        isAuthenticated: !!usuario,
        login,
        loginComGoogle,
        logout,
        setUsuario,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
