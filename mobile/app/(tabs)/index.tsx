import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ShoppingCart, CheckCircle, AlertCircle, Target, 
  Coffee, DollarSign, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react-native';
import { resumoService, ResumoGeral } from '../../src/services/resumoService';
import { useAuth } from '../../src/context/AuthContext';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';

export default function InicioScreen() {
  const { usuario } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll(),
        categoriasService.listarDoUsuario()
      ]);
      setItens(its || []);
      setCategorias(cats || []);
    } catch (error) {
      console.error("Erro dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  if (loading && !refreshing) return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator color="#A78BFA" /></View>;

  // Cálculos Ultra-Seguros (Mirror Web Inicio.jsx)
  const calcTotal = (arr: Item[]) => arr.reduce((acc, i) => acc + ((Number(i.preco) || 0) * (Number(i.quantidade) || 0)), 0);
  
  const totalGeral = calcTotal(itens);
  const totalPago = calcTotal(itens.filter(i => i.comprado));
  const totalFalta = totalGeral - totalPago;
  const totalItens = itens.length;
  const totalComprados = itens.filter(i => i.comprado).length;
  const pctComprados = totalItens > 0 ? Math.round((totalComprados / totalItens) * 100) : 0;
  const urgenciaFalta = calcTotal(itens.filter(i => i.prioridade === 'urgente' && !i.comprado));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} tintColor="#A78BFA" />}
      >
        <Text className="text-text-soft font-medium mb-1">Olá, {usuario?.nomeCompleto?.split(' ')[0] || 'Usuário'}! 👋</Text>
        <Text className="text-3xl font-black text-white mb-8">Resumo do mês</Text>

        {/* 1. Cards de Resumo Financeiro (CardsGrid do Web) */}
        <View className="flex-row flex-wrap justify-between mb-8">
           <View className="bg-surface w-[48%] p-4 rounded-[28px] border border-border mb-4">
              <View className="bg-primary/20 w-8 h-8 rounded-xl items-center justify-center mb-3"><ShoppingCart size={16} color="#A78BFA" /></View>
              <Text className="text-text-soft text-[10px] font-bold uppercase">Total Planejado</Text>
              <Text className="text-lg font-black text-white">R$ {(totalGeral || 0).toFixed(2)}</Text>
           </View>

           <View className="bg-surface w-[48%] p-4 rounded-[28px] border border-border mb-4">
              <View className="bg-green-500/20 w-8 h-8 rounded-xl items-center justify-center mb-3"><CheckCircle size={16} color="#22C55E" /></View>
              <Text className="text-text-soft text-[10px] font-bold uppercase">Já Pago</Text>
              <Text className="text-lg font-black text-white">R$ {(totalPago || 0).toFixed(2)}</Text>
           </View>

           <View className="bg-surface w-[48%] p-4 rounded-[28px] border border-border">
              <View className="bg-yellow-500/20 w-8 h-8 rounded-xl items-center justify-center mb-3"><AlertCircle size={16} color="#EAB308" /></View>
              <Text className="text-text-soft text-[10px] font-bold uppercase">Falta Pagar</Text>
              <Text className="text-lg font-black text-white">R$ {(totalFalta || 0).toFixed(2)}</Text>
           </View>

           <View className="bg-surface w-[48%] p-4 rounded-[28px] border border-border">
              <View className="bg-blue-500/20 w-8 h-8 rounded-xl items-center justify-center mb-3"><Target size={16} color="#3B82F6" /></View>
              <Text className="text-text-soft text-[10px] font-bold uppercase">Progresso</Text>
              <Text className="text-lg font-black text-white">{pctComprados}%</Text>
           </View>
        </View>

        {/* 2. Por Tipo de Pagamento (ResumoGrid do Web) */}
        <Text className="text-white font-bold text-lg mb-4">💳 Por tipo de pagamento</Text>
        <View className="flex-row justify-between mb-8">
           <View className="bg-surface w-[48%] p-5 rounded-[32px] border-l-4 border-yellow-500 border border-border">
              <Coffee size={20} color="#FBBF24" className="mb-3" />
              <Text className="text-lg font-black text-white">R$ {calcTotal(itens.filter(i => i.pagamento === 'vr')).toFixed(2)}</Text>
              <Text className="text-[10px] text-text-soft mt-1">VR / VA</Text>
           </View>

           <View className="bg-surface w-[48%] p-5 rounded-[32px] border-l-4 border-primary border border-border">
              <DollarSign size={20} color="#A78BFA" className="mb-3" />
              <Text className="text-lg font-black text-white">R$ {calcTotal(itens.filter(i => i.pagamento === 'normal')).toFixed(2)}</Text>
              <Text className="text-[10px] text-text-soft mt-1">Normal</Text>
           </View>
        </View>

        {/* 3. Resumo por Prioridade (PrioridadeGrid do Web) */}
        <Text className="text-white font-bold text-lg mb-4">🎯 Resumo por prioridade</Text>
        <View className="flex-row flex-wrap justify-between mb-8">
           {['urgente', 'normal', 'pode_esperar'].map((p) => {
              const valor = calcTotal(itens.filter(i => (p === 'normal' ? (i.prioridade !== 'urgente' && i.prioridade !== 'pode_esperar') : i.prioridade === p)));
              if (valor === 0 && p !== 'urgente') return null;
              const label = p === 'urgente' ? '🔴 Urgente' : p === 'normal' ? '🟡 Normal' : '🟢 Pode esperar';
              return (
                 <View key={p} className="bg-surface w-[48%] p-4 rounded-2xl border border-border mb-4">
                    <Text className="text-xs font-bold text-white mb-2">{label}</Text>
                    <Text className="text-base font-black text-white">R$ {(valor || 0).toFixed(2)}</Text>
                 </View>
              );
           })}
        </View>

        {/* 4. Dica Inteligente (TipCard do Web) */}
        <View className="bg-primary/10 p-5 rounded-[32px] border border-primary/20 flex-row items-center mb-8">
           <Text className="text-2xl mr-4">💡</Text>
           <View className="flex-1">
              <Text className="text-white text-xs font-medium leading-relaxed">
                 {urgenciaFalta > 0 
                    ? `Foco total! Você ainda precisa de R$ ${urgenciaFalta.toFixed(2)} em itens URGENTES.` 
                    : `Bom progresso! Faltam apenas R$ ${totalFalta.toFixed(2)} para completar tudo.`}
              </Text>
           </View>
        </View>

        {/* 5. Total por Categoria (CatGrid do Web) */}
        <Text className="text-white font-bold text-lg mb-4">📊 Total por categoria</Text>
        <View className="mb-10">
           {categorias.map(cat => {
              const totalCat = calcTotal(itens.filter(i => i.categoriaId === cat.id));
              if (totalCat === 0) return null;
              return (
                 <View key={cat.id} className="flex-row items-center bg-surface/40 p-4 rounded-2xl border border-border mb-3">
                    <View style={{ backgroundColor: cat.cor + '20' }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                       <Text className="text-lg">{cat.icone || '📦'}</Text>
                    </View>
                    <View className="flex-1">
                       <Text className="text-white font-bold text-sm">{cat.nome}</Text>
                       <Text className="text-[10px] text-text-soft">R$ {(totalCat || 0).toFixed(2)}</Text>
                    </View>
                    <ChevronRight size={16} color="#71717A" />
                 </View>
              );
           })}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
