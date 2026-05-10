import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  Animated, Modal, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, Heart, Mail, DollarSign, ChevronRight, LogOut,
  Shield, Trash2, Edit3, X, Check, Calendar, CreditCard
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { itensService, Item } from '../../src/services/itensService';
import usuarioService from '../../src/services/usuarioService';

// ─── Formatters ──────────────────────────────────────────────────────────
const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtCPF = (v: string) => {
  if (!v) return '';
  v = v.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const fmtData = (v: string) => {
  if (!v) return '';
  v = v.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  return v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

const converterDataBRparaISO = (data: string) => {
  const p = data.split('/');
  if (p.length === 3) return `${p[2]}-${p[1]}-${p[0]}T00:00:00.000Z`;
  return null;
};

const formatarDataExibicao = (dataISO: string) => {
  if (!dataISO) return '';
  const data = new Date(dataISO);
  data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
  const d = String(data.getDate()).padStart(2, '0');
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const y = data.getFullYear();
  return `${d}/${m}/${y}`;
};

function getInitials(nome: string) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

// ─── Components ──────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, destaque = false }: { icon: React.ReactNode; label: string; value?: string; destaque?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#27272A' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#27272A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          {icon}
        </View>
        <Text style={{ color: '#A1A1AA', fontSize: 14, fontWeight: '500' }}>{label}</Text>
      </View>
      <Text style={{ color: destaque ? '#A78BFA' : '#FFFFFF', fontWeight: destaque ? '900' : '700', fontSize: 14, maxWidth: '50%', textAlign: 'right' }} numberOfLines={1}>
        {value || '—'}
      </Text>
    </View>
  );
}

function SectionCard({ title, children, actionIcon, onAction }: { title: string; children: React.ReactNode; actionIcon?: React.ReactNode; onAction?: () => void }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: -0.2 }}>
          {title}
        </Text>
        {actionIcon && onAction && (
          <TouchableOpacity onPress={onAction} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            {actionIcon}
          </TouchableOpacity>
        )}
      </View>
      <View style={{ backgroundColor: '#27272A', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: '#3F3F46' }}>
        {children}
      </View>
    </View>
  );
}

