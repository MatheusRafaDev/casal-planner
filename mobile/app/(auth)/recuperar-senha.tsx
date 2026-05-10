import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Send, Key } from 'lucide-react-native';

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleRecuperar = () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu e-mail.');
      return;
    }
    Alert.alert('E-mail enviado', 'Se este e-mail estiver em nossa base, você receberá as instruções de recuperação em breve.', [
      { text: 'OK', onPress: () => router.replace('/(auth)/login') }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-6">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-12 h-12 bg-surface rounded-2xl items-center justify-center border border-border mb-10"
        >
          <ArrowLeft size={24} color="#A78BFA" />
        </TouchableOpacity>
        
        <View className="mb-10">
          <View className="bg-primary/10 w-16 h-16 rounded-3xl items-center justify-center mb-6">
            <Key size={32} color="#A78BFA" />
          </View>
          <Text className="text-3xl font-black text-white leading-tight">Esqueceu a{"\n"}sua senha?</Text>
          <Text className="text-text-soft mt-4 text-lg">
            Não se preocupe! Digite seu e-mail abaixo e enviaremos um link para você criar uma nova.
          </Text>
        </View>

        <View className="bg-surface rounded-2xl border border-border px-5 flex-row items-center h-16 mb-10">
          <Mail size={20} color="#71717A" />
          <TextInput
            placeholder="Seu e-mail cadastrado"
            placeholderTextColor="#71717A"
            className="flex-1 ml-3 text-white text-base"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          onPress={handleRecuperar} 
          className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
        >
          <Send size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-lg">Recuperar Acesso</Text>
        </TouchableOpacity>

        <View className="mt-auto items-center pb-8">
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-text-light font-medium">Lembrou a senha? <Text className="text-primary font-bold">Voltar ao Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
