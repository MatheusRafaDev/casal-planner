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
      console.log('🔄 Carregando usuário do localStorage...');
      const token = authService.getToken();
      const usuarioSalvo = authService.getUsuario();
      
      console.log('Token existe:', !!token);
      console.log('Usuário salvo:', usuarioSalvo);
      
      if (token && usuarioSalvo) {
        console.log('✅ Usuário restaurado da sessão');
        setUsuario(usuarioSalvo);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa encontrada');
      }
      setLoading(false);
    };
    
    carregarUsuario();
  }, []);

  // Login INDIVIDUAL
  const login = async (email, senha) => {
    try {
      console.log('🔐 Tentando login individual com:', email);
      
      const response = await authService.login({ email, senha });
      console.log('📦 Resposta do login individual:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('✅ Login individual bem-sucedido!');
        navigate('/');
        return { success: true };
      } else {
        console.error('❌ Resposta sem token:', response);
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  // NOVO: Login do CASAL
  const loginCasal = async (email, senha) => {
    try {
      console.log('🔐 Tentando login do casal com:', email);
      
      const response = await authService.loginCasal({ email, senha });
      console.log('📦 Resposta do login do casal:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('✅ Login do casal bem-sucedido!');
        navigate('/');
        return { success: true };
      } else {
        console.error('❌ Resposta sem token:', response);
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no login do casal:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login do casal' 
      };
    }
  };

  const registrar = async (dados) => {
    try {
      console.log('📝 Tentando registrar individual:', dados.email);
      
      const response = await authService.registrar(dados);
      console.log('📦 Resposta do registro:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('✅ Registro individual bem-sucedido!');
        navigate('/');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar' 
      };
    }
  };

  const registrarCasal = async (dados) => {
    try {
      console.log('📝 Tentando registro de casal');
      
      const response = await authService.registrarCasal(dados);
      console.log('📦 Resposta do registro de casal:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('✅ Registro de casal bem-sucedido!');
        navigate('/');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('❌ Erro no registro de casal:', error);
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