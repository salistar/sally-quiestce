/**
 * @file game/variants.tsx
 * @description Sélecteur de packs thématiques pour Qui-est-ce ?
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../src/components/AppHeader';
import { useTheme } from '../../src/contexts/AppProviders';

const PACKS = [
  { key: 'classic', label: 'Classique', icon: 'people', color: '#0EA5E9', n: 24 },
  { key: 'maroc', label: 'Personnages historiques Maroc', icon: 'flag', color: '#DC2626', n: 36 },
  { key: 'sally', label: 'Univers Sally', icon: 'happy', color: '#F59E0B', n: 24 },
  { key: 'foot', label: 'Footballeurs', icon: 'football', color: '#16A34A', n: 36 },
  { key: 'animaux', label: 'Animaux', icon: 'paw', color: '#A855F7', n: 24 },
];

export default function VariantsScreen() {
  const router = useRouter();
  const { palette } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <AppHeader title="Packs thématiques" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {PACKS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={() => router.push({ pathname: '/game/local', params: { variant: p.key } })}
          >
            <View style={[styles.icon, { backgroundColor: p.color + '22' }]}>
              <Ionicons name={p.icon as any} size={26} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: palette.text }]}>{p.label}</Text>
              <Text style={[styles.sub, { color: palette.textSecondary }]}>{p.n} personnages</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
});
