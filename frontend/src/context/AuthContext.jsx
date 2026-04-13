import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import authService from "../services/authService";
import usuarioService from "../services/usuarioService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const carregarUsuario = async () => {
      try {
        // Uma única chamada — estaAutenticado() já usa cache interno do authService
        const dadosUsuario = await authService.getUsuario();
        if (!cancelled) setUsuario(dadosUsuario || null);
      } catch {
        if (!cancelled) setUsuario(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    carregarUsuario();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, senha) => {
    try {
      const usuarioLogado = await authService.login({ email, senha });
      if (usuarioLogado) {
        setUsuario(usuarioLogado);
        return { success: true };
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer login",
      };
    }
  }, []);

  const registrar = useCallback(async (dados) => {
    try {
      const usuarioNovo = await usuarioService.registrar(dados);
      if (usuarioNovo) {
        return login(dados.email, dados.senha);
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar",
      };
    }
  }, [login]);

  const registrarCasal = useCallback(async (dados) => {
    try {
      const usuarioNovo = await usuarioService.registrarCasal(dados);
      if (usuarioNovo) {
        return login(dados.emailPessoa1, dados.senhaPessoa1);
      }
      return { success: false, error: "Resposta inválida" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar casal",
      };
    }
  }, [login]);

  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
    navigate("/");
  }, [navigate]);

  const atualizarUsuario = useCallback((novosDados) => {
    setUsuario(novosDados);
  }, []);

  const atualizarPerfil = useCallback(async (id, dados) => {
    try {
      await usuarioService.atualizarPerfil(id, dados);
      const dadosAtualizados = await authService.buscarDadosCompletos();
      setUsuario(dadosAtualizados);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Erro ao atualizar perfil" };
    }
  }, []);

  const atualizarPerfilCasal = useCallback(async (id, dados) => {
    try {
      await usuarioService.atualizarPerfilCasal(id, dados);
      const dadosAtualizados = await authService.buscarDadosCompletos();
      setUsuario(dadosAtualizados);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Erro ao atualizar perfil" };
    }
  }, []);

  const atualizarModoEscuro = useCallback(async (id, modoEscuro) => {
    try {
      await usuarioService.atualizarModoEscuro(id, modoEscuro);
      setUsuario((prev) => prev ? { ...prev, modoEscuro } : prev);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Erro ao atualizar modo escuro" };
    }
  }, []);

  const alterarSenha = useCallback(async (dados) => {
    try {
      const response = await usuarioService.alterarSenha(dados);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Erro ao alterar senha" };
    }
  }, []);

  const excluirConta = useCallback(async (id) => {
    try {
      const response = await usuarioService.excluirConta(id);
      logout();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Erro ao excluir conta" };
    }
  }, [logout]);

  const value = {
    usuario,
    loading,
    estaAutenticado: !!usuario,
    isCasal: usuario?.isCasal || usuario?.tipoConta === "1",
    pessoaLogada: usuario?.pessoaQueLogou || null,
    login,
    registrar,
    registrarCasal,
    logout,
    atualizarUsuario,
    atualizarPerfil,
    atualizarPerfilCasal,
    atualizarModoEscuro,
    alterarSenha,
    excluirConta,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
