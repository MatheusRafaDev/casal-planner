import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { categoriasService, Categoria } from '../services/categoriasService';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<Categoria>) => void;
  categoria?: Categoria | null;
}

const COLORS = ['#A78BFA', '#F9A8D4', '#F87171', '#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#A1A1AA'];
const ICONS = ['🛒', '🏠', '🧼', '🥩', '🍎', '🧴', '🔌', '📦', '🎁', '🐶'];

export function CategoryModal({ visible, onClose, onSave, categoria }: CategoryModalProps) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(COLORS[0]);
  const [icone, setIcone] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome);
      setCor(categoria.cor || COLORS[0]);
      setIcone(categoria.icone || ICONS[0]);
    } else {
      setNome('');
      setCor(COLORS[0]);
      setIcone(ICONS[0]);
    }
  }, [categoria, visible]);

  const handleSave = async () => {
    if (!nome) {
      Alert.alert('Erro', 'O nome da categoria é obrigatório');
      return;
    }

    onSave({ nome, cor, icone });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/70">
        <View className="bg-surface h-[80%] rounded-t-[40px] border-t border-border">
          <View className="flex-row justify-between items-center px-8 py-6 border-b border-border">
            <Text className="text-2xl font-black text-white">{categoria ? 'Editar Categoria' : 'Nova Categoria'}</Text>
            <TouchableOpacity onPress={onClose} className="bg-background/50 p-2 rounded-full">
              <X size={20} color="#F4F4F5" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-8 pt-6">
            <View className="space-y-8">
              {/* Nome */}
              <View>
                <Text className="text-text-soft font-bold mb-3 ml-1">Nome da Categoria</Text>
                <TextInput 
                  placeholder="Ex: Mercado, Casa, Higiene..."
                  placeholderTextColor="#71717A"
                  className="bg-background h-16 rounded-2xl px-5 text-white border border-border text-lg"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              {/* Ícone */}
              <View>
                <Text className="text-text-soft font-bold mb-3 ml-1">Escolha um Ícone</Text>
                <View className="flex-row flex-wrap justify-between">
                  {ICONS.map(i => (
                    <TouchableOpacity 
                      key={i} 
                      onPress={() => setIcone(i)}
                      className={`w-[18%] aspect-square items-center justify-center rounded-2xl mb-3 border ${icone === i ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                    >
                      <Text className="text-2xl">{i}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cor */}
              <View>
                <Text className="text-text-soft font-bold mb-3 ml-1">Cor de Destaque</Text>
                <View className="flex-row flex-wrap justify-between">
                  {COLORS.map(c => (
                    <TouchableOpacity 
                      key={c} 
                      onPress={() => setCor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-[11%] aspect-square rounded-full mb-3 border-2 ${cor === c ? 'border-white' : 'border-transparent'}`}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSave}
                className="bg-primary h-16 rounded-2xl flex-row items-center justify-center mt-10 shadow-lg shadow-primary/20"
              >
                <Check size={24} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg">Salvar Categoria</Text>
              </TouchableOpacity>
            </View>
            <View className="h-20" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
