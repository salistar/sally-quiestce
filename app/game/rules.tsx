/**
 * @file game/rules.tsx
 * @description Règles du Qui-est-ce ?
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import { useTheme } from '../../src/contexts/AppProviders';

export default function RulesScreen() {
  const { palette } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <AppHeader title="Règles — Qui est-ce ?" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Section palette={palette} title="🎯 But du jeu">
          Devine le personnage secret de l'adversaire avant qu'il devine le tien.
        </Section>
        <Section palette={palette} title="🃏 Mise en place">
          Chaque joueur dispose de toutes les cartes face visible. Chaque joueur tire au hasard une carte « personnage secret » qu'il met de côté.
        </Section>
        <Section palette={palette} title="❓ Tour de jeu">
          Pose une question fermée (oui/non) sur le personnage adverse. Selon la réponse, élimine les cartes ne correspondant pas. À tout moment, tente la devinette finale — si juste, victoire ; si fausse, défaite immédiate.
        </Section>
        <Section palette={palette} title="🧠 Stratégie optimale">
          Avec 24 personnages, on peut deviner en log₂(24) ≈ 5 questions parfaites. Privilégie les questions qui éliminent ~50% des candidats (genre, cheveux clairs/foncés, lunettes…).
        </Section>
        <Section palette={palette} title="🎨 Variantes">
          Solo (vs IA), Multi local pass-and-play, Multi en ligne, Coopératif, Express (5 questions max), Bluff (mensonge autorisé 1 fois).
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ palette, title, children }: any) {
  return (
    <View style={[styles.section, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.body, { color: palette.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12 },
  section: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
});
