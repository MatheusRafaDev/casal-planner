import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Send, Key } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../../src/services/api';

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRecuperar = async () => {
    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('E-mail obrigatório', 'Por favor, insira seu e-mail cadastrado.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await api.post('/auth/recuperar-senha', { email: email.trim().toLowerCase() }).catch(() => {});
      // Always show success (security: don't reveal if email exists)
      setSent(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSent(true); // Still show success
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, backgroundColor: '#27272A', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3F3F46', marginBottom: 32 }}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {!sent ? (
              <>
                {/* Icon */}
                <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: '#A78BFA20', borderWidth: 1, borderColor: '#A78BFA30', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Key size={28} color="#A78BFA" />
                </View>

                <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', lineHeight: 36, letterSpacing: -0.5, marginBottom: 12 }}>
                  Esqueceu{'\n'}sua senha?
                </Text>
                <Text style={{ color: '#71717A', fontSize: 15, lineHeight: 22, fontWeight: '500', marginBottom: 32 }}>
                  Não se preocupe! Insira seu e-mail abaixo e enviaremos um link para criar uma nova senha.
                </Text>

                {/* Email Field */}
                <View style={{
                  backgroundColor: '#27272A', borderRadius: 20, borderWidth: 1,
                  borderColor: '#3F3F46', paddingHorizontal: 18, flexDirection: 'row',
                  alignItems: 'center', height: 56, marginBottom: 24,
                }}>
                  <Mail size={18} color="#71717A" />
                  <TextInput
                    placeholder="Seu e-mail cadastrado"
                    placeholderTextColor="#52525B"
                    style={{ flex: 1, marginLeft: 12, color: '#FFFFFF', fontSize: 15, fontWeight: '500' }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="go"
                    onSubmitEditing={handleRecuperar}
                  />
                </View>

                {/* CTA */}
                <TouchableOpacity
                  onPress={handleRecuperar}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: loading ? '#6D4FC2' : '#A78BFA',
                    height: 56, borderRadius: 18,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#A78BFA', shadowOpacity: 0.35, shadowRadius: 14,
                    shadowOffset: { width: 0, height: 5 }, elevation: 8,
                  }}
                >
                  <Send size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 17 }}>
                    {loading ? 'Enviando...' : 'Recuperar Acesso'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Success State */
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ fontSize: 64, marginBottom: 20 }}>📬</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12 }}>
                  E-mail enviado!
                </Text>
                <Text style={{ color: '#71717A', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 }}>
                  Se o e-mail <Text style={{ color: '#A78BFA', fontWeight: '700' }}>{email}</Text> estiver cadastrado, você receberá as instruções em breve.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  style={{
                    backgroundColor: '#A78BFA', height: 54, borderRadius: 18,
                    paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#A78BFA', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16 }}>Voltar ao Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {!sent && (
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginTop: 32 }}>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={{ color: '#71717A', fontSize: 14, fontWeight: '500' }}>
                  Lembrou? <Text style={{ color: '#A78BFA', fontWeight: '800' }}>Voltar ao Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
