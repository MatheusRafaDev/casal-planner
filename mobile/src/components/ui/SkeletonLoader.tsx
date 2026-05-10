import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#3F3F46',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ backgroundColor: '#27272A', borderRadius: 24, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3F3F46' }}>
      <Skeleton width={80} height={10} borderRadius={6} style={{ marginBottom: 10 }} />
      <Skeleton width={'60%'} height={22} borderRadius={6} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272A', borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#3F3F46' }}>
      <Skeleton width={40} height={40} borderRadius={12} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width={'70%'} height={12} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width={'40%'} height={10} borderRadius={6} />
      </View>
    </View>
  );
}
