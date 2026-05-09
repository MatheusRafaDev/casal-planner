import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CreditCard, ChevronRight } from 'lucide-react-native';

interface CategoryCardProps {
  nome: string;
  icon?: string;
  bg?: string;
  total: number;
  quantidade: number;
  meta?: number;
  onPress?: () => void;
}

export function CategoryCard({ nome, icon, bg, total, quantidade, meta, onPress }: CategoryCardProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const progresso = meta ? Math.min((total / meta) * 100, 100) : 0;

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View 
            style={{ backgroundColor: bg || '#F2F2F7' }} 
            className="w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-sm"
          >
            {icon ? (
              <Text className="text-2xl">{icon}</Text>
            ) : (
              <CreditCard size={24} color="#1c1c1e" />
            )}
          </View>
          <View>
            <Text className="font-bold text-primary text-lg">{nome}</Text>
            <Text className="text-gray-400 text-xs">{quantidade} itens adicionados</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#C7C7CC" />
      </View>

      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Total Gasto</Text>
          <Text className="text-primary font-black text-xl">{formatarMoeda(total)}</Text>
        </View>
        
        {meta ? (
          <View className="items-end">
            <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Meta: {formatarMoeda(meta)}</Text>
            <View className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
               <View 
                className={`h-full rounded-full ${progresso > 90 ? 'bg-red-500' : 'bg-accent'}`} 
                style={{ width: `${progresso}%` }} 
              />
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
