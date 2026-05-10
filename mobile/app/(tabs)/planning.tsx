import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Circle, Plus, Filter, Search, ShoppingBag, Tag } from 'lucide-react-native';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import { ItemModal } from '../../src/components/ItemModal';
import { CategoryModal } from '../../src/components/CategoryModal';
import { BlurView } from 'expo-blur';

export default function PlanningScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll(),
        categoriasService.listarDoUsuario()
      ]);
      setItens(its);
      setCategorias(cats);
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

  const handleSaveItem = async (itemData: Partial<Item>) => {
    try {
      if (selectedItem) {
        await itensService.update(selectedItem.id, itemData);
      } else {
        await itensService.create(itemData);
      }
      carregarDados();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveCategory = async (catData: Partial<Categoria>) => {
    try {
      if (selectedCategory) {
        await categoriasService.update(selectedCategory.id, catData);
      } else {
        await categoriasService.create(catData);
      }
      carregarDados();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComprado = async (item: Item) => {
    try {
      const novoEstado = !item.comprado;
      await itensService.updateComprado(item.id, novoEstado);
      setItens(itens.map(i => i.id === item.id ? { ...i, comprado: novoEstado } : i));
    } catch (error) {
      console.error(error);
    }
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
      <View className="absolute top-0 w-full z-10">
        <BlurView intensity={80} tint="light" className="px-6 pt-14 pb-4">
           <View className="flex-row justify-between items-center mb-4">
              <Text className="text-3xl font-black text-primary">Planejamento</Text>
              <View className="flex-row">
                <TouchableOpacity 
                  onPress={() => { setSelectedCategory(null); setCategoryModalVisible(true); }}
                  className="bg-gray-100 p-3 rounded-full mr-2"
                >
                  <Tag size={22} color="#1c1c1e" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => { setSelectedItem(null); setItemModalVisible(true); }}
                  className="bg-accent p-3 rounded-full shadow-lg"
                >
                  <Plus size={22} color="white" />
                </TouchableOpacity>
              </View>
           </View>
           <View className="flex-row items-center bg-white rounded-2xl px-4 h-12 shadow-sm border border-gray-100">
              <Search size={20} color="#999" />
              <Text className="text-gray-400 ml-2">Buscar itens ou categorias...</Text>
           </View>
        </BlurView>
      </View>

      <ScrollView 
        className="flex-1 px-6 pt-44"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} tintColor="#0A84FF" />}
      >
        <View className="flex-row justify-between items-center mb-6">
           <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full">
              <ShoppingBag size={18} color="#666" />
              <Text className="ml-2 font-medium text-gray-600">{itens.filter(i => !i.comprado).length} pendentes</Text>
           </View>
           <TouchableOpacity className="flex-row items-center">
              <Filter size={18} color="#0A84FF" />
              <Text className="ml-1 font-medium text-accent">Filtrar</Text>
           </TouchableOpacity>
        </View>

        {itens.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ShoppingBag size={60} color="#E5E5EA" />
            <Text className="text-gray-400 mt-4 text-lg">Nenhum item encontrado</Text>
          </View>
        ) : (
          itens.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => toggleComprado(item)}
              onLongPress={() => { setSelectedItem(item); setModalVisible(true); }}
              className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm border ${item.comprado ? 'border-gray-100 opacity-60' : 'border-gray-50'}`}
            >
              <View className="mr-4">
                {item.comprado ? (
                  <CheckCircle2 size={26} color="#4ADE80" />
                ) : (
                  <Circle size={26} color="#D1D1D6" />
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-base font-semibold ${item.comprado ? 'text-gray-400 line-through' : 'text-primary'}`}>
                  {item.nome}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {item.loja || 'Sem local'} • R$ {item.preco?.toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <View className="bg-gray-50 px-3 py-1 rounded-lg">
                <Text className="text-gray-500 font-bold text-xs">{item.quantidade}x</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        
        <View className="h-32" />
      </ScrollView>

      <ItemModal 
        visible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        onSave={handleSaveItem}
        item={selectedItem}
      />

      <CategoryModal 
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        categoria={selectedCategory}
      />
    </SafeAreaView>
  );
}
