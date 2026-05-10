import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, Heart, Mail, DollarSign, ChevronRight, LogOut, Shield, Trash2
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function PerfilScreen() {
  const { usuario, logout, isCasal, pessoaQueLogou } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
          router.replace('/(auth)/login');
      }}
    ]);
  };

  const getInitials = (nome: string) => {
    if (!nome) return "?";
    const parts = nome.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <View className="flex-row items-center justify-between py-4 border-b border-border/30">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center mr-3">{icon}</View>
        <Text className="text-text-soft text-sm font-medium">{label}</Text>
      </View>
      <Text className="text-white font-bold text-sm">{value || '—'}</Text>
    </View>
  );

  const Section = ({ title, children }: any) => (
    <View className="mb-8">
      <Text className="text-white font-black text-lg mb-4">{title}</Text>
      <View className="bg-surface/50 border border-border rounded-3xl px-5 py-2">{children}</View>
    </View>
  );

  const casalInfo = usuario?.casalInfo;
  const isPessoa1 = pessoaQueLogou === 'pessoa1';
  
  const meusDados = isCasal && casalInfo 
    ? (isPessoa1 ? { nome: casalInfo.nomeCompletoPessoa1, email: casalInfo.emailPessoa1, renda: casalInfo.rendaMensalPessoa1 } 
                 : { nome: casalInfo.nomeCompletoPessoa2, email: casalInfo.emailPessoa2, renda: casalInfo.rendaMensalPessoa2 })
    : { nome: usuario?.nomeCompleto, email: usuario?.email, renda: usuario?.rendaMensal };

  const parceiroDados = isCasal && casalInfo 
    ? (isPessoa1 ? { nome: casalInfo.nomeCompletoPessoa2, email: casalInfo.emailPessoa2, renda: casalInfo.rendaMensalPessoa2 } 
                 : { nome: casalInfo.nomeCompletoPessoa1, email: casalInfo.emailPessoa1, renda: casalInfo.rendaMensalPessoa1 })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-6 pt-4">
        <View className="items-center mb-10 mt-4">
          <View className="w-24 h-24 rounded-[40px] bg-primary items-center justify-center shadow-2xl shadow-primary/40">
            <Text className="text-white text-3xl font-black">{getInitials(meusDados.nome || '')}</Text>
          </View>
          <Text className="text-white text-2xl font-black mt-5">{meusDados.nome || 'Usuário'}</Text>
          <View className="bg-primary/20 px-4 py-1.5 rounded-full mt-2 flex-row items-center">
            {isCasal ? <Heart size={12} color="#A78BFA" /> : <User size={12} color="#A78BFA" />}
            <Text className="text-primary font-bold text-[10px] uppercase ml-2 tracking-widest">{isCasal ? 'Conta Casal' : 'Conta Individual'}</Text>
          </View>
        </View>

        <Section title="Meus Dados">
          <InfoRow icon={<User size={16} color="#71717A" />} label="Nome" value={meusDados.nome} />
          <InfoRow icon={<Mail size={16} color="#71717A" />} label="E-mail" value={meusDados.email} />
          <InfoRow icon={<DollarSign size={16} color="#A78BFA" />} label="Minha Renda" value={`R$ ${(Number(meusDados.renda) || 0).toFixed(2)}`} />
        </Section>

        {isCasal && parceiroDados && (
          <Section title="Meu Parceiro(a)">
            <InfoRow icon={<Heart size={16} color="#F9A8D4" />} label="Nome" value={parceiroDados.nome} />
            <InfoRow icon={<DollarSign size={16} color="#F9A8D4" />} label="Renda dele(a)" value={`R$ ${(Number(parceiroDados.renda) || 0).toFixed(2)}`} />
            <View className="py-5 items-center">
               <Text className="text-text-soft text-[10px] font-bold uppercase tracking-widest">Renda Familiar Total</Text>
               <Text className="text-primary text-2xl font-black mt-1">R$ {((Number(meusDados.renda) || 0) + (Number(parceiroDados.renda) || 0)).toFixed(2)}</Text>
            </View>
          </Section>
        )}

        <Section title="Segurança & Conta">
           <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center">
                 <View className="w-8 h-8 rounded-lg bg-red-500/10 items-center justify-center mr-3"><LogOut size={16} color="#F87171" /></View>
                 <Text className="text-red-400 font-medium">Sair da Conta</Text>
              </View>
              <ChevronRight size={18} color="#F87171" />
           </TouchableOpacity>
        </Section>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
