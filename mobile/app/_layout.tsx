import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import '../global.css';

function RootLayoutNav() {
  const { estaAutenticado, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments.includes('(auth)');

    if (!estaAutenticado && !inAuthGroup) {
      // Se não estiver logado e não estiver nas rotas de login, vai para login
      router.replace('/(auth)/login');
    } else if (estaAutenticado && inAuthGroup) {
      // Se já estiver logado e tentar entrar no login, vai para home
      router.replace('/(tabs)');
    }
  }, [estaAutenticado, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' }}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
