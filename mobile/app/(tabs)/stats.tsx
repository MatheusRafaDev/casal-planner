import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { PieChart, BarChart3, TrendingUp, AlertCircle, Coffee, DollarSign } from 'lucide-react-native';
import resumoService, { ResumoData } from '../../src/services/resumoService';

export default function StatsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumo, setResumo] = useState<ResumoData | null>(null);

  const carregarDados = async () => {
    try {
      const data = await resumoService.getResumoSeguro();
      setResumo(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute top-0 w-full z-10">
        <BlurView intensity={80} tint="light" className="px-6 pt-14 pb-4">
           <Text className="text-3xl font-black text-primary">Estatísticas</Text>
        </BlurView>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-32" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} tintColor="#0A84FF" />}
      >
        
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Por Pagamento</Text>
        <View className="flex-row mb-8">
           <View className="flex-1 bg-white p-5 rounded-[32px] mr-2 shadow-sm border border-gray-100">
              <View className="bg-orange-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                 <Coffee size={20} color="#FF9500" />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">VR / VA</Text>
              <Text className="text-primary font-black text-lg">{formatarMoeda(resumo?.atual.totalVR || 0)}</Text>
              <View className="h-1 bg-gray-50 rounded-full mt-3 overflow-hidden">
                 <View className="h-full bg-orange-400" style={{ width: '45%' }} />
              </View>
           </View>
           <View className="flex-1 bg-white p-5 rounded-[32px] ml-2 shadow-sm border border-gray-100">
              <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                 <DollarSign size={20} color="#0A84FF" />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Normal</Text>
              <Text className="text-primary font-black text-lg">{formatarMoeda(resumo?.atual.totalNormal || 0)}</Text>
              <View className="h-1 bg-gray-50 rounded-full mt-3 overflow-hidden">
                 <View className="h-full bg-blue-400" style={{ width: '75%' }} />
              </View>
           </View>
        </View>

        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 ml-1">Análise de Prioridade</Text>
        <View className="bg-white rounded-[32px] p-6 mb-8 shadow-sm border border-gray-100">
           <PriorityRow label="Urgente" color="#FF3B30" total={1200} pago={800} emoji="🔴" />
           <View className="h-[1px] bg-gray-50 my-4" />
           <PriorityRow label="Normal" color="#FFCC00" total={2500} pago={1200} emoji="🟡" />
           <View className="h-[1px] bg-gray-50 my-4" />
           <PriorityRow label="Pode Esperar" color="#34C759" total={800} pago={200} emoji="🟢" />
        </View>

        <View className="bg-accent-nubank rounded-[32px] p-8 mb-12 items-center">
           <TrendingUp size={40} color="white" opacity={0.3} />
           <Text className="text-white text-lg font-bold text-center mt-4">
              Seu planejamento está {resumo?.comparativo.percentualGeral || 0}% mais eficiente este mês!
           </Text>
           <Text className="text-white/60 text-xs text-center mt-2">
              Continue assim para economizar mais.
           </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

function PriorityRow({ label, color, total, pago, emoji }: any) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };
  const pct = (pago / total) * 100;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-primary">{emoji} {label}</Text>
        <Text className="text-xs text-gray-400 font-bold">{Math.round(pct)}% pago</Text>
      </View>
      <View className="h-2 bg-gray-50 rounded-full overflow-hidden mb-2">
         <View style={{ backgroundColor: color, width: `${pct}%` }} className="h-full rounded-full" />
      </View>
      <View className="flex-row justify-between">
         <Text className="text-[10px] text-gray-400">Total: {formatarMoeda(total)}</Text>
         <Text className="text-[10px] text-gray-400">Pago: {formatarMoeda(pago)}</Text>
      </View>
    </View>
  );
}
