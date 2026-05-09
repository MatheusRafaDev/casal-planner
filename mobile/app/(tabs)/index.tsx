import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StatusBar, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Bell } from 'lucide-react-native';
import { MainSummaryCard, ProgressCard } from '../../src/components/SummaryCards';
import { CategoryCard } from '../../src/components/CategoryCard';
import resumoService, { ResumoData } from '../../src/services/resumoService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resumo, setResumo] = useState<ResumoData | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const carregarDados = async () => {
    try {
      const [resumoData, catsData] = await Promise.all([
        resumoService.getResumoSeguro(),
        categoriasService.listarDoUsuario()
      ]);
      setResumo(resumoData);
      setCategorias(catsData);
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

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      
      <View className="absolute top-0 w-full z-10">
        <BlurView intensity={80} tint="light" className="px-6 pt-14 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dashboard</Text>
            <Text className="text-2xl font-black text-primary">Olá, {usuario?.nomeCompleto?.split(' ')[0] || 'Casal'} 👋</Text>
          </View>
          <TouchableOpacity className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100">
            <Bell size={22} color="#1c1c1e" />
          </TouchableOpacity>
        </BlurView>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-32" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A84FF" />}
      >
        
        <MainSummaryCard 
          label="Saldo Total Planejado"
          total={resumo?.atual.totalGeral || 0}
          variacao={resumo?.comparativo.percentualGeral || 0}
        />

        <View className="flex-row justify-between mb-8">
          <View className="bg-white flex-1 mr-2 p-5 rounded-[24px] shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2 tracking-widest">VR / VA</Text>
            <Text className="text-primary font-black text-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo?.atual.totalVR || 0)}
            </Text>
          </View>
          <View className="bg-white flex-1 ml-2 p-5 rounded-[24px] shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2 tracking-widest">Normal</Text>
            <Text className="text-primary font-black text-lg">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo?.atual.totalNormal || 0)}
            </Text>
          </View>
        </View>

        <ProgressCard 
          total={resumo?.atual.totalItens || 0}
          comprados={resumo?.atual.totalComprados || 0}
        />

        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-xl font-black text-primary">Categorias</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/planning')}>
             <Text className="text-accent font-bold">Ver Planejamento</Text>
          </TouchableOpacity>
        </View>

        {categorias.map((cat) => (
          <CategoryCard 
            key={cat.id}
            nome={cat.nome}
            icon={cat.icon}
            bg={cat.bg}
            total={resumo?.atual.porCategoria[cat.id] || 0}
            quantidade={resumo?.atual.quantidadePorCategoria[cat.id] || 0}
            meta={cat.metaOrcamento}
            onPress={() => router.push('/(tabs)/planning')}
          />
        ))}
        
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}

