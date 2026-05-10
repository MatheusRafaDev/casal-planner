import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-svg-charts';
import { resumoService, ResumoGeral } from '../../src/services/resumoService';
import { itensService } from '../../src/services/itensService';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react-native';

export default function EstatisticasScreen() {
  const [resumo, setResumo] = useState<ResumoGeral | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const its = await itensService.getAll().catch(() => []);
      const res = await resumoService.getResumoSeguro(its);
      setResumo(res);
    } catch (error) {
      console.error('Erro estatisticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  if (loading && !refreshing) return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator color="#A78BFA" /></View>;

  const atual = resumo?.atual || { totalPago: 0, totalFalta: 0, totalGeral: 0, totalItens: 0, totalComprados: 0 };
  const pctComprados = atual.totalItens > 0 ? Math.round((atual.totalComprados / atual.totalItens) * 100) : 0;

  const data = [
    {
      key: 1,
      value: atual.totalPago || 0.0001, // Evita erro se for 0
      svg: { fill: '#A78BFA' },
      arc: { outerRadius: '100%', padAngle: 0.05 }
    },
    {
      key: 2,
      value: (atual.totalGeral - atual.totalPago) || 0.0001,
      svg: { fill: '#3F3F46' },
      arc: { outerRadius: '90%', padAngle: 0.05 }
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} tintColor="#A78BFA" />}
      >
        <View className="flex-row items-center mb-1">
          <TrendingUp size={16} color="#A78BFA" />
          <Text className="text-text-soft font-medium ml-2">Insights Financeiros</Text>
        </View>
        <Text className="text-3xl font-black text-white mb-8">Análise de Gastos</Text>

        <View className="bg-surface/50 p-8 rounded-[40px] border border-border items-center mb-8">
           <View className="relative w-64 h-64 justify-center items-center">
              <PieChart 
                style={{ height: 220, width: 220 }} 
                data={data} 
                innerRadius="75%"
              />
              <View className="absolute items-center">
                 <Text className="text-text-soft font-bold text-xs uppercase tracking-widest">Pago</Text>
                 <Text className="text-3xl font-black text-white">{pctComprados}%</Text>
              </View>
           </View>
        </View>

        <View className="space-y-4 mb-10">
           <View className="bg-surface/50 p-6 rounded-[32px] border border-border flex-row items-center mb-4">
              <View className="bg-primary/20 p-4 rounded-2xl mr-4">
                 <BarChart3 size={24} color="#A78BFA" />
              </View>
              <View className="flex-1">
                 <Text className="text-white font-bold text-base">Meta de Itens</Text>
                 <Text className="text-text-soft text-xs mt-1">Você já comprou {atual.totalComprados} de {atual.totalItens} itens.</Text>
              </View>
           </View>

           <View className="bg-primary/10 p-6 rounded-[32px] border border-primary/20 flex-row items-center">
              <View className="bg-primary/20 p-4 rounded-2xl mr-4">
                 <Sparkles size={24} color="#A78BFA" />
              </View>
              <View className="flex-1">
                 <Text className="text-white font-bold text-base">Análise IA</Text>
                 <Text className="text-text-soft text-xs mt-1">
                    {pctComprados > 70 
                       ? "Parabéns! Vocês estão com excelente controle financeiro este mês." 
                       : "Atenção ao orçamento! Itens pendentes superam o valor já pago."}
                 </Text>
              </View>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
