import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          
          <View className="mb-10">
            <Text className="text-3xl font-bold text-primary">Criar Conta</Text>
            <Text className="text-gray-500 mt-1">Comece a organizar sua vida a dois</Text>
          </View>

          <Input 
            label="Nome Completo"
            placeholder="Seu nome"
            icon={<User size={20} color="#999" />}
          />

          <Input 
            label="E-mail"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={20} color="#999" />}
          />

          <Input 
            label="Senha"
            placeholder="••••••"
            secureTextEntry
            icon={<Lock size={20} color="#999" />}
          />

          <Input 
            label="Confirmar Senha"
            placeholder="••••••"
            secureTextEntry
            icon={<Lock size={20} color="#999" />}
          />

          <View className="mt-4">
            <Button 
              title="Registrar" 
              variant="primary" 
              onPress={() => alert('Em breve!')}
              disabled={loading}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
