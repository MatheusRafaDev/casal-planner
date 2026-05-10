import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, Animated, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  iconBg?: string;
  delay?: number;
  style?: ViewStyle;
}

export function StatCard({ icon, label, value, subValue, iconBg = '#A78BFA20', delay = 0, style }: StatCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          backgroundColor: '#27272A',
          borderRadius: 24,
          padding: 16,
          borderWidth: 1,
          borderColor: '#3F3F46',
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        {icon}
      </View>
      <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>
        {value}
      </Text>
      {subValue && (
        <Text style={{ color: '#71717A', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
          {subValue}
        </Text>
      )}
    </Animated.View>
  );
}
