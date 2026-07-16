import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/auth";
import { setToken, TOKEN_STORAGE_KEY } from "@/lib/api";
import type { Usuario } from "@/services/types";

interface AuthState {
  usuario: Usuario | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
  setUsuario: (u: Usuario | null) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

type PessoaLike = NonNullable<Usuario["casalInfo"]>["pessoa1"];

function normalizarPessoa(pessoaRaw: unknown): PessoaLike {
  const p = (pessoaRaw ?? {}) as Record<string, unknown>;
  const nome = typeof p.nome === "string" && p.nome.trim()
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

function normalizarUsuario(raw: unknown): Usuario {
  const r = (raw ?? {}) as Record<string, unknown> & {
    casalInfo?: Usuario["casalInfo"];
    pessoa1?: unknown;
    pessoa2?: unknown;
    pessoaLogada?: unknown;
  };
  const casalInfoRaw = r.casalInfo as Record<string, unknown> | undefined;
  const pessoa1Raw = casalInfoRaw?.pessoa1 ?? r.pessoa1;
  const pessoa2Raw = casalInfoRaw?.pessoa2 ?? r.pessoa2;
  const casalInfo = pessoa1Raw && pessoa2Raw
    ? {
        pessoa1: normalizarPessoa(pessoa1Raw),
        pessoa2: normalizarPessoa(pessoa2Raw),
      }
    : null;
  const pl = r.pessoaLogada;
  const pessoaLogada: 1 | 2 | undefined =
    pl === 2 || pl === "pessoa2" || pl === "2" ? 2 :
    pl === 1 || pl === "pessoa1" || pl === "1" ? 1 :
    undefined;
  return { ...(raw as Usuario), casalInfo, pessoaLogada };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setUsuario(null);
      setLoading(false);
      return;
    }
    try {
      const u = await authService.me();
      setUsuario(normalizarUsuario(u));
    } catch {
      setToken(null);
      setUsuario(null);
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
    setUsuario(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    authService.logout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        isAuthenticated: !!usuario,
        login,
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
