import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Tag, Target, Palette } from 'lucide-react-native';
import { Input } from './Input';
import { Button } from './Button';
import { Categoria } from '../services/categoriasService';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (categoria: Partial<Categoria>) => void;
  categoria?: Categoria | null;
}

const COLORS = ['#0A84FF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55'];
const ICONS = ['🛒', '🏠', '🚗', '🍔', '👗', '🎮', '💊', '✨', '📦'];

export function CategoryModal({ visible, onClose, onSave, categoria }: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Categoria>>({
    nome: '',
    icon: '🛒',
    bg: '#0A84FF',
    metaOrcamento: 0,
  });

  const [metaString, setMetaString] = useState('');

  useEffect(() => {
    if (categoria) {
      setFormData(categoria);
      setMetaString(categoria.metaOrcamento?.toString() || '');
    } else {
      setFormData({
        nome: '',
        icon: '🛒',
        bg: '#0A84FF',
        metaOrcamento: 0,
      });
      setMetaString('');
    }
  }, [categoria, visible]);

  const handleSave = () => {
    if (!formData.nome) return;
    onSave({
      ...formData,
      metaOrcamento: parseFloat(metaString.replace(',', '.')) || 0,
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
                  {categoria ? 'Editar Categoria' : 'Nova Categoria'}
                </Text>
                <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Input 
                  label="Nome da Categoria *"
                  placeholder="Ex: Supermercado, Casa, Lazer"
                  value={formData.nome}
                  onChangeText={(text) => setFormData({...formData, nome: text})}
                  icon={<Tag size={20} color="#999" />}
                />

                <Input 
                  label="Meta de Orçamento"
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={metaString}
                  onChangeText={setMetaString}
                  icon={<Target size={20} color="#999" />}
                />

                <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1 tracking-widest">Ícone</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                   {ICONS.map((icon) => (
                     <TouchableOpacity 
                       key={icon}
                       onPress={() => setFormData({...formData, icon})}
                       className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 border-2 ${formData.icon === icon ? 'border-accent bg-blue-50' : 'border-gray-100 bg-gray-50'}`}
                     >
                       <Text className="text-2xl">{icon}</Text>
                     </TouchableOpacity>
                   ))}
                </ScrollView>

                <Text className="text-gray-500 font-bold text-xs uppercase mb-3 ml-1 tracking-widest">Cor de Destaque</Text>
                <View className="flex-row flex-wrap mb-10">
                   {COLORS.map((color) => (
                     <TouchableOpacity 
                       key={color}
                       onPress={() => setFormData({...formData, bg: color})}
                       className="p-1"
                     >
                       <View 
                        style={{ backgroundColor: color }}
                        className={`w-10 h-10 rounded-full border-2 ${formData.bg === color ? 'border-gray-400' : 'border-transparent'}`}
                       />
                     </TouchableOpacity>
                   ))}
                </View>

                <Button 
                  title={categoria ? "Salvar Categoria" : "Criar Categoria"} 
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
