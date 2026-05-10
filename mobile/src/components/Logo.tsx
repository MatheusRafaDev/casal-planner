import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export function Logo({ size = 120 }) {
  const s = size.toString();
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0" stopColor="#A78BFA" />
          <Stop offset="1" stopColor="#F9A8D4" />
        </LinearGradient>
      </Defs>
      <Path 
        d="M50 85C50 85 15 65 15 35C15 20 28 15 35 15C42 15 48 20 50 25C52 20 58 15 65 15C72 15 85 20 85 35C85 45 80 55 72 65" 
        stroke="url(#logo_grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      <Path 
        d="M60 75L72 87L95 60" 
        stroke="url(#logo_grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
}
