import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, User, LogOut } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopWidth: 1,
          borderTopColor: '#27272A',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#71717A',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <Home size={22} color={color} />
              {focused && <View className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planejamento"
        options={{
          title: 'Planejamento',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <ClipboardList size={22} color={color} />
              {focused && <View className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <User size={22} color={color} />
              {focused && <View className="absolute -bottom-2 w-1.5 h-1.5 bg-primary rounded-full" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="sair"
        options={{
          title: 'Sair',
          tabBarIcon: ({ color }) => <LogOut size={22} color="#F87171" />,
        }}
      />

      {/* Escondendo arquivos antigos/redundantes */}
      <Tabs.Screen name="estatisticas" options={{ href: null }} />
      <Tabs.Screen name="planning" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
  );
}
