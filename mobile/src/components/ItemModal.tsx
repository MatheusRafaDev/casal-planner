import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ShoppingBag, DollarSign, Tag, Store, CreditCard, AlertCircle } from 'lucide-react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Item } from '../services/itensService';

interface ItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  item?: Item | null;
  categoriaId?: string;
}

export function ItemModal({ visible, onClose, onSave, item, categoriaId }: ItemModalProps) {
  const [formData, setFormData] = useState<Partial<Item>>({
    nome: '',
    preco: 0,
    quantidade: 1,
    pagamento: 'normal',
    prioridade: 'normal',
    loja: '',
    marca: '',
  });

  const [precoString, setPrecoString] = useState('');

  useEffect(() => {
    if (item) {
      setFormData(item);
      setPrecoString(item.preco.toString());
    } else {
      setFormData({
        nome: '',
        preco: 0,
        quantidade: 1,
        pagamento: 'normal',
        prioridade: 'normal',
        loja: '',
        marca: '',
        categoriaId
      });
      setPrecoString('');
    }
  }, [item, visible, categoriaId]);

  const handleSave = () => {
    if (!formData.nome) return;
    onSave({
      ...formData,
      preco: parseFloat(precoString.replace(',', '.')) || 0,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView className="bg-white rounded-t-[32px] max-h-[90%]">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-primary">
                  {item ? 'Editar Item' : 'Novo Item'}
                </Text>
                <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Input 
                  label="Nome do Item *"
                  placeholder="Ex: Arroz, iPhone, Camisa"
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  icon={<ShoppingBag size={20} color="#999" />}
                />

                <View className="flex-row">
                  <View className="flex-1 mr-2">
                    <Input 
                      label="Preço"
                      placeholder="0,00"
                      keyboardType="numeric"
                      value={precoString}
                      onChangeText={setPrecoString}
                      icon={<DollarSign size={20} color="#999" />}
                    />
                  </View>
                  <View className="flex-1 ml-2">
                    <Input 
                      label="Quantidade"
                      placeholder="1"
                      keyboardType="numeric"
                      value={formData.quantidade?.toString()}
                      onChangeText={(text) => setFormData({...formData, quantidade: parseInt(text) || 1})}
                    />
                  </View>
                </View>

                <Input 
                  label="Loja / Local"
                  placeholder="Onde comprar?"
                  value={formData.loja}
                  onChangeText={(text) => setFormData({...formData, loja: text})}
                  icon={<Store size={20} color="#999" />}
                />

                <Input 
                  label="Marca / Fabricante"
                  placeholder="Ex: Apple, Nike, Nestlé"
                  value={formData.marca}
                  onChangeText={(text) => setFormData({...formData, marca: text})}
                  icon={<Tag size={20} color="#999" />}
                />

                <Input 
                  label="Link do Produto"
                  placeholder="https://..."
                  autoCapitalize="none"
                  value={formData.linkProduto}
                  onChangeText={(text) => setFormData({...formData, linkProduto: text})}
                  icon={<Tag size={20} color="#999" />}
                />

                <Input 
                  label="URL da Foto"
                  placeholder="https://imagem.com/..."
                  autoCapitalize="none"
                  value={formData.fotoUrl}
                  onChangeText={(text) => setFormData({...formData, fotoUrl: text})}
                  icon={<Tag size={20} color="#999" />}
                />

                <View className="flex-row mb-6">
                  <TouchableOpacity 
                    onPress={() => setFormData({...formData, pagamento: 'normal'})}
                    className={`flex-1 p-4 rounded-2xl border mr-2 items-center ${formData.pagamento === 'normal' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <CreditCard size={20} color={formData.pagamento === 'normal' ? '#0A84FF' : '#999'} />
                    <Text className={`mt-1 font-medium ${formData.pagamento === 'normal' ? 'text-blue-600' : 'text-gray-500'}`}>Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setFormData({...formData, pagamento: 'vr'})}
                    className={`flex-1 p-4 rounded-2xl border ml-2 items-center ${formData.pagamento === 'vr' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <ShoppingBag size={20} color={formData.pagamento === 'vr' ? '#FF9500' : '#999'} />
                    <Text className={`mt-1 font-medium ${formData.pagamento === 'vr' ? 'text-orange-600' : 'text-gray-500'}`}>VR/VA</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-8">
                   <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1 tracking-widest">Prioridade</Text>
                   <View className="flex-row">
                      {['urgente', 'normal', 'pode_esperar'].map((p) => (
                        <TouchableOpacity 
                          key={p}
                          onPress={() => setFormData({...formData, prioridade: p as any})}
                          className={`flex-1 py-3 rounded-xl border mx-1 items-center ${formData.prioridade === p ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-100'}`}
                        >
                          <Text className={`text-xs font-bold ${formData.prioridade === p ? 'text-primary' : 'text-gray-400'}`}>
                            {p.replace('_', ' ').toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                   </View>
                </View>

                <Button 
                  title={item ? "Salvar Alterações" : "Adicionar à Lista"} 
                  onPress={handleSave}
                  disabled={!formData.nome}
                />
                
                <View className="h-10" />
              </ScrollView>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
