import React, { createContext, useState, useContext, useEffect } from "react";
import authService, { Usuario } from "../services/authService";
import usuarioService from "../services/usuarioService";

interface AuthContextData {
  usuario: Usuario | null;
  loading: boolean;
  estaAutenticado: boolean;
  isCasal: boolean;
  pessoaQueLogou: string | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  registrar: (dados: any) => Promise<{ success: boolean; error?: string }>;
  registrarCasal: (dados: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  recarregarUsuario: () => Promise<Usuario | null>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const dadosUsuario = await authService.getUsuario();
        setUsuario(dadosUsuario || null);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const dadosUsuario = await authService.login({ email, senha });
      if (dadosUsuario && !dadosUsuario.error) {
        setUsuario(dadosUsuario);
        return { success: true };
      }
      return { success: false, error: dadosUsuario?.error || "Resposta inválida" };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer login",
      };
    }
  };

  const registrar = async (dados: any) => {
    try {
      const resp = await usuarioService.registrar(dados);
      if (resp) return await login(dados.email, dados.senha);
      return { success: false, error: "Resposta inválida" };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar",
      };
    }
  };

  const registrarCasal = async (dados: any) => {
    try {
      const resp = await usuarioService.registrarCasal(dados);
      if (resp) return await login(dados.emailPessoa1, dados.senhaPessoa1);
      return { success: false, error: "Resposta inválida" };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar casal",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const recarregarUsuario = async () => {
    try {
      authService.clearCache();
      const dadosAtualizados = await authService.buscarDadosCompletos();
      setUsuario(dadosAtualizados);
      return dadosAtualizados;
    } catch (error) {
      console.error("Erro ao recarregar usuário:", error);
      return null;
    }
  };

  const isCasal = !!(usuario?.isCasal || usuario?.tipoConta === 1);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        estaAutenticado: !!usuario,
        isCasal,
        pessoaQueLogou: usuario?.pessoaQueLogou || null,
        login,
        registrar,
        registrarCasal,
        logout,
        recarregarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
