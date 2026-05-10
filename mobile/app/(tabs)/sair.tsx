import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SairScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };
    doLogout();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator color="#A78BFA" />
    </View>
  );
}
