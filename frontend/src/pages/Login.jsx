import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { ReactComponent as CasalPlannerLogo } from "../logo.svg";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Calendar,
  DollarSign,
  Users,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  User,
} from "lucide-react";

import {
  formatarCPF,
  formatarValorInput,
  formatarDataInput,
  converterDataBRparaISO,
  validarData,
  validarCPF,
} from "../utils/formatters";

import {
  LoginContainer,
  LoginCard,
  LogoWrapper,
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
  BackLink,
  ForgotPasswordLink,
} from "../styles/pages/LoginStyles";

const PasswordStrengthIndicator = ({ password }) => {
  const requirements = [
    { regex: /.{8,}/, text: "Mínimo 8 caracteres", icon: "🔒" },
    { regex: /[A-Z]/, text: "Letra maiúscula", icon: "⬆️" },
    { regex: /[a-z]/, text: "Letra minúscula", icon: "⬇️" },
    { regex: /[0-9]/, text: "Número", icon: "🔢" },
    { regex: /[^A-Za-z0-9]/, text: "Caractere especial (!@#$%*)", icon: "✨" },
  ];

  return (
    <div style={{ marginTop: "8px", fontSize: "12px" }}>
      {requirements.map((req, index) => {
        const isValid = req.regex.test(password);
        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
              color: isValid ? "#4caf50" : "#999",
              fontSize: "11px",
            }}
          >
            <span>{isValid ? "✅" : "❌"}</span>
            <span>{req.icon}</span>
            <span>{req.text}</span>
          </div>
        );
      })}
    </div>
  );
};

