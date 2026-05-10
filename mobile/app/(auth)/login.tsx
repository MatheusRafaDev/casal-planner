import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { Logo } from '../../src/components/Logo';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await login(email, senha);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Falha ao entrar', 'Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-10 pb-10">
          <View className="items-center mb-12">
            <View className="mb-8">
              <Logo size={100} />
            </View>
            <Text className="text-3xl font-black text-white text-center">Acesse sua conta</Text>
            <Text className="text-text-soft text-center mt-2 font-medium">Continue de onde parou</Text>
          </View>

          <View className="space-y-4">
            <View className="bg-surface/50 rounded-[22px] border border-border px-5 flex-row items-center h-16 mb-4">
              <Mail size={20} color="#A78BFA" opacity={0.6} />
              <TextInput
                placeholder="E-mail"
                placeholderTextColor="#71717A"
                className="flex-1 ml-4 text-white text-base font-semibold"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="bg-surface/50 rounded-[22px] border border-border px-5 flex-row items-center h-16">
              <Lock size={20} color="#A78BFA" opacity={0.6} />
              <TextInput
                placeholder="Senha"
                placeholderTextColor="#71717A"
                className="flex-1 ml-4 text-white text-base font-semibold"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/recuperar-senha')} className="mt-4 self-end">
              <Text className="text-primary font-bold">Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
              className="bg-primary h-16 rounded-[22px] flex-row items-center justify-center mt-10 shadow-xl shadow-primary/30"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-black text-lg mr-2">Entrar agora</Text>
                  <ArrowRight size={22} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="mt-auto flex-row justify-center">
            <Text className="text-text-soft font-medium">Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
              <Text className="text-primary font-black">Cadastre-se grátis</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
