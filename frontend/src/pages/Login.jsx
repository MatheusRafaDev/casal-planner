import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Ícones do Lucide React
import { 
  Heart, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  DollarSign,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  User
} from 'lucide-react';


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
} from "../styles/pages/LoginStyles";

const Login = () => {

  const location = useLocation(); 
  const [modo, setModo] = useState(location.state?.modo || "login"); 
  
  const [isCasal, setIsCasal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Dados individuais
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    rendaMensal: "",

    // Dados do casal (quando ativado)
    pessoa1: {
      nomeCompleto: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cpf: "",
      dataNascimento: "",
      telefone: "",
      rendaMensal: "",
    },
    pessoa2: {
      nomeCompleto: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cpf: "",
      dataNascimento: "",
      telefone: "",
      rendaMensal: "",
    },
    dataInclusao: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaError, setSenhaError] = useState("");

  const { login, registrar, registrarCasal, estaAutenticado } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado) {
      navigate("/inicio");
    }
  }, [estaAutenticado, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("pessoa1_")) {
      const campo = name.replace("pessoa1_", "");
      setFormData({
        ...formData,
        pessoa1: { ...formData.pessoa1, [campo]: value },
      });
    } else if (name.startsWith("pessoa2_")) {
      const campo = name.replace("pessoa2_", "");
      setFormData({
        ...formData,
        pessoa2: { ...formData.pessoa2, [campo]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (modo === "registro" && (name.includes("senha") || name.includes("confirmar"))) {
      setSenhaError("");
    }
  };

  const validarSenhasRegistro = () => {
    if (isCasal) {
      if (formData.pessoa1.senha !== formData.pessoa1.confirmarSenha) {
        setSenhaError("As senhas da primeira pessoa não coincidem");
        return false;
      }
      if (formData.pessoa1.senha.length < 6) {
        setSenhaError(
          "A senha da primeira pessoa deve ter no mínimo 6 caracteres",
        );
        return false;
      }
      if (formData.pessoa2.senha !== formData.pessoa2.confirmarSenha) {
        setSenhaError("As senhas da segunda pessoa não coincidem");
        return false;
      }
      if (formData.pessoa2.senha.length < 6) {
        setSenhaError(
          "A senha da segunda pessoa deve ter no mínimo 6 caracteres",
        );
        return false;
      }
    } else {
      if (formData.senha !== formData.confirmarSenha) {
        setSenhaError("As senhas não coincidem");
        return false;
      }
      if (formData.senha.length < 6) {
        setSenhaError("A senha deve ter no mínimo 6 caracteres");
        return false;
      }
    }
    return true;
  };

  const validarCPF = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    return cpfLimpo.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSenhaError("");

    if (modo === "login") {
      if (!formData.email || !formData.senha) {
        setError("Preencha email e senha");
        return;
      }
    } else {
      if (!validarSenhasRegistro()) return;

      if (!isCasal) {
        if (!validarCPF(formData.cpf)) {
          setError("CPF inválido. Deve conter 11 dígitos.");
          return;
        }
      } else {
        if (!validarCPF(formData.pessoa1.cpf)) {
          setError("CPF da primeira pessoa inválido. Deve conter 11 dígitos.");
          return;
        }
        if (!validarCPF(formData.pessoa2.cpf)) {
          setError("CPF da segunda pessoa inválido. Deve conter 11 dígitos.");
          return;
        }
      }
    }

    setLoading(true);

    try {
      let result;

      if (modo === "login") {
        result = await login(formData.email, formData.senha);
      } else {
        if (isCasal) {
          if (
            !formData.pessoa1.nomeCompleto ||
            !formData.pessoa1.email ||
            !formData.pessoa1.senha ||
            !formData.pessoa1.cpf ||
            !formData.pessoa1.dataNascimento ||
            !formData.pessoa2.nomeCompleto ||
            !formData.pessoa2.email ||
            !formData.pessoa2.senha ||
            !formData.pessoa2.cpf ||
            !formData.pessoa2.dataNascimento
          ) {
            setError("Preencha todos os campos obrigatórios do casal");
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
            rendaMensalPessoa1: formData.pessoa1.rendaMensal
              ? parseFloat(
                  formData.pessoa1.rendaMensal
                    .replace(/\./g, "")
                    .replace(",", "."),
                )
              : null,

            nomeCompletoPessoa2: formData.pessoa2.nomeCompleto,
            emailPessoa2: formData.pessoa2.email,
            senhaPessoa2: formData.pessoa2.senha,
            cpfPessoa2: formData.pessoa2.cpf,
            dataNascimentoPessoa2: formData.pessoa2.dataNascimento,
            telefonePessoa2: formData.pessoa2.telefone || null,
            rendaMensalPessoa2: formData.pessoa2.rendaMensal
              ? parseFloat(
                  formData.pessoa2.rendaMensal
                    .replace(/\./g, "")
                    .replace(",", "."),
                )
              : null,
            dataInclusao: formData.dataInclusao,
          };

          result = await registrarCasal(dadosCasal);
        } else {
          if (
            !formData.nomeCompleto ||
            !formData.email ||
            !formData.senha ||
            !formData.cpf ||
            !formData.dataNascimento
          ) {
            setError("Preencha todos os campos obrigatórios");
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
            rendaMensal: formData.rendaMensal
              ? parseFloat(
                  formData.rendaMensal.replace(/\./g, "").replace(",", "."),
                )
              : null,
            dataInclusao: formData.dataInclusao,
          };

          result = await registrar(dadosIndividuais);
        }
      }

      if (!result.success) {
        setError(result.error || "Erro ao processar solicitação");
      }
    } catch (err) {
      console.error("Erro detalhado:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao processar solicitação",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatarCPF = (value) => {
    const cpf = value.replace(/\D/g, "");
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatarTelefone = (value) => {
    const telefone = value.replace(/\D/g, "");
    if (telefone.length <= 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const formatarRenda = (value) => {
    const numero = value.replace(/\D/g, "");
    if (numero.length === 0) return "";
    const valor = (parseInt(numero) / 100).toFixed(2);
    return valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <LoginContainer theme={theme}>
      <LoginCard theme={theme}>
        {/* Logo */}
        <LogoWrapper>
          <LogoIcon theme={theme}>
            <Heart size={32} />
          </LogoIcon>
        </LogoWrapper>
        
        <Title theme={theme}>CasalPlanner</Title>
        <Subtitle theme={theme}>Organize a vida a dois</Subtitle>

        {/* Tabs */}
        <TabsContainer theme={theme}>
          <Tab 
            active={modo === "login"} 
            onClick={() => {
              setModo("login");
              setError("");
              setSenhaError("");
            }}
            theme={theme}
          >
            <LogIn size={16} />
            <span>Login</span>
          </Tab>
          <Tab 
            active={modo === "registro"} 
            onClick={() => {
              setModo("registro");
              setError("");
              setSenhaError("");
            }}
            theme={theme}
          >
            <UserPlus size={16} />
            <span>Registrar</span>
          </Tab>
        </TabsContainer>

        {/* Mensagens de erro */}
        {error && (
          <ErrorMessage theme={theme}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </ErrorMessage>
        )}
        {senhaError && (
          <ErrorMessage theme={theme}>
            <AlertCircle size={16} />
            <span>{senhaError}</span>
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          {/* FORMULÁRIO DE LOGIN */}
          {modo === "login" && (
            <>
              <FormGroup>
                <Label theme={theme}>
                  <Mail size={16} />
                  Email
                </Label>
                <InputWrapper>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    theme={theme}
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>
                  <Lock size={16} />
                  Senha
                </Label>
                <InputWrapper>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="••••••"
                    theme={theme}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    theme={theme}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </PasswordToggle>
                </InputWrapper>
              </FormGroup>

              <LoginButton type="submit" disabled={loading} theme={theme}>
                {loading ? "Entrando..." : "Entrar"}
              </LoginButton>

              <InfoMessage theme={theme}>
                <CheckCircle size={14} />
                <span>Use joao@email.com / 123456 para testar</span>
              </InfoMessage>
            </>
          )}

          {/* FORMULÁRIO DE REGISTRO */}
          {modo === "registro" && (
            <>
              <CheckboxWrapper theme={theme}>
                <CheckboxLabel theme={theme}>
                  <input
                    type="checkbox"
                    checked={isCasal}
                    onChange={(e) => setIsCasal(e.target.checked)}
                  />
                  <Users size={16} />
                  <span>Ativar conta casal (duas pessoas)</span>
                </CheckboxLabel>
                <CheckboxHelper theme={theme}>
                  {isCasal
                    ? "Conta compartilhada para duas pessoas"
                    : "Conta individual para uma pessoa"}
                </CheckboxHelper>
              </CheckboxWrapper>

              {!isCasal ? (
                /* FORMULÁRIO INDIVIDUAL */
                <>
                  <FormGroup>
                    <Label theme={theme}>
                      <User size={16} />
                      Nome completo *
                    </Label>
                    <Input
                      type="text"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>
                      <Mail size={16} />
                      Email *
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>
                        <Lock size={16} />
                        Senha *
                      </Label>
                      <InputWrapper>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="senha"
                          value={formData.senha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                      </InputWrapper>
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>
                        <Lock size={16} />
                        Confirmar *
                      </Label>
                      <InputWrapper>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmarSenha"
                          value={formData.confirmarSenha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          theme={theme}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </PasswordToggle>
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>
                        <Hash size={16} />
                        CPF *
                      </Label>
                      <Input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({
                            target: { name: "cpf", value: formatado },
                          });
                        }}
                        placeholder="000.000.000-00"
                        maxLength="14"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>
                        <Calendar size={16} />
                        Data nasc. *
                      </Label>
                      <Input
                        type="date"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={handleChange}
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>
                        <Phone size={16} />
                        Telefone
                      </Label>
                      <Input
                        type="text"
                        name="telefone"
                        value={formData.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({
                            target: { name: "telefone", value: formatado },
                          });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>
                        <DollarSign size={16} />
                        Renda mensal
                      </Label>
                      <Input
                        type="text"
                        name="rendaMensal"
                        value={formData.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({
                            target: { name: "rendaMensal", value: formatado },
                          });
                        }}
                        placeholder="1.500,00"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>
                </>
              ) : (
                /* FORMULÁRIO CASAL */
                <>
                  <SectionTitle theme={theme}>
                    <User size={18} />
                    Pessoa 1
                  </SectionTitle>

                  <FormGroup>
                    <Label theme={theme}>Nome completo *</Label>
                    <Input
                      type="text"
                      name="pessoa1_nomeCompleto"
                      value={formData.pessoa1.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Nome completo"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>Email *</Label>
                    <Input
                      type="email"
                      name="pessoa1_email"
                      value={formData.pessoa1.email}
                      onChange={handleChange}
                      placeholder="pessoa1@email.com"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>Senha *</Label>
                      <InputWrapper>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="pessoa1_senha"
                          value={formData.pessoa1.senha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                      </InputWrapper>
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Confirmar *</Label>
                      <InputWrapper>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="pessoa1_confirmarSenha"
                          value={formData.pessoa1.confirmarSenha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>CPF *</Label>
                      <Input
                        type="text"
                        name="pessoa1_cpf"
                        value={formData.pessoa1.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({
                            target: { name: "pessoa1_cpf", value: formatado },
                          });
                        }}
                        placeholder="000.000.000-00"
                        maxLength="14"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Data nasc. *</Label>
                      <Input
                        type="date"
                        name="pessoa1_dataNascimento"
                        value={formData.pessoa1.dataNascimento}
                        onChange={handleChange}
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>Telefone</Label>
                      <Input
                        type="text"
                        name="pessoa1_telefone"
                        value={formData.pessoa1.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({
                            target: { name: "pessoa1_telefone", value: formatado },
                          });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Renda mensal</Label>
                      <Input
                        type="text"
                        name="pessoa1_rendaMensal"
                        value={formData.pessoa1.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({
                            target: { name: "pessoa1_rendaMensal", value: formatado },
                          });
                        }}
                        placeholder="1.500,00"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <SectionTitle theme={theme}>
                    <User size={18} />
                    Pessoa 2
                  </SectionTitle>

                  <FormGroup>
                    <Label theme={theme}>Nome completo *</Label>
                    <Input
                      type="text"
                      name="pessoa2_nomeCompleto"
                      value={formData.pessoa2.nomeCompleto}
                      onChange={handleChange}
                      placeholder="Nome completo"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>Email *</Label>
                    <Input
                      type="email"
                      name="pessoa2_email"
                      value={formData.pessoa2.email}
                      onChange={handleChange}
                      placeholder="pessoa2@email.com"
                      theme={theme}
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>Senha *</Label>
                      <InputWrapper>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="pessoa2_senha"
                          value={formData.pessoa2.senha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                      </InputWrapper>
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Confirmar *</Label>
                      <InputWrapper>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="pessoa2_confirmarSenha"
                          value={formData.pessoa2.confirmarSenha}
                          onChange={handleChange}
                          placeholder="••••••"
                          minLength={6}
                          theme={theme}
                        />
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>CPF *</Label>
                      <Input
                        type="text"
                        name="pessoa2_cpf"
                        value={formData.pessoa2.cpf}
                        onChange={(e) => {
                          const formatado = formatarCPF(e.target.value);
                          handleChange({
                            target: { name: "pessoa2_cpf", value: formatado },
                          });
                        }}
                        placeholder="000.000.000-00"
                        maxLength="14"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Data nasc. *</Label>
                      <Input
                        type="date"
                        name="pessoa2_dataNascimento"
                        value={formData.pessoa2.dataNascimento}
                        onChange={handleChange}
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup half>
                      <Label theme={theme}>Telefone</Label>
                      <Input
                        type="text"
                        name="pessoa2_telefone"
                        value={formData.pessoa2.telefone}
                        onChange={(e) => {
                          const formatado = formatarTelefone(e.target.value);
                          handleChange({
                            target: { name: "pessoa2_telefone", value: formatado },
                          });
                        }}
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                        theme={theme}
                      />
                    </FormGroup>

                    <FormGroup half>
                      <Label theme={theme}>Renda mensal</Label>
                      <Input
                        type="text"
                        name="pessoa2_rendaMensal"
                        value={formData.pessoa2.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarRenda(e.target.value);
                          handleChange({
                            target: { name: "pessoa2_rendaMensal", value: formatado },
                          });
                        }}
                        placeholder="1.500,00"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>
                </>
              )}

              <input type="hidden" name="dataInclusao" value={formData.dataInclusao} />

              <LoginButton type="submit" disabled={loading} style={{ marginTop: '20px' }} theme={theme}>
                {loading ? "Registrando..." : "Registrar"}
              </LoginButton>
            </>
          )}
        </Form>

        <BackLink onClick={() => navigate("/")} theme={theme}>
          <ArrowLeft size={16} />
          Voltar para Home
        </BackLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;