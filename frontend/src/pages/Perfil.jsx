import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import usuarioService from "../services/usuarioService";
import authService from "../services/authService";
import {
  User, Heart, Lock, Trash2, Edit3, X, CheckCircle,
  AlertCircle, Calendar, DollarSign, Mail, CreditCard,
  Clock, Shield, ChevronRight, Eye, EyeOff
} from "lucide-react";

import {
  formatarMoeda, formatarValorInput, formatarCPF,
  formatarDataInput, converterDataBRparaISO, validarData,
  validarCPF, formatarDataExibicao, converterValorParaNumero,
} from "../utils/formatters";

import {
  PerfilContainer, Header, EditarButton, MensagemSucesso, MensagemErro,
  PerfilCard, AvatarSection, Avatar, AvatarPlaceholder, UserInfo, TypeBadge,
  InfoContainer, InfoMembro, InfoRow, InfoGroup, Label, Valor, InfoGrid,
  RendaTotalCard, FormGroup, FormRow, Input, Small, FormActions,
  CancelarButton, SalvarButton, SectionTitle, AlterarSenhaButton,
  LoadingSpinner, LoadingContainer, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, FecharButton, ConfirmarButton, DataCriacao, Divider,
} from "../styles/pages/PerfilStyles";

// ─── Sub-componentes de Display ───────────────────────────────────────────────

const InfoField = ({ label, value, icon: Icon, destaque, theme }) => (
  <InfoGroup>
    <Label theme={theme}>
      {label}
    </Label>
    <Valor theme={theme} className={destaque ? "destaque" : ""}>
      {value || <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>}
    </Valor>
  </InfoGroup>
);

// ─── Campo de senha com toggle ─────────────────────────────────────────────

