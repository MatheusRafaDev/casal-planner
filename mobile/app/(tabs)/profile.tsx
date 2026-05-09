import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, ChevronRight, Settings, Bell, Shield, Moon, Heart } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { BlurView } from 'expo-blur';

export default function ProfileScreen() {
  const { usuario, logout, isCasal } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute top-0 w-full z-10">
        <BlurView intensity={80} tint="light" className="px-6 pt-14 pb-4">
           <Text className="text-3xl font-bold text-primary">Perfil</Text>
        </BlurView>
      </View>

      <ScrollView className="flex-1 px-6 pt-32" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8">
          <View className="relative">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-md border-4 border-white">
              <User size={50} color="#0A84FF" />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-accent p-2 rounded-full border-2 border-white">
              <Settings size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-primary mt-4">{usuario?.nomeCompleto || 'Rafael Rocha'}</Text>
          <Text className="text-gray-500">{usuario?.email || 'rafael@pwi.com.br'}</Text>
          
          {isCasal && (
            <View className="flex-row items-center bg-accent-nubank px-4 py-2 rounded-full mt-4">
               <Heart size={16} color="white" fill="white" />
               <Text className="text-white ml-2 font-bold text-xs uppercase tracking-widest">Conta Casal</Text>
            </View>
          )}
        </View>

        <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm border border-gray-100">
          <ProfileItem icon={<Bell size={20} color="#FF9500" />} title="Notificações" value="Ativado" />
          <Divider />
          <ProfileItem icon={<Moon size={20} color="#5856D6" />} title="Modo Escuro" toggle />
          <Divider />
          <ProfileItem icon={<Shield size={20} color="#34C759" />} title="Privacidade" />
        </View>

        <Text className="text-gray-400 font-bold text-xs uppercase ml-4 mb-3 tracking-widest">Conta</Text>
        <View className="bg-white rounded-3xl p-2 mb-8 shadow-sm border border-gray-100">
          <ProfileItem icon={<User size={20} color="#0A84FF" />} title="Editar Perfil" />
          <Divider />
          <TouchableOpacity onPress={logout}>
            <ProfileItem 
              icon={<LogOut size={20} color="#FF3B30" />} 
              title="Sair" 
              textColor="text-red-500"
              hideChevron 
            />
          </TouchableOpacity>
        </View>

        <View className="items-center pb-12">
           <Text className="text-gray-300 text-xs">CasalPlanner v1.0.0</Text>
           <Text className="text-gray-200 text-[10px] mt-1">Made with ♥ by Antigravity</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileItem({ icon, title, value, textColor = "text-primary", hideChevron, toggle }: any) {
  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
          {icon}
        </View>
        <Text className={`text-base font-medium ${textColor}`}>{title}</Text>
      </View>
      <View className="flex-row items-center">
        {value && <Text className="text-gray-400 mr-2">{value}</Text>}
        {toggle ? (
          <Switch 
            trackColor={{ false: '#E5E5EA', true: '#34C759' }} 
            thumbColor="#fff"
            ios_backgroundColor="#E5E5EA"
          />
        ) : (
          !hideChevron && <ChevronRight size={20} color="#C7C7CC" />
        )}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-[1px] bg-gray-50 ml-16" />;
}
