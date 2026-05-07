/**
 * @file quick-match.tsx
 * @description Quick Match Qui-est-ce ? — appelle l'endpoint API
 * /quiestce-matches/quick-match qui trouve un joueur en attente ou crée
 * une nouvelle partie.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../src/components/AppHeader';
import { useTheme } from '../src/contexts/AppProviders';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const VARIANTS = [
  { key: 'classic', label: 'Classique' },
  { key: 'maroc', label: 'Maroc' },
  { key: 'sally', label: 'Sally' },
  { key: 'foot', label: 'Football' },
  { key: 'animaux', label: 'Animaux' },
];

export default function QuickMatchScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const [busy, setBusy] = useState<string | null>(null);

  async function joinOrCreate(variant: string) {
    setBusy(variant);
    try {
      const res = await fetch(`${API_URL}/api/v1/quiestce-matches/quick-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant,
          difficulty: 'medium',
          userId: 'guest-' + Math.random().toString(36).slice(2, 8),
          displayName: 'Guest',
        }),
      });
      const j = await res.json();
      const data = j?.data?.data ?? j?.data;
      if (data?.code) {
        router.push({ pathname: '/game/[roomCode]', params: { roomCode: data.code } });
      } else {
        Alert.alert('Erreur', j?.error ?? 'Quick match indisponible');
      }
    } catch (e: any) {
      Alert.alert('Erreur réseau', String(e?.message ?? e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <AppHeader title="Quick Match" showBack />
      <View style={styles.content}>
        <Text style={[styles.intro, { color: palette.textSecondary }]}>
          Trouve un adversaire en attente, ou crée une partie.
        </Text>
        {VARIANTS.map((v) => (
          <TouchableOpacity
            key={v.key}
            style={[styles.btn, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={() => joinOrCreate(v.key)}
            disabled={busy !== null}
          >
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={[styles.btnLabel, { color: palette.text }]}>{v.label}</Text>
            {busy === v.key ? (
              <ActivityIndicator size="small" color={palette.text} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12 },
  intro: { marginBottom: 8, fontSize: 14 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 12, borderWidth: 1,
  },
  btnLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
});
