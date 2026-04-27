import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";
import usuarioService from "../services/usuarioService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carrega o usuário do cache/localStorage ao montar
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

  const login = async (email, senha) => {
    try {
      const dadosUsuario = await authService.login({ email, senha });
      if (dadosUsuario) {
        setUsuario(dadosUsuario);
        return { success: true };
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer login",
      };
    }
  };

  const registrar = async (dados) => {
    try {
      const resp = await usuarioService.registrar(dados);
      if (resp) {
        return await login(dados.email, dados.senha);
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar",
      };
    }
  };

  const registrarCasal = async (dados) => {
    try {
      const resp = await usuarioService.registrarCasal(dados);
      if (resp) {
        return await login(dados.emailPessoa1, dados.senhaPessoa1);
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar casal",
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    navigate("/");
  };

  const atualizarUsuario = (novosDados) => {
    setUsuario(novosDados);
  };

  // Recarrega dados completos do servidor e atualiza contexto
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

  const atualizarPerfil = async (id, dados) => {
    try {
      const response = await usuarioService.atualizarPerfil(id, dados);
      await recarregarUsuario();
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar perfil",
      };
    }
  };

  const atualizarPerfilCasal = async (id, dados) => {
    try {
      const response = await usuarioService.atualizarPerfilCasal(id, dados);
      await recarregarUsuario();
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar perfil",
      };
    }
  };

  const atualizarModoEscuro = async (id, modoEscuro) => {
    try {
      const response = await usuarioService.atualizarModoEscuro(id, modoEscuro);
      setUsuario((prev) => ({ ...prev, modoEscuro }));
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao atualizar modo escuro",
      };
    }
  };

  const alterarSenha = async (dados) => {
    try {
      const response = await usuarioService.alterarSenha(dados);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao alterar senha",
      };
    }
  };

  const excluirConta = async (id) => {
    try {
      const response = await usuarioService.excluirConta(id);
      logout();
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao excluir conta",
      };
    }
  };

  // Derivações úteis, todas baseadas no estado central `usuario`
  const isCasal = !!(usuario?.isCasal || usuario?.tipoConta === "Casal" || usuario?.tipoConta === 1);
  const pessoaQueLogou = usuario?.pessoaQueLogou || null;

  const value = {
    usuario,
    loading,
    estaAutenticado: !!usuario,
    isCasal,
    pessoaLogada: pessoaQueLogou,  // alias mantido por compatibilidade
    pessoaQueLogou,

    login,
    registrar,
    registrarCasal,
    logout,

    atualizarUsuario,
    recarregarUsuario,
    atualizarPerfil,
    atualizarPerfilCasal,
    atualizarModoEscuro,
    alterarSenha,
    excluirConta,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};