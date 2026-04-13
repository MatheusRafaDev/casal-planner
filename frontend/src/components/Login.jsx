import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, Lock, AlertCircle, User, Calendar, DollarSign, 
  Users, Eye, EyeOff, CheckCircle, ArrowLeft, Heart, 
  ClipboardList, Target, TrendingUp, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LoginContainer,
  LoginCard,
  LogoWrapper,
  LogoIcon,
  Title,
  Subtitle,
  TabsContainer,
  Tab,
  ErrorMessage,
  Form,
  FormGroup,
  FormRow,
  Label,
  InputWrapper,
  Input,
  PasswordToggle,
  CheckboxWrapper,
  CheckboxLabel,
  CheckboxHelper,
  SectionTitle,
  LoginButton,
  InfoMessage,
  BackLink
} from '../styles/pages/LoginStyles';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showIndividualForm, setShowIndividualForm] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Form states
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Individual register states
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmSenha, setRegConfirmSenha] = useState('');
  const [regCPF, setRegCPF] = useState('');
  const [regDataNascimento, setRegDataNascimento] = useState('');
  const [regRendaMensal, setRegRendaMensal] = useState('');
  
  // Couple register states
  const [isCasal, setIsCasal] = useState(false);
  const [pessoa1Nome, setPessoa1Nome] = useState('');
  const [pessoa1Email, setPessoa1Email] = useState('');
  const [pessoa1Senha, setPessoa1Senha] = useState('');
  const [pessoa1CPF, setPessoa1CPF] = useState('');
  const [pessoa1DataNasc, setPessoa1DataNasc] = useState('');
  const [pessoa1Renda, setPessoa1Renda] = useState('');
  const [pessoa2Nome, setPessoa2Nome] = useState('');
  const [pessoa2Email, setPessoa2Email] = useState('');
  const [pessoa2Senha, setPessoa2Senha] = useState('');
  const [pessoa2CPF, setPessoa2CPF] = useState('');
  const [pessoa2DataNasc, setPessoa2DataNasc] = useState('');
  const [pessoa2Renda, setPessoa2Renda] = useState('');

  const { login, register, registerCasal, estaAutenticado } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado) {
      navigate('/');
    }
  }, [estaAutenticado, navigate]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validateCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const validateIndividualForm = () => {
    const newErrors = {};

    if (!regNome.trim()) {
      newErrors.regNome = 'Nome completo é obrigatório';
    }

    if (!regEmail.trim()) {
      newErrors.regEmail = 'Email é obrigatório';
    } else if (!validateEmail(regEmail)) {
      newErrors.regEmail = 'Email inválido';
    }

    if (!regSenha) {
      newErrors.regSenha = 'Senha é obrigatória';
    } else if (regSenha.length < 6) {
      newErrors.regSenha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (regSenha !== regConfirmSenha) {
      newErrors.regConfirmSenha = 'As senhas não conferem';
    }

    if (regCPF && !validateCPF(regCPF)) {
      newErrors.regCPF = 'CPF inválido';
    }

    if (regDataNascimento) {
      const age = new Date().getFullYear() - new Date(regDataNascimento).getFullYear();
      if (age < 18) {
        newErrors.regDataNascimento = 'Deve ter pelo menos 18 anos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCasalForm = () => {
    const newErrors = {};

    // Pessoa 1
    if (!pessoa1Nome.trim()) newErrors.pessoa1Nome = 'Nome da pessoa 1 é obrigatório';
    if (!pessoa1Email.trim()) {
      newErrors.pessoa1Email = 'Email da pessoa 1 é obrigatório';
    } else if (!validateEmail(pessoa1Email)) {
      newErrors.pessoa1Email = 'Email inválido';
    }
    if (!pessoa1Senha) {
      newErrors.pessoa1Senha = 'Senha da pessoa 1 é obrigatória';
    } else if (pessoa1Senha.length < 6) {
      newErrors.pessoa1Senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    if (pessoa1CPF && !validateCPF(pessoa1CPF)) newErrors.pessoa1CPF = 'CPF inválido';

    // Pessoa 2
    if (!pessoa2Nome.trim()) newErrors.pessoa2Nome = 'Nome da pessoa 2 é obrigatório';
    if (!pessoa2Email.trim()) {
      newErrors.pessoa2Email = 'Email da pessoa 2 é obrigatório';
    } else if (!validateEmail(pessoa2Email)) {
      newErrors.pessoa2Email = 'Email inválido';
    }
    if (!pessoa2Senha) {
      newErrors.pessoa2Senha = 'Senha da pessoa 2 é obrigatória';
    } else if (pessoa2Senha.length < 6) {
      newErrors.pessoa2Senha = 'Senha deve ter no mínimo 6 caracteres';
    }
    if (pessoa2CPF && !validateCPF(pessoa2CPF)) newErrors.pessoa2CPF = 'CPF inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ email: true, senha: true });

    if (!email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Digite um email válido');
      return;
    }
    if (!senha) {
      toast.error('Senha é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, senha);
      if (!result.success) {
        let errorMsg = result.error || 'Erro ao fazer login';
        if (errorMsg.toLowerCase().includes('email')) {
          errorMsg = 'Email não encontrado';
        } else if (errorMsg.toLowerCase().includes('senha')) {
          errorMsg = 'Senha incorreta';
        }
        toast.error(errorMsg);
        setErrors({ geral: errorMsg });
      }
    } catch (err) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualRegister = async (e) => {
    e.preventDefault();
    if (!validateIndividualForm()) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        nomeCompleto: regNome,
        email: regEmail,
        senha: regSenha,
        cpf: regCPF,
        dataNascimento: regDataNascimento,
        rendaMensal: parseFloat(regRendaMensal) || 0
      });

      if (result.success) {
        toast.success('Conta criada com sucesso!');
        setTimeout(() => {
          setIsLogin(true);
          setEmail(regEmail);
          setSenha(regSenha);
        }, 1500);
      } else {
        toast.error(result.error || 'Erro ao criar conta');
      }
    } catch (err) {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleCasalRegister = async (e) => {
    e.preventDefault();
    if (!validateCasalForm()) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    try {
      const result = await registerCasal({
        nomeCompletoPessoa1: pessoa1Nome,
        emailPessoa1: pessoa1Email,
        senhaPessoa1: pessoa1Senha,
        cpfPessoa1: pessoa1CPF,
        dataNascimentoPessoa1: pessoa1DataNasc,
        rendaMensalPessoa1: parseFloat(pessoa1Renda) || 0,
        nomeCompletoPessoa2: pessoa2Nome,
        emailPessoa2: pessoa2Email,
        senhaPessoa2: pessoa2Senha,
        cpfPessoa2: pessoa2CPF,
        dataNascimentoPessoa2: pessoa2DataNasc,
        rendaMensalPessoa2: parseFloat(pessoa2Renda) || 0
      });

      if (result.success) {
        toast.success('Conta de casal criada com sucesso!');
        setTimeout(() => {
          setIsLogin(true);
          setEmail(pessoa1Email);
          setSenha(pessoa1Senha);
        }, 1500);
      } else {
        toast.error(result.error || 'Erro ao criar conta de casal');
      }
    } catch (err) {
      toast.error('Erro ao criar conta de casal');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <Form onSubmit={handleLogin}>
      <FormGroup>
        <Label><Mail size={16} /> Email</Label>
        <InputWrapper>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="seu@email.com"
            disabled={loading}
          />
        </InputWrapper>
      </FormGroup>

      <FormGroup>
        <Label><Lock size={16} /> Senha</Label>
        <InputWrapper>
          <Input
            type={showPassword ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onBlur={() => handleBlur('senha')}
            placeholder="••••••"
            disabled={loading}
          />
          <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </PasswordToggle>
        </InputWrapper>
      </FormGroup>

      <LoginButton type="submit" disabled={loading}>
        {loading ? 'Carregando...' : 'Entrar'}
      </LoginButton>
    </Form>
  );

  const renderIndividualRegisterForm = () => (
    <Form onSubmit={handleIndividualRegister}>
      <FormGroup>
        <Label><User size={16} /> Nome Completo *</Label>
        <Input
          value={regNome}
          onChange={(e) => setRegNome(e.target.value)}
          placeholder="Seu nome completo"
          disabled={loading}
        />
      </FormGroup>

      <FormGroup>
        <Label><Mail size={16} /> Email *</Label>
        <Input
          type="email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={loading}
        />
      </FormGroup>

      <FormRow>
        <FormGroup $half>
          <Label><Lock size={16} /> Senha *</Label>
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              value={regSenha}
              onChange={(e) => setRegSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </InputWrapper>
        </FormGroup>
        <FormGroup $half>
          <Label><Lock size={16} /> Confirmar Senha *</Label>
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              value={regConfirmSenha}
              onChange={(e) => setRegConfirmSenha(e.target.value)}
              placeholder="Digite novamente"
              disabled={loading}
            />
          </InputWrapper>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup $half>
          <Label><ClipboardList size={16} /> CPF</Label>
          <Input
            value={regCPF}
            onChange={(e) => setRegCPF(e.target.value)}
            placeholder="Apenas números"
            disabled={loading}
          />
        </FormGroup>
        <FormGroup $half>
          <Label><Calendar size={16} /> Data Nascimento</Label>
          <Input
            type="date"
            value={regDataNascimento}
            onChange={(e) => setRegDataNascimento(e.target.value)}
            disabled={loading}
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label><DollarSign size={16} /> Renda Mensal</Label>
        <Input
          type="number"
          step="0.01"
          value={regRendaMensal}
          onChange={(e) => setRegRendaMensal(e.target.value)}
          placeholder="0,00"
          disabled={loading}
        />
      </FormGroup>

      <LoginButton type="submit" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar Conta Individual'}
      </LoginButton>
    </Form>
  );

  const renderCasalRegisterForm = () => (
    <Form onSubmit={handleCasalRegister}>
      <SectionTitle><Heart size={18} /> Pessoa 1</SectionTitle>
      
      <FormGroup>
        <Label><User size={16} /> Nome Completo *</Label>
        <Input
          value={pessoa1Nome}
          onChange={(e) => setPessoa1Nome(e.target.value)}
          placeholder="Nome da primeira pessoa"
          disabled={loading}
        />
      </FormGroup>

      <FormRow>
        <FormGroup $half>
          <Label><Mail size={16} /> Email *</Label>
          <Input
            type="email"
            value={pessoa1Email}
            onChange={(e) => setPessoa1Email(e.target.value)}
            placeholder="email@exemplo.com"
            disabled={loading}
          />
        </FormGroup>
        <FormGroup $half>
          <Label><Lock size={16} /> Senha *</Label>
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              value={pessoa1Senha}
              onChange={(e) => setPessoa1Senha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </InputWrapper>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup $half>
          <Label><ClipboardList size={16} /> CPF</Label>
          <Input
            value={pessoa1CPF}
            onChange={(e) => setPessoa1CPF(e.target.value)}
            placeholder="Apenas números"
            disabled={loading}
          />
        </FormGroup>
        <FormGroup $half>
          <Label><Calendar size={16} /> Data Nascimento</Label>
          <Input
            type="date"
            value={pessoa1DataNasc}
            onChange={(e) => setPessoa1DataNasc(e.target.value)}
            disabled={loading}
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label><DollarSign size={16} /> Renda Mensal</Label>
        <Input
          type="number"
          step="0.01"
          value={pessoa1Renda}
          onChange={(e) => setPessoa1Renda(e.target.value)}
          placeholder="0,00"
          disabled={loading}
        />
      </FormGroup>

      <SectionTitle><Users size={18} /> Pessoa 2</SectionTitle>

      <FormGroup>
        <Label><User size={16} /> Nome Completo *</Label>
        <Input
          value={pessoa2Nome}
          onChange={(e) => setPessoa2Nome(e.target.value)}
          placeholder="Nome da segunda pessoa"
          disabled={loading}
        />
      </FormGroup>

      <FormRow>
        <FormGroup $half>
          <Label><Mail size={16} /> Email *</Label>
          <Input
            type="email"
            value={pessoa2Email}
            onChange={(e) => setPessoa2Email(e.target.value)}
            placeholder="email@exemplo.com"
            disabled={loading}
          />
        </FormGroup>
        <FormGroup $half>
          <Label><Lock size={16} /> Senha *</Label>
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              value={pessoa2Senha}
              onChange={(e) => setPessoa2Senha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
          </InputWrapper>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup $half>
          <Label><ClipboardList size={16} /> CPF</Label>
          <Input
            value={pessoa2CPF}
            onChange={(e) => setPessoa2CPF(e.target.value)}
            placeholder="Apenas números"
            disabled={loading}
          />
        </FormGroup>
        <FormGroup $half>
          <Label><Calendar size={16} /> Data Nascimento</Label>
          <Input
            type="date"
            value={pessoa2DataNasc}
            onChange={(e) => setPessoa2DataNasc(e.target.value)}
            disabled={loading}
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label><DollarSign size={16} /> Renda Mensal</Label>
        <Input
          type="number"
          step="0.01"
          value={pessoa2Renda}
          onChange={(e) => setPessoa2Renda(e.target.value)}
          placeholder="0,00"
          disabled={loading}
        />
      </FormGroup>

      <LoginButton type="submit" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar Conta de Casal'}
      </LoginButton>
    </Form>
  );

  return (
    <LoginContainer theme={theme}>
      <LoginCard theme={theme}>
        <LogoWrapper>
          <LogoIcon theme={theme}>
            <Sparkles size={32} />
          </LogoIcon>
        </LogoWrapper>
        <Title theme={theme}>CasalPlanner</Title>
        <Subtitle theme={theme}>
          {isLogin ? 'organizando o lar a dois' : 'crie sua conta e comece a organizar'}
        </Subtitle>

        {errors.geral && (
          <ErrorMessage theme={theme}>
            <AlertCircle size={16} />
            {errors.geral}
          </ErrorMessage>
        )}

        {!isLogin && (
          <TabsContainer>
            <Tab 
              $active={showIndividualForm} 
              onClick={() => setShowIndividualForm(true)}
            >
              <User size={16} />
              <span>Individual</span>
            </Tab>
            <Tab 
              $active={!showIndividualForm} 
              onClick={() => setShowIndividualForm(false)}
            >
              <Users size={16} />
              <span>Casal</span>
            </Tab>
          </TabsContainer>
        )}

        {isLogin ? renderLoginForm() : (
          showIndividualForm ? renderIndividualRegisterForm() : renderCasalRegisterForm()
        )}

        <InfoMessage theme={theme}>
          <CheckCircle size={16} />
          {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setShowIndividualForm(true);
            }}
            style={{ background: 'none', border: 'none', color: theme.primary, cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </InfoMessage>

        {isLogin && (
          <InfoMessage theme={theme}>
            <Target size={16} />
            <strong>Teste:</strong> joao@email.com / 123456
          </InfoMessage>
        )}
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;