import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowLeft, Hash, Calendar, DollarSign, Users, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import { Logo } from '../../src/components/Logo';
import * as Haptics from 'expo-haptics';

interface FieldInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad';
  autoCapitalize?: 'none' | 'words';
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmit?: () => void;
}

function FieldInput({
  icon, placeholder, value, onChange, secure = false,
  keyboardType = 'default', autoCapitalize, returnKeyType = 'next', onSubmit,
}: FieldInputProps) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <View style={{
      backgroundColor: '#27272A', borderRadius: 18, borderWidth: 1,
      borderColor: '#3F3F46', paddingHorizontal: 16, flexDirection: 'row',
      alignItems: 'center', height: 54, marginBottom: 12,
    }}>
      {icon}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#52525B"
        style={{ flex: 1, marginLeft: 12, color: '#FFFFFF', fontSize: 15, fontWeight: '500' }}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure && !showPwd}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? (secure ? 'none' : 'words')}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmit}
      />
      {secure && (
        <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {showPwd ? <EyeOff size={16} color="#52525B" /> : <Eye size={16} color="#52525B" />}
        </TouchableOpacity>
      )}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
      <View style={{ height: 1, flex: 1, backgroundColor: '#3F3F46' }} />
      <Text style={{ color: '#A78BFA', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginHorizontal: 12 }}>
        {children}
      </Text>
      <View style={{ height: 1, flex: 1, backgroundColor: '#3F3F46' }} />
    </View>
  );
}

