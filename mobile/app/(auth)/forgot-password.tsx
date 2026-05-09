import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    setLoading(true);
    // Simulação de envio
    setTimeout(() => {
      setLoading(false);
      alert('Se o e-mail estiver cadastrado, você receberá um link de recuperação.');
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TouchableOpacity 
        onPress={() => router.back()}
        className="px-6 pt-4"
      >
        <ArrowLeft size={24} color="#1c1c1e" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          
          <View className="items-center mb-10">
            <View className="bg-orange-100 p-6 rounded-full mb-6">
              <KeyRound size={48} color="#FF9500" />
            </View>
            <Text className="text-3xl font-bold text-primary text-center">Esqueceu a senha?</Text>
            <Text className="text-gray-500 mt-2 text-center px-4">
              Digite seu e-mail abaixo para receber as instruções de recuperação.
            </Text>
          </View>

          <Input 
            label="E-mail de Cadastro"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={20} color="#999" />}
            value={email}
            onChangeText={setEmail}
          />

          <View className="mt-6">
            <Button 
              title="Enviar Link" 
              variant="primary" 
              onPress={handleReset}
              disabled={loading || !email}
            />
          </View>

          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-8 items-center"
          >
            <Text className="text-gray-400 font-medium">Voltar para o login</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
