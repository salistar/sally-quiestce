/**
 * @file CardsPattern.tsx (Quiestce variant — CHARACTER PATTERN, NO CARDS)
 * @description Background pattern of stylized character portrait blocks.
 * Used by the onboarding slides — purely decorative.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type CardsPatternVariant = 'fan' | 'scattered' | 'spread' | 'grid';

interface Char {
  initial: string;
  gradient: [string, string];
  accent: string;
  top: string;
  left: string;
  rotate: number;
  size: number;
  opacity?: number;
}

// Indigo / pink / sky / rose / amber palette
const CHARS_POOL: Array<Omit<Char, 'top' | 'left' | 'rotate' | 'size' | 'opacity'>> = [
  { initial: 'S', gradient: ['#6366F1', '#4338CA'], accent: '#FFEDD5' },
  { initial: 'P', gradient: ['#FF6B9D', '#C026D3'], accent: '#FFE4E6' },
  { initial: 'M', gradient: ['#818CF8', '#4F46E5'], accent: '#FCE7F3' },
  { initial: 'J', gradient: ['#F472B6', '#BE185D'], accent: '#DBEAFE' },
  { initial: 'A', gradient: ['#FCD34D', '#D97706'], accent: '#FFEDD5' },
  { initial: 'L', gradient: ['#10B981', '#047857'], accent: '#FEF3C7' },
];

const LAYOUTS: Record<CardsPatternVariant, Char[]> = {
  fan: [
    { ...CHARS_POOL[0], top: '10%', left: '5%',  rotate: -20, size: 90, opacity: 0.65 },
    { ...CHARS_POOL[1], top: '15%', left: '32%', rotate: -8,  size: 100, opacity: 0.75 },
    { ...CHARS_POOL[2], top: '18%', left: '58%', rotate: 6,   size: 95, opacity: 0.7 },
    { ...CHARS_POOL[3], top: '70%', left: '20%', rotate: 12,  size: 80, opacity: 0.5 },
    { ...CHARS_POOL[4], top: '72%', left: '60%', rotate: -15, size: 80, opacity: 0.5 },
  ],
  scattered: [
    { ...CHARS_POOL[1], top: '8%',  left: '10%', rotate: -30, size: 95, opacity: 0.65 },
    { ...CHARS_POOL[3], top: '20%', left: '60%', rotate: 22,  size: 100, opacity: 0.7 },
    { ...CHARS_POOL[0], top: '45%', left: '5%',  rotate: 45,  size: 75, opacity: 0.5 },
    { ...CHARS_POOL[5], top: '50%', left: '55%', rotate: -18, size: 110, opacity: 0.75 },
    { ...CHARS_POOL[2], top: '78%', left: '25%', rotate: 10,  size: 75, opacity: 0.45 },
  ],
  spread: [
    { ...CHARS_POOL[0], top: '38%', left: '3%',  rotate: -8, size: 85, opacity: 0.65 },
    { ...CHARS_POOL[1], top: '36%', left: '22%', rotate: -3, size: 90, opacity: 0.7 },
    { ...CHARS_POOL[2], top: '35%', left: '42%', rotate: 0,  size: 100, opacity: 0.85 },
    { ...CHARS_POOL[3], top: '36%', left: '62%', rotate: 4,  size: 90, opacity: 0.7 },
    { ...CHARS_POOL[4], top: '38%', left: '82%', rotate: 8,  size: 85, opacity: 0.65 },
  ],
  grid: [
    { ...CHARS_POOL[0], top: '8%',  left: '8%',  rotate: -5, size: 78, opacity: 0.55 },
    { ...CHARS_POOL[1], top: '8%',  left: '38%', rotate: 4,  size: 78, opacity: 0.55 },
    { ...CHARS_POOL[2], top: '8%',  left: '68%', rotate: -3, size: 78, opacity: 0.55 },
    { ...CHARS_POOL[3], top: '32%', left: '8%',  rotate: 6,  size: 78, opacity: 0.55 },
    { ...CHARS_POOL[4], top: '32%', left: '38%', rotate: -7, size: 78, opacity: 0.55 },
    { ...CHARS_POOL[5], top: '32%', left: '68%', rotate: 2,  size: 78, opacity: 0.55 },
  ],
};

interface CardsPatternProps {
  variant?: CardsPatternVariant;
  tint?: [string, string, string];
  overlayStrength?: number;
  style?: ViewStyle;
}

export default function CardsPattern({
  variant = 'fan',
  tint = ['rgba(99,102,241,0.6)', 'rgba(67,56,202,0.8)', 'rgba(20,15,60,0.95)'],
  overlayStrength = 0.55,
  style,
}: CardsPatternProps) {
  const layout = LAYOUTS[variant];
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <LinearGradient colors={tint} style={StyleSheet.absoluteFill} />
      {layout.map((c, i) => (
        <View
          key={`${variant}-${i}`}
          style={{
            position: 'absolute',
            top: c.top as any,
            left: c.left as any,
            width: c.size,
            height: c.size * 1.25,
            borderRadius: c.size * 0.15,
            opacity: c.opacity ?? 0.7,
            transform: [{ rotate: `${c.rotate}deg` }],
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={c.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: c.size * 0.15 }]}
          />
          <View
            style={{
              width: c.size * 0.55,
              height: c.size * 0.55,
              borderRadius: c.size * 0.275,
              backgroundColor: c.accent,
              alignSelf: 'center',
              marginTop: c.size * 0.2,
              opacity: 0.85,
            }}
          />
          <Text
            style={{
              fontSize: c.size * 0.22,
              fontWeight: '900',
              color: '#fff',
              textAlign: 'center',
              textShadowColor: 'rgba(0,0,0,0.4)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
              marginTop: 4,
            }}
          >
            {c.initial}
          </Text>
        </View>
      ))}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(20,15,60,${overlayStrength})` },
        ]}
      />
    </View>
  );
}
