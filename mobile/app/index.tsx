import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Sparkles, Shield, Smartphone, Zap } from 'lucide-react-native';
import { Logo } from '../src/components/Logo';
import * as Haptics from 'expo-haptics';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/registro');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-12 pb-10">
        <View className="items-center mb-10">
          <View className="mb-8">
            <Logo size={140} />
          </View>
          <View className="bg-primary/20 px-4 py-1 rounded-full flex-row items-center mb-4">
             <Sparkles size={14} color="#A78BFA" />
             <Text className="text-primary font-bold text-[10px] uppercase tracking-[2px] ml-2">Casal Planner Premium</Text>
          </View>
          <Text className="text-4xl font-black text-center text-white leading-tight">
            Tudo em ordem{"\n"}
            <Text className="text-primary">nada fora do plano</Text>
          </Text>
          <Text className="text-text-soft text-center mt-6 text-lg leading-6 font-medium">
            O único app de organização pensado exclusivamente para o casal moderno.
          </Text>
        </View>

        <View className="space-y-4 mb-10">
          {[
            { icon: Shield, text: "Segurança de nível bancário", color: "#34D399" },
            { icon: Smartphone, text: "Interface nativa ultra-rápida", color: "#A78BFA" },
            { icon: Zap, text: "Sincronização instantânea", color: "#FBBF24" }
          ].map((item, i) => (
            <View key={i} className="flex-row items-center bg-surface/50 p-5 rounded-[24px] border border-border mb-4">
              <View style={{ backgroundColor: `${item.color}15` }} className="p-3 rounded-2xl">
                <item.icon size={22} color={item.color} />
              </View>
              <Text className="ml-4 text-white font-semibold text-base">{item.text}</Text>
            </View>
          ))}
        </View>

        <View className="mt-auto">
          <TouchableOpacity 
            onPress={handleStart}
            activeOpacity={0.8}
            className="bg-primary h-18 rounded-[24px] flex-row items-center justify-center shadow-2xl shadow-primary/40"
          >
            <Text className="text-white font-black text-xl mr-2">Criar minha conta</Text>
            <ArrowRight size={22} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/(auth)/login');
            }}
            className="mt-4 h-18 rounded-[24px] items-center justify-center border border-border"
          >
            <Text className="text-text-soft font-bold text-lg">Acessar minha conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
