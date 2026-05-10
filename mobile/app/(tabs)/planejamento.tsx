import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus, Search, ChevronDown, ChevronUp, CheckCircle2, 
  ShoppingBag, Store, Tag, CreditCard, ArrowUpDown
} from 'lucide-react-native';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import { ItemModal } from '../../src/components/ItemModal';
import * as Haptics from 'expo-haptics';

export default function PlanejamentoScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'comprado' | 'vrva' | 'normal'>('all');
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>(undefined);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'preco' | 'prioridade'>('preco');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const carregarDados = async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll(),
        categoriasService.listarDoUsuario()
      ]);
      setItens(its || []);
      setCategorias((cats || []).sort((a,b) => (a.ordem || 0) - (b.ordem || 0)));
      
      const expanded: Record<string, boolean> = {};
      (cats || []).forEach(c => expanded[c.id] = true);
      setExpandedCats(expanded);
    } catch (error) {
      console.error("Erro planejamento:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleToggleComprado = async (item: Item) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await itensService.updateComprado(item.id, !item.comprado);
      carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o item.');
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert('Excluir', 'Deseja realmente remover este item?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          await itensService.delete(id);
          carregarDados();
      }}
    ]);
  };

  const handleSaveItem = async (data: any) => {
    try {
      if (selectedItem) await itensService.update(selectedItem.id, data);
      else await itensService.create(data);
      setModalVisible(false);
      carregarDados();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar item.');
    }
  };

  const filteredAndSortedItens = useMemo(() => {
    let its = itens.filter(i => {
      const matchBusca = (i.nome || '').toLowerCase().includes(busca.toLowerCase());
      let matchFiltro = true;
      if (filter === 'comprado') matchFiltro = i.comprado === true;
      else if (filter === 'vrva') matchFiltro = i.pagamento === 'vr';
      else if (filter === 'normal') matchFiltro = i.pagamento === 'normal';
      return matchBusca && matchFiltro;
    });

    return [...its].sort((a, b) => {
      const precoA = (Number(a.preco) || 0) * (Number(a.quantidade) || 0);
      const precoB = (Number(b.preco) || 0) * (Number(b.quantidade) || 0);
      
      if (sortBy === 'preco') {
        return sortOrder === 'asc' ? precoA - precoB : precoB - precoA;
      }
      if (sortBy === 'prioridade') {
        const pMap: any = { urgente: 0, alta: 1, media: 2, baixa: 3 };
        const valA = pMap[a.prioridade] ?? 1;
        const valB = pMap[b.prioridade] ?? 1;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [itens, busca, filter, sortBy, sortOrder]);

  const toggleExpand = (catId: string) => {
    Haptics.selectionAsync();
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (loading && !refreshing) return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator color="#A78BFA" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pt-4 mb-2">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-black text-white">Planejamento</Text>
          <TouchableOpacity onPress={() => { setSelectedItem(undefined); setModalVisible(true); }} className="bg-primary w-12 h-12 rounded-2xl items-center justify-center">
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-surface border border-border rounded-2xl flex-row items-center px-4 h-12 mb-4">
          <Search size={18} color="#71717A" />
          <TextInput placeholder="Buscar na lista..." placeholderTextColor="#71717A" className="flex-1 ml-3 text-white font-medium" value={busca} onChangeText={setBusca} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {['all', 'comprado', 'vrva', 'normal'].map((f) => (
            <TouchableOpacity key={f} onPress={() => setFilter(f as any)} className={`px-6 py-2 rounded-full mr-2 border ${filter === f ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
              <Text className={`font-bold text-xs ${filter === f ? 'text-white' : 'text-text-soft'}`}>{f === 'all' ? 'Todos' : f === 'comprado' ? 'Comprados' : f === 'vrva' ? 'VR/VA' : 'Normal'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row items-center mb-4 px-1">
          <ArrowUpDown size={14} color="#71717A" />
          <Text className="text-[10px] text-text-soft font-bold uppercase ml-2 mr-4">Ordenar por:</Text>
          {['preco', 'prioridade'].map((s) => (
            <TouchableOpacity key={s} onPress={() => { if (sortBy === s) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); else setSortBy(s as any); }} className="mr-4">
              <Text className={`text-[10px] font-black uppercase ${sortBy === s ? 'text-primary' : 'text-text-soft'}`}>{s === 'preco' ? 'Preço' : 'Prioridade'} {sortBy === s ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-6" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} tintColor="#A78BFA" />}>
        {categorias.map(cat => {
          const catItens = filteredAndSortedItens.filter(i => i.categoriaId === cat.id);
          if (catItens.length === 0 && busca) return null;
          
          const totalCat = catItens.reduce((acc, i) => acc + ((Number(i.preco) || 0) * (Number(i.quantidade) || 0)), 0);
          const comprados = catItens.filter(i => i.comprado).length;
          const progresso = catItens.length > 0 ? (comprados / catItens.length) * 100 : 0;
          const isExpanded = expandedCats[cat.id];

          return (
            <View key={cat.id} className="mb-6">
              <TouchableOpacity onPress={() => toggleExpand(cat.id)} className="bg-surface border border-border rounded-3xl overflow-hidden">
                <View style={{ borderLeftWidth: 6, borderLeftColor: cat.cor }} className="p-4">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{cat.icone || '📦'}</Text>
                      <View>
                        <Text className="text-white font-bold text-lg">{cat.nome}</Text>
                        <Text className="text-text-soft text-[10px] font-bold uppercase">R$ {(totalCat || 0).toFixed(2)} • {catItens.length} itens</Text>
                      </View>
                    </View>
                    {isExpanded ? <ChevronUp size={20} color="#71717A" /> : <ChevronDown size={20} color="#71717A" />}
                  </View>
                  <View className="h-1 bg-background rounded-full mt-4 overflow-hidden">
                    <View style={{ width: `${progresso}%`, backgroundColor: cat.cor }} className="h-full" />
                  </View>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View className="mt-3 space-y-3">
                  {catItens.map(item => (
                    <TouchableOpacity key={item.id} onPress={() => { setSelectedItem(item); setModalVisible(true); }} onLongPress={() => handleDeleteItem(item.id)} className="bg-surface/50 border border-border rounded-2xl p-4 mb-2">
                      <View className="flex-row items-center mb-3">
                        <TouchableOpacity onPress={() => handleToggleComprado(item)} className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${item.comprado ? 'bg-green-500 border-green-500' : 'border-border'}`}>
                          {item.comprado && <CheckCircle2 size={14} color="white" />}
                        </TouchableOpacity>
                        <View className="flex-1 ml-3">
                          <Text className={`text-white font-bold text-base ${item.comprado ? 'line-through opacity-40' : ''}`}>{item.nome}</Text>
                          <Text className="text-primary font-black text-sm">R$ {((Number(item.preco) || 0) * (Number(item.quantidade) || 0)).toFixed(2)}</Text>
                        </View>
                      </View>

                      <View className="flex-row flex-wrap items-center mt-1">
                         <View className="bg-background/50 px-2 py-1 rounded-lg mr-2 mb-2 border border-border flex-row items-center">
                            <Text className="text-[9px] mr-1">{item.prioridade === 'urgente' ? '🔴' : item.prioridade === 'alta' ? '🟠' : '🟡'}</Text>
                            <Text className="text-[9px] text-text-soft font-bold uppercase">{item.prioridade}</Text>
                         </View>
                         <View className="bg-background/50 px-2 py-1 rounded-lg mr-2 mb-2 border border-border">
                            <Text className="text-[9px] text-text-soft font-bold">R$ {(Number(item.preco) || 0).toFixed(2)}/un</Text>
                         </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        <View className="h-20" />
      </ScrollView>

      <ItemModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveItem} item={selectedItem} />
    </SafeAreaView>
  );
}
