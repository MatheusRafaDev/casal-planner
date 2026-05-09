import React from 'react';
import { View, Text } from 'react-native';
import { Wallet, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react-native';

interface SummaryCardProps {
  total: number;
  variacao: number;
  label: string;
  type?: 'primary' | 'secondary';
}

export function MainSummaryCard({ total, variacao, label }: SummaryCardProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <View className="bg-accent-nubank rounded-[32px] p-7 mb-6 shadow-xl shadow-purple-500/30">
      <View className="flex-row items-center mb-6">
        <View className="bg-white/20 p-2 rounded-xl">
          <Wallet size={20} color="white" />
        </View>
        <Text className="text-white/80 ml-3 font-semibold text-sm">{label}</Text>
      </View>
      
      <Text className="text-white text-4xl font-black mb-3">
        {formatarMoeda(total)}
      </Text>
      
      <View className="flex-row items-center bg-white/10 self-start px-3 py-1.5 rounded-full">
        {variacao >= 0 ? (
          <TrendingUp size={14} color="#4ADE80" />
        ) : (
          <TrendingDown size={14} color="#F87171" />
        )}
        <Text className={`font-bold text-xs ml-1.5 ${variacao >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {Math.abs(variacao)}%
        </Text>
        <Text className="text-white/50 text-[10px] ml-2 font-medium">vs último mês</Text>
      </View>
    </View>
  );
}

export function ProgressCard({ total, comprados }: { total: number, comprados: number }) {
  const progresso = total > 0 ? (comprados / total) * 100 : 0;

  return (
    <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="bg-blue-50 p-2 rounded-lg mr-3">
            <ShoppingBag size={18} color="#0A84FF" />
          </View>
          <Text className="text-primary font-bold text-base">Progresso da Lista</Text>
        </View>
        <Text className="text-accent font-black">{comprados}<Text className="text-gray-300 font-medium"> / {total}</Text></Text>
      </View>
      
      <View className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
        <View 
          className="h-full bg-accent rounded-full" 
          style={{ width: `${progresso}%` }} 
        />
      </View>
      <Text className="text-gray-400 text-[10px] mt-2 text-center font-medium">
        {progresso === 100 ? '🎉 Tudo comprado!' : `${Math.round(progresso)}% concluído`}
      </Text>
    </View>
  );
}
