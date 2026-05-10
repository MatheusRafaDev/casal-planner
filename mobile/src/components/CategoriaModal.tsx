import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, ScrollView,
  Animated, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { X, Check, Palette } from 'lucide-react-native';
import { categoriasService, Categoria } from '../services/categoriasService';
import * as Haptics from 'expo-haptics';

interface CategoriaModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: (cat: Categoria, isEditing: boolean) => void;
  categoria?: Categoria | null;
}

const COLORS = [
  '#A78BFA', '#F9A8D4', '#F87171', '#FB923C',
  '#FBBF24', '#34D399', '#60A5FA', '#F472B6',
  '#818CF8', '#2DD4BF', '#A3E635', '#E879F9',
];

const ICONS = [
  '🛒', '🏠', '🧼', '🥩', '🍎', '🧴',
  '🔌', '📦', '🎁', '🐶', '👗', '🚗',
  '💊', '📚', '🏋️', '✈️', '🎮', '🍽️',
  '☕', '🌿', '🧹', '💡', '🛁', '🔧',
];

export function CategoriaModal({ visible, onClose, onSaved, categoria }: CategoriaModalProps) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(COLORS[0]);
  const [icone, setIcone] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(700)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 12, useNativeDriver: true,
      }).start();
      if (categoria) {
        setNome(categoria.nome || '');
        setCor((categoria.cor as string) || COLORS[0]);
        setIcone((categoria.icone as string) || ICONS[0]);
      } else {
        setNome('');
        setCor(COLORS[0]);
        setIcone(ICONS[0]);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 700, duration: 250, useNativeDriver: true,
      }).start();
    }
  }, [visible, categoria]);

  const handleSave = async () => {
    if (!nome.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Campo obrigatório', 'Informe um nome para a categoria.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      let result: Categoria;
      const payload = { nome: nome.trim(), cor, icone };
      if (categoria) {
        result = await categoriasService.update(categoria.id, payload);
      } else {
        result = await categoriasService.create(payload);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(result, !!categoria);
      onClose();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', e?.response?.data?.message || 'Não foi possível salvar a categoria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      {/* Backdrop */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: '#000000CC' }}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#18181B',
        borderTopLeftRadius: 36, borderTopRightRadius: 36,
        borderWidth: 1, borderColor: '#27272A',
        maxHeight: '88%',
        transform: [{ translateY: slideAnim }],
      }}>
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 12 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#3F3F46' }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 24, paddingVertical: 16,
          borderBottomWidth: 1, borderBottomColor: '#27272A',
        }}>
          {/* Preview */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: cor + '25',
              borderWidth: 2, borderColor: cor,
              alignItems: 'center', justifyContent: 'center', marginRight: 12,
            }}>
              <Text style={{ fontSize: 20 }}>{icone}</Text>
            </View>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: -0.3 }}>
                {categoria ? 'Editar Categoria' : 'Nova Categoria'}
              </Text>
              {nome.length > 0 && (
                <Text style={{ color: cor, fontWeight: '700', fontSize: 12, marginTop: 1 }}>
                  {nome}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: '#27272A', width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3F3F46' }}
          >
            <X size={16} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nome */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
              Nome da categoria *
            </Text>
            <TextInput
              placeholder="Ex: Mercado, Casa, Higiene..."
              placeholderTextColor="#3F3F46"
              style={{
                backgroundColor: '#27272A', borderWidth: 1, borderColor: nome ? cor + '60' : '#3F3F46',
                borderRadius: 18, paddingHorizontal: 16, height: 52,
                color: '#FFFFFF', fontSize: 16, fontWeight: '600',
              }}
              value={nome}
              onChangeText={setNome}
              returnKeyType="done"
              autoFocus={!categoria}
            />
          </View>

          {/* Ícone */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
              Ícone
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map(i => (
                <TouchableOpacity
                  key={i}
                  onPress={() => { setIcone(i); Haptics.selectionAsync(); }}
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: icone === i ? cor + '20' : '#27272A',
                    borderWidth: 2, borderColor: icone === i ? cor : '#3F3F46',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cor */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>
              Cor de destaque
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setCor(c); Haptics.selectionAsync(); }}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: c,
                    borderWidth: cor === c ? 3 : 0,
                    borderColor: '#FFFFFF',
                    alignItems: 'center', justifyContent: 'center',
                    transform: [{ scale: cor === c ? 1.1 : 1 }],
                  }}
                >
                  {cor === c && <Check size={16} color="white" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: loading ? '#6D4FC2' : cor,
              height: 54, borderRadius: 18,
              alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
              shadowColor: cor, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
            }}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : (
                <>
                  <Check size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 16 }}>
                    {categoria ? 'Salvar alterações' : 'Criar categoria'}
                  </Text>
                </>
              )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}
