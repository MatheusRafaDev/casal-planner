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
    const inTabsGroup = segments.includes('(tabs)');
    const isLandingPage = segments.length === 0 || (segments.length === 1 && segments[0] === '');

    if (estaAutenticado && (inAuthGroup || isLandingPage)) {
      router.replace('/(tabs)');
    } else if (!estaAutenticado && inTabsGroup) {
      router.replace('/(auth)/login');
    }
  }, [estaAutenticado, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <View className="flex-1 dark bg-background">
        <RootLayoutNav />
      </View>
    </AuthProvider>
  );
}