export default function RegistroScreen() {
  const [isCasal, setIsCasal] = useState(false);
  const [step, setStep] = useState<'tipo' | 'dados'>(Platform.OS === 'ios' ? 'tipo' : 'dados');
  const [formData, setFormData] = useState({
    nomeCompleto: '', email: '', senha: '', confirmarSenha: '',
    cpf: '', dataNascimento: '', rendaMensal: '',
    pessoa1: { nomeCompleto: '', email: '', senha: '', confirmarSenha: '', cpf: '', dataNascimento: '', rendaMensal: '' },
    pessoa2: { nomeCompleto: '', email: '', senha: '', confirmarSenha: '', cpf: '', dataNascimento: '', rendaMensal: '' },
  });
  const [loading, setLoading] = useState(false);
  const { registrar, registrarCasal } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const updatePessoa = (n: 1 | 2, key: string, value: string) =>
    setFormData(prev => ({ ...prev, [`pessoa${n}`]: { ...prev[`pessoa${n}` as 'pessoa1' | 'pessoa2'], [key]: value } }));

  const validate = (): string | null => {
    if (!isCasal) {
      if (!formData.nomeCompleto.trim()) return 'Informe seu nome completo.';
      if (!formData.email.trim()) return 'Informe seu e-mail.';
      if (!formData.senha) return 'Informe uma senha.';
      if (formData.senha.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
      if (formData.senha !== formData.confirmarSenha) return 'As senhas não coincidem.';
    } else {
      if (!formData.pessoa1.nomeCompleto.trim()) return 'Informe o nome da Pessoa 1.';
      if (!formData.pessoa1.email.trim()) return 'Informe o e-mail da Pessoa 1.';
      if (!formData.pessoa1.senha) return 'Informe a senha da Pessoa 1.';
      if (formData.pessoa1.senha.length < 6) return 'Senha da Pessoa 1 deve ter 6+ caracteres.';
      if (formData.pessoa1.senha !== formData.pessoa1.confirmarSenha) return 'Senhas da Pessoa 1 não coincidem.';
      if (!formData.pessoa2.nomeCompleto.trim()) return 'Informe o nome da Pessoa 2.';
      if (!formData.pessoa2.email.trim()) return 'Informe o e-mail da Pessoa 2.';
      if (!formData.pessoa2.senha) return 'Informe a senha da Pessoa 2.';
      if (formData.pessoa2.senha !== formData.pessoa2.confirmarSenha) return 'Senhas da Pessoa 2 não coincidem.';
    }
    return null;
  };

  const handleRegistro = async () => {
    const err = validate();
    if (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Dados inválidos', err);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (isCasal) {
        await registrarCasal({
          nomeCompletoPessoa1: formData.pessoa1.nomeCompleto,
          emailPessoa1: formData.pessoa1.email,
          senhaPessoa1: formData.pessoa1.senha,
          cpfPessoa1: formData.pessoa1.cpf,
          dataNascimentoPessoa1: formData.pessoa1.dataNascimento,
          rendaMensalPessoa1: Number(formData.pessoa1.rendaMensal) || 0,
          nomeCompletoPessoa2: formData.pessoa2.nomeCompleto,
          emailPessoa2: formData.pessoa2.email,
          senhaPessoa2: formData.pessoa2.senha,
          cpfPessoa2: formData.pessoa2.cpf,
          dataNascimentoPessoa2: formData.pessoa2.dataNascimento,
          rendaMensalPessoa2: Number(formData.pessoa2.rendaMensal) || 0,
        });
      } else {
        await registrar({
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          senha: formData.senha,
          cpf: formData.cpf,
          dataNascimento: formData.dataNascimento,
          rendaMensal: Number(formData.rendaMensal) || 0,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('🎉 Conta criada!', 'Bem-vindo(a) ao CasalPlanner!', [
        { text: 'Entrar', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro ao cadastrar', error?.response?.data?.message || error?.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, backgroundColor: '#27272A', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3F3F46', marginBottom: 24 }}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Logo size={70} />
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginTop: 14, marginBottom: 6 }}>
              Criar Conta
            </Text>
            <Text style={{ color: '#71717A', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
              Escolha o tipo de conta e preencha seus dados.
            </Text>
          </View>

          {/* Casal Toggle */}
          <View style={{
            backgroundColor: '#27272A', borderRadius: 22, padding: 16, marginBottom: 24,
            borderWidth: 1, borderColor: isCasal ? '#A78BFA50' : '#3F3F46',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: isCasal ? '#A78BFA20' : '#18181B', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Users size={18} color={isCasal ? '#A78BFA' : '#71717A'} />
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Conta Casal</Text>
                <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '500', marginTop: 2 }}>Duas pessoas, um planejamento</Text>
              </View>
            </View>
            <Switch
              value={isCasal}
              onValueChange={v => { setIsCasal(v); Haptics.selectionAsync(); }}
              trackColor={{ false: '#3F3F46', true: '#A78BFA' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Form Fields */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {!isCasal ? (
              <>
                <FieldInput icon={<User size={16} color="#71717A" />} placeholder="Nome Completo" value={formData.nomeCompleto} onChange={v => update('nomeCompleto', v)} />
                <FieldInput icon={<Mail size={16} color="#71717A" />} placeholder="E-mail" value={formData.email} onChange={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
                <FieldInput icon={<Hash size={16} color="#71717A" />} placeholder="CPF (opcional)" value={formData.cpf} onChange={v => update('cpf', v)} keyboardType="numeric" />
                <FieldInput icon={<Calendar size={16} color="#71717A" />} placeholder="Data Nasc. (AAAA-MM-DD)" value={formData.dataNascimento} onChange={v => update('dataNascimento', v)} />
                <FieldInput icon={<DollarSign size={16} color="#71717A" />} placeholder="Renda Mensal (opcional)" value={formData.rendaMensal} onChange={v => update('rendaMensal', v)} keyboardType="decimal-pad" />
                <FieldInput icon={<Lock size={16} color="#71717A" />} placeholder="Senha" value={formData.senha} onChange={v => update('senha', v)} secure />
                <FieldInput icon={<Lock size={16} color="#71717A" />} placeholder="Confirmar Senha" value={formData.confirmarSenha} onChange={v => update('confirmarSenha', v)} secure returnKeyType="done" />
              </>
            ) : (
              <>
                <SectionLabel>Pessoa 1</SectionLabel>
                <FieldInput icon={<User size={16} color="#71717A" />} placeholder="Nome Completo" value={formData.pessoa1.nomeCompleto} onChange={v => updatePessoa(1, 'nomeCompleto', v)} />
                <FieldInput icon={<Mail size={16} color="#71717A" />} placeholder="E-mail" value={formData.pessoa1.email} onChange={v => updatePessoa(1, 'email', v)} keyboardType="email-address" autoCapitalize="none" />
                <FieldInput icon={<Hash size={16} color="#71717A" />} placeholder="CPF (opcional)" value={formData.pessoa1.cpf} onChange={v => updatePessoa(1, 'cpf', v)} keyboardType="numeric" />
                <FieldInput icon={<Calendar size={16} color="#71717A" />} placeholder="Data Nasc. (AAAA-MM-DD)" value={formData.pessoa1.dataNascimento} onChange={v => updatePessoa(1, 'dataNascimento', v)} />
                <FieldInput icon={<DollarSign size={16} color="#71717A" />} placeholder="Renda Mensal (opcional)" value={formData.pessoa1.rendaMensal} onChange={v => updatePessoa(1, 'rendaMensal', v)} keyboardType="decimal-pad" />
                <FieldInput icon={<Lock size={16} color="#71717A" />} placeholder="Senha" value={formData.pessoa1.senha} onChange={v => updatePessoa(1, 'senha', v)} secure />
                <FieldInput icon={<Lock size={16} color="#71717A" />} placeholder="Confirmar Senha" value={formData.pessoa1.confirmarSenha} onChange={v => updatePessoa(1, 'confirmarSenha', v)} secure />

                <View style={{ height: 16 }} />
                <SectionLabel>Pessoa 2</SectionLabel>
                <FieldInput icon={<User size={16} color="#F9A8D4" />} placeholder="Nome Completo" value={formData.pessoa2.nomeCompleto} onChange={v => updatePessoa(2, 'nomeCompleto', v)} />
                <FieldInput icon={<Mail size={16} color="#F9A8D4" />} placeholder="E-mail" value={formData.pessoa2.email} onChange={v => updatePessoa(2, 'email', v)} keyboardType="email-address" autoCapitalize="none" />
                <FieldInput icon={<Hash size={16} color="#F9A8D4" />} placeholder="CPF (opcional)" value={formData.pessoa2.cpf} onChange={v => updatePessoa(2, 'cpf', v)} keyboardType="numeric" />
                <FieldInput icon={<Calendar size={16} color="#F9A8D4" />} placeholder="Data Nasc. (AAAA-MM-DD)" value={formData.pessoa2.dataNascimento} onChange={v => updatePessoa(2, 'dataNascimento', v)} />
                <FieldInput icon={<DollarSign size={16} color="#F9A8D4" />} placeholder="Renda Mensal (opcional)" value={formData.pessoa2.rendaMensal} onChange={v => updatePessoa(2, 'rendaMensal', v)} keyboardType="decimal-pad" />
                <FieldInput icon={<Lock size={16} color="#F9A8D4" />} placeholder="Senha" value={formData.pessoa2.senha} onChange={v => updatePessoa(2, 'senha', v)} secure />
                <FieldInput icon={<Lock size={16} color="#F9A8D4" />} placeholder="Confirmar Senha" value={formData.pessoa2.confirmarSenha} onChange={v => updatePessoa(2, 'confirmarSenha', v)} secure returnKeyType="done" />
              </>
            )}
          </Animated.View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleRegistro}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: loading ? '#6D4FC2' : '#A78BFA',
              height: 56, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 16,
              shadowColor: '#A78BFA', shadowOpacity: 0.35, shadowRadius: 14,
              shadowOffset: { width: 0, height: 5 }, elevation: 8,
            }}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 17 }}>Criar Minha Conta</Text>}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#71717A', fontSize: 14 }}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#A78BFA', fontWeight: '800', fontSize: 14 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
