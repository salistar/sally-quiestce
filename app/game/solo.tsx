/**
 * @file game/solo.tsx
 * @description Mode solo Qui-est-ce ? — redirige vers /game/local qui héberge
 * déjà la logique solo-vs-IA via quiestceEngine.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function SoloScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/game/local');
  }, [router]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
