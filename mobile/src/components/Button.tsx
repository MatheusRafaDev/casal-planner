import React, { useRef } from 'react';
import { Text, Pressable, PressableProps, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'nubank';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({ title, variant = 'primary', onPress, ...props }: ButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    if (props.onPressIn) props.onPressIn(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    if (props.onPressOut) props.onPressOut(e);
  };

  const baseClasses = "rounded-2xl py-4 px-6 items-center justify-center flex-row shadow-sm";
  let variantClasses = "bg-accent";
  let textClasses = "text-white font-semibold text-lg";

  if (variant === 'secondary') {
    variantClasses = "bg-primary-light";
  } else if (variant === 'outline') {
    variantClasses = "bg-transparent border border-accent";
    textClasses = "text-accent font-semibold text-lg";
  } else if (variant === 'nubank') {
    variantClasses = "bg-accent-nubank";
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className={`${baseClasses} ${variantClasses}`}
      style={{ transform: [{ scale: scaleAnim }] }}
      {...props}
    >
      <Text className={textClasses}>{title}</Text>
    </AnimatedPressable>
  );
};
