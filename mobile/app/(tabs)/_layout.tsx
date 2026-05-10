import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, User, BarChart3 } from 'lucide-react-native';
import { View, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

function TabIcon({ icon, focused }: { icon: React.ReactNode; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {icon}
      {focused && (
        <View style={{ position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: '#A78BFA' }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopWidth: 1,
          borderTopColor: '#27272A',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#52525B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<Home size={22} color={color} />} focused={focused} />
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />
      <Tabs.Screen
        name="planejamento"
        options={{
          title: 'Planejamento',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<ClipboardList size={22} color={color} />} focused={focused} />
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />
      <Tabs.Screen
        name="estatisticas"
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<BarChart3 size={22} color={color} />} focused={focused} />
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={<User size={22} color={color} />} focused={focused} />
          ),
        }}
        listeners={{ tabPress: () => Haptics.selectionAsync() }}
      />

      {/* Hidden legacy routes */}
      <Tabs.Screen name="sair" options={{ href: null }} />
      <Tabs.Screen name="planning" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
    </Tabs>
  );
}
