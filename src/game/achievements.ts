/**
 * @file achievements.ts
 * @description Système d'achievements Qui-est-ce ? basé sur les parties gagnées
 * stockées localement.
 *
 * Stockage : `achievements:unlocked` = { id: timestamp }
 *           `replay:quiestce:*`     = JSON par partie
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'achievements:unlocked';
const REPLAY_PREFIX = 'replay:quiestce:';

export interface QuiestceWin {
  id: string;
  variantKey: string;
  difficulty: string;
  questionsAsked: number;
  durationMs: number;
  wonAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (wins: QuiestceWin[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win',
    title: 'Premier Triomphe',
    description: 'Gagne ta toute première partie.',
    icon: 'trophy',
    rarity: 'common',
    check: (rs) => rs.length >= 1,
  },
  {
    id: 'win-10',
    title: 'Apprenti Détective',
    description: 'Gagne 10 parties.',
    icon: 'medal',
    rarity: 'common',
    check: (rs) => rs.length >= 10,
  },
  {
    id: 'win-50',
    title: 'Sherlock Marocain',
    description: 'Gagne 50 parties.',
    icon: 'star',
    rarity: 'rare',
    check: (rs) => rs.length >= 50,
  },
  {
    id: 'win-hard',
    title: 'Cœur d\'acier',
    description: 'Gagne une partie en HARD (50 personnages).',
    icon: 'shield',
    rarity: 'rare',
    check: (rs) => rs.some((r) => r.difficulty === 'hard'),
  },
  {
    id: 'efficient-5',
    title: 'Logicien',
    description: 'Gagne en moins de 6 questions.',
    icon: 'bulb',
    rarity: 'rare',
    check: (rs) => rs.some((r) => r.questionsAsked > 0 && r.questionsAsked < 6),
  },
  {
    id: 'efficient-3',
    title: 'Génie de la déduction',
    description: 'Gagne en 3 questions ou moins.',
    icon: 'flash',
    rarity: 'legendary',
    check: (rs) => rs.some((r) => r.questionsAsked > 0 && r.questionsAsked <= 3),
  },
  {
    id: 'speedrun-30s',
    title: 'Foudre',
    description: 'Gagne une partie en moins de 30 secondes.',
    icon: 'stopwatch',
    rarity: 'epic',
    check: (rs) => rs.some((r) => r.durationMs > 0 && r.durationMs < 30_000),
  },
  {
    id: 'all-packs',
    title: 'Polyvalent',
    description: 'Gagne au moins une fois dans chaque pack thématique.',
    icon: 'apps',
    rarity: 'epic',
    check: (rs) => {
      const packs = new Set(rs.map((r) => r.variantKey));
      return packs.size >= 5;
    },
  },
];

export interface UnlockedAchievement extends Achievement {
  unlockedAt: number;
}

async function listAllWins(): Promise<QuiestceWin[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const replayKeys = keys.filter((k) => k.startsWith(REPLAY_PREFIX));
    const items = await AsyncStorage.multiGet(replayKeys);
    return items
      .map(([_, v]) => { try { return JSON.parse(v ?? ''); } catch { return null; } })
      .filter((x): x is QuiestceWin => !!x && typeof x.questionsAsked === 'number');
  } catch {
    return [];
  }
}

export async function evaluateAchievements(): Promise<{
  all: Achievement[];
  unlocked: Record<string, number>;
  newlyUnlocked: Achievement[];
}> {
  const wins = await listAllWins();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const unlocked: Record<string, number> = raw ? JSON.parse(raw) : {};
  const newlyUnlocked: Achievement[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlocked[ach.id]) continue;
    if (ach.check(wins)) {
      unlocked[ach.id] = Date.now();
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }

  return { all: ACHIEVEMENTS, unlocked, newlyUnlocked };
}

export async function getUnlockedAchievements(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
