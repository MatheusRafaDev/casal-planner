import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarUsuario = () => {
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
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };


  const loginCasal = async (email, senha) => {
    try {
      const response = await authService.loginCasal({ email, senha });
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login do casal' 
      };
    }
  };

  const registrar = async (dados) => {
    try {
      const response = await authService.registrar(dados);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar' 
      };
    }
  };

  const registrarCasal = async (dados) => {
    try {
      const response = await authService.registrarCasal(dados);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: 'Resposta inválida do servidor' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar casal' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      loading,
      login,
      loginCasal,      
      registrar,
      registrarCasal,
      logout,
      estaAutenticado: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};