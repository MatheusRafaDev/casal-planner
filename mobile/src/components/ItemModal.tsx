import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image, Linking } from 'react-native';
import { X, Search, ShoppingBag, Store, Tag, CreditCard, AlertTriangle, ExternalLink, Sparkles, DollarSign } from 'lucide-react-native';
import { categoriasService, Categoria } from '../services/categoriasService';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item?: any;
}

export function ItemModal({ visible, onClose, onSave, item }: ItemModalProps) {
  const [formData, setFormData] = useState({
    nome: '', preco: '', quantidade: '1', categoriaId: '',
    prioridade: 'normal', pagamento: 'normal', loja: '',
    marca: '', linkProduto: '', fotoUrl: ''
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [showPainel, setShowPainel] = useState(false);

  useEffect(() => {
    if (visible) {
      if (item) {
        setFormData({
          nome: item.nome,
          preco: String(item.preco),
          quantidade: String(item.quantidade),
          categoriaId: item.categoriaId,
          prioridade: item.prioridade,
          pagamento: item.pagamento,
          loja: item.loja || '',
          marca: item.marca || '',
          linkProduto: item.linkProduto || '',
          fotoUrl: item.fotoUrl || ''
        });
      } else {
        setFormData({
          nome: '', preco: '', quantidade: '1', categoriaId: '',
          prioridade: 'normal', pagamento: 'normal', loja: '',
          marca: '', linkProduto: '', fotoUrl: ''
        });
      }
      categoriasService.listarDoUsuario().then(setCategorias);
      setShowPainel(false);
      setResultados([]);
    }
  }, [visible, item]);

  const buscarPrecos = async () => {
    if (!formData.nome) return;
    setPesquisando(true);
    setShowPainel(true);
    try {
      const { data } = await api.get(`/PesquisaPrecos?q=${encodeURIComponent(formData.nome)}`);
      setResultados(data?.produtos || []);
    } catch (error) {
      console.error(error);
    } finally {
      setPesquisando(false);
    }
  };

  const selecionarPreco = (prod: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormData({
      ...formData,
      preco: String(prod.preco),
      loja: prod.loja || '',
      marca: prod.marca || '',
      linkProduto: prod.link || '',
      fotoUrl: prod.imagem || ''
    });
    setShowPainel(false);
  };

  const handleSave = () => {
    onSave({
      ...formData,
      preco: parseFloat(formData.preco),
      quantidade: parseInt(formData.quantidade)
    });
  };

  const renderInput = (label: string, icon: any, key: string, placeholder: string, keyboardType: any = 'default') => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
         {icon}
         <Text className="text-text-soft font-bold text-[10px] uppercase ml-2 tracking-widest">{label}</Text>
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#3F3F46"
        className="bg-surface border border-border rounded-2xl px-4 h-14 text-white font-medium"
        value={(formData as any)[key]}
        onChangeText={(v) => setFormData({ ...formData, [key]: v })}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-background border-t border-border rounded-t-[40px] h-[92%] overflow-hidden">
          <View className="flex-row justify-between items-center px-8 py-6 border-b border-border/30">
            <Text className="text-white text-xl font-black">{item ? 'Editar Item' : 'Novo Item'}</Text>
            <TouchableOpacity onPress={onClose} className="bg-surface w-10 h-10 rounded-full items-center justify-center">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-8 pt-6">
            <View className="flex-row items-end mb-4">
              <View className="flex-1 mr-2">
                 <View className="flex-row items-center mb-2">
                    <ShoppingBag size={14} color="#71717A" />
                    <Text className="text-text-soft font-bold text-[10px] uppercase ml-2 tracking-widest">Nome do Item</Text>
                 </View>
                 <TextInput
                   placeholder="Ex: Arroz Tio João"
                   placeholderTextColor="#3F3F46"
                   className="bg-surface border border-border rounded-2xl px-4 h-14 text-white font-medium"
                   value={formData.nome}
                   onChangeText={(v) => setFormData({ ...formData, nome: v })}
                 />
              </View>
              <TouchableOpacity 
                onPress={buscarPrecos}
                className="bg-primary w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
              >
                <Search size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* Painel de Resultados (Mirror PainelPesquisaPrecos.jsx) */}
            {showPainel && (
              <View className="bg-surface border border-primary/30 rounded-3xl p-4 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                   <Text className="text-white font-bold text-xs">🔍 Sugestões de Preço</Text>
                   <TouchableOpacity onPress={() => setShowPainel(false)}><X size={14} color="#71717A" /></TouchableOpacity>
                </View>
                
                {pesquisando ? (
                  <ActivityIndicator color="#A78BFA" className="my-4" />
                ) : resultados.length > 0 ? (
                  <View>
                    <View className="flex-row justify-between mb-4">
                       <View className="bg-background p-3 rounded-2xl border border-border flex-1 mr-2">
                          <Text className="text-primary font-black text-sm">R$ {Math.min(...resultados.map(r => r.preco)).toFixed(2)}</Text>
                          <Text className="text-[8px] text-text-soft uppercase font-bold">Menor Preço</Text>
                       </View>
                       <View className="bg-background p-3 rounded-2xl border border-border flex-1">
                          <Text className="text-white font-black text-sm">R$ {(resultados.reduce((a, b) => a + b.preco, 0) / resultados.length).toFixed(2)}</Text>
                          <Text className="text-[8px] text-text-soft uppercase font-bold">Preço Médio</Text>
                       </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                      {resultados.map((res, i) => (
                        <TouchableOpacity 
                          key={i} 
                          onPress={() => selecionarPreco(res)}
                          className="bg-background border border-border rounded-2xl p-3 mr-3 w-48"
                        >
                          <Image source={{ uri: res.imagem }} className="w-full h-24 rounded-xl mb-2 bg-surface" resizeMode="contain" />
                          <Text className="text-white font-bold text-[10px]" numberOfLines={1}>{res.nome}</Text>
                          <Text className="text-primary font-black text-sm mt-1">R$ {res.preco.toFixed(2)}</Text>
                          <Text className="text-text-soft text-[8px] uppercase font-bold mt-1">{res.loja}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <Text className="text-text-soft text-xs text-center my-4">Nenhum preço encontrado.</Text>
                )}
              </View>
            )}

            <View className="flex-row justify-between">
               <View className="w-[48%]">
                  {renderInput("Valor", <DollarSign size={14} color="#71717A" />, "preco", "0.00", "numeric")}
               </View>
               <View className="w-[48%]">
                  {renderInput("Qtd", <Sparkles size={14} color="#71717A" />, "quantidade", "1", "numeric")}
               </View>
            </View>

            <View className="mb-6">
              <Text className="text-text-soft font-bold text-[10px] uppercase mb-2 tracking-widest ml-1">Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categorias.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, categoriaId: cat.id }); }}
                    className={`px-4 py-3 rounded-2xl mr-2 border ${formData.categoriaId === cat.id ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                  >
                    <Text className="text-base mr-2">{cat.icone}</Text>
                    <Text className={`font-bold text-xs ${formData.categoriaId === cat.id ? 'text-white' : 'text-text-soft'}`}>{cat.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-text-soft font-bold text-[10px] uppercase mb-2 tracking-widest ml-1">Prioridade</Text>
              <View className="flex-row flex-wrap">
                {['urgente', 'alta', 'media', 'baixa'].map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setFormData({ ...formData, prioridade: p })}
                    className={`px-4 py-2 rounded-xl mr-2 mb-2 border ${formData.prioridade === p ? 'bg-primary/20 border-primary' : 'bg-surface border-border'}`}
                  >
                    <Text className={`font-bold text-[10px] uppercase ${formData.prioridade === p ? 'text-primary' : 'text-text-soft'}`}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-text-soft font-bold text-[10px] uppercase mb-2 tracking-widest ml-1">Forma de Pagamento</Text>
              <View className="flex-row">
                {['normal', 'vr'].map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setFormData({ ...formData, pagamento: p })}
                    className={`flex-1 py-3 rounded-2xl mr-2 border flex-row items-center justify-center ${formData.pagamento === p ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                  >
                    <Text className={`font-bold text-xs ${formData.pagamento === p ? 'text-white' : 'text-text-soft'}`}>
                      {p === 'normal' ? '💵 Normal' : '💳 VR/VA'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderInput("Loja", <Store size={14} color="#71717A" />, "loja", "Ex: Carrefour")}
            {renderInput("Marca", <Tag size={14} color="#71717A" />, "marca", "Ex: Nestlé")}
            {renderInput("Link do Produto", <ExternalLink size={14} color="#71717A" />, "linkProduto", "https://...")}
            
            <View className="h-32" />
          </ScrollView>

          <View className="px-8 pb-10 pt-4 bg-background border-t border-border/30">
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/40"
            >
              <Text className="text-white font-black text-lg">Salvar Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
