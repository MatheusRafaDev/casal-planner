// Perfil.js
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import usuarioService from "../services/usuarioService";
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
  LoadingSpinner, LoadingContainer, DataCriacao, Divider,
  ToggleContainer, ToggleInfo, ToggleLabel, ToggleSwitch, ToggleKnob,
  SkeletonAvatar, SkeletonText, SkeletonLine, SkeletonCard, SkeletonBadge,
  Shimmer
} from "../styles/pages/PerfilStyles";

import { useScrollRestoration } from "../hooks/useScrollRestoration";

const InfoField = ({ label, value, icon: Icon, destaque, theme }) => (
  <InfoGroup>
    <Label theme={theme}>{label}</Label>
    <Valor theme={theme} className={destaque ? "destaque" : ""}>
      {value || <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>}
    </Valor>
  </InfoGroup>
);

const SenhaInput = ({ value, name, onChange, placeholder, theme }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%" }}>
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

// Componente de Skeleton para o Perfil
const PerfilSkeleton = ({ theme }) => {
  return (
    <PerfilContainer theme={theme}>
      <Header theme={theme}>
        <h1>Meu Perfil</h1>
      </Header>

      {/* Skeleton do Card Principal */}
      <SkeletonCard theme={theme}>
        <AvatarSection theme={theme}>
          <SkeletonAvatar theme={theme} />
          <UserInfo theme={theme}>
            <SkeletonText width="180px" height="24px" theme={theme} />
            <SkeletonText width="100px" height="16px" style={{ marginTop: "8px" }} theme={theme} />
            <SkeletonBadge theme={theme} />
          </UserInfo>
        </AvatarSection>

        <InfoContainer theme={theme}>
          <InfoGrid>
            {[...Array(5)].map((_, i) => (
              <InfoGroup key={i}>
                <SkeletonLine width="60px" height="12px" theme={theme} />
                <SkeletonLine width="140px" height="20px" theme={theme} />
              </InfoGroup>
            ))}
          </InfoGrid>
          <DataCriacao theme={theme}>
            <SkeletonLine width="160px" height="14px" theme={theme} />
          </DataCriacao>
        </InfoContainer>
      </SkeletonCard>

      {/* Skeleton do Card de Aparência */}
      <SkeletonCard theme={theme}>
        <SectionTitle theme={theme}>
          <SkeletonLine width="20px" height="18px" theme={theme} />
          <SkeletonLine width="80px" height="18px" theme={theme} />
        </SectionTitle>
        <ToggleContainer>
          <ToggleInfo>
            <SkeletonLine width="100px" height="20px" theme={theme} />
          </ToggleInfo>
          <SkeletonLine width="52px" height="28px" borderRadius="34px" theme={theme} />
        </ToggleContainer>
      </SkeletonCard>

      {/* Skeleton do Card de Segurança */}
      <SkeletonCard theme={theme}>
        <SectionTitle theme={theme}>
          <SkeletonLine width="20px" height="18px" theme={theme} />
          <SkeletonLine width="80px" height="18px" theme={theme} />
        </SectionTitle>
        <AlterarSenhaButton as="div" style={{ background: theme.hover, cursor: "default" }} theme={theme}>
          <SkeletonLine width="120px" height="16px" theme={theme} />
        </AlterarSenhaButton>
      </SkeletonCard>

      {/* Skeleton do Card de Zona de Perigo */}
      <SkeletonCard theme={theme}>
        <SectionTitle theme={theme}>
          <SkeletonLine width="20px" height="18px" theme={theme} />
          <SkeletonLine width="100px" height="18px" theme={theme} />
        </SectionTitle>
        <AlterarSenhaButton as="div" $danger style={{ background: `${theme.error}10`, cursor: "default" }} theme={theme}>
          <SkeletonLine width="200px" height="16px" theme={theme} />
        </AlterarSenhaButton>
      </SkeletonCard>
    </PerfilContainer>
  );
};

const Perfil = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { usuario, atualizarUsuario, recarregarUsuario, logout, isCasal, pessoaQueLogou, loading: authLoading } = useAuth();
  const { showConfirm } = useConfirm();

  const [editando, setEditando] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para skeleton

  const scrollRef = useScrollRestoration();

  const [meusDados, setMeusDados] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    dataNascimento: "",
    rendaMensal: "",
    rendaMensalValor: 0,
  });

  const [dadosParceiro, setDadosParceiro] = useState(null);
  const [senha, setSenha] = useState({ atual: "", nova: "", confirmar: "" });

  const pessoaLogada = pessoaQueLogou || "pessoa1";
  const isPessoa1 = pessoaLogada === "pessoa1";

  const showMsg = (msg, isErro = false) => {
    if (isErro) { setErro(msg); setTimeout(() => setErro(""), 4000); }
    else { setMensagem(msg); setTimeout(() => setMensagem(""), 4000); }
  };

  // Simular loading inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Tempo para mostrar o skeleton
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!usuario || isLoading) return;

    if (isCasal) {
      const casalInfo = usuario.casalInfo || {};
      
      if (isPessoa1) {
        setMeusDados({
          nomeCompleto: casalInfo.nomeCompletoPessoa1 || "",
          email: casalInfo.emailPessoa1 || usuario.email || "",
          cpf: casalInfo.cpfPessoa1 ? formatarCPF(casalInfo.cpfPessoa1) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa1),
          rendaMensal: casalInfo.rendaMensalPessoa1 ? formatarMoeda(casalInfo.rendaMensalPessoa1) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa1 || 0),
        });
        
        setDadosParceiro({
          nomeCompleto: casalInfo.nomeCompletoPessoa2 || "",
          email: casalInfo.emailPessoa2 || "",
          cpf: casalInfo.cpfPessoa2 ? formatarCPF(casalInfo.cpfPessoa2) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa2),
          rendaMensal: casalInfo.rendaMensalPessoa2 ? formatarMoeda(casalInfo.rendaMensalPessoa2) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa2 || 0),
        });
      } else {
        setMeusDados({
          nomeCompleto: casalInfo.nomeCompletoPessoa2 || "",
          email: casalInfo.emailPessoa2 || usuario.email || "",
          cpf: casalInfo.cpfPessoa2 ? formatarCPF(casalInfo.cpfPessoa2) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa2),
          rendaMensal: casalInfo.rendaMensalPessoa2 ? formatarMoeda(casalInfo.rendaMensalPessoa2) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa2 || 0),
        });
        
        setDadosParceiro({
          nomeCompleto: casalInfo.nomeCompletoPessoa1 || "",
          email: casalInfo.emailPessoa1 || "",
          cpf: casalInfo.cpfPessoa1 ? formatarCPF(casalInfo.cpfPessoa1) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa1),
          rendaMensal: casalInfo.rendaMensalPessoa1 ? formatarMoeda(casalInfo.rendaMensalPessoa1) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa1 || 0),
        });
      }
    } else {
      setMeusDados({
        nomeCompleto: usuario.nomeCompleto || "",
        email: usuario.email || "",
        cpf: usuario.cpf ? formatarCPF(usuario.cpf) : "",
        dataNascimento: formatarDataExibicao(usuario.dataNascimento),
        rendaMensal: usuario.rendaMensal ? formatarMoeda(usuario.rendaMensal) : "",
        rendaMensalValor: parseFloat(usuario.rendaMensal || 0),
      });
      setDadosParceiro(null);
    }
  }, [usuario, isCasal, isPessoa1, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cpf") {
      setMeusDados(prev => ({ ...prev, cpf: formatarCPF(value) }));
    } else if (name === "rendaMensal") {
      const fmt = formatarValorInput(value);
      setMeusDados(prev => ({ 
        ...prev, 
        rendaMensal: fmt, 
        rendaMensalValor: converterValorParaNumero(fmt) 
      }));
    } else if (name === "dataNascimento") {
      setMeusDados(prev => ({ ...prev, dataNascimento: formatarDataInput(value) }));
    } else {
      setMeusDados(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelar = () => {
    if (isCasal) {
      const casalInfo = usuario.casalInfo || {};
      if (isPessoa1) {
        setMeusDados({
          nomeCompleto: casalInfo.nomeCompletoPessoa1 || "",
          email: casalInfo.emailPessoa1 || usuario.email || "",
          cpf: casalInfo.cpfPessoa1 ? formatarCPF(casalInfo.cpfPessoa1) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa1),
          rendaMensal: casalInfo.rendaMensalPessoa1 ? formatarMoeda(casalInfo.rendaMensalPessoa1) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa1 || 0),
        });
      } else {
        setMeusDados({
          nomeCompleto: casalInfo.nomeCompletoPessoa2 || "",
          email: casalInfo.emailPessoa2 || usuario.email || "",
          cpf: casalInfo.cpfPessoa2 ? formatarCPF(casalInfo.cpfPessoa2) : "",
          dataNascimento: formatarDataExibicao(casalInfo.dataNascimentoPessoa2),
          rendaMensal: casalInfo.rendaMensalPessoa2 ? formatarMoeda(casalInfo.rendaMensalPessoa2) : "",
          rendaMensalValor: parseFloat(casalInfo.rendaMensalPessoa2 || 0),
        });
      }
    } else {
      setMeusDados({
        nomeCompleto: usuario.nomeCompleto || "",
        email: usuario.email || "",
        cpf: usuario.cpf ? formatarCPF(usuario.cpf) : "",
        dataNascimento: formatarDataExibicao(usuario.dataNascimento),
        rendaMensal: usuario.rendaMensal ? formatarMoeda(usuario.rendaMensal) : "",
        rendaMensalValor: parseFloat(usuario.rendaMensal || 0),
      });
    }
    
    setEditando(false);
    setErro("");
  };

  const validarDados = () => {
    if (!meusDados.nomeCompleto) { 
      showMsg("Nome completo é obrigatório", true); 
      return false; 
    }
    if (meusDados.cpf && !validarCPF(meusDados.cpf)) { 
      showMsg("CPF inválido", true); 
      return false; 
    }
    if (meusDados.dataNascimento && !validarData(meusDados.dataNascimento)) { 
      showMsg("Data de nascimento inválida", true); 
      return false; 
    }
    return true;
  };

  const handleSalvarPerfil = async () => {
    if (!validarDados()) return;
    
    setLoading(true);
    try {
      if (isCasal) {
        const dados = isPessoa1 ? {
          nomeCompletoPessoa1: meusDados.nomeCompleto,
          dataNascimentoPessoa1: meusDados.dataNascimento ? converterDataBRparaISO(meusDados.dataNascimento) : null,
          rendaMensalPessoa1: meusDados.rendaMensalValor || 0,
          cpfPessoa1: meusDados.cpf.replace(/\D/g, ""),
        } : {
          nomeCompletoPessoa2: meusDados.nomeCompleto,
          dataNascimentoPessoa2: meusDados.dataNascimento ? converterDataBRparaISO(meusDados.dataNascimento) : null,
          rendaMensalPessoa2: meusDados.rendaMensalValor || 0,
          cpfPessoa2: meusDados.cpf.replace(/\D/g, ""),
        };
        
        await usuarioService.atualizarPerfilCasal(usuario.id, dados);
        await recarregarUsuario();
      } else {
        const dados = {
          nomeCompleto: meusDados.nomeCompleto,
          dataNascimento: meusDados.dataNascimento ? converterDataBRparaISO(meusDados.dataNascimento) : null,
          rendaMensal: meusDados.rendaMensalValor || 0,
          cpf: meusDados.cpf.replace(/\D/g, ""),
        };
        
        await usuarioService.atualizarPerfil(usuario.id, dados);
        await recarregarUsuario();
      }
      
      showMsg("Perfil atualizado com sucesso! ✓");
      setEditando(false);
    } catch (error) {
      showMsg(error.response?.data?.message || "Erro ao atualizar perfil", true);
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
      await usuarioService.alterarSenha({ 
        email: meusDados.email, 
        senhaAtual: senha.atual, 
        novaSenha: senha.nova 
      });
      showMsg("Senha alterada com sucesso! ✓");
      setEditandoSenha(false);
      setSenha({ atual: "", nova: "", confirmar: "" });
    } catch (error) {
      showMsg(error.response?.data?.message || "Erro ao alterar senha", true);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirConta = () => {
    const mensagem = isCasal
      ? "⚠️ ATENÇÃO: Isso excluirá TODA a conta do casal, incluindo todos os dados de ambas as pessoas. Esta ação é PERMANENTE e não pode ser desfeita!"
      : "⚠️ ATENÇÃO: Esta ação é PERMANENTE e não pode ser desfeita! Todos os seus dados serão excluídos.";

    showConfirm({
      title: 'Excluir Conta Permanentemente',
      itemName: meusDados.nomeCompleto,
      itemType: 'conta',
      message: mensagem,
      isDanger: true,
      confirmText: 'Sim, excluir minha conta',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setLoading(true);
        try {
          await usuarioService.excluirConta(usuario.id);
          await logout();
        } catch (error) {
          showMsg(error.response?.data?.message || "Erro ao excluir conta", true);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const formatarDataCriacao = (data) => {
    if (!data) return "—";
    try {
      return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    } catch { return "—"; }
  };

  const getInitials = () => {
    if (!meusDados.nomeCompleto) return "?";
    const parts = meusDados.nomeCompleto.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Mostrar skeleton enquanto carrega
  if (isLoading || authLoading || !usuario) {
    return <PerfilSkeleton theme={theme} />;
  }

  return (
    <PerfilContainer theme={theme}>
      <Header theme={theme}>
        <h1>Meu Perfil</h1>
        {!editando && !editandoSenha && (
          <EditarButton $primary onClick={() => setEditando(true)} disabled={loading} theme={theme}>
            <Edit3 size={15} /> Editar
          </EditarButton>
        )}
      </Header>

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

      {/* Card Principal */}
      <PerfilCard theme={theme}>
        <AvatarSection theme={theme}>
          <Avatar>
            <AvatarPlaceholder theme={theme}>{getInitials()}</AvatarPlaceholder>
          </Avatar>
          <UserInfo theme={theme}>
            <h2>{meusDados.nomeCompleto || "Usuário"}</h2>
            <TypeBadge theme={theme}>
              {isCasal ? <><Heart size={11} /> Casal</> : <><User size={11} /> Individual</>}
            </TypeBadge>
          </UserInfo>
        </AvatarSection>

        <InfoContainer theme={theme}>
          {!editando ? (
            <>
              <InfoGrid>
                <InfoField label="Nome completo" value={meusDados.nomeCompleto} theme={theme} />
                <InfoField label="E-mail" value={meusDados.email} theme={theme} />
                <InfoField label="CPF" value={meusDados.cpf} theme={theme} />
                <InfoField label="Data de nascimento" value={meusDados.dataNascimento} theme={theme} />
                <InfoField label="Renda mensal" value={formatarMoeda(meusDados.rendaMensalValor)} destaque theme={theme} />
              </InfoGrid>

              {isCasal && dadosParceiro && (
                <>
                  <Divider theme={theme} />
                  <InfoMembro theme={theme}>
                    <h3>
                      <User size={16} />
                      {isPessoa1 ? "Pessoa 2 (Parceiro)" : "Pessoa 1 (Parceiro)"}
                      <TypeBadge theme={theme} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", marginLeft: "0.5rem" }}>
                        Apenas leitura
                      </TypeBadge>
                    </h3>
                    <InfoGrid>
                      <InfoField label="Nome completo" value={dadosParceiro.nomeCompleto} theme={theme} />
                      <InfoField label="E-mail" value={dadosParceiro.email} theme={theme} />
                      <InfoField label="CPF" value={dadosParceiro.cpf} theme={theme} />
                      <InfoField label="Data de nascimento" value={dadosParceiro.dataNascimento} theme={theme} />
                      <InfoField label="Renda mensal" value={formatarMoeda(dadosParceiro.rendaMensalValor)} destaque theme={theme} />
                    </InfoGrid>
                  </InfoMembro>
                  
                  <RendaTotalCard theme={theme}>
                    <Label theme={theme}><DollarSign size={14} /> Renda familiar total</Label>
                    <Valor theme={theme}>
                      {formatarMoeda(meusDados.rendaMensalValor + (dadosParceiro?.rendaMensalValor || 0))}
                    </Valor>
                  </RendaTotalCard>
                </>
              )}

              <DataCriacao theme={theme}>
                <Clock size={13} /> Conta criada em {formatarDataCriacao(usuario.createdAt)}
              </DataCriacao>
            </>
          ) : (
            <>
              <FormGroup>
                <Label theme={theme}>Nome completo *</Label>
                <Input 
                  type="text" 
                  name="nomeCompleto" 
                  value={meusDados.nomeCompleto} 
                  onChange={handleChange} 
                  theme={theme} 
                />
              </FormGroup>
              
              <FormGroup>
                <Label theme={theme}>E-mail</Label>
                <Input 
                  type="email" 
                  value={meusDados.email} 
                  theme={theme} 
                  disabled
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <Label theme={theme}>CPF</Label>
                  <Input 
                    type="text" 
                    name="cpf" 
                    value={meusDados.cpf} 
                    onChange={handleChange} 
                    placeholder="000.000.000-00" 
                    maxLength="14" 
                    theme={theme} 
                  />
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Data de nascimento</Label>
                  <Input 
                    type="text" 
                    name="dataNascimento" 
                    value={meusDados.dataNascimento} 
                    onChange={handleChange} 
                    placeholder="DD/MM/AAAA" 
                    maxLength="10" 
                    theme={theme} 
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <Label theme={theme}>Renda mensal</Label>
                <Input 
                  type="text" 
                  name="rendaMensal" 
                  value={meusDados.rendaMensal} 
                  onChange={handleChange} 
                  placeholder="R$ 1.500,00" 
                  theme={theme} 
                />
              </FormGroup>
              
              <FormActions theme={theme}>
                <CancelarButton onClick={handleCancelar} disabled={loading} theme={theme}>
                  Cancelar
                </CancelarButton>
                <SalvarButton onClick={handleSalvarPerfil} disabled={loading} theme={theme}>
                  {loading ? "Salvando…" : "Salvar alterações"}
                </SalvarButton>
              </FormActions>
            </>
          )}
        </InfoContainer>
      </PerfilCard>

      {/* Aparência - Versão com Toggle Switch */}
      {!editando && !editandoSenha && (
        <PerfilCard theme={theme}>
          <SectionTitle theme={theme}>
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />} 
            Aparência
          </SectionTitle>
          
          <ToggleContainer>
            <ToggleInfo>
              <ToggleLabel theme={theme}>
                {isDarkMode ? 'Modo escuro' : 'Modo claro'}
              </ToggleLabel>
            </ToggleInfo>
            
            <ToggleSwitch
              onClick={toggleTheme}
              $isDark={isDarkMode}
              aria-label={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              <ToggleKnob $isDark={isDarkMode}>
                {isDarkMode ? (
                  <Moon size={12} color="#4a5568" />
                ) : (
                  <Sun size={12} color="#f59e0b" />
                )}
              </ToggleKnob>
            </ToggleSwitch>
          </ToggleContainer>
        </PerfilCard>
      )}

      {/* Segurança */}
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
                <SenhaInput 
                  name="atual" 
                  value={senha.atual} 
                  onChange={e => setSenha(p => ({ ...p, atual: e.target.value }))} 
                  placeholder="••••••••" 
                  theme={theme} 
                />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label theme={theme}>Nova senha</Label>
                  <SenhaInput 
                    name="nova" 
                    value={senha.nova} 
                    onChange={e => setSenha(p => ({ ...p, nova: e.target.value }))} 
                    placeholder="••••••••" 
                    theme={theme} 
                  />
                  <Small theme={theme}>Mínimo 6 caracteres</Small>
                </FormGroup>
                <FormGroup>
                  <Label theme={theme}>Confirmar nova senha</Label>
                  <SenhaInput 
                    name="confirmar" 
                    value={senha.confirmar} 
                    onChange={e => setSenha(p => ({ ...p, confirmar: e.target.value }))} 
                    placeholder="••••••••" 
                    theme={theme} 
                  />
                </FormGroup>
              </FormRow>
              <FormActions theme={theme}>
                <CancelarButton 
                  onClick={() => { 
                    setEditandoSenha(false); 
                    setSenha({ atual: "", nova: "", confirmar: "" }); 
                  }} 
                  disabled={loading} 
                  theme={theme}
                >
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

      {/* Zona de Perigo */}
      {!editando && !editandoSenha && (
        <PerfilCard theme={theme}>
          <SectionTitle theme={theme}><AlertCircle size={16} /> Zona de Perigo</SectionTitle>
          <AlterarSenhaButton $danger onClick={handleExcluirConta} theme={theme}>
            <Trash2 size={16} /> Excluir minha conta permanentemente
            <ChevronRight size={16} style={{ marginLeft: "auto" }} />
          </AlterarSenhaButton>
        </PerfilCard>
      )}
    </PerfilContainer>
  );
};

export default Perfil;