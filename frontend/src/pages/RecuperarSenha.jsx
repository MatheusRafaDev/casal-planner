// RecuperarSenha.jsx (versão refatorada)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Key, Lock, Eye, EyeOff, ArrowLeft, Send, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import recuperarSenhaService from '../services/RecuperarSenhaService';
import { useTheme } from '../context/ThemeContext';

import {
  Container,
  Card,
  Title,
  Subtitle,
  ProgressContainer,
  StepsWrapper,
  Step,
  StepCircle,
  StepLabel,
  ProgressBarWrapper,
  ProgressFill,
  Form,
  FormGroup,
  Label,
  InputWrapper,
  Input,
  CodeInput,
  PasswordToggle,
  Button,
  ResendButton,
  BackLink,
  ErrorMessage,
  Divider,
  FieldError,
  WarningMessage
} from '../styles/pages/RecuperarSenhaStyles';

const RecuperarSenha = () => {
  const [step, setStep] = useState(() => {
    // Restaurar step da storage se existir
    const status = recuperarSenhaService.verificarStatus();
    return status.step;
  });
  
  const [email, setEmail] = useState(() => {
    // Restaurar email da storage se existir
    const status = recuperarSenhaService.verificarStatus();
    return status.email || '';
  });
  
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tempToken, setTempToken] = useState(() => {
    // Restaurar token da storage se existir
    const status = recuperarSenhaService.verificarStatus();
    return status.isTokenValid ? recuperarSenhaService.obterTokenRecuperacao() : '';
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [emailNotFound, setEmailNotFound] = useState(false);
  
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Timer para reenviar código
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Limpar erro de email não encontrado quando o email mudar
  React.useEffect(() => {
    if (emailNotFound) {
      setEmailNotFound(false);
    }
  }, [email]);

  // Validações
  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!recuperarSenhaService.isValidEmail(email)) {
      newErrors.email = 'Email inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    if (!codigo || codigo.length !== 6) {
      newErrors.codigo = 'Digite o código de 6 dígitos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve ter no mínimo 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(novaSenha)) {
      newErrors.novaSenha = 'A senha deve conter letra maiúscula, minúscula e número';
    }
    if (novaSenha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não conferem';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Passo 1: Enviar email
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    
    setLoading(true);
    setEmailNotFound(false);
    
    const result = await recuperarSenhaService.solicitarCodigo(email);
    
    if (result.success) {
      toast.success(result.message);
      setCountdown(60);
      setStep(2);
    } else {
      if (result.code === 'USER_NOT_FOUND') {
        setEmailNotFound(true);
        setErrors({ email: result.message });
        toast.error(result.message);
      } else {
        toast.error(result.message);
      }
    }
    
    setLoading(false);
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (countdown > 0) {
      toast.error(`Aguarde ${countdown} segundos para reenviar`);
      return;
    }

    setLoading(true);
    
    const result = await recuperarSenhaService.reenviarCodigo(email);
    
    if (result.success) {
      setCountdown(result.countdown || 60);
      toast.success(result.message);
    } else {
      if (result.code === 'USER_NOT_FOUND') {
        toast.error('Email não encontrado. Volte e verifique o endereço.');
        setTimeout(() => {
          setStep(1);
          setEmailNotFound(true);
        }, 2000);
      } else {
        toast.error(result.message);
      }
    }
    
    setLoading(false);
  };

  // Passo 2: Validar código
  const handleValidateCode = async (e) => {
    e.preventDefault();
    if (!validateCode()) return;
    
    setLoading(true);
    
    const result = await recuperarSenhaService.validarCodigo(codigo);
    
    if (result.success) {
      setTempToken(result.token);
      toast.success(result.message);
      setStep(3);
    } else {
      toast.error(result.message);
      if (result.isLastAttempt) {
        toast.warning('Última tentativa!');
      }
    }
    
    setLoading(false);
  };

  // Passo 3: Redefinir senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    
    setLoading(true);
    
    const result = await recuperarSenhaService.redefinirSenha(novaSenha, confirmarSenha);
    
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(result.message);
      if (result.shouldRestart) {
        setTimeout(() => {
          setStep(1);
          setTempToken('');
        }, 2000);
      }
    }
    
    setLoading(false);
  };

  // Ir para página de cadastro
  const handleGoToRegister = () => {
    navigate('/register');
  };

  // Ícones dos steps
  const getStepIcon = (stepNumber) => {
    if (step > stepNumber) return <CheckCircle size={20} />;
    if (step === stepNumber) {
      switch(stepNumber) {
        case 1: return <Mail size={20} />;
        case 2: return <Key size={20} />;
        case 3: return <Lock size={20} />;
        default: return stepNumber;
      }
    }
    return stepNumber;
  };

  // Renderizar conteúdo baseado no step
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <Form onSubmit={handleSendCode}>
            <FormGroup>
              <Label theme={theme}>
                <Mail size={16} />
                Endereço de email
              </Label>
              <InputWrapper>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  theme={theme}
                  error={errors.email || emailNotFound}
                  autoFocus
                />
              </InputWrapper>
              {errors.email && (
                <ErrorMessage>
                  <AlertCircle size={14} />
                  {errors.email}
                </ErrorMessage>
              )}
              {emailNotFound && !errors.email && (
                <WarningMessage theme={theme}>
                  <AlertCircle size={14} />
                  Este email não está cadastrado. Verifique o endereço ou 
                  <button type="button" onClick={handleGoToRegister}>
                    crie uma conta
                  </button>
                </WarningMessage>
              )}
            </FormGroup>

            <Button type="submit" disabled={loading} theme={theme}>
              {loading ? 'Enviando...' : 'Enviar código de verificação'}
              {!loading && <Send size={18} />}
            </Button>
          </Form>
        );

      case 2:
        return (
          <Form onSubmit={handleValidateCode}>
            <FormGroup>
              <Label theme={theme}>
                <Key size={16} />
                Código de verificação
              </Label>
              <InputWrapper>
                <CodeInput
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  theme={theme}
                  error={errors.codigo}
                  autoFocus
                />
              </InputWrapper>
              {errors.codigo && (
                <ErrorMessage>
                  ❌ {errors.codigo}
                </ErrorMessage>
              )}
              <FieldError theme={theme}>
                Digite o código de 6 dígitos enviado para {email}
              </FieldError>
            </FormGroup>

            <Button type="submit" disabled={loading} theme={theme}>
              {loading ? 'Validando...' : 'Validar código'}
              {!loading && <CheckCircle size={18} />}
            </Button>

            <Divider theme={theme}>
              <span>Não recebeu o código?</span>
            </Divider>

            <ResendButton 
              type="button" 
              onClick={handleResendCode} 
              disabled={countdown > 0 || loading}
              theme={theme}
            >
              <RefreshCw size={14} />
              {countdown > 0 
                ? `Reenviar em ${countdown}s` 
                : "Reenviar código"}
            </ResendButton>
          </Form>
        );

      case 3:
        return (
          <Form onSubmit={handleResetPassword}>
            <FormGroup>
              <Label theme={theme}>
                <Lock size={16} />
                Nova senha
              </Label>
              <InputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  theme={theme}
                  error={errors.novaSenha}
                  autoFocus
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  theme={theme}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
              </InputWrapper>
              {errors.novaSenha && (
                <ErrorMessage>
                  ❌ {errors.novaSenha}
                </ErrorMessage>
              )}
              <FieldError theme={theme}>
                A senha deve conter letra maiúscula, minúscula e número
              </FieldError>
            </FormGroup>

            <FormGroup>
              <Label theme={theme}>
                <Lock size={16} />
                Confirmar senha
              </Label>
              <InputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  theme={theme}
                  error={errors.confirmarSenha}
                />
              </InputWrapper>
              {errors.confirmarSenha && (
                <ErrorMessage>
                  ❌ {errors.confirmarSenha}
                </ErrorMessage>
              )}
            </FormGroup>

            <Button type="submit" disabled={loading} theme={theme}>
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
              {!loading && <CheckCircle size={18} />}
            </Button>
          </Form>
        );

      default:
        return null;
    }
  };

  return (
    <Container theme={theme}>
      <Card theme={theme}>
        <Title theme={theme}>
          Recuperar senha
        </Title>
        <Subtitle theme={theme}>
          {step === 1 && "Digite seu email para receber um código de verificação"}
          {step === 2 && `Enviamos um código de 6 dígitos para ${email}`}
          {step === 3 && "Digite sua nova senha para acessar sua conta"}
        </Subtitle>

        <ProgressContainer>
          <StepsWrapper>
            {[1, 2, 3].map((s) => (
              <Step key={s}>
                <StepCircle 
                  active={step === s} 
                  completed={step > s}
                  theme={theme}
                >
                  {getStepIcon(s)}
                </StepCircle>
                <StepLabel 
                  active={step === s} 
                  completed={step > s}
                  theme={theme}
                >
                  {s === 1 && "Email"}
                  {s === 2 && "Código"}
                  {s === 3 && "Senha"}
                </StepLabel>
              </Step>
            ))}
          </StepsWrapper>
          <ProgressBarWrapper theme={theme}>
            <ProgressFill width={((step - 1) / 2) * 100} theme={theme} />
          </ProgressBarWrapper>
        </ProgressContainer>

        {renderContent()}

        <BackLink 
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
              if (step === 3) setTempToken("");
            } else {
              recuperarSenhaService.limparDadosRecuperacao();
              navigate("/login");
            }
          }} 
          theme={theme}
        >
          <ArrowLeft size={16} />
          {step > 1 ? "Voltar" : "Voltar para o login"}
        </BackLink>
      </Card>
    </Container>
  );
};

export default RecuperarSenha;