import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, estaAutenticado } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado) {
      navigate('/');
    }
  }, [estaAutenticado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, senha);
      if (!result.success) {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer theme={theme}>
      <LoginCard theme={theme}>
        <LogoContainer>
          <LogoIcon>🐝</LogoIcon>
          <Title theme={theme}>CasalPlanner</Title>
        </LogoContainer>
        <Subtitle theme={theme}>organizando o lar a dois</Subtitle>

        {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label theme={theme}>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              theme={theme}
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••"
              theme={theme}
            />
          </FormGroup>

          <LoginButton type="submit" disabled={loading} theme={theme}>
            {loading ? 'Carregando...' : 'Entrar'}
          </LoginButton>
        </Form>

        <InfoText theme={theme}>
          Use joao@email.com / 123456 para testar
        </InfoText>
      </LoginCard>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.gradient};
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 32px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: slideUp 0.5s ease;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const LogoIcon = styled.span`
  font-size: 2.5rem;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  background: ${props => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${props => props.theme.textSoft};
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.borderLight};
  color: ${props => props.theme.error};
  padding: 0.8rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid ${props => props.theme.error};
`;

const Form = styled.form`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.3rem;
  color: ${props => props.theme.textSoft};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid ${props => props.theme.border};
  border-radius: 16px;
  font-size: 1rem;
  transition: 0.2s;
  background: ${props => props.theme.card};
  color: ${props => props.theme.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.borderLight};
  }

  &::placeholder {
    color: ${props => props.theme.textLight};
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme.gradient};
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.primary}80;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme.textLight};
  background: ${props => props.theme.borderLight};
  padding: 0.8rem;
  border-radius: 12px;
`;

export default Login;