/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth";
import { resumoService } from "@/services/resumo";
import { categoriasService } from "@/services/categorias";
import { itensService } from "@/services/itens";
import { clearAppData } from "@/lib/clear-app-data";
import { ApiError } from "@/lib/api";
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
    receberNotificacoes: p.receberNotificacoes as boolean | undefined,
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

const CACHED_USER_KEY = "cp_cached_user";

function getCachedUser(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? normalizarUsuario(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function setCachedUser(u: Usuario | null) {
  if (typeof window === "undefined") return;
  try {
    if (u) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {
    // ignorar possíveis erros de quota
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioState] = useState<Usuario | null>(() => getCachedUser());
  const [loading, setLoading] = useState(() => !getCachedUser());
  const qc = useQueryClient();

  const preaquecerQueries = useCallback(() => {
    // Pré-carrega no React Query em paralelo com o pré-aquecimento do Redis
    qc.prefetchQuery({ queryKey: ["resumo"], queryFn: () => resumoService.obter() });
    qc.prefetchQuery({ queryKey: ["categorias"], queryFn: () => categoriasService.listar() });
    qc.prefetchInfiniteQuery({
      queryKey: ["itens-paginado", "tudo", "", "todos", "todos", "todos"],
      queryFn: ({ pageParam }) =>
        itensService.listarPaginado({ page: pageParam as number, pageSize: 20 }),
      initialPageParam: 1,
    });
  }, [qc]);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const u = await authService.me();
      const norm = normalizarUsuario(u);
      setUsuarioState(norm);
      setCachedUser(norm);
    } catch (err: unknown) {
      // Se for 401 ou 403 explícito (token e refresh token expirados ou inválidos):
      const isAuthError = err instanceof ApiError && (err.status === 401 || err.status === 403);

      if (isAuthError) {
        setUsuarioState(null);
        setCachedUser(null);
      } else {
        // Erro de conexão, offline ou instabilidade temporária:
        // Mantém o usuário autenticado com cache para não derrubar a sessão no mobile!
        console.warn("Falha de conexão ao validar sessão, mantendo usuário ativo:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (typeof window !== "undefined") {
      window.addEventListener("online", refresh);
      return () => window.removeEventListener("online", refresh);
    }
  }, [refresh]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const res = await authService.login(email, senha);
      const u = normalizarUsuario(res.usuario);
      setUsuarioState(u);
      setCachedUser(u);
      preaquecerQueries();
      return u;
    },
    [preaquecerQueries],
  );

  const loginComGoogle = useCallback(
    async (token: string) => {
      const res = await authService.loginComGoogle(token);
      const u = normalizarUsuario(res.usuario);
      setUsuarioState(u);
      setCachedUser(u);
      preaquecerQueries();
      return u;
    },
    [preaquecerQueries],
  );

  const logout = useCallback(() => {
    setCachedUser(null);
    clearAppData();
    qc.clear();
    setUsuarioState(null);
    authService.logout().catch(() => {});
  }, [qc]);

  const setUsuario = useCallback(
    (u: Usuario | null | ((prev: Usuario | null) => Usuario | null)) => {
      setUsuarioState((prev) => {
        const next = typeof u === "function" ? u(prev) : u;
        setCachedUser(next);
        return next;
      });
    },
    [],
  );

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
