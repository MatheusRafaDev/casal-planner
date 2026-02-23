import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registrar, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (estaAutenticado) {
      console.log('Usuário já autenticado, redirecionando...');
      navigate('/');
    }
  }, [estaAutenticado, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        console.log('Tentando login com:', formData.email);
        result = await login(formData.email, formData.senha, false);
        console.log('Resultado do login:', result);
      } else {
        console.log('Tentando registro com:', formData.email);
        result = await registrar(formData.nome, formData.email, formData.senha);
        console.log('Resultado do registro:', result);
      }

      if (!result.success) {
        setError(result.error || 'Erro ao fazer login');
      }
      // O redirecionamento será feito pelo AuthContext
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginCasal = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('Tentando login do casal');
      const result = await login('casal@email.com', 'casal123', true);
      console.log('Resultado do login casal:', result);
      
      if (!result.success) {
        setError(result.error);
      }
      // O redirecionamento será feito pelo AuthContext
    } catch (err) {
      console.error('Erro detalhado no login casal:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao fazer login do casal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CasalPlanner</h1>
        <p className="subtitle">organizando o lar a dois</p>

        <div className="login-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registrar
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder="••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button 
          className="btn-casal"
          onClick={handleLoginCasal}
          disabled={loading}
        >
          🏠 Entrar como Casal
        </button>

        <p className="login-info">
          Conta do casal: casal@email.com / casal123
        </p>
      </div>
    </div>
  );
};

export default Login;