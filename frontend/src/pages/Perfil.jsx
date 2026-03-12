
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  PerfilContainer,
  Header,
  EditarButton,
  MensagemSucesso,
  MensagemErro,
  PerfilCard,
  Avatar,
  AvatarPlaceholder,
  InfoContainer,
  InfoGroup,
  InfoRow,
  Label,
  Valor,
  FormGroup,
  FormRow,
  Input,
  Small,
  FormActions,
  CancelarButton,
  SalvarButton,
  SectionTitle,
  AlterarSenhaButton,
  InfoMembro,
  LoadingSpinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FecharButton,
  ConfirmarButton,
  Select
} from '../styles/pages/PerfilStyles';

const Perfil = () => {
  const { theme, toggleTheme } = useTheme();
  const { usuario, atualizarUsuario, logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [editandoPreferencias, setEditandoPreferencias] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);

  // Estado para casal
  const [dadosCasal, setDadosCasal] = useState({
    nomeCompletoPessoa1: '',
    emailPessoa1: '',
    cpfPessoa1: '',
    dataNascimentoPessoa1: '',
    telefonePessoa1: '',
    rendaMensalPessoa1: '',
    nomeCompletoPessoa2: '',
    emailPessoa2: '',
    cpfPessoa2: '',
    dataNascimentoPessoa2: '',
    telefonePessoa2: '',
    rendaMensalPessoa2: '',
    dataCasamento: ''
  });

  // Estado para individual
  const [dadosIndividual, setDadosIndividual] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    rendaMensal: ''
  });

  // Estado para preferências
  const [preferencias, setPreferencias] = useState({
    modoEscuro: false,
    moeda: 'BRL',
    idioma: 'pt-BR',
    notificacoesEmail: true,
    corPrimaria: '#27ae60'
  });

  // Estado para senha
  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });

  // Carregar dados do usuário
  useEffect(() => {
    if (usuario) {
      setCarregandoDados(true);
      
      // Se for casal
      if (usuario.isCasal || usuario.tipoConta === 'Casal') {
        const casalInfo = usuario.casalInfo || {};
        setDadosCasal({
          nomeCompletoPessoa1: casalInfo.nomeCompletoPessoa1 || '',
          emailPessoa1: casalInfo.emailPessoa1 || '',
          cpfPessoa1: casalInfo.cpfPessoa1 || '',
          dataNascimentoPessoa1: casalInfo.dataNascimentoPessoa1 ? 
            new Date(casalInfo.dataNascimentoPessoa1).toISOString().split('T')[0] : '',
          telefonePessoa1: casalInfo.telefonePessoa1 || '',
          rendaMensalPessoa1: casalInfo.rendaMensalPessoa1 || '',
          nomeCompletoPessoa2: casalInfo.nomeCompletoPessoa2 || '',
          emailPessoa2: casalInfo.emailPessoa2 || '',
          cpfPessoa2: casalInfo.cpfPessoa2 || '',
          dataNascimentoPessoa2: casalInfo.dataNascimentoPessoa2 ? 
            new Date(casalInfo.dataNascimentoPessoa2).toISOString().split('T')[0] : '',
          telefonePessoa2: casalInfo.telefonePessoa2 || '',
          rendaMensalPessoa2: casalInfo.rendaMensalPessoa2 || '',
          dataCasamento: casalInfo.dataCasamento ? 
            new Date(casalInfo.dataCasamento).toISOString().split('T')[0] : ''
        });
      } 
      // Se for individual
      else {
        setDadosIndividual({
          nomeCompleto: usuario.nomeCompleto || '',
          email: usuario.email || '',
          cpf: usuario.cpf || '',
          dataNascimento: usuario.dataNascimento ? 
            new Date(usuario.dataNascimento).toISOString().split('T')[0] : '',
          telefone: usuario.telefone || '',
          rendaMensal: usuario.rendaMensal || ''
        });
      }

      // Preferências
      if (usuario.preferencias) {
        setPreferencias({
          modoEscuro: usuario.preferencias.modoEscuro ?? false,
          moeda: usuario.preferencias.moeda || 'BRL',
          idioma: usuario.preferencias.idioma || 'pt-BR',
          notificacoesEmail: usuario.preferencias.notificacoesEmail ?? true,
          corPrimaria: usuario.preferencias.corPrimaria || '#27ae60'
        });
      }

      setCarregandoDados(false);
    }
  }, [usuario]);

  const handleChangeCasal = (e) => {
    const { name, value } = e.target;
    setDadosCasal(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeIndividual = (e) => {
    const { name, value } = e.target;
    setDadosIndividual(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenciasChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferencias(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenha(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarPerfil = async () => {
    setLoading(true);
    setErro('');
    
    try {
      const isCasal = usuario.isCasal || usuario.tipoConta === 'Casal';
      let response;

      if (isCasal) {
        // Validações para casal
        if (!dadosCasal.nomeCompletoPessoa1) {
          throw new Error('Nome da primeira pessoa é obrigatório');
        }
        if (!dadosCasal.nomeCompletoPessoa2) {
          throw new Error('Nome da segunda pessoa é obrigatório');
        }

        const dadosAtualizados = {
          nomeCompletoPessoa1: dadosCasal.nomeCompletoPessoa1,
          telefonePessoa1: dadosCasal.telefonePessoa1 || null,
          dataNascimentoPessoa1: dadosCasal.dataNascimentoPessoa1 || null,
          rendaMensalPessoa1: dadosCasal.rendaMensalPessoa1 ? 
            parseFloat(dadosCasal.rendaMensalPessoa1) : null,
          nomeCompletoPessoa2: dadosCasal.nomeCompletoPessoa2,
          telefonePessoa2: dadosCasal.telefonePessoa2 || null,
          dataNascimentoPessoa2: dadosCasal.dataNascimentoPessoa2 || null,
          rendaMensalPessoa2: dadosCasal.rendaMensalPessoa2 ? 
            parseFloat(dadosCasal.rendaMensalPessoa2) : null,
          dataCasamento: dadosCasal.dataCasamento || null
        };

        response = await authService.atualizarPerfilCasal(usuario.id, dadosAtualizados);
        
        // Atualizar estado local
        const usuarioAtualizado = {
          ...usuario,
          casalInfo: {
            ...usuario.casalInfo,
            ...dadosAtualizados
          }
        };
        atualizarUsuario(usuarioAtualizado);
      } else {
        // Validações para individual
        if (!dadosIndividual.nomeCompleto) {
          throw new Error('Nome completo é obrigatório');
        }

        const dadosAtualizados = {
          nomeCompleto: dadosIndividual.nomeCompleto,
          telefone: dadosIndividual.telefone || null,
          dataNascimento: dadosIndividual.dataNascimento || null,
          rendaMensal: dadosIndividual.rendaMensal ? 
            parseFloat(dadosIndividual.rendaMensal) : null
        };

        response = await authService.atualizarPerfil(usuario.id, dadosAtualizados);
        
        // Atualizar estado local
        const usuarioAtualizado = {
          ...usuario,
          ...dadosAtualizados
        };
        atualizarUsuario(usuarioAtualizado);
      }

      setMensagem('Perfil atualizado com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
      setEditando(false);
    } catch (error) {
      setErro(error.response?.data?.message || error.message || 'Erro ao atualizar perfil');
      setTimeout(() => setErro(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarPreferencias = async () => {
    setLoading(true);
    
    try {
      await authService.atualizarPreferencias(usuario.id, preferencias);
      
      // Atualizar tema se necessário
      if (preferencias.modoEscuro !== theme.modoEscuro) {
        toggleTheme();
      }

      const usuarioAtualizado = {
        ...usuario,
        preferencias: preferencias
      };
      
      atualizarUsuario(usuarioAtualizado);

      setMensagem('Preferências atualizadas com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
      setEditandoPreferencias(false);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar preferências');
      setTimeout(() => setErro(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!senha.atual) {
      setErro('Digite a senha atual');
      setTimeout(() => setErro(''), 3000);
      return;
    }

    if (senha.nova.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres');
      setTimeout(() => setErro(''), 3000);
      return;
    }

    if (senha.nova !== senha.confirmar) {
      setErro('As senhas não coincidem');
      setTimeout(() => setErro(''), 3000);
      return;
    }

    setLoading(true);
    
    try {
      let email;
      if (usuario.isCasal || usuario.tipoConta === 'Casal') {
        email = usuario.pessoaQueLogou === 'pessoa1' 
          ? usuario.casalInfo.emailPessoa1 
          : usuario.casalInfo.emailPessoa2;
      } else {
        email = usuario.email;
      }

      await authService.alterarSenha({
        email: email,
        senhaAtual: senha.atual,
        novaSenha: senha.nova
      });

      setMensagem('Senha alterada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
      setEditandoSenha(false);
      setSenha({ atual: '', nova: '', confirmar: '' });
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao alterar senha');
      setTimeout(() => setErro(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirConta = async () => {
    setLoading(true);
    
    try {
      await authService.excluirConta(usuario.id);
      await logout();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao excluir conta');
      setTimeout(() => setErro(''), 3000);
      setMostrarModalExcluir(false);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return 'R$ 0,00';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? 'R$ 0,00' : `R$ ${num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (carregandoDados) {
    return (
      <PerfilContainer>
        <LoadingSpinner />
      </PerfilContainer>
    );
  }

  if (!usuario) {
    return (
      <PerfilContainer>
        <div>Usuário não encontrado. Faça login novamente.</div>
      </PerfilContainer>
    );
  }

  const isCasal = usuario.isCasal || usuario.tipoConta === 'Casal';

  return (
    <PerfilContainer>
      <Header>
        <h1>👤 Meu Perfil</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!editando && !editandoPreferencias && (
            <EditarButton onClick={() => setEditandoPreferencias(true)} disabled={loading}>
              ⚙️ Preferências
            </EditarButton>
          )}
          {!editando && !editandoPreferencias && (
            <EditarButton onClick={() => setEditando(true)} disabled={loading}>
              ✏️ Editar Perfil
            </EditarButton>
          )}
        </div>
      </Header>

      {mensagem && <MensagemSucesso>{mensagem}</MensagemSucesso>}
      {erro && <MensagemErro>{erro}</MensagemErro>}

      {/* PREFERÊNCIAS */}
      {editandoPreferencias && (
        <PerfilCard>
          <SectionTitle>⚙️ Preferências</SectionTitle>
          
          <InfoContainer>
            <FormGroup>
              <Label>Modo Escuro</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="modoEscuro"
                  checked={preferencias.modoEscuro}
                  onChange={handlePreferenciasChange}
                />
                <span>Ativar modo escuro</span>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Moeda</Label>
              <Select
                name="moeda"
                value={preferencias.moeda}
                onChange={handlePreferenciasChange}
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar ($)</option>
                <option value="EUR">Euro (€)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Idioma</Label>
              <Select
                name="idioma"
                value={preferencias.idioma}
                onChange={handlePreferenciasChange}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es">Español</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Notificações por Email</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="notificacoesEmail"
                  checked={preferencias.notificacoesEmail}
                  onChange={handlePreferenciasChange}
                />
                <span>Receber notificações por email</span>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Cor Primária</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  name="corPrimaria"
                  value={preferencias.corPrimaria}
                  onChange={handlePreferenciasChange}
                />
                <span>Cor principal da aplicação</span>
              </div>
            </FormGroup>

            <FormActions>
              <CancelarButton 
                onClick={() => setEditandoPreferencias(false)} 
                disabled={loading}
              >
                Cancelar
              </CancelarButton>
              <SalvarButton 
                onClick={handleSalvarPreferencias} 
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar preferências'}
              </SalvarButton>
            </FormActions>
          </InfoContainer>
        </PerfilCard>
      )}

      {/* PERFIL */}
      {!editandoPreferencias && (
        <PerfilCard>
          <Avatar>
            <AvatarPlaceholder>
              {isCasal 
                ? (usuario.pessoaQueLogou === 'pessoa1' 
                    ? dadosCasal.nomeCompletoPessoa1?.charAt(0) 
                    : dadosCasal.nomeCompletoPessoa2?.charAt(0)) || '👤'
                : dadosIndividual.nomeCompleto?.charAt(0) || '👤'}
            </AvatarPlaceholder>
          </Avatar>

          <InfoContainer>
            {isCasal ? (
              // VISUALIZAÇÃO CASAL
              !editando ? (
                <>
                  <InfoMembro>
                    <h3>👤 Pessoa 1 {usuario.pessoaQueLogou === 'pessoa1' && '(Você)'}</h3>
                    <InfoGroup>
                      <Label>Nome completo</Label>
                      <Valor>{dadosCasal.nomeCompletoPessoa1 || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>Email</Label>
                      <Valor>{dadosCasal.emailPessoa1 || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoRow>
                      <InfoGroup $half>
                        <Label>CPF</Label>
                        <Valor>{dadosCasal.cpfPessoa1 || 'Não informado'}</Valor>
                      </InfoGroup>
                      <InfoGroup $half>
                        <Label>Data nascimento</Label>
                        <Valor>{formatarData(dadosCasal.dataNascimentoPessoa1)}</Valor>
                      </InfoGroup>
                    </InfoRow>
                    <InfoRow>
                      <InfoGroup $half>
                        <Label>Telefone</Label>
                        <Valor>{dadosCasal.telefonePessoa1 || 'Não informado'}</Valor>
                      </InfoGroup>
                      <InfoGroup $half>
                        <Label>Renda mensal</Label>
                        <Valor>{formatarMoeda(dadosCasal.rendaMensalPessoa1)}</Valor>
                      </InfoGroup>
                    </InfoRow>
                  </InfoMembro>

                  <InfoMembro>
                    <h3>👤 Pessoa 2 {usuario.pessoaQueLogou === 'pessoa2' && '(Você)'}</h3>
                    <InfoGroup>
                      <Label>Nome completo</Label>
                      <Valor>{dadosCasal.nomeCompletoPessoa2 || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>Email</Label>
                      <Valor>{dadosCasal.emailPessoa2 || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoRow>
                      <InfoGroup $half>
                        <Label>CPF</Label>
                        <Valor>{dadosCasal.cpfPessoa2 || 'Não informado'}</Valor>
                      </InfoGroup>
                      <InfoGroup $half>
                        <Label>Data nascimento</Label>
                        <Valor>{formatarData(dadosCasal.dataNascimentoPessoa2)}</Valor>
                      </InfoGroup>
                    </InfoRow>
                    <InfoRow>
                      <InfoGroup $half>
                        <Label>Telefone</Label>
                        <Valor>{dadosCasal.telefonePessoa2 || 'Não informado'}</Valor>
                      </InfoGroup>
                      <InfoGroup $half>
                        <Label>Renda mensal</Label>
                        <Valor>{formatarMoeda(dadosCasal.rendaMensalPessoa2)}</Valor>
                      </InfoGroup>
                    </InfoRow>
                  </InfoMembro>

                  <InfoGroup>
                    <Label>Data de casamento</Label>
                    <Valor>{formatarData(dadosCasal.dataCasamento)}</Valor>
                  </InfoGroup>
                </>
              ) : (
                // EDIÇÃO CASAL
                <>
                  <h3>👤 Pessoa 1</h3>
                  <FormGroup>
                    <Label>Nome completo *</Label>
                    <Input
                      type="text"
                      name="nomeCompletoPessoa1"
                      value={dadosCasal.nomeCompletoPessoa1}
                      onChange={handleChangeCasal}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={dadosCasal.emailPessoa1}
                      disabled
                      className="disabled"
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup $half>
                      <Label>CPF</Label>
                      <Input
                        type="text"
                        value={dadosCasal.cpfPessoa1}
                        disabled
                        className="disabled"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Data nascimento</Label>
                      <Input
                        type="date"
                        name="dataNascimentoPessoa1"
                        value={dadosCasal.dataNascimentoPessoa1}
                        onChange={handleChangeCasal}
                      />
                    </FormGroup>
                  </FormRow>
                  <FormRow>
                    <FormGroup $half>
                      <Label>Telefone</Label>
                      <Input
                        type="text"
                        name="telefonePessoa1"
                        value={dadosCasal.telefonePessoa1}
                        onChange={handleChangeCasal}
                        placeholder="(11) 99999-9999"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Renda mensal</Label>
                      <Input
                        type="number"
                        name="rendaMensalPessoa1"
                        value={dadosCasal.rendaMensalPessoa1}
                        onChange={handleChangeCasal}
                        step="0.01"
                        placeholder="0,00"
                      />
                    </FormGroup>
                  </FormRow>

                  <h3 style={{ marginTop: '30px' }}>👤 Pessoa 2</h3>
                  <FormGroup>
                    <Label>Nome completo *</Label>
                    <Input
                      type="text"
                      name="nomeCompletoPessoa2"
                      value={dadosCasal.nomeCompletoPessoa2}
                      onChange={handleChangeCasal}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={dadosCasal.emailPessoa2}
                      disabled
                      className="disabled"
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup $half>
                      <Label>CPF</Label>
                      <Input
                        type="text"
                        value={dadosCasal.cpfPessoa2}
                        disabled
                        className="disabled"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Data nascimento</Label>
                      <Input
                        type="date"
                        name="dataNascimentoPessoa2"
                        value={dadosCasal.dataNascimentoPessoa2}
                        onChange={handleChangeCasal}
                      />
                    </FormGroup>
                  </FormRow>
                  <FormRow>
                    <FormGroup $half>
                      <Label>Telefone</Label>
                      <Input
                        type="text"
                        name="telefonePessoa2"
                        value={dadosCasal.telefonePessoa2}
                        onChange={handleChangeCasal}
                        placeholder="(11) 99999-9999"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Renda mensal</Label>
                      <Input
                        type="number"
                        name="rendaMensalPessoa2"
                        value={dadosCasal.rendaMensalPessoa2}
                        onChange={handleChangeCasal}
                        step="0.01"
                        placeholder="0,00"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label>Data de casamento</Label>
                    <Input
                      type="date"
                      name="dataCasamento"
                      value={dadosCasal.dataCasamento}
                      onChange={handleChangeCasal}
                    />
                  </FormGroup>

                  <FormActions>
                    <CancelarButton onClick={() => setEditando(false)} disabled={loading}>
                      Cancelar
                    </CancelarButton>
                    <SalvarButton onClick={handleSalvarPerfil} disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </SalvarButton>
                  </FormActions>
                </>
              )
            ) : (
              // VISUALIZAÇÃO INDIVIDUAL
              !editando ? (
                <>
                  <InfoGroup>
                    <Label>Nome completo</Label>
                    <Valor>{dadosIndividual.nomeCompleto || 'Não informado'}</Valor>
                  </InfoGroup>
                  <InfoGroup>
                    <Label>Email</Label>
                    <Valor>{dadosIndividual.email || 'Não informado'}</Valor>
                  </InfoGroup>
                  <InfoRow>
                    <InfoGroup $half>
                      <Label>CPF</Label>
                      <Valor>{dadosIndividual.cpf || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoGroup $half>
                      <Label>Data nascimento</Label>
                      <Valor>{formatarData(dadosIndividual.dataNascimento)}</Valor>
                    </InfoGroup>
                  </InfoRow>
                  <InfoRow>
                    <InfoGroup $half>
                      <Label>Telefone</Label>
                      <Valor>{dadosIndividual.telefone || 'Não informado'}</Valor>
                    </InfoGroup>
                    <InfoGroup $half>
                      <Label>Renda mensal</Label>
                      <Valor>{formatarMoeda(dadosIndividual.rendaMensal)}</Valor>
                    </InfoGroup>
                  </InfoRow>
                </>
              ) : (
                // EDIÇÃO INDIVIDUAL
                <>
                  <FormGroup>
                    <Label>Nome completo *</Label>
                    <Input
                      type="text"
                      name="nomeCompleto"
                      value={dadosIndividual.nomeCompleto}
                      onChange={handleChangeIndividual}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={dadosIndividual.email}
                      disabled
                      className="disabled"
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup $half>
                      <Label>CPF</Label>
                      <Input
                        type="text"
                        value={dadosIndividual.cpf}
                        disabled
                        className="disabled"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Data nascimento</Label>
                      <Input
                        type="date"
                        name="dataNascimento"
                        value={dadosIndividual.dataNascimento}
                        onChange={handleChangeIndividual}
                      />
                    </FormGroup>
                  </FormRow>
                  <FormRow>
                    <FormGroup $half>
                      <Label>Telefone</Label>
                      <Input
                        type="text"
                        name="telefone"
                        value={dadosIndividual.telefone}
                        onChange={handleChangeIndividual}
                        placeholder="(11) 99999-9999"
                      />
                    </FormGroup>
                    <FormGroup $half>
                      <Label>Renda mensal</Label>
                      <Input
                        type="number"
                        name="rendaMensal"
                        value={dadosIndividual.rendaMensal}
                        onChange={handleChangeIndividual}
                        step="0.01"
                        placeholder="0,00"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormActions>
                    <CancelarButton onClick={() => setEditando(false)} disabled={loading}>
                      Cancelar
                    </CancelarButton>
                    <SalvarButton onClick={handleSalvarPerfil} disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </SalvarButton>
                  </FormActions>
                </>
              )
            )}
          </InfoContainer>
        </PerfilCard>
      )}

      {/* SEGURANÇA */}
      {!editando && !editandoPreferencias && (
        <PerfilCard>
          <SectionTitle>🔒 Segurança</SectionTitle>
          
          {!editandoSenha ? (
            <AlterarSenhaButton onClick={() => setEditandoSenha(true)}>
              🔑 Alterar Senha
            </AlterarSenhaButton>
          ) : (
            <InfoContainer>
              <FormGroup>
                <Label>Senha atual</Label>
                <Input
                  type="password"
                  name="atual"
                  value={senha.atual}
                  onChange={handleSenhaChange}
                  placeholder="••••••••"
                />
              </FormGroup>
              <FormGroup>
                <Label>Nova senha</Label>
                <Input
                  type="password"
                  name="nova"
                  value={senha.nova}
                  onChange={handleSenhaChange}
                  placeholder="••••••••"
                />
                <Small>Mínimo de 6 caracteres</Small>
              </FormGroup>
              <FormGroup>
                <Label>Confirmar nova senha</Label>
                <Input
                  type="password"
                  name="confirmar"
                  value={senha.confirmar}
                  onChange={handleSenhaChange}
                  placeholder="••••••••"
                />
              </FormGroup>
              <FormActions>
                <CancelarButton 
                  onClick={() => {
                    setEditandoSenha(false);
                    setSenha({ atual: '', nova: '', confirmar: '' });
                  }} 
                  disabled={loading}
                >
                  Cancelar
                </CancelarButton>
                <SalvarButton onClick={handleAlterarSenha} disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar senha'}
                </SalvarButton>
              </FormActions>
            </InfoContainer>
          )}
        </PerfilCard>
      )}

      {/* ZONA DE PERIGO */}
      {!editando && !editandoPreferencias && !editandoSenha && (
        <PerfilCard>
          <SectionTitle>⚠️ Zona de Perigo</SectionTitle>
          <AlterarSenhaButton danger onClick={() => setMostrarModalExcluir(true)}>
            🗑️ Excluir Conta
          </AlterarSenhaButton>
        </PerfilCard>
      )}

      {mostrarModalExcluir && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>Excluir Conta</h2>
              <FecharButton onClick={() => setMostrarModalExcluir(false)}>×</FecharButton>
            </ModalHeader>
            <ModalBody>
              <p>Tem certeza que deseja excluir sua conta?</p>
              <p style={{ color: '#f44336', fontWeight: 'bold' }}>
                Esta ação é permanente e não pode ser desfeita!
              </p>
              <p>Todos os seus dados serão removidos permanentemente.</p>
            </ModalBody>
            <ModalFooter>
              <CancelarButton onClick={() => setMostrarModalExcluir(false)}>
                Cancelar
              </CancelarButton>
              <ConfirmarButton onClick={handleExcluirConta} disabled={loading}>
                {loading ? 'Excluindo...' : 'Sim, excluir minha conta'}
              </ConfirmarButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </PerfilContainer>
  );
};

export default Perfil;