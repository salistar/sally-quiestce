/**
 * @file quiestce-elo.ts
 * @description Système ELO Qui-est-ce ? — basé sur les parties locales gagnées,
 * avec bonus pour faible nombre de questions et rapidité.
 *
 * Formule :
 *   - ELO de base : 1000
 *   - Victoire en hard (50 perso) : +30
 *   - Victoire en medium (36 perso) : +15
 *   - Victoire en easy (24 perso) : +5
 *   - Bonus < log2(N)+1 questions (théorique optimal) : +15
 *   - Bonus speedrun (< best * 1.3) : +5
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_ELO = 1000;
const REPLAY_PREFIX = 'replay:quiestce:';

const WIN_GAIN: Record<string, number> = {
  easy: 5,
  medium: 15,
  hard: 30,
};

const VARIANTS = ['classic', 'maroc', 'sally', 'foot', 'animaux'];

interface QuiestceWin {
  variantKey: string;
  difficulty: string;
  questionsAsked: number;
  durationMs: number;
  wonAt: number;
}

export interface VariantElo {
  variant: string;
  elo: number;
  wins: number;
  history: { date: number; elo: number; gain: number; reason: string }[];
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

function poolSize(difficulty: string): number {
  return difficulty === 'hard' ? 50 : difficulty === 'easy' ? 24 : 36;
}

export async function computeEloByVariant(): Promise<Record<string, VariantElo>> {
  const wins = await listAllWins();
  wins.sort((a, b) => a.wonAt - b.wonAt);

  const out: Record<string, VariantElo> = {};
  for (const v of VARIANTS) out[v] = { variant: v, elo: BASE_ELO, wins: 0, history: [] };

  const bestDurByVariant: Record<string, number> = {};
  for (const r of wins) {
    if (!out[r.variantKey] || r.durationMs <= 0) continue;
    if (!bestDurByVariant[r.variantKey] || r.durationMs < bestDurByVariant[r.variantKey]) {
      bestDurByVariant[r.variantKey] = r.durationMs;
    }
  }

  for (const r of wins) {
    const v = out[r.variantKey];
    if (!v) continue;
    let gain = WIN_GAIN[r.difficulty] ?? WIN_GAIN.medium;
    let reason = `Win ${r.difficulty}`;

    const optimal = Math.ceil(Math.log2(poolSize(r.difficulty))) + 1;
    if (r.questionsAsked > 0 && r.questionsAsked <= optimal) {
      gain += 15;
      reason += ' +efficient';
    }

    if (bestDurByVariant[r.variantKey] && r.durationMs > 0 && r.durationMs < bestDurByVariant[r.variantKey] * 1.3) {
      gain += 5;
      reason += ' +speed';
    }

    v.elo += gain;
    v.wins++;
    v.history.push({ date: r.wonAt, elo: v.elo, gain, reason });
  }

  return out;
}

export async function computeGlobalElo(): Promise<number> {
  const eloMap = await computeEloByVariant();
  const played = Object.values(eloMap).filter((v) => v.wins > 0);
  if (played.length === 0) return BASE_ELO;
  const sum = played.reduce((a, b) => a + b.elo, 0);
  return Math.round(sum / played.length);
}

export function rankFromElo(elo: number): { tier: string; color: string; emoji: string } {
  if (elo >= 2500) return { tier: 'Diamond', color: '#06B6D4', emoji: '💎' };
  if (elo >= 2000) return { tier: 'Platinum', color: '#A855F7', emoji: '🏆' };
  if (elo >= 1500) return { tier: 'Gold', color: '#F59E0B', emoji: '🥇' };
  if (elo >= 1200) return { tier: 'Silver', color: '#94A3B8', emoji: '🥈' };
  return { tier: 'Bronze', color: '#92400E', emoji: '🥉' };
}
