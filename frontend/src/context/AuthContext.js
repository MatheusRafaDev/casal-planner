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
      const usuarioSalvo = authService.getUsuario();
      const token = authService.getToken();
      
      console.log('Verificando usuário salvo:', usuarioSalvo);
      console.log('Token existe:', !!token);
      
      if (usuarioSalvo && token) {
        setUsuario(usuarioSalvo);
      }
      setLoading(false);
    };
    
    carregarUsuario();
  }, []);

  const login = async (email, senha, isCasal = false) => {
    try {
      console.log('AuthContext: Iniciando login para', email);
      
      let response;
      
      if (isCasal) {
        response = await authService.loginCasal({ email, senha });
      } else {
        response = await authService.login({ email, senha });
      }
      
      console.log('AuthContext: Resposta do login:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('AuthContext: Login bem-sucedido, redirecionando...');
        
        // Redirecionar para a página principal
        setTimeout(() => {
          navigate('/');
        }, 100);
        
        return { success: true };
      } else {
        console.error('AuthContext: Resposta sem token:', response);
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const registrar = async (nome, email, senha) => {
    try {
      console.log('AuthContext: Iniciando registro para', email);
      
      const response = await authService.registrar({ nome, email, senha });
      
      console.log('AuthContext: Resposta do registro:', response);
      
      if (response && response.token) {
        authService.salvarToken(response.token);
        authService.salvarUsuario(response);
        setUsuario(response);
        
        console.log('AuthContext: Registro bem-sucedido, redirecionando...');
        
        setTimeout(() => {
          navigate('/');
        }, 100);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Resposta inválida do servidor' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar' 
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
      registrar,
      logout,
      estaAutenticado: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};