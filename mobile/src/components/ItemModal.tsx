import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Linking, Animated, Platform, Keyboard,
} from 'react-native';
import {
  X, Search, ShoppingBag, Store, Tag, CreditCard,
  ExternalLink, Sparkles, DollarSign, Hash, AlertTriangle,
} from 'lucide-react-native';
import { categoriasService, Categoria } from '../services/categoriasService';
import api from '../services/api';
import * as Haptics from 'expo-haptics';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  item?: any;
}

const PRIORITIES = [
  { key: 'urgente', label: '🔴 Urgente', color: '#EF4444' },
  { key: 'alta', label: '🟠 Alta', color: '#F97316' },
  { key: 'media', label: '🟡 Média', color: '#EAB308' },
  { key: 'normal', label: '🟡 Normal', color: '#A78BFA' },
  { key: 'pode_esperar', label: '🟢 Pode esperar', color: '#22C55E' },
];

const PAYMENTS = [
  { key: 'normal', label: '💵 Normal' },
  { key: 'vr', label: '🍽️ VR/VA' },
];

function LabeledInput({
  icon, label, value, onChange, placeholder, keyboardType = 'default',
  multiline = false, inputRef,
}: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'url';
  multiline?: boolean; inputRef?: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
        {icon}
        <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 7 }}>
          {label}
        </Text>
      </View>
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor="#3F3F46"
        style={{
          backgroundColor: '#18181B', borderWidth: 1, borderColor: '#3F3F46',
          borderRadius: 16, paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          height: multiline ? undefined : 50,
          color: '#FFFFFF', fontSize: 15, fontWeight: '500',
          minHeight: multiline ? 70 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

export function ItemModal({ visible, onClose, onSave, item }: ItemModalProps) {
  const [formData, setFormData] = useState({
    nome: '', preco: '', quantidade: '1', categoriaId: '',
    prioridade: 'normal', pagamento: 'normal', loja: '',
    marca: '', linkProduto: '', fotoUrl: '',
  });
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pesquisando, setPesquisando] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [showPainel, setShowPainel] = useState(false);

  const slideAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 12, useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 800, duration: 250, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (item) {
        setFormData({
          nome: item.nome || '',
          preco: String(item.preco || ''),
          quantidade: String(item.quantidade || 1),
          categoriaId: item.categoriaId || '',
          prioridade: item.prioridade || 'normal',
          pagamento: item.pagamento || 'normal',
          loja: item.loja || '',
          marca: item.marca || '',
          linkProduto: item.linkProduto || '',
          fotoUrl: item.fotoUrl || '',
        });
      } else {
        setFormData({
          nome: '', preco: '', quantidade: '1', categoriaId: '',
          prioridade: 'normal', pagamento: 'normal', loja: '',
          marca: '', linkProduto: '', fotoUrl: '',
        });
      }
      categoriasService.listarDoUsuario().then(cats => setCategorias(cats || []));
      setShowPainel(false);
      setResultados([]);
    }
  }, [visible, item]);

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const buscarPrecos = async () => {
    if (!formData.nome.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Keyboard.dismiss();
    setPesquisando(true);
    setShowPainel(true);
    try {
      const { data } = await api.get(`/PesquisaPrecos?q=${encodeURIComponent(formData.nome.trim())}`);
      setResultados(data?.produtos || []);
    } catch {
      setResultados([]);
    } finally {
      setPesquisando(false);
    }
  };

  const selecionarPreco = (prod: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFormData(prev => ({
      ...prev,
      preco: String(prod.preco || ''),
      loja: prod.loja || prev.loja,
      marca: prod.marca || prev.marca,
      linkProduto: prod.link || prev.linkProduto,
      fotoUrl: prod.imagem || prev.fotoUrl,
    }));
    setShowPainel(false);
  };

  const handleSave = () => {
    if (!formData.nome.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      ...formData,
      nome: formData.nome.trim(),
      preco: parseFloat(formData.preco) || 0,
      quantidade: parseInt(formData.quantidade) || 1,
    });
  };

  const totalPreview = (parseFloat(formData.preco) || 0) * (parseInt(formData.quantidade) || 1);

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: '#000000CC' }}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#18181B',
          borderTopLeftRadius: 36, borderTopRightRadius: 36,
          borderWidth: 1, borderColor: '#27272A',
          height: '94%',
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#3F3F46' }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#27272A',
        }}>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '900', letterSpacing: -0.3 }}>
              {item ? 'Editar Item' : 'Novo Item'}
            </Text>
            {totalPreview > 0 && (
              <Text style={{ color: '#A78BFA', fontSize: 13, fontWeight: '700', marginTop: 2 }}>
                Total: R$ {totalPreview.toFixed(2)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: '#27272A', width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3F3F46' }}
          >
            <X size={18} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nome + Search */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
              <ShoppingBag size={13} color="#71717A" />
              <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 7 }}>
                Nome do Item *
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                placeholder="Ex: Arroz Tio João 5kg"
                placeholderTextColor="#3F3F46"
                style={{
                  flex: 1, backgroundColor: '#18181B', borderWidth: 1, borderColor: '#3F3F46',
                  borderRadius: 16, paddingHorizontal: 14, height: 50, color: '#FFFFFF', fontSize: 15, fontWeight: '500',
                }}
                value={formData.nome}
                onChangeText={v => update('nome', v)}
              />
              <TouchableOpacity
                onPress={buscarPrecos}
                style={{
                  backgroundColor: '#A78BFA', width: 50, height: 50, borderRadius: 16,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: '#A78BFA', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
                }}
              >
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Search Results */}
          {showPainel && (
            <View style={{ backgroundColor: '#27272A', borderRadius: 20, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#A78BFA30' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>🔍 Sugestões de Preço</Text>
                <TouchableOpacity onPress={() => setShowPainel(false)}>
                  <X size={14} color="#71717A" />
                </TouchableOpacity>
              </View>

              {pesquisando ? (
                <ActivityIndicator color="#A78BFA" style={{ marginVertical: 16 }} />
              ) : resultados.length > 0 ? (
                <>
                  {/* Min/Avg summary */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    <View style={{ flex: 1, backgroundColor: '#18181B', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#3F3F46' }}>
                      <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14 }}>
                        R$ {Math.min(...resultados.map(r => r.preco)).toFixed(2)}
                      </Text>
                      <Text style={{ color: '#71717A', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Menor Preço</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#18181B', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#3F3F46' }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>
                        R$ {(resultados.reduce((a, b) => a + b.preco, 0) / resultados.length).toFixed(2)}
                      </Text>
                      <Text style={{ color: '#71717A', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Preço Médio</Text>
                    </View>
                  </View>

                  {/* Product cards */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                    {resultados.map((res, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => selecionarPreco(res)}
                        style={{
                          backgroundColor: '#18181B', borderRadius: 16, padding: 10,
                          marginHorizontal: 4, width: 150, borderWidth: 1, borderColor: '#3F3F46',
                        }}
                      >
                        <Image
                          source={{ uri: res.imagem }}
                          style={{ width: '100%', height: 80, borderRadius: 10, marginBottom: 8, backgroundColor: '#27272A' }}
                          resizeMode="contain"
                        />
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 10, marginBottom: 3 }} numberOfLines={2}>
                          {res.nome}
                        </Text>
                        <Text style={{ color: '#A78BFA', fontWeight: '900', fontSize: 14, marginBottom: 2 }}>
                          R$ {(res.preco || 0).toFixed(2)}
                        </Text>
                        <Text style={{ color: '#71717A', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                          {res.loja}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <Text style={{ color: '#71717A', fontSize: 13, textAlign: 'center', marginVertical: 12 }}>
                  Nenhum resultado encontrado para "{formData.nome}"
                </Text>
              )}
            </View>
          )}

          {/* Valor + Qtd */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <LabeledInput
                icon={<DollarSign size={13} color="#71717A" />}
                label="Valor"
                value={formData.preco}
                onChange={v => update('preco', v)}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <LabeledInput
                icon={<Hash size={13} color="#71717A" />}
                label="Quantidade"
                value={formData.quantidade}
                onChange={v => update('quantidade', v)}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Categoria */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <CreditCard size={13} color="#71717A" />
              <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 7 }}>
                Categoria
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categorias.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => { Haptics.selectionAsync(); update('categoriaId', cat.id); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginRight: 8,
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: formData.categoriaId === cat.id ? '#A78BFA' : '#27272A',
                    borderWidth: 1, borderColor: formData.categoriaId === cat.id ? '#A78BFA' : '#3F3F46',
                  }}
                >
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{cat.icone}</Text>
                  <Text style={{
                    color: formData.categoriaId === cat.id ? '#FFFFFF' : '#A1A1AA',
                    fontWeight: '700', fontSize: 12,
                  }}>
                    {cat.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Prioridade */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <AlertTriangle size={13} color="#71717A" />
              <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 7 }}>
                Prioridade
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => { Haptics.selectionAsync(); update('prioridade', p.key); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                    backgroundColor: formData.prioridade === p.key ? p.color + '25' : '#27272A',
                    borderWidth: 1, borderColor: formData.prioridade === p.key ? p.color : '#3F3F46',
                  }}
                >
                  <Text style={{
                    color: formData.prioridade === p.key ? p.color : '#A1A1AA',
                    fontWeight: '700', fontSize: 12,
                  }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pagamento */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <CreditCard size={13} color="#71717A" />
              <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 7 }}>
                Forma de Pagamento
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {PAYMENTS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => { Haptics.selectionAsync(); update('pagamento', p.key); }}
                  style={{
                    flex: 1, paddingVertical: 12, borderRadius: 16, alignItems: 'center',
                    backgroundColor: formData.pagamento === p.key ? '#A78BFA' : '#27272A',
                    borderWidth: 1, borderColor: formData.pagamento === p.key ? '#A78BFA' : '#3F3F46',
                  }}
                >
                  <Text style={{ color: formData.pagamento === p.key ? '#FFFFFF' : '#A1A1AA', fontWeight: '700', fontSize: 13 }}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Optional fields */}
          <LabeledInput icon={<Store size={13} color="#71717A" />} label="Loja" value={formData.loja} onChange={v => update('loja', v)} placeholder="Ex: Carrefour" />
          <LabeledInput icon={<Tag size={13} color="#71717A" />} label="Marca" value={formData.marca} onChange={v => update('marca', v)} placeholder="Ex: Nestlé" />
          <LabeledInput icon={<ExternalLink size={13} color="#71717A" />} label="Link do Produto" value={formData.linkProduto} onChange={v => update('linkProduto', v)} placeholder="https://..." keyboardType="url" />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Footer Button */}
        <View style={{
          paddingHorizontal: 24, paddingVertical: 16,
          paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          borderTopWidth: 1, borderTopColor: '#27272A',
          backgroundColor: '#18181B',
        }}>
          {totalPreview > 0 && (
            <Text style={{ color: '#71717A', fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 10 }}>
              {parseInt(formData.quantidade) || 1}× R$ {(parseFloat(formData.preco) || 0).toFixed(2)} = <Text style={{ color: '#A78BFA', fontWeight: '900' }}>R$ {totalPreview.toFixed(2)}</Text>
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#A78BFA', height: 54, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#A78BFA', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 17 }}>
              {item ? 'Salvar Alterações' : 'Adicionar Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
