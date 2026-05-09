import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Mail, Lock, User, Users, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [isCasal, setIsCasal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, registrar, registrarCasal } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nomeCompleto: '',
    confirmarSenha: '',
  });

  const handleAction = async () => {
    setLoading(true);
    try {
      if (modo === 'login') {
        const res = await login(formData.email, formData.senha);
        if (res.success) {
          router.replace('/(tabs)');
        } else {
          alert(res.error || 'Erro ao entrar');
        }
      } else {
        // Registro simplificado para mobile por enquanto
        alert('Funcionalidade de registro completa sendo integrada...');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          
          <View className="items-center mb-10">
            <View className="bg-accent-nubank p-4 rounded-3xl shadow-lg mb-4">
              <Heart size={40} color="white" fill="white" />
            </View>
            <Text className="text-3xl font-bold text-primary">CasalPlanner</Text>
            <Text className="text-gray-500 mt-1">Organize a vida a dois</Text>
          </View>

          <View className="flex-row bg-gray-200 p-1 rounded-2xl mb-8">
            <TouchableOpacity 
              onPress={() => setModo('login')}
              className={`flex-1 py-3 rounded-xl items-center ${modo === 'login' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold ${modo === 'login' ? 'text-primary' : 'text-gray-500'}`}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              className={`flex-1 py-3 rounded-xl items-center ${modo === 'registro' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold ${modo === 'registro' ? 'text-primary' : 'text-gray-500'}`}>Registrar</Text>
            </TouchableOpacity>
          </View>

          {modo === 'registro' && (
            <View className="mb-6 flex-row items-center bg-white p-4 rounded-2xl border border-gray-200">
               <TouchableOpacity 
                onPress={() => setIsCasal(!isCasal)}
                className="flex-row items-center flex-1"
              >
                <View className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${isCasal ? 'bg-accent border-accent' : 'border-gray-300'}`}>
                  {isCasal && <View className="w-3 h-3 bg-white rounded-full" />}
                </View>
                <Users size={20} color={isCasal ? '#0A84FF' : '#999'} />
                <Text className="ml-2 font-medium text-gray-700">Conta Casal</Text>
              </TouchableOpacity>
            </View>
          )}

          {modo === 'registro' && !isCasal && (
            <Input 
              label="Nome Completo"
              placeholder="Seu nome"
              icon={<User size={20} color="#999" />}
              value={formData.nomeCompleto}
              onChangeText={(text) => setFormData({...formData, nomeCompleto: text})}
            />
          )}

          <Input 
            label="E-mail"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            icon={<Mail size={20} color="#999" />}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
          />

          <Input 
            label="Senha"
            placeholder="••••••"
            secureTextEntry
            icon={<Lock size={20} color="#999" />}
            value={formData.senha}
            onChangeText={(text) => setFormData({...formData, senha: text})}
          />

          {modo === 'registro' && (
            <Input 
              label="Confirmar Senha"
              placeholder="••••••"
              secureTextEntry
              icon={<Lock size={20} color="#999" />}
              value={formData.confirmarSenha}
              onChangeText={(text) => setFormData({...formData, confirmarSenha: text})}
            />
          )}

          {modo === 'login' && (
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-accent font-medium">Esqueceu a senha?</Text>
            </TouchableOpacity>
          )}

          <Button 
            title={modo === 'login' ? 'Entrar' : 'Criar Conta'} 
            variant="primary" 
            onPress={handleAction}
            disabled={loading}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
