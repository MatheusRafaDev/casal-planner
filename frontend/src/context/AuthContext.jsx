import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import usuarioService from '../services/usuarioService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarUsuario = async () => {
      const token = authService.getToken();
      const usuarioSalvo = authService.getUsuario();
      
      if (token && usuarioSalvo) {
        setUsuario(usuarioSalvo);
      }
      setLoading(false);
    };
    carregarUsuario();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await authService.login({ email, senha });
      if (response) {
        setUsuario(response);
        navigate('/dashboard');
        return { success: true };
      }
      return { success: false, error: 'Resposta inválida' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao fazer login' };
    }
  };

  const registrar = async (dados) => {
    try {
      const response = await usuarioService.registrar(dados);
      if (response) {
        setUsuario(response);
        navigate('/dashboard');
        return { success: true };
      }
      return { success: false, error: 'Resposta inválida' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao registrar' };
    }
  };

  const registrarCasal = async (dados) => {
    try {
      const response = await usuarioService.registrarCasal(dados);
      if (response) {
        setUsuario(response);
        navigate('/dashboard');
        return { success: true };
      }
      return { success: false, error: 'Resposta inválida' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao registrar casal' };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    navigate('/login');
  };

  const atualizarUsuario = (novosDados) => {
    setUsuario(novosDados);
    authService._salvarUsuario(novosDados);
  };

  const atualizarPerfil = async (id, dados) => {
    try {
      const response = await usuarioService.atualizarPerfil(id, dados);
      const usuarioAtualizado = { ...usuario, ...dados };
      setUsuario(usuarioAtualizado);
      authService._salvarUsuario(usuarioAtualizado);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao atualizar perfil' };
    }
  };

  const atualizarPerfilCasal = async (id, dados) => {
    try {
      const response = await usuarioService.atualizarPerfilCasal(id, dados);
      const usuarioAtualizado = {
        ...usuario,
        casalInfo: { ...usuario.casalInfo, ...dados }
      };
      setUsuario(usuarioAtualizado);
      authService._salvarUsuario(usuarioAtualizado);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao atualizar perfil' };
    }
  };

  const atualizarModoEscuro = async (id, modoEscuro) => {
    try {
      const response = await usuarioService.atualizarModoEscuro(id, modoEscuro);
      const usuarioAtualizado = { ...usuario, modoEscuro };
      setUsuario(usuarioAtualizado);
      authService._salvarUsuario(usuarioAtualizado);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao atualizar modo escuro' };
    }
  };

  const alterarSenha = async (dados) => {
    try {
      const response = await usuarioService.alterarSenha(dados);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao alterar senha' };
    }
  };

  const excluirConta = async (id) => {
    try {
      const response = await usuarioService.excluirConta(id);
      logout();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao excluir conta' };
    }
  };

  const value = {
    usuario,
    loading,
    estaAutenticado: !!usuario,
    isCasal: usuario?.isCasal || usuario?.tipoConta === '1',
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
    
    getToken: authService.getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};