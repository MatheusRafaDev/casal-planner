import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// Import das funções de formatação
import {
  formatarMoeda,
  formatarValorInput,
  formatarCPF,
  formatarDataInput,
  converterDataBRparaISO,
  validarData,
  validarCPF,
  formatarDataExibicao,
  converterValorParaNumero
} from '../utils/formatters';

// Import dos estilos
import {
  PerfilContainer,
  Header,
  EditarButton,
  MensagemSucesso,
  MensagemErro,
  PerfilCard,
  AvatarSection,
  Avatar,
  AvatarPlaceholder,
  UserInfo,
  InfoContainer,
  InfoMembro,
  InfoRow,
  InfoGroup,
  Label,
  Valor,
  RendaTotalCard,
  FormGroup,
  FormRow,
  Input,
  Small,
  FormActions,
  CancelarButton,
  SalvarButton,
  SectionTitle,
  AlterarSenhaButton,
  LoadingSpinner,
  LoadingContainer,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FecharButton,
  ConfirmarButton,
  DataCriacao,
  Divider
} from '../styles/pages/PerfilStyles';

const Perfil = () => {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
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
    rendaMensalPessoa1: '',
    rendaMensalPessoa1Valor: 0,
    nomeCompletoPessoa2: '',
    emailPessoa2: '',
    cpfPessoa2: '',
    dataNascimentoPessoa2: '',
    rendaMensalPessoa2: '',
    rendaMensalPessoa2Valor: 0,
    RendaMensal: 0,
    createdAt: ''
  });

  // Estado para individual
  const [dadosIndividual, setDadosIndividual] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    rendaMensal: '',
    rendaMensalValor: 0
  });

  // Estado para senha
  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });

  // ========== FUNÇÕES DE HANDLE ==========

  const handleChangeCasal = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('cpf')) {
      setDadosCasal(prev => ({ ...prev, [name]: formatarCPF(value) }));
    } else if (name.includes('rendaMensal')) {
      const valorFormatado = formatarValorInput(value);
      const valorNumerico = converterValorParaNumero(valorFormatado);
      
      setDadosCasal(prev => {
        const novosDados = { ...prev, [name]: valorFormatado };
        
        if (name === 'rendaMensalPessoa1') {
          novosDados.rendaMensalPessoa1Valor = valorNumerico;
        } else if (name === 'rendaMensalPessoa2') {
          novosDados.rendaMensalPessoa2Valor = valorNumerico;
        }
        
        novosDados.RendaMensal = novosDados.rendaMensalPessoa1Valor + novosDados.rendaMensalPessoa2Valor;
        
        return novosDados;
      });
    } else if (name.includes('dataNascimento')) {
      setDadosCasal(prev => ({ ...prev, [name]: formatarDataInput(value) }));
    } else {
      setDadosCasal(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeIndividual = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('cpf')) {
      setDadosIndividual(prev => ({ ...prev, [name]: formatarCPF(value) }));
    } else if (name.includes('rendaMensal')) {
      const valorFormatado = formatarValorInput(value);
      const valorNumerico = converterValorParaNumero(valorFormatado);
      
      setDadosIndividual(prev => ({ 
        ...prev, 
        [name]: valorFormatado,
        rendaMensalValor: valorNumerico 
      }));
    } else if (name.includes('dataNascimento')) {
      setDadosIndividual(prev => ({ ...prev, [name]: formatarDataInput(value) }));
    } else {
      setDadosIndividual(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenha(prev => ({ ...prev, [name]: value }));
  };

  // ========== FUNÇÕES DE VALIDAÇÃO ==========

  const validarDadosCasal = () => {
    if (!dadosCasal.nomeCompletoPessoa1) {
      setErro('Nome da primeira pessoa é obrigatório');
      return false;
    }
    if (!dadosCasal.nomeCompletoPessoa2) {
      setErro('Nome da segunda pessoa é obrigatório');
      return false;
    }
    
    if (dadosCasal.cpfPessoa1 && !validarCPF(dadosCasal.cpfPessoa1)) {
      setErro('CPF da primeira pessoa inválido');
      return false;
    }
    if (dadosCasal.cpfPessoa2 && !validarCPF(dadosCasal.cpfPessoa2)) {
      setErro('CPF da segunda pessoa inválido');
      return false;
    }
    
    if (dadosCasal.dataNascimentoPessoa1 && !validarData(dadosCasal.dataNascimentoPessoa1)) {
      setErro('Data de nascimento da primeira pessoa inválida');
      return false;
    }
    if (dadosCasal.dataNascimentoPessoa2 && !validarData(dadosCasal.dataNascimentoPessoa2)) {
      setErro('Data de nascimento da segunda pessoa inválida');
      return false;
    }
    
    return true;
  };

  const validarDadosIndividual = () => {
    if (!dadosIndividual.nomeCompleto) {
      setErro('Nome completo é obrigatório');
      return false;
    }
    
    if (dadosIndividual.cpf && !validarCPF(dadosIndividual.cpf)) {
      setErro('CPF inválido');
      return false;
    }
    
    if (dadosIndividual.dataNascimento && !validarData(dadosIndividual.dataNascimento)) {
      setErro('Data de nascimento inválida');
      return false;
    }
    
    return true;
  };



  const handleSalvarPerfil = async () => {
    setLoading(true);
    setErro('');
    setMensagem('');
    


    try {
      const isCasal = usuario.isCasal || usuario.tipoConta === 1;


      if (isCasal) {

        if (!validarDadosCasal()) {
          setLoading(false);
          console.log("Validação do casal falhou:", erro);
          return;
        }



        const dadosAtualizados = {
          nomeCompletoPessoa1: dadosCasal.nomeCompletoPessoa1,
          dataNascimentoPessoa1: dadosCasal.dataNascimentoPessoa1 ? 
            converterDataBRparaISO(dadosCasal.dataNascimentoPessoa1) : null,
          rendaMensalPessoa1: dadosCasal.rendaMensalPessoa1Valor || 0,
          nomeCompletoPessoa2: dadosCasal.nomeCompletoPessoa2,
          dataNascimentoPessoa2: dadosCasal.dataNascimentoPessoa2 ? 
            converterDataBRparaISO(dadosCasal.dataNascimentoPessoa2) : null,
          rendaMensalPessoa2: dadosCasal.rendaMensalPessoa2Valor || 0
        };


        const dadosCasal = await authService.atualizarPerfilCasal(usuario.id, dadosAtualizados);

        const usuarioAtualizado = {
          ...usuario,
          casalInfo: {
            ...usuario.casalInfo,
            ...dadosAtualizados,
            rendaMensalPessoa1: dadosCasal.rendaMensalPessoa1Valor.toString(),
            rendaMensalPessoa2: dadosCasal.rendaMensalPessoa2Valor.toString(),
          },
        };


        atualizarUsuario(usuarioAtualizado);
      } else {
        if (!validarDadosIndividual()) {
          setLoading(false);
          return;
        }

        const dadosAtualizados = {
          nomeCompleto: dadosIndividual.nomeCompleto,
          dataNascimento: dadosIndividual.dataNascimento ? 
            converterDataBRparaISO(dadosIndividual.dataNascimento) : null,
          rendaMensal: dadosIndividual.rendaMensalValor || 0
        };

        await authService.atualizarPerfil(usuario.id, dadosAtualizados);
        
        const usuarioAtualizado = {
          ...usuario,
          ...dadosAtualizados,
          rendaMensal: dadosIndividual.rendaMensalValor.toString()
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

  const handleAlterarSenha = async () => {
    if (!senha.atual) {
      setErro('Digite a senha atual');
      return;
    }

    if (senha.nova.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha.nova !== senha.confirmar) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setErro('');
    setMensagem('');
    
    try {
      let email;
      if (usuario.isCasal || usuario.tipoConta === 1) {
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
    setErro('');
    
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



  const formatarDataCriacao = (data) => {
    if (!data) return 'Não informado';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };



  useEffect(() => {
    if (usuario) {
      setCarregandoDados(true);
      
      if (usuario.isCasal || usuario.tipoConta === 1) {
        const casalInfo = usuario.casalInfo || {};
        
        const rendaPessoa1 = parseFloat(casalInfo.rendaMensalPessoa1 || 0);
        const rendaPessoa2 = parseFloat(casalInfo.rendaMensalPessoa2 || 0);
        
        setDadosCasal({
          nomeCompletoPessoa1: casalInfo.nomeCompletoPessoa1 || '',
          emailPessoa1: casalInfo.emailPessoa1 || '',
          cpfPessoa1: casalInfo.cpfPessoa1 || '',
          dataNascimentoPessoa1: formatarDataExibicao(casalInfo.dataNascimentoPessoa1),
          rendaMensalPessoa1: casalInfo.rendaMensalPessoa1 ? 
            formatarMoeda(parseFloat(casalInfo.rendaMensalPessoa1)) : '',
          rendaMensalPessoa1Valor: rendaPessoa1,
          nomeCompletoPessoa2: casalInfo.nomeCompletoPessoa2 || '',
          emailPessoa2: casalInfo.emailPessoa2 || '',
          cpfPessoa2: casalInfo.cpfPessoa2 || '',
          dataNascimentoPessoa2: formatarDataExibicao(casalInfo.dataNascimentoPessoa2),
          rendaMensalPessoa2: casalInfo.rendaMensalPessoa2 ? 
            formatarMoeda(parseFloat(casalInfo.rendaMensalPessoa2)) : '',
          rendaMensalPessoa2Valor: rendaPessoa2,
          RendaMensal: usuario.RendaMensal,
          createdAt: casalInfo.createdAt || ''
          
        });
      } else {
        const renda = parseFloat(usuario.rendaMensal || 0);
        
        setDadosIndividual({
          nomeCompleto: usuario.nomeCompleto || '',
          email: usuario.email || '',
          cpf: usuario.cpf || '',
          dataNascimento: formatarDataExibicao(usuario.dataNascimento),
          rendaMensal: usuario.rendaMensal ? 
            formatarMoeda(parseFloat(usuario.rendaMensal)) : '',
          rendaMensalValor: renda
        });
      }

      setCarregandoDados(false);
    }
  }, [usuario]);

  // ========== RENDERIZAÇÃO ==========

  if (carregandoDados) {
    return (
      <PerfilContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Carregando dados do perfil...</p>
        </LoadingContainer>
      </PerfilContainer>
    );
  }

  if (!usuario) {
    return (
      <PerfilContainer>
        <PerfilCard>
          <p>Usuário não encontrado. Faça login novamente.</p>
        </PerfilCard>
      </PerfilContainer>
    );
  }

  const isCasal = usuario.isCasal || usuario.tipoConta === 1;

  return (
    <PerfilContainer>
      <Header>
        <h1>Meu Perfil</h1>
        {!editando && !editandoSenha && (
          <EditarButton onClick={() => setEditando(true)} disabled={loading}>
            ✏️ Editar Perfil
          </EditarButton>
        )}
      </Header>

      {mensagem && <MensagemSucesso>{mensagem}</MensagemSucesso>}
      {erro && <MensagemErro>{erro}</MensagemErro>}

      <PerfilCard>
        <AvatarSection>
          <Avatar>
            <AvatarPlaceholder>
              {isCasal 
                ? (usuario.pessoaQueLogou === 'pessoa1' 
                    ? dadosCasal.nomeCompletoPessoa1?.charAt(0) 
                    : dadosCasal.nomeCompletoPessoa2?.charAt(0)) || '👤'
                : dadosIndividual.nomeCompleto?.charAt(0) || '👤'}
            </AvatarPlaceholder>
          </Avatar>
          <UserInfo>
            <h2>
              {isCasal ? 'Conta Casal' : 'Conta Individual'}
              {isCasal && usuario.pessoaQueLogou && ` (${usuario.pessoaQueLogou === 'pessoa1' ? 'Pessoa 1' : 'Pessoa 2'})`}
            </h2>
            <p>{isCasal ? 'Duas pessoas compartilhando' : 'Conta pessoal'}</p>
          </UserInfo>
        </AvatarSection>

        <InfoContainer>
          {isCasal ? (
            !editando ? (
              <>
                <InfoMembro>
                  <h3>👤 Pessoa 1 {usuario.pessoaQueLogou === 'pessoa1' && '(Você)'}</h3>
                  <InfoRow>
                    <InfoGroup>
                      <Label>Nome completo</Label>
                      <Valor>{dadosCasal.nomeCompletoPessoa1}</Valor>
                    </InfoGroup>
                  </InfoRow>
                  <InfoRow $half>
                    <InfoGroup>
                      <Label>E-mail</Label>
                      <Valor>{dadosCasal.emailPessoa1}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>CPF</Label>
                      <Valor>{dadosCasal.cpfPessoa1 || '-'}</Valor>
                    </InfoGroup>
                  </InfoRow>
                  <InfoRow $half>
                    <InfoGroup>
                      <Label>Data de nascimento</Label>
                      <Valor>{dadosCasal.dataNascimentoPessoa1 || '-'}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>Renda mensal</Label>
                      <Valor className="destaque">{formatarMoeda(dadosCasal.rendaMensalPessoa1Valor)}</Valor>
                    </InfoGroup>
                  </InfoRow>
                </InfoMembro>

                <InfoMembro>
                  <h3>👤 Pessoa 2 {usuario.pessoaQueLogou === 'pessoa2' && '(Você)'}</h3>
                  <InfoRow>
                    <InfoGroup>
                      <Label>Nome completo</Label>
                      <Valor>{dadosCasal.nomeCompletoPessoa2}</Valor>
                    </InfoGroup>
                  </InfoRow>
                  <InfoRow $half>
                    <InfoGroup>
                      <Label>E-mail</Label>
                      <Valor>{dadosCasal.emailPessoa2}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>CPF</Label>
                      <Valor>{dadosCasal.cpfPessoa2 || '-'}</Valor>
                    </InfoGroup>
                  </InfoRow>
                  <InfoRow $half>
                    <InfoGroup>
                      <Label>Data de nascimento</Label>
                      <Valor>{dadosCasal.dataNascimentoPessoa2 || '-'}</Valor>
                    </InfoGroup>
                    <InfoGroup>
                      <Label>Renda mensal</Label>
                      <Valor className="destaque">{formatarMoeda(dadosCasal.rendaMensalPessoa2Valor)}</Valor>
                    </InfoGroup>
                  </InfoRow>
                </InfoMembro>

                <RendaTotalCard>
                  <Label>Renda familiar total</Label>
                  <Valor>{formatarMoeda(dadosCasal.RendaMensal)}</Valor>
                </RendaTotalCard>

                <DataCriacao>
                  Conta criada em {formatarDataCriacao(dadosCasal.createdAt)}
                </DataCriacao>
              </>
            ) : (
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
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={dadosCasal.emailPessoa1}
                    disabled
                    className="disabled"
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label>CPF</Label>
                    <Input
                      type="text"
                      name="cpfPessoa1"
                      value={dadosCasal.cpfPessoa1}
                      onChange={handleChangeCasal}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      disabled={usuario.pessoaQueLogou !== 'pessoa1'}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Data de nascimento</Label>
                    <Input
                      type="text"
                      name="dataNascimentoPessoa1"
                      value={dadosCasal.dataNascimentoPessoa1}
                      onChange={handleChangeCasal}
                      placeholder="DD/MM/AAAA"
                      maxLength="10"
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <Label>Renda mensal</Label>
                  <Input
                    type="text"
                    name="rendaMensalPessoa1"
                    value={dadosCasal.rendaMensalPessoa1}
                    onChange={handleChangeCasal}
                    placeholder="1.500,00"
                  />
                  <Small>Digite o valor em reais (ex: 2900 ou 2.900,00)</Small>
                </FormGroup>

                <Divider />

                <h3>👤 Pessoa 2</h3>
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
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={dadosCasal.emailPessoa2}
                    disabled
                    className="disabled"
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label>CPF</Label>
                    <Input
                      type="text"
                      name="cpfPessoa2"
                      value={dadosCasal.cpfPessoa2}
                      onChange={handleChangeCasal}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      disabled={usuario.pessoaQueLogou !== 'pessoa2'}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Data de nascimento</Label>
                    <Input
                      type="text"
                      name="dataNascimentoPessoa2"
                      value={dadosCasal.dataNascimentoPessoa2}
                      onChange={handleChangeCasal}
                      placeholder="DD/MM/AAAA"
                      maxLength="10"
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <Label>Renda mensal</Label>
                  <Input
                    type="text"
                    name="rendaMensalPessoa2"
                    value={dadosCasal.rendaMensalPessoa2}
                    onChange={handleChangeCasal}
                    placeholder="1.500,00"
                  />
                </FormGroup>

                <RendaTotalCard>
                  <Label>Renda familiar total</Label>
                  <Valor>{formatarMoeda(dadosCasal.RendaMensal)}</Valor>
                </RendaTotalCard>

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
            !editando ? (
              <>
                <InfoRow $half>
                  <InfoGroup>
                    <Label>Nome completo</Label>
                    <Valor>{dadosIndividual.nomeCompleto}</Valor>
                  </InfoGroup>
                  <InfoGroup>
                    <Label>E-mail</Label>
                    <Valor>{dadosIndividual.email}</Valor>
                  </InfoGroup>
                </InfoRow>
                <InfoRow $half>
                  <InfoGroup>
                    <Label>CPF</Label>
                    <Valor>{dadosIndividual.cpf || '-'}</Valor>
                  </InfoGroup>
                  <InfoGroup>
                    <Label>Data de nascimento</Label>
                    <Valor>{dadosIndividual.dataNascimento || '-'}</Valor>
                  </InfoGroup>
                </InfoRow>
                <RendaTotalCard>
                  <Label>Renda mensal</Label>
                  <Valor>{formatarMoeda(dadosIndividual.rendaMensalValor)}</Valor>
                </RendaTotalCard>

                <DataCriacao>
                  Conta criada em {formatarDataCriacao(usuario.createdAt || usuario.dataInclusao)}
                </DataCriacao>
              </>
            ) : (
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
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={dadosIndividual.email}
                    disabled
                    className="disabled"
                  />
                </FormGroup>
                <FormRow>
                  <FormGroup>
                    <Label>CPF</Label>
                    <Input
                      type="text"
                      name="cpf"
                      value={dadosIndividual.cpf}
                      onChange={handleChangeIndividual}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      disabled
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Data de nascimento</Label>
                    <Input
                      type="text"
                      name="dataNascimento"
                      value={dadosIndividual.dataNascimento}
                      onChange={handleChangeIndividual}
                      placeholder="DD/MM/AAAA"
                      maxLength="10"
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <Label>Renda mensal</Label>
                  <Input
                    type="text"
                    name="rendaMensal"
                    value={dadosIndividual.rendaMensal}
                    onChange={handleChangeIndividual}
                    placeholder="1.500,00"
                  />
                </FormGroup>

                <RendaTotalCard>
                  <Label>Renda mensal</Label>
                  <Valor>{formatarMoeda(dadosIndividual.rendaMensalValor)}</Valor>
                </RendaTotalCard>

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

      {/* SEGURANÇA */}
      {!editando && (
        <PerfilCard>
          <SectionTitle>🔒 Segurança</SectionTitle>
          
          {!editandoSenha ? (
            <AlterarSenhaButton onClick={() => setEditandoSenha(true)}>
              🔑 Alterar Senha
            </AlterarSenhaButton>
          ) : (
            <>
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
              <FormRow>
                <FormGroup>
                  <Label>Nova senha</Label>
                  <Input
                    type="password"
                    name="nova"
                    value={senha.nova}
                    onChange={handleSenhaChange}
                    placeholder="••••••••"
                  />
                  <Small>Mínimo 6 caracteres</Small>
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
              </FormRow>
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
            </>
          )}
        </PerfilCard>
      )}

      {!editando && !editandoSenha && (
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
              <p className="warning">
                Esta ação é permanente e não pode ser desfeita!
              </p>
            </ModalBody>
            <ModalFooter>
              <CancelarButton onClick={() => setMostrarModalExcluir(false)}>
                Cancelar
              </CancelarButton>
              <ConfirmarButton onClick={handleExcluirConta} disabled={loading}>
                {loading ? 'Excluindo...' : 'Excluir conta'}
              </ConfirmarButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </PerfilContainer>
  );
};

export default Perfil;