import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isCasal, setIsCasal] = useState(false);
  const [formData, setFormData] = useState({
    // Dados individuais
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    rendaMensal: '',
    
    // Dados do casal (quando ativado)
    pessoa1: {
      nomeCompleto: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      rendaMensal: ''
    },
    pessoa2: {
      nomeCompleto: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      rendaMensal: ''
    },
    dataInclusao: new Date().toISOString().split('T')[0]
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [senhaError, setSenhaError] = useState('');

  // Importando APENAS UM método de login
  const { login, registrar, registrarCasal, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (estaAutenticado) {
      console.log('Usuário já autenticado, redirecionando...');
      navigate('/');
    }
  }, [estaAutenticado, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('pessoa1_')) {
      // Campo da pessoa 1
      const campo = name.replace('pessoa1_', '');
      setFormData({
        ...formData,
        pessoa1: {
          ...formData.pessoa1,
          [campo]: value
        }
      });
    } else if (name.startsWith('pessoa2_')) {
      // Campo da pessoa 2
      const campo = name.replace('pessoa2_', '');
      setFormData({
        ...formData,
        pessoa2: {
          ...formData.pessoa2,
          [campo]: value
        }
      });
    } else {
      // Campo individual
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpar erro de senha ao digitar (apenas no registro)
    if (!isLogin && (name.includes('senha') || name.includes('confirmar'))) {
      setSenhaError('');
    }
  };

  const validarSenhasRegistro = () => {
    if (isCasal) {
      // Validar senhas da pessoa 1
      if (formData.pessoa1.senha !== formData.pessoa1.confirmarSenha) {
        setSenhaError('As senhas da primeira pessoa não coincidem');
        return false;
      }
      if (formData.pessoa1.senha.length < 6) {
        setSenhaError('A senha da primeira pessoa deve ter no mínimo 6 caracteres');
        return false;
      }
      
      // Validar senhas da pessoa 2
      if (formData.pessoa2.senha !== formData.pessoa2.confirmarSenha) {
        setSenhaError('As senhas da segunda pessoa não coincidem');
        return false;
      }
      if (formData.pessoa2.senha.length < 6) {
        setSenhaError('A senha da segunda pessoa deve ter no mínimo 6 caracteres');
        return false;
      }
    } else {
      // Validar senha individual
      if (formData.senha !== formData.confirmarSenha) {
        setSenhaError('As senhas não coincidem');
        return false;
      }
      if (formData.senha.length < 6) {
        setSenhaError('A senha deve ter no mínimo 6 caracteres');
        return false;
      }
    }
    return true;
  };

  const validarCPF = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSenhaError('');
    
    if (isLogin) {
      // ===== LOGIN - UM ÚNICO MÉTODO PARA TODOS =====
      if (!formData.email || !formData.senha) {
        setError('Preencha email e senha');
        return;
      }
    } else {
      // ===== REGISTRO - validações completas =====
      
      // Validar senhas
      if (!validarSenhasRegistro()) {
        return;
      }
      
      // Validar CPFs
      if (!isCasal) {
        if (!validarCPF(formData.cpf)) {
          setError('CPF inválido. Deve conter 11 dígitos.');
          return;
        }
      } else {
        if (!validarCPF(formData.pessoa1.cpf)) {
          setError('CPF da primeira pessoa inválido. Deve conter 11 dígitos.');
          return;
        }
        if (!validarCPF(formData.pessoa2.cpf)) {
          setError('CPF da segunda pessoa inválido. Deve conter 11 dígitos.');
          return;
        }
      }
    }
    
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        // ===== LOGIN ÚNICO (funciona para individual E casal) =====
        console.log('🔐 Tentando login com:', formData.email);
        console.log('📧 Dados completos:', { email: formData.email, senha: formData.senha });
        
        result = await login(formData.email, formData.senha);
        
        console.log('📦 RESULTADO DO LOGIN (copiar abaixo):');
        console.log('=================================');
        console.log(JSON.stringify(result, null, 2));
        console.log('=================================');
      } else {
        // REGISTRO
        if (isCasal) {
          console.log('Tentando registro de casal');
          
          // Validar dados obrigatórios do casal
          if (!formData.pessoa1.nomeCompleto || !formData.pessoa1.email || !formData.pessoa1.senha ||
              !formData.pessoa1.cpf || !formData.pessoa1.dataNascimento ||
              !formData.pessoa2.nomeCompleto || !formData.pessoa2.email || !formData.pessoa2.senha ||
              !formData.pessoa2.cpf || !formData.pessoa2.dataNascimento) {
            setError('Preencha todos os campos obrigatórios do casal');
            setLoading(false);
            return;
          }
          
          const dadosCasal = {
            nomeCompletoPessoa1: formData.pessoa1.nomeCompleto,
            emailPessoa1: formData.pessoa1.email,
            senhaPessoa1: formData.pessoa1.senha,
            cpfPessoa1: formData.pessoa1.cpf,
            dataNascimentoPessoa1: formData.pessoa1.dataNascimento,
            telefonePessoa1: formData.pessoa1.telefone || null,
            rendaMensalPessoa1: formData.pessoa1.rendaMensal ? parseFloat(formData.pessoa1.rendaMensal.replace(/\./g, '').replace(',', '.')) : null,
            
            nomeCompletoPessoa2: formData.pessoa2.nomeCompleto,
            emailPessoa2: formData.pessoa2.email,
            senhaPessoa2: formData.pessoa2.senha,
            cpfPessoa2: formData.pessoa2.cpf,
            dataNascimentoPessoa2: formData.pessoa2.dataNascimento,
            telefonePessoa2: formData.pessoa2.telefone || null,
            rendaMensalPessoa2: formData.pessoa2.rendaMensal ? parseFloat(formData.pessoa2.rendaMensal.replace(/\./g, '').replace(',', '.')) : null,
            
            dataInclusao: formData.dataInclusao
          };
          
          console.log('Dados do casal:', dadosCasal);
          result = await registrarCasal(dadosCasal);
        } else {
          console.log('Tentando registro individual com:', formData.email);
          
          // Validar dados obrigatórios individuais
          if (!formData.nomeCompleto || !formData.email || !formData.senha ||
              !formData.cpf || !formData.dataNascimento) {
            setError('Preencha todos os campos obrigatórios');
            setLoading(false);
            return;
          }
          
          const dadosIndividuais = {
            nomeCompleto: formData.nomeCompleto,
            email: formData.email,
            senha: formData.senha,
            cpf: formData.cpf,
            dataNascimento: formData.dataNascimento,
            telefone: formData.telefone || null,
            rendaMensal: formData.rendaMensal ? parseFloat(formData.rendaMensal.replace(/\./g, '').replace(',', '.')) : null,
            dataInclusao: formData.dataInclusao
          };
          
          console.log('Dados individuais:', dadosIndividuais);
          result = await registrar(dadosIndividuais);
        }
        console.log('Resultado do registro:', result);
      }

      if (!result.success) {
        setError(result.error || 'Erro ao processar solicitação');
      }
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar CPF
  const formatarCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Função para formatar telefone
  const formatarTelefone = (value) => {
    const telefone = value.replace(/\D/g, '');
    if (telefone.length <= 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  // Função para formatar renda
  const formatarRenda = (value) => {
    const numero = value.replace(/\D/g, '');
    if (numero.length === 0) return '';
    const valor = (parseInt(numero) / 100).toFixed(2);
    return valor.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CasalPlanner</h1>
        <p className="subtitle">organizando o lar a dois</p>

        <div className="login-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSenhaError('');
            }}
            type="button"
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSenhaError('');
            }}
            type="button"
          >
            Registrar
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {senhaError && <div className="error-message">{senhaError}</div>}

        <form onSubmit={handleSubmit}>
          {/* FORMULÁRIO DE LOGIN - ÚNICO PARA TODOS */}
          {isLogin && (
            <>
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
                />
              </div>

              <button 
                type="submit" 
                className="btn-login"
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Entrar'}
              </button>

              <p className="login-info">
                Use qualquer email cadastrado (joao@email.com, maria@email.com ou individual)
              </p>
            </>
          )}

          {/* FORMULÁRIO DE REGISTRO (mantido igual) */}
          {!isLogin && (
            <>
              {/* Checkbox para ativar conta casal */}
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isCasal}
                    onChange={(e) => setIsCasal(e.target.checked)}
                  />
                  <span>Ativar conta casal (duas pessoas)</span>
                </label>
                <p className="checkbox-helper">
                  {isCasal 
                    ? 'Conta compartilhada para duas pessoas. Ambos terão seus próprios dados.'
                    : 'Conta individual para uma pessoa.'}
                </p>
              </div>

              {!isCasal ? (
                /* FORMULÁRIO INDIVIDUAL */
                <>
                  <div className="form-group">
                    <label>Nome completo *</label>
                    <input
                      type="text"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Senha *</label>
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

                    <div className="form-group half">
                      <label>Confirmar senha *</label>
                      <input
                        type="password"
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        required
                        placeholder="••••••"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>CPF *</label>
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({ target: { name: 'cpf', value: formatado } });
                        }}
                        required
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Data nascimento *</label>
                      <input
                        type="date"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Telefone</label>
                      <input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({ target: { name: 'telefone', value: formatado } });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Renda mensal (R$)</label>
                      <input
                        type="text"
                        name="rendaMensal"
                        value={formData.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({ target: { name: 'rendaMensal', value: formatado } });
                        }}
                        placeholder="1.500,00"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* FORMULÁRIO CASAL */
                <>
                  <h3 className="form-section-title">👤 Pessoa 1</h3>
                  
                  <div className="form-group">
                    <label>Nome completo *</label>
                    <input
                      type="text"
                      name="pessoa1_nomeCompleto"
                      value={formData.pessoa1.nomeCompleto}
                      onChange={handleChange}
                      required
                      placeholder="Nome completo da primeira pessoa"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="pessoa1_email"
                      value={formData.pessoa1.email}
                      onChange={handleChange}
                      required
                      placeholder="pessoa1@email.com"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Senha *</label>
                      <input
                        type="password"
                        name="pessoa1_senha"
                        value={formData.pessoa1.senha}
                        onChange={handleChange}
                        required
                        placeholder="••••••"
                        minLength={6}
                      />
                    </div>

                    <div className="form-group half">
                      <label>Confirmar *</label>
                      <input
                        type="password"
                        name="pessoa1_confirmarSenha"
                        value={formData.pessoa1.confirmarSenha}
                        onChange={handleChange}
                        required
                        placeholder="••••••"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>CPF *</label>
                      <input
                        type="text"
                        name="pessoa1_cpf"
                        value={formData.pessoa1.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({ target: { name: 'pessoa1_cpf', value: formatado } });
                        }}
                        required
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Data nasc. *</label>
                      <input
                        type="date"
                        name="pessoa1_dataNascimento"
                        value={formData.pessoa1.dataNascimento}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Telefone</label>
                      <input
                        type="text"
                        name="pessoa1_telefone"
                        value={formData.pessoa1.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({ target: { name: 'pessoa1_telefone', value: formatado } });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Renda mensal (R$)</label>
                      <input
                        type="text"
                        name="pessoa1_rendaMensal"
                        value={formData.pessoa1.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({ target: { name: 'pessoa1_rendaMensal', value: formatado } });
                        }}
                        placeholder="1.500,00"
                      />
                    </div>
                  </div>

                  <h3 className="form-section-title">👤 Pessoa 2</h3>
                  
                  <div className="form-group">
                    <label>Nome completo *</label>
                    <input
                      type="text"
                      name="pessoa2_nomeCompleto"
                      value={formData.pessoa2.nomeCompleto}
                      onChange={handleChange}
                      required
                      placeholder="Nome completo da segunda pessoa"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="pessoa2_email"
                      value={formData.pessoa2.email}
                      onChange={handleChange}
                      required
                      placeholder="pessoa2@email.com"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Senha *</label>
                      <input
                        type="password"
                        name="pessoa2_senha"
                        value={formData.pessoa2.senha}
                        onChange={handleChange}
                        required
                        placeholder="••••••"
                        minLength={6}
                      />
                    </div>

                    <div className="form-group half">
                      <label>Confirmar *</label>
                      <input
                        type="password"
                        name="pessoa2_confirmarSenha"
                        value={formData.pessoa2.confirmarSenha}
                        onChange={handleChange}
                        required
                        placeholder="••••••"
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>CPF *</label>
                      <input
                        type="text"
                        name="pessoa2_cpf"
                        value={formData.pessoa2.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({ target: { name: 'pessoa2_cpf', value: formatado } });
                        }}
                        required
                        placeholder="000.000.000-00"
                        maxLength="14"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Data nasc. *</label>
                      <input
                        type="date"
                        name="pessoa2_dataNascimento"
                        value={formData.pessoa2.dataNascimento}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Telefone</label>
                      <input
                        type="text"
                        name="pessoa2_telefone"
                        value={formData.pessoa2.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({ target: { name: 'pessoa2_telefone', value: formatado } });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                      />
                    </div>

                    <div className="form-group half">
                      <label>Renda mensal (R$)</label>
                      <input
                        type="text"
                        name="pessoa2_rendaMensal"
                        value={formData.pessoa2.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({ target: { name: 'pessoa2_rendaMensal', value: formatado } });
                        }}
                        placeholder="1.500,00"
                      />
                    </div>
                  </div>
                </>
              )}

              <input
                type="hidden"
                name="dataInclusao"
                value={formData.dataInclusao}
              />

              <button 
                type="submit" 
                className="btn-login"
                disabled={loading}
                style={{ marginTop: '20px' }}
              >
                {loading ? 'Carregando...' : 'Registrar'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;