const Login = () => {
  const location = useLocation();
  const [modo, setModo] = useState(location.state?.modo || "login");

  const [isCasal, setIsCasal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    dataNascimento: "",
    rendaMensal: "",

    pessoa1: {
      nomeCompleto: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cpf: "",
      dataNascimento: "",
      rendaMensal: "",
    },
    pessoa2: {
      nomeCompleto: "",
      email: "",
      senha: "",
      confirmarSenha: "",
      cpf: "",
      dataNascimento: "",
      rendaMensal: "",
    },
    dataInclusao: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaError, setSenhaError] = useState("");
  const [, setPasswordStrength] = useState({
    pessoa1: { isValid: false, errors: [] },
    pessoa2: { isValid: false, errors: [] },
  });

  const { login, registrar, registrarCasal, estaAutenticado } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (estaAutenticado) {
      navigate("/inicio");
    }
  }, [estaAutenticado, navigate]);

  // Função para validar força da senha
  const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("A senha deve ter no mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("A senha deve conter pelo menos uma letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("A senha deve conter pelo menos um número");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push(
        "A senha deve conter pelo menos um caractere especial (!@#$%*)",
      );
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  // Atualiza validação da senha quando ela muda
  useEffect(() => {
    if (isCasal) {
      const validation1 = validatePasswordStrength(formData.pessoa1.senha);
      const validation2 = validatePasswordStrength(formData.pessoa2.senha);
      setPasswordStrength({
        pessoa1: validation1,
        pessoa2: validation2,
      });
    } else {
      const validation = validatePasswordStrength(formData.senha);
      setPasswordStrength({
        pessoa1: validation,
        pessoa2: { isValid: false, errors: [] },
      });
    }
  }, [formData.senha, formData.pessoa1.senha, formData.pessoa2.senha, isCasal]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("pessoa1_")) {
      const campo = name.replace("pessoa1_", "");
      setFormData((prev) => ({
        ...prev,
        pessoa1: { ...prev.pessoa1, [campo]: value },
      }));
    } else if (name.startsWith("pessoa2_")) {
      const campo = name.replace("pessoa2_", "");
      setFormData((prev) => ({
        ...prev,
        pessoa2: { ...prev.pessoa2, [campo]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (
      modo === "registro" &&
      (name.includes("senha") || name.includes("confirmar"))
    ) {
      setSenhaError("");
    }
  };

  const validarSenhasRegistro = () => {
    if (isCasal) {
      // Valida senha da pessoa 1
      const validation1 = validatePasswordStrength(formData.pessoa1.senha);
      if (!validation1.isValid) {
        const msg = validation1.errors[0];
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }

      if (formData.pessoa1.senha !== formData.pessoa1.confirmarSenha) {
        const msg = "As senhas da primeira pessoa não coincidem";
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }

      // Valida senha da pessoa 2
      const validation2 = validatePasswordStrength(formData.pessoa2.senha);
      if (!validation2.isValid) {
        const msg = validation2.errors[0];
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }

      if (formData.pessoa2.senha !== formData.pessoa2.confirmarSenha) {
        const msg = "As senhas da segunda pessoa não coincidem";
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }
    } else {
      // Valida senha individual
      const validation = validatePasswordStrength(formData.senha);
      if (!validation.isValid) {
        const msg = validation.errors[0];
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }

      if (formData.senha !== formData.confirmarSenha) {
        const msg = "As senhas não coincidem";
        setSenhaError(msg);
        toast.error(msg, { duration: 4000 });
        return false;
      }
    }
    return true;
  };

  const limparCPF = (cpf) => {
    if (!cpf) return null;
    return cpf.replace(/[^\d]/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSenhaError("");

    if (modo === "login") {
      if (!formData.email || !formData.senha) {
        const msg = "Preencha email e senha";
        setError(msg);
        toast.error(msg, { duration: 4000 });
        return;
      }
    } else {
      if (!validarSenhasRegistro()) return;

      if (!isCasal) {
        if (!validarCPF(formData.cpf)) {
          const msg = "CPF inválido. Deve conter 11 dígitos.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }

        if (!validarData(formData.dataNascimento)) {
          const msg = "Data de nascimento inválida. Use o formato DD/MM/AAAA.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }
      } else {
        if (!validarCPF(formData.pessoa1.cpf)) {
          const msg =
            "CPF da primeira pessoa inválido. Deve conter 11 dígitos.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }
        if (!validarCPF(formData.pessoa2.cpf)) {
          const msg = "CPF da segunda pessoa inválido. Deve conter 11 dígitos.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }

        if (!validarData(formData.pessoa1.dataNascimento)) {
          const msg = "Data de nascimento da primeira pessoa inválida.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }
        if (!validarData(formData.pessoa2.dataNascimento)) {
          const msg = "Data de nascimento da segunda pessoa inválida.";
          setError(msg);
          toast.error(msg, { duration: 4000 });
          return;
        }
      }
    }

    setLoading(true);

    try {
      let result;

      if (modo === "login") {
        toast.loading("Fazendo login...", { id: "login" });
        result = await login(formData.email, formData.senha);
        toast.dismiss("login");

        if (result.success === false) {
          toast.error(result.error || "Erro ao fazer login", {
            duration: 4000,
          });
          setError(result.error || "Erro ao fazer login");
          setLoading(false);
          return;
        }
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
            const msg = "Preencha todos os campos obrigatórios do casal";
            setError(msg);
            toast.error(msg, { duration: 4000 });
            setLoading(false);
            return;
          }

          const dadosCasal = {
            nomeCompletoPessoa1: formData.pessoa1.nomeCompleto,
            emailPessoa1: formData.pessoa1.email,
            senhaPessoa1: formData.pessoa1.senha,
            cpfPessoa1: limparCPF(formData.pessoa1.cpf),
            dataNascimentoPessoa1: converterDataBRparaISO(
              formData.pessoa1.dataNascimento,
            ),
            rendaMensalPessoa1: formData.pessoa1.rendaMensal
              ? parseFloat(
                  formData.pessoa1.rendaMensal
                    .replace(/\./g, "")
                    .replace(",", "."),
                )
              : 0,

            nomeCompletoPessoa2: formData.pessoa2.nomeCompleto,
            emailPessoa2: formData.pessoa2.email,
            senhaPessoa2: formData.pessoa2.senha,
            cpfPessoa2: limparCPF(formData.pessoa2.cpf),
            dataNascimentoPessoa2: converterDataBRparaISO(
              formData.pessoa2.dataNascimento,
            ),
            rendaMensalPessoa2: formData.pessoa2.rendaMensal
              ? parseFloat(
                  formData.pessoa2.rendaMensal
                    .replace(/\./g, "")
                    .replace(",", "."),
                )
              : 0,
          };

          toast.loading("Registrando casal...", { id: "registro" });
          result = await registrarCasal(dadosCasal);
          toast.dismiss("registro");

          if (result && result.success === false) {
            toast.error(result.error || "Erro ao registrar casal", {
              duration: 4000,
            });
            setError(result.error || "Erro ao registrar casal");
            setLoading(false);
            return;
          }

          toast.success("Casal registrado com sucesso! 🎉", { duration: 3000 });
        } else {
          if (
            !formData.nomeCompleto ||
            !formData.email ||
            !formData.senha ||
            !formData.cpf ||
            !formData.dataNascimento
          ) {
            const msg = "Preencha todos os campos obrigatórios";
            setError(msg);
            toast.error(msg, { duration: 4000 });
            setLoading(false);
            return;
          }

          const dadosIndividuais = {
            nomeCompleto: formData.nomeCompleto,
            email: formData.email,
            senha: formData.senha,
            cpf: limparCPF(formData.cpf),
            dataNascimento: converterDataBRparaISO(formData.dataNascimento),
            rendaMensal: formData.rendaMensal
              ? parseFloat(
                  formData.rendaMensal.replace(/\./g, "").replace(",", "."),
                )
              : 0,
          };

          toast.loading("Registrando usuário...", { id: "registro" });
          result = await registrar(dadosIndividuais);
          toast.dismiss("registro");

          if (result && result.success === false) {
            toast.error(result.error || "Erro ao registrar usuário", {
              duration: 4000,
            });
            setError(result.error || "Erro ao registrar usuário");
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Erro detalhado:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.Senha?.[0] ||
        err.response?.data?.errors?.senhaPessoa1?.[0] ||
        err.response?.data?.errors?.senhaPessoa2?.[0] ||
        err.message ||
        "Erro ao processar solicitação";

      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer theme={theme}>
      <LoginCard theme={theme}>
        <LogoWrapper>
          <CasalPlannerLogo width={56} height={56} />
        </LogoWrapper>


        <Subtitle theme={theme}>Organize a vida a dois</Subtitle>

        <TabsContainer theme={theme}>
          <Tab
            $active={modo === "login"}
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
            $active={modo === "registro"}
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

              <ForgotPasswordLink
                onClick={() => navigate("/recuperar-senha")}
                theme={theme}
              >
                Esqueci minha senha
              </ForgotPasswordLink>
            </>
          )}

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
                    <FormGroup $half>
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
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          theme={theme}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                      <PasswordStrengthIndicator password={formData.senha} />
                    </FormGroup>

                    <FormGroup $half>
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
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          theme={theme}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
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

                    <FormGroup $half>
                      <Label theme={theme}>
                        <Calendar size={16} />
                        Data nasc. *
                      </Label>
                      <Input
                        type="text"
                        name="dataNascimento"
                        value={formData.dataNascimento}
                        onChange={(e) => {
                          const formatado = formatarDataInput(e.target.value);
                          handleChange({
                            target: {
                              name: "dataNascimento",
                              value: formatado,
                            },
                          });
                        }}
                        placeholder="DD/MM/AAAA"
                        maxLength="10"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
                      <Label theme={theme}>
                        <DollarSign size={16} />
                        Renda mensal
                      </Label>
                      <Input
                        type="text"
                        name="rendaMensal"
                        value={formData.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarValorInput(e.target.value);
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
                    <FormGroup $half>
                      <Label theme={theme}>Senha *</Label>
                      <InputWrapper>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="pessoa1_senha"
                          value={formData.pessoa1.senha}
                          onChange={handleChange}
                          placeholder="••••••"
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          theme={theme}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                      <PasswordStrengthIndicator
                        password={formData.pessoa1.senha}
                      />
                    </FormGroup>

                    <FormGroup $half>
                      <Label theme={theme}>Confirmar *</Label>
                      <InputWrapper>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="pessoa1_confirmarSenha"
                          value={formData.pessoa1.confirmarSenha}
                          onChange={handleChange}
                          placeholder="••••••"
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          theme={theme}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
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

                    <FormGroup $half>
                      <Label theme={theme}>Data nasc. *</Label>
                      <Input
                        type="text"
                        name="pessoa1_dataNascimento"
                        value={formData.pessoa1.dataNascimento}
                        onChange={(e) => {
                          const formatado = formatarDataInput(e.target.value);
                          handleChange({
                            target: {
                              name: "pessoa1_dataNascimento",
                              value: formatado,
                            },
                          });
                        }}
                        placeholder="DD/MM/AAAA"
                        maxLength="10"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
                      <Label theme={theme}>Renda mensal</Label>
                      <Input
                        type="text"
                        name="pessoa1_rendaMensal"
                        value={formData.pessoa1.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarValorInput(e.target.value);
                          handleChange({
                            target: {
                              name: "pessoa1_rendaMensal",
                              value: formatado,
                            },
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
                    <FormGroup $half>
                      <Label theme={theme}>Senha *</Label>
                      <InputWrapper>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="pessoa2_senha"
                          value={formData.pessoa2.senha}
                          onChange={handleChange}
                          placeholder="••••••"
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          theme={theme}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                      <PasswordStrengthIndicator
                        password={formData.pessoa2.senha}
                      />
                    </FormGroup>

                    <FormGroup $half>
                      <Label theme={theme}>Confirmar *</Label>
                      <InputWrapper>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          name="pessoa2_confirmarSenha"
                          value={formData.pessoa2.confirmarSenha}
                          onChange={handleChange}
                          placeholder="••••••"
                          theme={theme}
                        />
                        <PasswordToggle
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          theme={theme}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </PasswordToggle>
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
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

                    <FormGroup $half>
                      <Label theme={theme}>Data nasc. *</Label>
                      <Input
                        type="text"
                        name="pessoa2_dataNascimento"
                        value={formData.pessoa2.dataNascimento}
                        onChange={(e) => {
                          const formatado = formatarDataInput(e.target.value);
                          handleChange({
                            target: {
                              name: "pessoa2_dataNascimento",
                              value: formatado,
                            },
                          });
                        }}
                        placeholder="DD/MM/AAAA"
                        maxLength="10"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup $half>
                      <Label theme={theme}>Renda mensal</Label>
                      <Input
                        type="text"
                        name="pessoa2_rendaMensal"
                        value={formData.pessoa2.rendaMensal}
                        onChange={(e) => {
                          const formatado = formatarValorInput(e.target.value);
                          handleChange({
                            target: {
                              name: "pessoa2_rendaMensal",
                              value: formatado,
                            },
                          });
                        }}
                        placeholder="1.500,00"
                        theme={theme}
                      />
                    </FormGroup>
                  </FormRow>
                </>
              )}

              <LoginButton
                type="submit"
                disabled={loading}
                style={{ marginTop: "20px" }}
                theme={theme}
              >
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
