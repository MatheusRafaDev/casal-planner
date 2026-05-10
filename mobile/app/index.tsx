import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Sparkles, Shield, Smartphone, Zap, Heart } from 'lucide-react-native';
import { Logo } from '../src/components/Logo';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: Heart, text: 'Planejamento financeiro a dois', sub: 'Ambos acompanham tudo em tempo real', color: '#F9A8D4' },
  { icon: Shield, text: 'Segurança de nível bancário', sub: 'Seus dados protegidos com criptografia', color: '#34D399' },
  { icon: Zap, text: 'Sincronização instantânea', sub: 'Mudanças refletem para os dois na hora', color: '#FBBF24' },
  { icon: Smartphone, text: 'Experiência nativa iOS', sub: 'Interface fluida e gestos naturais', color: '#A78BFA' },
];

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const ctaScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, tension: 50, friction: 8, delay: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/registro');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#18181B' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', marginBottom: 40 }}>
          <View style={{ marginBottom: 24 }}>
            <Logo size={120} />
          </View>

          <View style={{
            backgroundColor: '#A78BFA20', paddingHorizontal: 16, paddingVertical: 7,
            borderRadius: 99, flexDirection: 'row', alignItems: 'center', marginBottom: 20,
          }}>
            <Sparkles size={13} color="#A78BFA" />
            <Text style={{ color: '#A78BFA', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginLeft: 8 }}>
              CasalPlanner Premium
            </Text>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900', textAlign: 'center', lineHeight: 44, letterSpacing: -0.8, marginBottom: 16 }}>
            Tudo em ordem,{'\n'}
            <Text style={{ color: '#A78BFA' }}>nada fora do plano</Text>
          </Text>

          <Text style={{ color: '#71717A', fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '500', maxWidth: 300 }}>
            O único app de organização financeira pensado exclusivamente para casais modernos.
          </Text>
        </Animated.View>

        {/* ── Features ──────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, gap: 12, marginBottom: 40 }}>
          {FEATURES.map((f, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#27272A', borderRadius: 20, padding: 16,
              borderWidth: 1, borderColor: '#3F3F46',
            }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: f.color + '20', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <f.icon size={20} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginBottom: 2 }}>{f.text}</Text>
                <Text style={{ color: '#71717A', fontSize: 12, fontWeight: '500' }}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* ── CTAs ──────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            onPress={handleStart}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#A78BFA', height: 58, borderRadius: 20,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
              shadowColor: '#A78BFA', shadowOpacity: 0.4, shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 }, elevation: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18, marginRight: 8 }}>
              Criar minha conta
            </Text>
            <ArrowRight size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/login'); }}
            style={{
              height: 56, borderRadius: 20,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: '#3F3F46', backgroundColor: '#27272A',
            }}
          >
            <Text style={{ color: '#A1A1AA', fontWeight: '700', fontSize: 16 }}>
              Acessar minha conta
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={{ color: '#3F3F46', fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 20 }}>
          Gratuito para sempre • Sem anúncios
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
