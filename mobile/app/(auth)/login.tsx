import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { Logo } from '../../src/components/Logo';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await login(email.trim().toLowerCase(), senha);
      if (result?.success !== false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Falha ao entrar',
        error.message?.includes('401') || error.message?.includes('credenciais')
          ? 'E-mail ou senha incorretos.'
          : 'Verifique sua conexão e tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* ── Logo & Header ─────────────────── */}
            <View style={{ alignItems: 'center', marginBottom: 44 }}>
              <View style={{ marginBottom: 24 }}>
                <Logo size={90} />
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center', marginBottom: 8 }}>
                Acesse sua conta
              </Text>
              <Text style={{ color: '#71717A', fontSize: 15, fontWeight: '500', textAlign: 'center' }}>
                Continue de onde parou
              </Text>
            </View>

            {/* ── Fields ───────────────────────── */}
            <View style={{ marginBottom: 8 }}>
              {/* Email */}
              <View style={{
                backgroundColor: '#27272A', borderRadius: 20, borderWidth: 1,
                borderColor: '#3F3F46', paddingHorizontal: 18, flexDirection: 'row',
                alignItems: 'center', height: 58, marginBottom: 14,
              }}>
                <Mail size={18} color="#A78BFA" style={{ opacity: 0.7 }} />
                <TextInput
                  placeholder="E-mail"
                  placeholderTextColor="#52525B"
                  style={{ flex: 1, marginLeft: 14, color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={{
                backgroundColor: '#27272A', borderRadius: 20, borderWidth: 1,
                borderColor: '#3F3F46', paddingHorizontal: 18, flexDirection: 'row',
                alignItems: 'center', height: 58, marginBottom: 10,
              }}>
                <Lock size={18} color="#A78BFA" style={{ opacity: 0.7 }} />
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="#52525B"
                  style={{ flex: 1, marginLeft: 14, color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                  value={senha}
                  onChangeText={setSenha}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {showPassword
                    ? <EyeOff size={18} color="#52525B" />
                    : <Eye size={18} color="#52525B" />}
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/recuperar-senha')}
                style={{ alignSelf: 'flex-end', paddingVertical: 6, marginBottom: 24 }}
              >
                <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 13 }}>
                  Esqueceu a senha?
                </Text>
              </TouchableOpacity>

              {/* CTA Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: loading ? '#6D4FC2' : '#A78BFA',
                  height: 58, borderRadius: 20,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#A78BFA', shadowOpacity: 0.35, shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 }, elevation: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 17, marginRight: 8 }}>
                      Entrar agora
                    </Text>
                    <ArrowRight size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Footer ──────────────────────────── */}
          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginTop: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#71717A', fontSize: 14, fontWeight: '500' }}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
                <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14 }}>Cadastre-se grátis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
