import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Alert, TextInput, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, ChevronDown, ChevronUp, CheckCircle2, Edit2, Trash2, FolderPlus } from 'lucide-react-native';
import { itensService, Item } from '../../src/services/itensService';
import { categoriasService, Categoria } from '../../src/services/categoriasService';
import { ItemModal } from '../../src/components/ItemModal';
import { CategoriaModal } from '../../src/components/CategoriaModal';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Skeleton, SkeletonRow } from '../../src/components/ui/SkeletonLoader';
import * as Haptics from 'expo-haptics';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

type FilterType = 'all' | 'comprado' | 'pendente' | 'vrva' | 'normal';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'comprado', label: 'Comprados' },
  { key: 'vrva', label: 'VR/VA' },
  { key: 'normal', label: 'Normal' },
];

// ─── Item Card ────────────────────────────────────────────────
function ItemCard({ item, onToggle, onPress, onDelete }: {
  item: Item; onToggle: () => void; onPress: () => void; onDelete: () => void;
}) {
  const total = (Number(item.preco) || 0) * (Number(item.quantidade) || 0);
  const hasImage = item.fotoUrl && item.fotoUrl.length > 0;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Excluir item', `Remover "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      onPress={onPress} onLongPress={handleLongPress} activeOpacity={0.85}
      style={{
        backgroundColor: item.comprado ? '#27272A60' : '#27272A',
        borderRadius: 18, padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: item.comprado ? '#3F3F4640' : '#3F3F46',
        flexDirection: 'row', alignItems: 'flex-start',
      }}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          width: 24, height: 24, borderRadius: 8, borderWidth: 2,
          borderColor: item.comprado ? '#22C55E' : '#52525B',
          backgroundColor: item.comprado ? '#22C55E' : 'transparent',
          alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1,
        }}
      >
        {item.comprado && <CheckCircle2 size={14} color="white" />}
      </TouchableOpacity>

      {/* Imagem do produto (se existir) */}
      {hasImage && (
        <TouchableOpacity onPress={onPress} style={{ marginRight: 10 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 8, overflow: 'hidden',
            backgroundColor: '#3F3F46', borderWidth: 1, borderColor: '#3F3F46',
          }}>
            <Image
              source={{ uri: item.fotoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text
            numberOfLines={2}
            style={{
              color: item.comprado ? '#52525B' : '#FFFFFF', fontWeight: '700',
              fontSize: 14, flex: 1, marginRight: 8,
              textDecorationLine: item.comprado ? 'line-through' : 'none',
            }}
          >
            {item.nome}
          </Text>
          <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14 }}>{fmt(total)}</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {item.prioridade && item.prioridade !== 'normal' && (
            <View style={{ backgroundColor: '#18181B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, borderWidth: 1, borderColor: '#3F3F46' }}>
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.prioridade === 'urgente' ? '🔴 Urgente' : item.prioridade === 'pode_esperar' ? '🟢 Pode esperar' : item.prioridade}
              </Text>
            </View>
          )}
          {item.loja ? (
            <View style={{ backgroundColor: '#18181B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, borderWidth: 1, borderColor: '#3F3F46' }}>
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700' }}>🏪 {item.loja}</Text>
            </View>
          ) : null}
          {Number(item.quantidade) > 1 && (
            <View style={{ backgroundColor: '#18181B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, borderWidth: 1, borderColor: '#3F3F46' }}>
              <Text style={{ color: '#A1A1AA', fontSize: 9, fontWeight: '700' }}>× {item.quantidade}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Category Group ───────────────────────────────────────────
function CategoryGroup({
  cat, items, isExpanded, onToggle, onToggleItem, onEditItem, onDeleteItem,
  onEditCategoria, onDeleteCategoria,
}: {
  cat: Categoria; items: Item[]; isExpanded: boolean;
  onToggle: () => void; onToggleItem: (item: Item) => void;
  onEditItem: (item: Item) => void; onDeleteItem: (id: string) => void;
  onEditCategoria: (cat: Categoria) => void; onDeleteCategoria: (id: string) => void;
}) {
  const calcTotal = (arr: Item[]) =>
    arr.reduce((a, i) => a + (Number(i.preco) || 0) * (Number(i.quantidade) || 0), 0);

  const totalCat = calcTotal(items);
  const comprados = items.filter(i => i.comprado).length;
  const progresso = items.length > 0 ? (comprados / items.length) * 100 : 0;
  const cor = (cat.cor as string) || '#A78BFA';

  const handleCatLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(cat.nome, 'O que deseja fazer?', [
      { text: 'Editar categoria', onPress: () => onEditCategoria(cat) },
      {
        text: 'Excluir categoria', style: 'destructive',
        onPress: () => Alert.alert(
          'Excluir categoria',
          `Excluir "${cat.nome}" e seus ${items.length} itens?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => onDeleteCategoria(cat.id) },
          ]
        ),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <TouchableOpacity
        onPress={onToggle} onLongPress={handleCatLongPress} activeOpacity={0.85}
        style={{
          backgroundColor: '#27272A', borderRadius: 20, overflow: 'hidden',
          borderWidth: 1, borderColor: '#3F3F46',
        }}
      >
        <View style={{ borderLeftWidth: 4, borderLeftColor: cor, padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{(cat.icone as string) || '📦'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{cat.nome}</Text>
                <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '600', marginTop: 1 }}>
                  {fmt(totalCat)} • {items.length} itens • {comprados} ✓
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => onEditCategoria(cat)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 4 }}
              >
                <Edit2 size={15} color="#52525B" />
              </TouchableOpacity>
              {isExpanded ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
            </View>
          </View>
          <ProgressBar progress={progresso} color={cor} height={4} />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ paddingTop: 6, paddingHorizontal: 2 }}>
          {items.map(item => (
            <ItemCard
              key={item.id} item={item}
              onToggle={() => onToggleItem(item)}
              onPress={() => onEditItem(item)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
          {items.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: '#52525B', fontSize: 12 }}>Nenhum item • toque em + para adicionar</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Skeleton width={180} height={28} borderRadius={8} />
          <Skeleton width={44} height={44} borderRadius={14} />
        </View>
        <Skeleton width="100%" height={46} borderRadius={14} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[80, 100, 80, 60, 70].map((w, i) => <Skeleton key={i} width={w} height={30} borderRadius={99} />)}
        </View>
        {[0, 1, 2].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function PlanejamentoScreen() {
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [busca, setBusca] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modals
  const [itemModal, setItemModal] = useState<{ visible: boolean; item?: Item; categoriaId?: string }>({ visible: false });
  const [catModal, setCatModal] = useState<{ visible: boolean; categoria?: Categoria }>({ visible: false });

  const carregar = useCallback(async () => {
    try {
      const [its, cats] = await Promise.all([
        itensService.getAll().catch(() => [] as Item[]),
        categoriasService.listarDoUsuario().catch(() => [] as Categoria[]),
      ]);
      setItens(its || []);
      const sorted = (cats || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      setCategorias(sorted);
      setExpandedCats(prev => {
        const next: Record<string, boolean> = {};
        sorted.forEach(c => { next[c.id] = prev[c.id] ?? true; });
        return next;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleToggle = async (item: Item) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Optimistic update
    setItens(prev => prev.map(i => i.id === item.id ? { ...i, comprado: !i.comprado } : i));
    try {
      await itensService.updateComprado(item.id, !item.comprado);
    } catch {
      setItens(prev => prev.map(i => i.id === item.id ? { ...i, comprado: item.comprado } : i));
      Alert.alert('Erro', 'Não foi possível atualizar o item.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setItens(prev => prev.filter(i => i.id !== id));
    try { await itensService.delete(id); } catch { carregar(); }
  };

  const handleSaveItem = async (data: any) => {
    try {
      if (itemModal.item) {
        const updated = await itensService.update(itemModal.item.id, data);
        setItens(prev => prev.map(i => i.id === itemModal.item!.id ? { ...i, ...data } : i));
      } else {
        const novo = await itensService.create({ ...data, categoriaId: data.categoriaId || itemModal.categoriaId });
        setItens(prev => [novo, ...prev]);
      }
      setItemModal({ visible: false });
    } catch {
      Alert.alert('Erro', 'Falha ao salvar item.');
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    const backup = { cats: [...categorias], its: [...itens] };
    setCategorias(prev => prev.filter(c => c.id !== id));
    setItens(prev => prev.filter(i => i.categoriaId !== id));
    try { await categoriasService.delete(id); } catch {
      setCategorias(backup.cats);
      setItens(backup.its);
      Alert.alert('Erro', 'Não foi possível excluir a categoria.');
    }
  };

  const filteredItens = useMemo(() => {
    return itens.filter(i => {
      const matchBusca = (i.nome || '').toLowerCase().includes(busca.toLowerCase());
      let matchFiltro = true;
      if (filter === 'comprado') matchFiltro = !!i.comprado;
      else if (filter === 'pendente') matchFiltro = !i.comprado;
      else if (filter === 'vrva') matchFiltro = i.pagamento === 'vr';
      else if (filter === 'normal') matchFiltro = i.pagamento === 'normal';
      return matchBusca && matchFiltro;
    });
  }, [itens, busca, filter]);

  const totalItens = filteredItens.length;
  const totalComprados = filteredItens.filter(i => i.comprado).length;

  if (loading) return <LoadingSkeleton />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }} edges={['top']}>
      {/* ── Header ──────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.8 }}>
            Planejamento
          </Text>
          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCatModal({ visible: true }); }}
              style={{ backgroundColor: '#27272A', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3F3F46' }}
            >
              <FolderPlus size={18} color="#A78BFA" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setItemModal({ visible: true }); }}
              style={{ backgroundColor: '#A78BFA', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={{
          backgroundColor: '#27272A', borderRadius: 14, flexDirection: 'row',
          alignItems: 'center', paddingHorizontal: 14, height: 44,
          marginBottom: 10, borderWidth: 1, borderColor: '#3F3F46',
        }}>
          <Search size={15} color="#71717A" />
          <TextInput
            placeholder="Buscar na lista..."
            placeholderTextColor="#52525B"
            style={{ flex: 1, marginLeft: 10, color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: '#71717A', fontSize: 16 }}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
              style={{
                paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, marginRight: 8,
                backgroundColor: filter === f.key ? '#A78BFA' : '#27272A',
                borderWidth: 1, borderColor: filter === f.key ? '#A78BFA' : '#3F3F46',
              }}
            >
              <Text style={{ color: filter === f.key ? '#FFFFFF' : '#71717A', fontWeight: '700', fontSize: 12 }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={{ color: '#52525B', fontSize: 10, fontWeight: '600', paddingLeft: 2 }}>
          {totalItens} itens • {totalComprados} comprados
        </Text>
      </View>

      {/* ── Empty: sem categorias ────────────────── */}
      {categorias.length === 0 && !loading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🗂️</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
            Comece criando uma categoria
          </Text>
          <Text style={{ color: '#71717A', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Organize seus itens por categorias como Mercado, Casa ou Higiene
          </Text>
          <TouchableOpacity
            onPress={() => setCatModal({ visible: true })}
            style={{ backgroundColor: '#A78BFA', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 }}
          >
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>+ Criar categoria</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── List ────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor="#A78BFA" />
        }
        showsVerticalScrollIndicator={false}
      >
        {categorias.map(cat => {
          const catItens = filteredItens.filter(i => i.categoriaId === cat.id);
          if (catItens.length === 0 && busca && filter === 'all') return null;
          return (
            <CategoryGroup
              key={cat.id} cat={cat} items={catItens}
              isExpanded={expandedCats[cat.id] ?? true}
              onToggle={() => { Haptics.selectionAsync(); setExpandedCats(p => ({ ...p, [cat.id]: !p[cat.id] })); }}
              onToggleItem={handleToggle}
              onEditItem={item => setItemModal({ visible: true, item })}
              onDeleteItem={handleDeleteItem}
              onEditCategoria={c => setCatModal({ visible: true, categoria: c })}
              onDeleteCategoria={handleDeleteCategoria}
            />
          );
        })}

        {/* Sem categoria */}
        {(() => {
          const catIds = new Set(categorias.map(c => c.id));
          const semCat = filteredItens.filter(i => !catIds.has(i.categoriaId));
          if (!semCat.length) return null;
          return (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: '#71717A', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
                Sem categoria
              </Text>
              {semCat.map(item => (
                <ItemCard key={item.id} item={item}
                  onToggle={() => handleToggle(item)}
                  onPress={() => setItemModal({ visible: true, item })}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </View>
          );
        })()}

        {/* Empty filtered */}
        {filteredItens.length === 0 && categorias.length > 0 && !loading && (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📋</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>
              {busca ? 'Nenhum resultado' : 'Lista vazia'}
            </Text>
            <Text style={{ color: '#71717A', fontSize: 13, textAlign: 'center' }}>
              {busca ? `Nenhum item para "${busca}"` : 'Toque em + para adicionar itens'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Modals ──────────────────────────────── */}
      <ItemModal
        visible={itemModal.visible}
        onClose={() => setItemModal({ visible: false })}
        onSave={handleSaveItem}
        item={itemModal.item}
      />

      <CategoriaModal
        visible={catModal.visible}
        onClose={() => setCatModal({ visible: false })}
        onSaved={(cat, isEditing) => {
          if (isEditing) {
            setCategorias(prev => prev.map(c => c.id === cat.id ? { ...c, ...cat } : c));
          } else {
            setCategorias(prev => [...prev, cat]);
            setExpandedCats(prev => ({ ...prev, [cat.id]: true }));
          }
        }}
        categoria={catModal.categoria}
      />
    </SafeAreaView>
  );
}