const SenhaInput = ({ value, name, onChange, placeholder, theme }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={theme}
        style={{ paddingRight: "2.75rem" }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: "0.875rem", top: "50%",
          transform: "translateY(-50%)", background: "none",
          border: "none", cursor: "pointer", padding: 0,
          color: "inherit", opacity: 0.5, display: "flex"
        }}
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const Perfil = () => {
  const { theme } = useTheme();
  const { usuario, atualizarUsuario, logout } = useAuth();

  const [editando, setEditando] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [dadosOriginais, setDadosOriginais] = useState(null);

  const [dadosCasal, setDadosCasal] = useState({
    nomeCompletoPessoa1: "", emailPessoa1: "", cpfPessoa1: "",
    dataNascimentoPessoa1: "", rendaMensalPessoa1: "", rendaMensalPessoa1Valor: 0,
    nomeCompletoPessoa2: "", emailPessoa2: "", cpfPessoa2: "",
    dataNascimentoPessoa2: "", rendaMensalPessoa2: "", rendaMensalPessoa2Valor: 0,
    RendaMensal: 0, createdAt: "",
  });

  const [dadosIndividual, setDadosIndividual] = useState({
    nomeCompleto: "", email: "", cpf: "", dataNascimento: "",
    rendaMensal: "", rendaMensalValor: 0, createdAt: "",
  });

  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });

  const showMsg = (msg, isErro = false) => {
    if (isErro) { setErro(msg); setTimeout(() => setErro(""), 4000); }
    else { setMensagem(msg); setTimeout(() => setMensagem(""), 4000); }
  };

  const handleChangeCasal = (e) => {
    const { name, value } = e.target;
    if (name.includes("cpf")) {
      setDadosCasal(prev => ({ ...prev, [name]: formatarCPF(value) }));
    } else if (name.includes("rendaMensal")) {
      const fmt = formatarValorInput(value);
      const num = converterValorParaNumero(fmt);
      setDadosCasal(prev => {
        const n = { ...prev, [name]: fmt };
        if (name === "rendaMensalPessoa1") n.rendaMensalPessoa1Valor = num;
        if (name === "rendaMensalPessoa2") n.rendaMensalPessoa2Valor = num;
        n.RendaMensal = n.rendaMensalPessoa1Valor + n.rendaMensalPessoa2Valor;
        return n;
      });
    } else if (name.includes("dataNascimento")) {
      setDadosCasal(prev => ({ ...prev, [name]: formatarDataInput(value) }));
    } else {
      setDadosCasal(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeIndividual = (e) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      setDadosIndividual(prev => ({ ...prev, cpf: formatarCPF(value) }));
    } else if (name === "rendaMensal") {
      const fmt = formatarValorInput(value);
      setDadosIndividual(prev => ({ ...prev, rendaMensal: fmt, rendaMensalValor: converterValorParaNumero(fmt) }));
    } else if (name === "dataNascimento") {
      setDadosIndividual(prev => ({ ...prev, dataNascimento: formatarDataInput(value) }));
    } else {
      setDadosIndividual(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelar = () => {
    if (dadosOriginais) {
      if (isCasal) setDadosCasal(dadosOriginais);
      else setDadosIndividual(dadosOriginais);
    }
    
    setEditando(false);
    setErro("");
  };

  const validarCasal = () => {
    if (!dadosCasal.nomeCompletoPessoa1) { showMsg("Nome da Pessoa 1 é obrigatório", true); return false; }
    if (!dadosCasal.nomeCompletoPessoa2) { showMsg("Nome da Pessoa 2 é obrigatório", true); return false; }
    if (dadosCasal.cpfPessoa1 && !validarCPF(dadosCasal.cpfPessoa1)) { showMsg("CPF da Pessoa 1 inválido", true); return false; }
    if (dadosCasal.cpfPessoa2 && !validarCPF(dadosCasal.cpfPessoa2)) { showMsg("CPF da Pessoa 2 inválido", true); return false; }
    if (dadosCasal.dataNascimentoPessoa1 && !validarData(dadosCasal.dataNascimentoPessoa1)) { showMsg("Data de nascimento da Pessoa 1 inválida", true); return false; }
    if (dadosCasal.dataNascimentoPessoa2 && !validarData(dadosCasal.dataNascimentoPessoa2)) { showMsg("Data de nascimento da Pessoa 2 inválida", true); return false; }
    return true;
  };

  const validarIndividual = () => {
    if (!dadosIndividual.nomeCompleto) { showMsg("Nome completo é obrigatório", true); return false; }
    if (dadosIndividual.cpf && !validarCPF(dadosIndividual.cpf)) { showMsg("CPF inválido", true); return false; }
    if (dadosIndividual.dataNascimento && !validarData(dadosIndividual.dataNascimento)) { showMsg("Data de nascimento inválida", true); return false; }
    return true;
  };

  const handleSalvarPerfil = async () => {
    setLoading(true);
    try {
      if (isCasal) {
        if (!validarCasal()) { setLoading(false); return; }
        const dados = {
          nomeCompletoPessoa1: dadosCasal.nomeCompletoPessoa1,
          dataNascimentoPessoa1: dadosCasal.dataNascimentoPessoa1 ? converterDataBRparaISO(dadosCasal.dataNascimentoPessoa1) : null,
          rendaMensalPessoa1: dadosCasal.rendaMensalPessoa1Valor || 0,
          nomeCompletoPessoa2: dadosCasal.nomeCompletoPessoa2,
          dataNascimentoPessoa2: dadosCasal.dataNascimentoPessoa2 ? converterDataBRparaISO(dadosCasal.dataNascimentoPessoa2) : null,
          rendaMensalPessoa2: dadosCasal.rendaMensalPessoa2Valor || 0,
        };
        await usuarioService.atualizarPerfilCasal(usuario.id, dados);
        atualizarUsuario({ ...usuario, rendaMensal: dadosCasal.RendaMensal, casalInfo: { ...usuario.casalInfo, ...dados } });
      } else {
        if (!validarIndividual()) { setLoading(false); return; }
        const dados = {
          nomeCompleto: dadosIndividual.nomeCompleto,
          dataNascimento: dadosIndividual.dataNascimento ? converterDataBRparaISO(dadosIndividual.dataNascimento) : null,
          rendaMensal: dadosIndividual.rendaMensal || 0,
          cpf: dadosIndividual.cpf.replace(/\D/g, ""),
        };
        await usuarioService.atualizarPerfil(usuario.id, dados);
        atualizarUsuario({ ...usuario, ...dados, nomeCompleto: dadosIndividual.nomeCompleto });
      }
      showMsg("Perfil atualizado com sucesso! ✓");
      setEditando(false);
    } catch (error) {
      showMsg(error.response?.data?.message || error.message || "Erro ao atualizar perfil", true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!senha.atual) { showMsg("Digite a senha atual", true); return; }
    if (senha.nova.length < 6) { showMsg("A nova senha deve ter no mínimo 6 caracteres", true); return; }
    if (senha.nova !== senha.confirmar) { showMsg("As senhas não coincidem", true); return; }
    setLoading(true);
    try {
      let email = isCasal
        ? (usuario.pessoaQueLogou === "pessoa1" ? usuario.casalInfo?.emailPessoa1 : usuario.casalInfo?.emailPessoa2)
        : usuario?.email;
      await usuarioService.alterarSenha({ email, senhaAtual: senha.atual, novaSenha: senha.nova });
      showMsg("Senha alterada com sucesso! ✓");
      setEditandoSenha(false);
      setSenha({ atual: "", nova: "", confirmar: "" });
    } catch (error) {
      showMsg(error.response?.data?.message || "Erro ao alterar senha", true);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirConta = async () => {
    setLoading(true);
    try {
      await usuarioService.excluirConta(usuario.id);
      await logout();
    } catch (error) {
      showMsg(error.response?.data?.message || "Erro ao excluir conta", true);
      setMostrarModalExcluir(false);
    } finally {
      setLoading(false);
    }
  };

  const formatarDataCriacao = (data) => {
    if (!data) return "—";
    try {
      return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch { return "—"; }
  };

  useEffect(() => {
    const carregar = async () => {
      if (!usuario) { setCarregandoDados(false); return; }
      try {
        setCarregandoDados(true);
        const d = await authService.buscarDadosCompletos();


        if (!d) throw new Error("Sem dados");

        if (d.isCasal || d.tipoConta === 1) {
          const c = d.casalInfo || {};
          const r1 = parseFloat(c.rendaMensalPessoa1 || 0);
          const r2 = parseFloat(c.rendaMensalPessoa2 || 0);
          const nd = {
            nomeCompletoPessoa1: c.nomeCompletoPessoa1 || "",
            emailPessoa1: c.emailPessoa1 || "",
            cpfPessoa1: c.cpfPessoa1 ? formatarCPF(c.cpfPessoa1) : "",
            dataNascimentoPessoa1: formatarDataExibicao(c.dataNascimentoPessoa1),
            rendaMensalPessoa1: c.rendaMensalPessoa1 ? formatarMoeda(r1) : "",
            rendaMensalPessoa1Valor: r1,
            nomeCompletoPessoa2: c.nomeCompletoPessoa2 || "",
            emailPessoa2: c.emailPessoa2 || "",
            cpfPessoa2: c.cpfPessoa2 ? formatarCPF(c.cpfPessoa2) : "",
            dataNascimentoPessoa2: formatarDataExibicao(c.dataNascimentoPessoa2),
            rendaMensalPessoa2: c.rendaMensalPessoa2 ? formatarMoeda(r2) : "",
            rendaMensalPessoa2Valor: r2,
            RendaMensal: d.rendaMensal || 0,
            createdAt: d.createdAt || "",
          };
          setDadosCasal(nd);
          setDadosOriginais(nd);
        } else {
          const r = parseFloat(d.rendaMensal || 0);
          const nd = {
            nomeCompleto: d.nomeCompleto || "",
            email: d.email || "",
            cpf: d.cpf ? formatarCPF(d.cpf) : "",
            dataNascimento: formatarDataExibicao(d.dataNascimento),
            rendaMensal: d.rendaMensal ? formatarMoeda(r) : "",
            rendaMensalValor: r,
            createdAt: d.createdAt,
          };
          setDadosIndividual(d);
        
          setDadosOriginais(nd);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showMsg("Erro ao carregar dados do perfil", true);
      } finally {
        setCarregandoDados(false);
      }
    };
    carregar();
  }, [usuario]);

  if (carregandoDados) {
    return (
      <PerfilContainer theme={theme}>
        <LoadingContainer theme={theme}>
          <LoadingSpinner theme={theme} />
          <p>Carregando perfil...</p>
        </LoadingContainer>
      </PerfilContainer>
    );
  }

  if (!usuario) {
    return (
      <PerfilContainer theme={theme}>
        <PerfilCard theme={theme}>
          <p>Usuário não encontrado. Faça login novamente.</p>
        </PerfilCard>
      </PerfilContainer>
    );
  }

  const isCasal = usuario.isCasal || usuario.tipoConta === 1;

  const getInitials = () => {
    const nome = isCasal
      ? (usuario.pessoaQueLogou === "pessoa1" ? dadosCasal.nomeCompletoPessoa1 : dadosCasal.nomeCompletoPessoa2)
      : dadosIndividual.nomeCompleto;
    if (!nome) return "?";
    return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  const getNomeDisplay = () => {
    if (isCasal) {
      return usuario.pessoaQueLogou === "pessoa1" ? dadosCasal.nomeCompletoPessoa1 : dadosCasal.nomeCompletoPessoa2;
    }
    return dadosIndividual.nomeCompleto;
  };

  return (
    <PerfilContainer theme={theme}>
      {/* Header */}
      <Header theme={theme}>
        <h1>Meu Perfil</h1>
        {!editando && !editandoSenha && (
          <EditarButton $primary onClick={() => setEditando(true)} disabled={loading} theme={theme}>
            <Edit3 size={15} /> Editar
          </EditarButton>
        )}
      </Header>

      {/* Mensagens */}
      {mensagem && (
        <MensagemSucesso theme={theme}>
          <CheckCircle size={16} /> {mensagem}
        </MensagemSucesso>
      )}
      {erro && (
        <MensagemErro theme={theme}>
          <AlertCircle size={16} /> {erro}
        </MensagemErro>
      )}

      {/* ── Card Principal: Avatar + Info ── */}
      <PerfilCard theme={theme}>
        <AvatarSection theme={theme}>
          <Avatar>
            <AvatarPlaceholder theme={theme}>{getInitials()}</AvatarPlaceholder>
          </Avatar>
          <UserInfo theme={theme}>
            <h2>{getNomeDisplay() || "Usuário"}</h2>
            <p>
              {isCasal
                ? `Conta Casal${usuario.pessoaQueLogou ? ` · ${usuario.pessoaQueLogou === "pessoa1" ? "Pessoa 1" : "Pessoa 2"}` : ""}`
                : "Conta Individual"}
            </p>
            <TypeBadge theme={theme}>
              {isCasal ? <><Heart size={11} /> Casal</> : <><User size={11} /> Individual</>}
            </TypeBadge>
          </UserInfo>
        </AvatarSection>

        {/* ── Visualização ── */}
        <InfoContainer theme={theme}>
          {isCasal ? (
            !editando ? (
              <>
                {/* Pessoa 1 */}
                <InfoMembro theme={theme}>
                  <h3>
                    <User size={16} />
                    Pessoa 1 {usuario.pessoaQueLogou === "pessoa1" && <TypeBadge theme={theme} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>Você</TypeBadge>}
                  </h3>
                  <InfoGrid>
                    <InfoField label="Nome completo" value={dadosCasal.nomeCompletoPessoa1} theme={theme} />
                    <InfoField label="E-mail" value={dadosCasal.emailPessoa1} theme={theme} />
                    <InfoField label="CPF" value={dadosCasal.cpfPessoa1} theme={theme} />
                    <InfoField label="Data de nascimento" value={dadosCasal.dataNascimentoPessoa1} theme={theme} />
                    <InfoField label="Renda mensal" value={formatarMoeda(dadosCasal.rendaMensalPessoa1Valor)} destaque theme={theme} />
                  </InfoGrid>
                </InfoMembro>

                {/* Pessoa 2 */}
                <InfoMembro theme={theme}>
                  <h3>
                    <User size={16} />
                    Pessoa 2 {usuario.pessoaQueLogou === "pessoa2" && <TypeBadge theme={theme} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>Você</TypeBadge>}
                  </h3>
                  <InfoGrid>
                    <InfoField label="Nome completo" value={dadosCasal.nomeCompletoPessoa2} theme={theme} />
                    <InfoField label="E-mail" value={dadosCasal.emailPessoa2} theme={theme} />
                    <InfoField label="CPF" value={dadosCasal.cpfPessoa2} theme={theme} />
                    <InfoField label="Data de nascimento" value={dadosCasal.dataNascimentoPessoa2} theme={theme} />
                    <InfoField label="Renda mensal" value={formatarMoeda(dadosCasal.rendaMensalPessoa2Valor)} destaque theme={theme} />
                  </InfoGrid>
                </InfoMembro>

                <RendaTotalCard theme={theme}>
                  <Label theme={theme}><DollarSign size={14} /> Renda familiar total</Label>
                  <Valor theme={theme}>{formatarMoeda(dadosCasal.RendaMensal)}</Valor>
                </RendaTotalCard>

                <DataCriacao theme={theme}>
                  <Clock size={13} /> Conta criada em {formatarDataCriacao(dadosCasal.createdAt)}
                </DataCriacao>
              </>
            ) : (
              /* Formulário Casal */
              <>
                <InfoMembro theme={theme}>
                  <h3><User size={16} /> Pessoa 1</h3>
                  <FormGroup>
                    <Label theme={theme}>Nome completo *</Label>
                    <Input type="text" name="nomeCompletoPessoa1" value={dadosCasal.nomeCompletoPessoa1} onChange={handleChangeCasal} theme={theme} />
                  </FormGroup>
                  <FormGroup>
                    <Label theme={theme}>E-mail</Label>
                    <Input type="email" value={dadosCasal.emailPessoa1} disabled className="disabled" theme={theme} />
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <Label theme={theme}>CPF</Label>
                      <Input type="text" name="cpfPessoa1" value={dadosCasal.cpfPessoa1} onChange={handleChangeCasal} placeholder="000.000.000-00" maxLength="14" disabled={usuario.pessoaQueLogou !== "pessoa1"} theme={theme} />
                    </FormGroup>
                    <FormGroup>
                      <Label theme={theme}>Data de nascimento</Label>
                      <Input type="text" name="dataNascimentoPessoa1" value={dadosCasal.dataNascimentoPessoa1} onChange={handleChangeCasal} placeholder="DD/MM/AAAA" maxLength="10" theme={theme} />
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <Label theme={theme}>Renda mensal</Label>
                    <Input type="text" name="rendaMensalPessoa1" value={dadosCasal.rendaMensalPessoa1} onChange={handleChangeCasal} placeholder="1.500,00" theme={theme} />
                  </FormGroup>
                </InfoMembro>

                <InfoMembro theme={theme}>
                  <h3><User size={16} /> Pessoa 2</h3>
                  <FormGroup>
                    <Label theme={theme}>Nome completo *</Label>
                    <Input type="text" name="nomeCompletoPessoa2" value={dadosCasal.nomeCompletoPessoa2} onChange={handleChangeCasal} theme={theme} />
                  </FormGroup>
                  <FormGroup>
                    <Label theme={theme}>E-mail</Label>
                    <Input type="email" value={dadosCasal.emailPessoa2} disabled className="disabled" theme={theme} />
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <Label theme={theme}>CPF</Label>
                      <Input type="text" name="cpfPessoa2" value={dadosCasal.cpfPessoa2} onChange={handleChangeCasal} placeholder="000.000.000-00" maxLength="14" disabled={usuario.pessoaQueLogou !== "pessoa2"} theme={theme} />
                    </FormGroup>
                    <FormGroup>
                      <Label theme={theme}>Data de nascimento</Label>
                      <Input type="text" name="dataNascimentoPessoa2" value={dadosCasal.dataNascimentoPessoa2} onChange={handleChangeCasal} placeholder="DD/MM/AAAA" maxLength="10" theme={theme} />
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <Label theme={theme}>Renda mensal</Label>
                    <Input type="text" name="rendaMensalPessoa2" value={dadosCasal.rendaMensalPessoa2} onChange={handleChangeCasal} placeholder="1.500,00" theme={theme} />
                  </FormGroup>
                </InfoMembro>

                <RendaTotalCard theme={theme}>
                  <Label theme={theme}>Renda familiar total</Label>
                  <Valor theme={theme}>{formatarMoeda(dadosCasal.RendaMensal)}</Valor>
                </RendaTotalCard>

                <FormActions theme={theme}>
                  <CancelarButton onClick={handleCancelar} disabled={loading} theme={theme}>Cancelar</CancelarButton>
                  <SalvarButton onClick={handleSalvarPerfil} disabled={loading} theme={theme}>
                    {loading ? "Salvando…" : "Salvar alterações"}
                  </SalvarButton>
                </FormActions>
              </>
            )
          ) : !editando ? (
            /* Visualização Individual */
            <>
              <InfoGrid>
                <InfoField label="Nome completo" value={dadosIndividual.nomeCompleto} theme={theme} />
                <InfoField label="E-mail" value={dadosIndividual.email} theme={theme} />
                <InfoField label="CPF" value={dadosIndividual.cpf} theme={theme} />
                <InfoField label="Data de nascimento" value={dadosIndividual.dataNascimento} theme={theme} />
                <InfoField label="Renda mensal" value={formatarMoeda(dadosIndividual.rendaMensal)} destaque theme={theme} />
              </InfoGrid>
              <DataCriacao theme={theme}>
                <Clock size={13} /> Conta criada em {formatarDataCriacao(dadosIndividual.createdAt)}
              </DataCriacao>
            </>
          ) : (
            /* Formulário Individual */
            <>
              <FormGroup>
                <Label theme={theme}>Nome completo *</Label>
                <Input type="text" name="nomeCompleto" value={dadosIndividual.nomeCompleto} onChange={handleChangeIndividual} theme={theme} />
              </FormGroup>
              <FormGroup>
                <Label theme={theme}>E-mail</Label>
                <Input type="email" value={dadosIndividual.email} disabled className="disabled" theme={theme} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label theme={theme}>CPF</Label>
                  <Input type="text" name="cpf" value={dadosIndividual.cpf} onChange={handleChangeIndividual} placeholder="000.000.000-00" maxLength="14" theme={theme} />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Data de nascimento</Label>
                  <Input type="text" name="dataNascimento" value={dadosIndividual.dataNascimento} onChange={handleChangeIndividual} placeholder="DD/MM/AAAA" maxLength="10" theme={theme} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label theme={theme}>Renda mensal</Label>
                <Input type="text" name="rendaMensal" value={dadosIndividual.rendaMensal} onChange={handleChangeIndividual} placeholder="1.500,00" theme={theme} />
              </FormGroup>
              <FormActions theme={theme}>
                <CancelarButton onClick={handleCancelar} disabled={loading} theme={theme}>Cancelar</CancelarButton>
                <SalvarButton onClick={handleSalvarPerfil} disabled={loading} theme={theme}>
                  {loading ? "Salvando…" : "Salvar alterações"}
                </SalvarButton>
              </FormActions>
            </>
          )}
        </InfoContainer>
      </PerfilCard>

      {/* ── Segurança ── */}
      {!editando && (
        <PerfilCard theme={theme}>
          <SectionTitle theme={theme}><Lock size={16} /> Segurança</SectionTitle>

          {!editandoSenha ? (
            <AlterarSenhaButton onClick={() => setEditandoSenha(true)} theme={theme}>
              <Shield size={16} /> Alterar senha
              <ChevronRight size={16} style={{ marginLeft: "auto" }} />
            </AlterarSenhaButton>
          ) : (
            <>
              <FormGroup>
                <Label theme={theme}>Senha atual</Label>
                <SenhaInput name="atual" value={senha.atual} onChange={e => setSenha(p => ({ ...p, atual: e.target.value }))} placeholder="••••••••" theme={theme} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label theme={theme}>Nova senha</Label>
                  <SenhaInput name="nova" value={senha.nova} onChange={e => setSenha(p => ({ ...p, nova: e.target.value }))} placeholder="••••••••" theme={theme} />
                  <Small theme={theme}>Mínimo 6 caracteres</Small>
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Confirmar nova senha</Label>
                  <SenhaInput name="confirmar" value={senha.confirmar} onChange={e => setSenha(p => ({ ...p, confirmar: e.target.value }))} placeholder="••••••••" theme={theme} />
                </FormGroup>
              </FormRow>
              <FormActions theme={theme}>
                <CancelarButton onClick={() => { setEditandoSenha(false); setSenha({ atual: "", nova: "", confirmar: "" }); }} disabled={loading} theme={theme}>
                  Cancelar
                </CancelarButton>
                <SalvarButton onClick={handleAlterarSenha} disabled={loading} theme={theme}>
                  {loading ? "Alterando…" : "Alterar senha"}
                </SalvarButton>
              </FormActions>
            </>
          )}
        </PerfilCard>
      )}

      {/* ── Zona de Perigo ── */}
      {!editando && !editandoSenha && (
        <PerfilCard theme={theme}>
          <SectionTitle theme={theme}><AlertCircle size={16} /> Zona de Perigo</SectionTitle>
          <AlterarSenhaButton $danger onClick={() => setMostrarModalExcluir(true)} theme={theme}>
            <Trash2 size={16} /> Excluir minha conta permanentemente
            <ChevronRight size={16} style={{ marginLeft: "auto" }} />
          </AlterarSenhaButton>
        </PerfilCard>
      )}

      {/* ── Modal Excluir ── */}
      {mostrarModalExcluir && (
        <Modal>
          <ModalContent theme={theme}>
            <ModalHeader theme={theme}>
              <h2>Excluir conta</h2>
              <FecharButton onClick={() => setMostrarModalExcluir(false)} theme={theme}>
                <X size={16} />
              </FecharButton>
            </ModalHeader>
            <ModalBody theme={theme}>
              <p>Tem certeza que deseja excluir sua conta?</p>
              <p className="warning">⚠️ Esta ação é permanente e não pode ser desfeita!</p>
            </ModalBody>
            <ModalFooter theme={theme}>
              <CancelarButton onClick={() => setMostrarModalExcluir(false)} theme={theme}>Cancelar</CancelarButton>
              <ConfirmarButton $danger onClick={handleExcluirConta} disabled={loading} theme={theme}>
                {loading ? "Excluindo…" : "Sim, excluir conta"}
              </ConfirmarButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </PerfilContainer>
  );
};

export default Perfil;
