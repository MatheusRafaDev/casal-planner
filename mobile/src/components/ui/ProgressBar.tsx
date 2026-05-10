import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  borderRadius?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color = '#A78BFA',
  backgroundColor = '#27272A',
  height = 6,
  borderRadius = 99,
  showLabel = false,
  label,
  style,
}: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clampedProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {showLabel && (
        <Text style={{ color: '#A1A1AA', fontSize: 10, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
          {label || `${clampedProgress.toFixed(0)}%`}
        </Text>
      )}
      <View
        style={{
          backgroundColor,
          height,
          borderRadius,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius,
            width: widthInterpolated,
          }}
        />
      </View>
    </View>
  );
}
