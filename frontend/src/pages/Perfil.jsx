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
  EstatisticasGrid,
  EstatisticaItem,
  EstatisticaValor,
  EstatisticaLabel,
  InfoMembro
} from '../styles/pages/PerfilStyles';

const Perfil = () => {
  const { darkMode } = useTheme();
  const { usuario, atualizarUsuario } = useAuth();
  const [editando, setEditando] = useState(false);
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);


  const [dados, setDados] = useState({
    nomeCompleto: '',
    email: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    rendaMensal: ''
  });

  const [senha, setSenha] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });


  useEffect(() => {
    if (usuario) {

      setDados({
        nomeCompleto: usuario.nomeCompleto || usuario.nome || '',
        email: usuario.email || '',
        cpf: usuario.cpf || '',
        dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.split('T')[0] : '',
        telefone: usuario.telefone || '',
        rendaMensal: usuario.rendaMensal || ''
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados(prev => ({ ...prev, [name]: value }));
  };

  const handleSenhaChange = (e) => {
    const { name, value } = e.target;
    setSenha(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarPerfil = async () => {
    setLoading(true);
    setErro('');
    
    try {

      if (!dados.nomeCompleto) {
        throw new Error('Nome completo é obrigatório');
      }


      const dadosAtualizados = {
        nomeCompleto: dados.nomeCompleto,
        telefone: dados.telefone || null,
        dataNascimento: dados.dataNascimento || null,
        rendaMensal: dados.rendaMensal ? parseFloat(dados.rendaMensal) : null
      };



      setTimeout(() => {
        atualizarUsuario(dadosAtualizados);
        
        setMensagem('Perfil atualizado com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setEditando(false);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      setErro(error.message || 'Erro ao atualizar perfil');
      setTimeout(() => setErro(''), 3000);
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

      setTimeout(() => {
        setMensagem('Senha alterada com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
        setEditandoSenha(false);
        setSenha({ atual: '', nova: '', confirmar: '' });
        setLoading(false);
      }, 500);
      
    } catch (error) {
      setErro(error.message || 'Erro ao alterar senha');
      setTimeout(() => setErro(''), 3000);
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor) return '0,00';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return isNaN(num) ? '0,00' : num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatarData = (data) => {
    if (!data) return 'Não informado';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const estatisticas = {
    categorias: 12,
    itens: 48,
    totalGasto: 3450.50,
    comprados: 23
  };

  if (!usuario) {
    return (
      <PerfilContainer>
        <div>Carregando...</div>
      </PerfilContainer>
    );
  }

  return (
    <PerfilContainer>
      <Header $darkMode={darkMode}>
        <h1>👤 Meu Perfil</h1>
        {!editando && (
          <EditarButton onClick={() => setEditando(true)} disabled={loading}>
            ✏️ Editar Perfil
          </EditarButton>
        )}
      </Header>

      {mensagem && <MensagemSucesso>{mensagem}</MensagemSucesso>}
      {erro && <MensagemErro>{erro}</MensagemErro>}

      <PerfilCard $darkMode={darkMode}>
        <Avatar>
          <AvatarPlaceholder>
            {dados.nomeCompleto?.charAt(0) || usuario?.nomeCompleto?.charAt(0) || '👤'}
          </AvatarPlaceholder>
        </Avatar>

        <InfoContainer>
          {!editando ? (

            <>
              <InfoGroup>
                <Label $darkMode={darkMode}>Nome completo</Label>
                <Valor $darkMode={darkMode}>{dados.nomeCompleto || 'Não informado'}</Valor>
              </InfoGroup>

              <InfoGroup>
                <Label $darkMode={darkMode}>Email</Label>
                <Valor $darkMode={darkMode}>{dados.email || 'Não informado'}</Valor>
              </InfoGroup>

              <InfoRow>
                <InfoGroup $half>
                  <Label $darkMode={darkMode}>CPF</Label>
                  <Valor $darkMode={darkMode}>{dados.cpf || 'Não informado'}</Valor>
                </InfoGroup>

                <InfoGroup $half>
                  <Label $darkMode={darkMode}>Data de nascimento</Label>
                  <Valor $darkMode={darkMode}>{formatarData(dados.dataNascimento)}</Valor>
                </InfoGroup>
              </InfoRow>

              <InfoRow>
                <InfoGroup $half>
                  <Label $darkMode={darkMode}>Telefone</Label>
                  <Valor $darkMode={darkMode}>{dados.telefone || 'Não informado'}</Valor>
                </InfoGroup>

                <InfoGroup $half>
                  <Label $darkMode={darkMode}>Renda mensal</Label>
                  <Valor $darkMode={darkMode}>R$ {formatarMoeda(dados.rendaMensal)}</Valor>
                </InfoGroup>
              </InfoRow>
            </>
          ) : (

            <>
              <FormGroup>
                <Label $darkMode={darkMode}>Nome completo *</Label>
                <Input
                  type="text"
                  name="nomeCompleto"
                  value={dados.nomeCompleto}
                  onChange={handleChange}
                  $darkMode={darkMode}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label $darkMode={darkMode}>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={dados.email}
                  disabled
                  $darkMode={darkMode}
                  className="disabled"
                />
                <Small $darkMode={darkMode}>O email não pode ser alterado</Small>
              </FormGroup>

              <FormRow>
                <FormGroup $half>
                  <Label $darkMode={darkMode}>CPF</Label>
                  <Input
                    type="text"
                    name="cpf"
                    value={dados.cpf}
                    disabled
                    $darkMode={darkMode}
                    className="disabled"
                  />
                </FormGroup>

                <FormGroup $half>
                  <Label $darkMode={darkMode}>Data de nascimento</Label>
                  <Input
                    type="date"
                    name="dataNascimento"
                    value={dados.dataNascimento}
                    onChange={handleChange}
                    $darkMode={darkMode}
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup $half>
                  <Label $darkMode={darkMode}>Telefone</Label>
                  <Input
                    type="text"
                    name="telefone"
                    value={dados.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    $darkMode={darkMode}
                  />
                </FormGroup>

                <FormGroup $half>
                  <Label $darkMode={darkMode}>Renda mensal (R$)</Label>
                  <Input
                    type="number"
                    name="rendaMensal"
                    value={dados.rendaMensal}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0,00"
                    $darkMode={darkMode}
                  />
                </FormGroup>
              </FormRow>

              <FormActions>
                <CancelarButton 
                  onClick={() => setEditando(false)} 
                  $darkMode={darkMode}
                  disabled={loading}
                >
                  Cancelar
                </CancelarButton>
                <SalvarButton 
                  onClick={handleSalvarPerfil} 
                  $darkMode={darkMode}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </SalvarButton>
              </FormActions>
            </>
          )}
        </InfoContainer>
      </PerfilCard>


    </PerfilContainer>
  );
};

export default Perfil;