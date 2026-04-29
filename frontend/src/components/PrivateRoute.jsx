import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  height: 100dvh;
  background: ${props => props.theme.background};
  color: ${props => props.theme.primary};
  font-size: 1.2rem;
`;

const PrivateRoute = ({ children }) => {
  const { usuario, loading, verificarAutenticacao } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verificar = async () => {
      if (!loading) {
        if (usuario) {
          setAutorizado(true);
        } else {
          // Tenta verificar com o backend
          const autenticado = await verificarAutenticacao();
          setAutorizado(autenticado);
        }
        setVerificando(false);
      }
    };

    verificar();
  }, [usuario, loading, verificarAutenticacao]);

  if (loading || verificando) {
    return <LoadingContainer>Verificando autenticação...</LoadingContainer>;
  }

  if (!autorizado) {
    // Salva a página que tentou acessar para redirecionar depois do login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;