function ActionRow({ icon, label, onPress, destructive = false, hideBorder = false }: {
  icon: React.ReactNode; label: string; onPress: () => void; destructive?: boolean; hideBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: hideBorder ? 0 : 1, borderBottomColor: '#3F3F46' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: destructive ? '#EF444415' : '#18181B', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          {icon}
        </View>
        <Text style={{ color: destructive ? '#EF4444' : '#E4E4E7', fontSize: 15, fontWeight: '600' }}>
          {label}
        </Text>
      </View>
      <ChevronRight size={16} color={destructive ? '#EF4444' : '#52525B'} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────
export default function PerfilScreen() {
  const { usuario, logout, isCasal, pessoaQueLogou, recarregarUsuario } = useAuth();
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);
  
  // Modals state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({ nome: '', cpf: '', dataNascimento: '', renda: '' });
  const [passForm, setPassForm] = useState({ atual: '', nova: '', confirmar: '' });

  const avatarScale = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    itensService.getAll().then(its => setItens(its || [])).catch(() => {});
  }, []);

  const casalInfo = usuario?.casalInfo;
  const isPessoa1 = pessoaQueLogou === 'pessoa1';

  const meusDados = isCasal && casalInfo
    ? (isPessoa1
      ? { nome: casalInfo.pessoa1?.nomeCompleto, email: casalInfo.pessoa1?.email, cpf: casalInfo.pessoa1?.cpf, dataNasc: casalInfo.pessoa1?.dataNascimento, renda: casalInfo.pessoa1?.rendaMensal }
      : { nome: casalInfo.pessoa2?.nomeCompleto, email: casalInfo.pessoa2?.email, cpf: casalInfo.pessoa2?.cpf, dataNasc: casalInfo.pessoa2?.dataNascimento, renda: casalInfo.pessoa2?.rendaMensal })
    : { nome: usuario?.nomeCompleto, email: usuario?.email, cpf: usuario?.cpf, dataNasc: usuario?.dataNascimento, renda: usuario?.rendaMensal };

  const parceiroDados = isCasal && casalInfo
    ? (isPessoa1
      ? { nome: casalInfo.pessoa2?.nomeCompleto, email: casalInfo.pessoa2?.email, cpf: casalInfo.pessoa2?.cpf, dataNasc: casalInfo.pessoa2?.dataNascimento, renda: casalInfo.pessoa2?.rendaMensal }
      : { nome: casalInfo.pessoa1?.nomeCompleto, email: casalInfo.pessoa1?.email, cpf: casalInfo.pessoa1?.cpf, dataNasc: casalInfo.pessoa1?.dataNascimento, renda: casalInfo.pessoa1?.rendaMensal })
    : null;

  const rendaFamiliar = (Number(meusDados.renda) || 0) + (parceiroDados ? Number(parceiroDados.renda) || 0 : 0);

  // Quick stats from items
  const calcTotal = (arr: Item[]) => arr.reduce((a, i) => a + (Number(i.preco) || 0) * (Number(i.quantidade) || 0), 0);
  const totalGeral = calcTotal(itens);
  const totalPago = calcTotal(itens.filter(i => i.comprado));
  const pctPago = totalGeral > 0 ? (totalPago / totalGeral) * 100 : 0;
  const pctRenda = rendaFamiliar > 0 ? (totalGeral / rendaFamiliar) * 100 : 0;

  const openEditModal = () => {
    setEditForm({
      nome: meusDados.nome || '',
      cpf: fmtCPF(meusDados.cpf || ''),
      dataNascimento: formatarDataExibicao(meusDados.dataNasc || ''),
      renda: String(meusDados.renda || '')
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.nome) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    setLoading(true);
    try {
      if (isCasal) {
        const dados = isPessoa1 ? {
          nomeCompletoPessoa1: editForm.nome,
          dataNascimentoPessoa1: editForm.dataNascimento ? converterDataBRparaISO(editForm.dataNascimento) : null,
          rendaMensalPessoa1: Number(editForm.renda.replace(/\D/g, '')) / 100 || 0,
          cpfPessoa1: editForm.cpf.replace(/\D/g, ''),
        } : {
          nomeCompletoPessoa2: editForm.nome,
          dataNascimentoPessoa2: editForm.dataNascimento ? converterDataBRparaISO(editForm.dataNascimento) : null,
          rendaMensalPessoa2: Number(editForm.renda.replace(/\D/g, '')) / 100 || 0,
          cpfPessoa2: editForm.cpf.replace(/\D/g, ''),
        };
        await usuarioService.atualizarPerfilCasal(usuario!.id, dados);
      } else {
        const dados = {
          nomeCompleto: editForm.nome,
          dataNascimento: editForm.dataNascimento ? converterDataBRparaISO(editForm.dataNascimento) : null,
          rendaMensal: Number(editForm.renda.replace(/\D/g, '')) / 100 || 0,
          cpf: editForm.cpf.replace(/\D/g, ''),
        };
        await usuarioService.atualizarPerfil(usuario!.id, dados);
      }
      await recarregarUsuario();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passForm.atual || passForm.nova.length < 6 || passForm.nova !== passForm.confirmar) {
      Alert.alert('Erro', 'Verifique os dados informados');
      return;
    }
    setLoading(true);
    try {
      await usuarioService.alterarSenha({ email: meusDados.email, senhaAtual: passForm.atual, novaSenha: passForm.nova });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Senha alterada com sucesso');
      setPasswordModalVisible(false);
      setPassForm({ atual: '', nova: '', confirmar: '' });
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Excluir Conta Permanentemente',
      isCasal 
        ? 'ATENÇÃO: Isso excluirá TODA a conta do casal. Esta ação é PERMANENTE e não pode ser desfeita!' 
        : 'ATENÇÃO: Esta ação é PERMANENTE e não pode ser desfeita!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try {
              await usuarioService.excluirConta(usuario!.id);
              logout();
              router.replace('/(auth)/login');
            } catch (e) {
              Alert.alert('Erro', 'Falha ao excluir conta');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar & Name ──────────────────────── */}
        <Animated.View style={{ alignItems: 'center', marginBottom: 28, transform: [{ scale: avatarScale }] }}>
          <View style={{
            width: 88, height: 88, borderRadius: 30, backgroundColor: '#A78BFA',
            alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            shadowColor: '#A78BFA', shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900' }}>
              {getInitials(meusDados.nome || '')}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.4 }}>
            {meusDados.nome || 'Usuário'}
          </Text>
          <View style={{ backgroundColor: '#A78BFA20', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {isCasal ? <Heart size={11} color="#A78BFA" /> : <User size={11} color="#A78BFA" />}
            <Text style={{ color: '#A78BFA', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 6 }}>
              {isCasal ? 'Conta Casal' : 'Conta Individual'}
            </Text>
          </View>
        </Animated.View>

        {/* ── Quick Stats ────────────────────────── */}
        {itens.length > 0 && (
          <View style={{ backgroundColor: '#27272A', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#3F3F46', marginBottom: 24 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginBottom: 14 }}>📊 Este mês</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Total Planejado</Text>
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15 }}>{fmtMoeda(totalGeral)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Já Pago</Text>
                <Text style={{ color: '#22C55E', fontWeight: '900', fontSize: 15 }}>{fmtMoeda(totalPago)}</Text>
              </View>
            </View>
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 11, fontWeight: '600' }}>Progresso financeiro</Text>
                <Text style={{ color: '#A78BFA', fontWeight: '800', fontSize: 11 }}>{pctPago.toFixed(0)}%</Text>
              </View>
              <ProgressBar progress={pctPago} color="#A78BFA" height={6} />
            </View>
            {rendaFamiliar > 0 && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ color: '#A1A1AA', fontSize: 11, fontWeight: '600' }}>% da renda familiar</Text>
                  <Text style={{ color: pctRenda > 80 ? '#EF4444' : pctRenda > 50 ? '#EAB308' : '#22C55E', fontWeight: '800', fontSize: 11 }}>{pctRenda.toFixed(0)}%</Text>
                </View>
                <ProgressBar progress={Math.min(pctRenda, 100)} color={pctRenda > 80 ? '#EF4444' : pctRenda > 50 ? '#EAB308' : '#22C55E'} height={6} />
              </View>
            )}
          </View>
        )}

        {/* ── Meus Dados ────────────────────────── */}
        <SectionCard title="Meus Dados" actionIcon={<Edit3 size={18} color="#A78BFA" />} onAction={openEditModal}>
          <InfoRow icon={<User size={15} color="#71717A" />} label="Nome" value={meusDados.nome} />
          <InfoRow icon={<Mail size={15} color="#71717A" />} label="E-mail" value={meusDados.email} />
          <InfoRow icon={<CreditCard size={15} color="#71717A" />} label="CPF" value={fmtCPF(meusDados.cpf || '')} />
          <InfoRow icon={<Calendar size={15} color="#71717A" />} label="Nascimento" value={formatarDataExibicao(meusDados.dataNasc || '')} />
          <InfoRow icon={<DollarSign size={15} color="#A78BFA" />} label="Minha Renda" value={fmtMoeda(Number(meusDados.renda) || 0)} destaque />
        </SectionCard>

        {/* ── Parceiro ─────────────────────────── */}
        {isCasal && parceiroDados && (
          <SectionCard title="Meu Parceiro(a)">
            <InfoRow icon={<Heart size={15} color="#F9A8D4" />} label="Nome" value={parceiroDados.nome} />
            <InfoRow icon={<Mail size={15} color="#F9A8D4" />} label="E-mail" value={parceiroDados.email} />
            <InfoRow icon={<CreditCard size={15} color="#F9A8D4" />} label="CPF" value={fmtCPF(parceiroDados.cpf || '')} />
            <InfoRow icon={<Calendar size={15} color="#F9A8D4" />} label="Nascimento" value={formatarDataExibicao(parceiroDados.dataNasc || '')} />
            <InfoRow icon={<DollarSign size={15} color="#F9A8D4" />} label="Renda dele(a)" value={fmtMoeda(Number(parceiroDados.renda) || 0)} destaque />
            <View style={{ paddingVertical: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#18181B', marginTop: 4 }}>
              <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                Renda Familiar Total
              </Text>
              <Text style={{ color: '#A78BFA', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>
                {fmtMoeda(rendaFamiliar)}
              </Text>
            </View>
          </SectionCard>
        )}

        {/* ── Conta & Segurança ─────────────────── */}
        <SectionCard title="Conta & Segurança">
          <ActionRow icon={<Shield size={15} color="#A1A1AA" />} label="Alterar senha" onPress={() => setPasswordModalVisible(true)} />
          <ActionRow icon={<LogOut size={15} color="#EF4444" />} label="Sair da conta" onPress={handleLogout} destructive />
          <ActionRow icon={<Trash2 size={15} color="#EF4444" />} label="Excluir conta" onPress={handleDeleteAccount} destructive hideBorder />
        </SectionCard>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: '#3F3F46', fontSize: 11, fontWeight: '600' }}>Conta criada em {formatarDataExibicao(usuario?.createdAt || '')}</Text>
          <Text style={{ color: '#3F3F46', fontSize: 11, fontWeight: '600', marginTop: 4 }}>CasalPlanner • v1.0.0</Text>
        </View>
      </ScrollView>

      {/* ── Edit Profile Modal ─────────────────── */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#18181B', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ padding: 8, backgroundColor: '#27272A', borderRadius: 12 }}>
                <X size={18} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Nome Completo</Text>
                <TextInput
                  value={editForm.nome} onChangeText={t => setEditForm(p => ({ ...p, nome: t }))}
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>CPF</Text>
                <TextInput
                  value={editForm.cpf} onChangeText={t => setEditForm(p => ({ ...p, cpf: fmtCPF(t) }))}
                  keyboardType="numeric" maxLength={14}
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Data Nascimento</Text>
                <TextInput
                  value={editForm.dataNascimento} onChangeText={t => setEditForm(p => ({ ...p, dataNascimento: fmtData(t) }))}
                  keyboardType="numeric" maxLength={10} placeholder="DD/MM/AAAA" placeholderTextColor="#52525B"
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Renda Mensal</Text>
                <TextInput
                  value={editForm.renda} 
                  onChangeText={t => {
                    const num = t.replace(/\D/g, '');
                    setEditForm(p => ({ ...p, renda: num ? fmtMoeda(Number(num)/100) : '' }));
                  }}
                  keyboardType="numeric"
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <TouchableOpacity
                onPress={handleSaveProfile} disabled={loading}
                style={{ backgroundColor: '#A78BFA', height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
              >
                {loading ? <ActivityIndicator color="white" /> : <><Check size={18} color="white" style={{ marginRight: 8 }} /><Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Salvar Alterações</Text></>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ─────────────── */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#18181B', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>Alterar Senha</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={{ padding: 8, backgroundColor: '#27272A', borderRadius: 12 }}>
                <X size={18} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Senha Atual</Text>
                <TextInput
                  value={passForm.atual} onChangeText={t => setPassForm(p => ({ ...p, atual: t }))}
                  secureTextEntry
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Nova Senha</Text>
                <TextInput
                  value={passForm.nova} onChangeText={t => setPassForm(p => ({ ...p, nova: t }))}
                  secureTextEntry
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Confirmar Nova Senha</Text>
                <TextInput
                  value={passForm.confirmar} onChangeText={t => setPassForm(p => ({ ...p, confirmar: t }))}
                  secureTextEntry
                  style={{ backgroundColor: '#27272A', color: 'white', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 }}
                />
              </View>
              <TouchableOpacity
                onPress={handleChangePassword} disabled={loading}
                style={{ backgroundColor: '#A78BFA', height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
              >
                {loading ? <ActivityIndicator color="white" /> : <><Check size={18} color="white" style={{ marginRight: 8 }} /><Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Confirmar Nova Senha</Text></>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
