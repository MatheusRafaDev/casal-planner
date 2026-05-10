import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator, Animated, Text, Platform } from 'react-native';
import '../global.css';

function SplashScreen() {
  const pulse = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.8, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#18181B', justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale: pulse }], marginBottom: 32 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 28,
          backgroundColor: '#A78BFA20', borderWidth: 2, borderColor: '#A78BFA40',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 36 }}>💜</Text>
        </View>
      </Animated.View>
      <ActivityIndicator size="large" color="#A78BFA" />
      <Text style={{ color: '#52525B', fontSize: 13, fontWeight: '600', marginTop: 20, letterSpacing: 0.3 }}>
        CasalPlanner
      </Text>
    </View>
  );
}

function RootLayoutNav() {
  const { estaAutenticado, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const segs = segments as string[];
    const inAuthGroup = segs.includes('(auth)');
    const inTabsGroup = segs.includes('(tabs)');
    const isLanding = segs.length === 0 || (segs.length === 1 && segs[0] === '');

    if (estaAutenticado && (inAuthGroup || isLanding)) {
      router.replace('/(tabs)');
    } else if (!estaAutenticado && (inTabsGroup || isLanding)) {
      router.replace('/(auth)/login');
    }
  }, [estaAutenticado, loading, segments]);

  if (loading) return <SplashScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'ios' ? 'default' : 'fade',
        contentStyle: { backgroundColor: '#18181B' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: '#18181B' }}>
        <RootLayoutNav />
      </View>
    </AuthProvider>
  );
}
