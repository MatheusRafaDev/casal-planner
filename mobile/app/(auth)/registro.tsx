import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, ArrowLeft, Hash, Calendar, DollarSign, Users } from 'lucide-react-native';
import { Logo } from '../../src/components/Logo';
import * as Haptics from 'expo-haptics';

export default function RegistroScreen() {
  const [isCasal, setIsCasal] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '', email: '', senha: '', confirmarSenha: '',
    cpf: '', dataNascimento: '', rendaMensal: '',
    pessoa1: { nomeCompleto: '', email: '', senha: '', confirmarSenha: '', cpf: '', dataNascimento: '', rendaMensal: '' },
    pessoa2: { nomeCompleto: '', email: '', senha: '', confirmarSenha: '', cpf: '', dataNascimento: '', rendaMensal: '' }
  });

  const [loading, setLoading] = useState(false);
  const { registrar, registrarCasal } = useAuth();
  const router = useRouter();

  const handleRegistro = async () => {
    setLoading(true);
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
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (icon: any, placeholder: string, value: string, onChange: (v: string) => void, secure = false) => (
    <View className="bg-surface border border-border rounded-2xl flex-row items-center px-4 h-14 mb-4">
      {icon}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#71717A"
        className="flex-1 ml-3 text-white font-medium"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-8 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 items-center justify-center bg-surface rounded-xl border border-border">
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Logo size={80} />
          <Text className="text-3xl font-black text-white mt-4">Criar Conta</Text>
          <Text className="text-text-soft text-center mt-2 px-6">Escolha o tipo de conta e preencha os dados abaixo.</Text>
        </View>

        <View className="bg-surface/50 border border-border p-4 rounded-3xl mb-8 flex-row items-center justify-between">
           <View className="flex-row items-center">
              <Users size={20} color={isCasal ? "#A78BFA" : "#71717A"} />
              <View className="ml-3">
                 <Text className="text-white font-bold">Conta Casal</Text>
                 <Text className="text-[10px] text-text-soft">Duas pessoas no mesmo plano</Text>
              </View>
           </View>
           <Switch value={isCasal} onValueChange={setIsCasal} trackColor={{ false: '#27272A', true: '#A78BFA' }} />
        </View>

        {!isCasal ? (
          <View>
            {renderInput(<User size={20} color="#71717A" />, "Nome Completo", formData.nomeCompleto, (v) => setFormData({...formData, nomeCompleto: v}))}
            {renderInput(<Mail size={20} color="#71717A" />, "Email", formData.email, (v) => setFormData({...formData, email: v}))}
            {renderInput(<Hash size={20} color="#71717A" />, "CPF", formData.cpf, (v) => setFormData({...formData, cpf: v}))}
            {renderInput(<Calendar size={20} color="#71717A" />, "Data de Nascimento (AAAA-MM-DD)", formData.dataNascimento, (v) => setFormData({...formData, dataNascimento: v}))}
            {renderInput(<DollarSign size={20} color="#71717A" />, "Renda Mensal", formData.rendaMensal, (v) => setFormData({...formData, rendaMensal: v}))}
            {renderInput(<Lock size={20} color="#71717A" />, "Senha", formData.senha, (v) => setFormData({...formData, senha: v}), true)}
            {renderInput(<Lock size={20} color="#71717A" />, "Confirmar Senha", formData.confirmarSenha, (v) => setFormData({...formData, confirmarSenha: v}), true)}
          </View>
        ) : (
          <View>
            <Text className="text-primary font-bold mb-4 uppercase tracking-widest text-[10px]">Pessoa 1</Text>
            {renderInput(<User size={20} color="#71717A" />, "Nome Pessoa 1", formData.pessoa1.nomeCompleto, (v) => setFormData({...formData, pessoa1: {...formData.pessoa1, nomeCompleto: v}}))}
            {renderInput(<Mail size={20} color="#71717A" />, "Email Pessoa 1", formData.pessoa1.email, (v) => setFormData({...formData, pessoa1: {...formData.pessoa1, email: v}}))}
            {renderInput(<Lock size={20} color="#71717A" />, "Senha Pessoa 1", formData.pessoa1.senha, (v) => setFormData({...formData, pessoa1: {...formData.pessoa1, senha: v}}), true)}
            
            <Text className="text-primary font-bold mt-4 mb-4 uppercase tracking-widest text-[10px]">Pessoa 2</Text>
            {renderInput(<User size={20} color="#71717A" />, "Nome Pessoa 2", formData.pessoa2.nomeCompleto, (v) => setFormData({...formData, pessoa2: {...formData.pessoa2, nomeCompleto: v}}))}
            {renderInput(<Mail size={20} color="#71717A" />, "Email Pessoa 2", formData.pessoa2.email, (v) => setFormData({...formData, pessoa2: {...formData.pessoa2, email: v}}))}
            {renderInput(<Lock size={20} color="#71717A" />, "Senha Pessoa 2", formData.pessoa2.senha, (v) => setFormData({...formData, pessoa2: {...formData.pessoa2, senha: v}}), true)}
          </View>
        )}

        <TouchableOpacity 
          onPress={handleRegistro}
          disabled={loading}
          className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/40 mt-6 mb-10"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Criar Minha Conta</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
