export type Lang = 'fr' | 'en' | 'ar' | 'es' | 'darija';
export type VariantId = 'classique' | 'animaux' | 'anime' | 'sport' | 'celebrites' | 'mini-12' | 'mega-48';

export interface VariantTexts {
  name:     Record<Lang, string>;
  tagline:  Record<Lang, string>;
  overview: Record<Lang, string>;
  bidding:  Record<Lang, string>;
  scoring:  Record<Lang, string>;
  bonuses:  Record<Lang, string>;
  endgame:  Record<Lang, string>;
}

export interface Variant {
  id: VariantId; emoji: string; players: number[]; deckSize: number;
  target: number; hasCustom: boolean; i18n: VariantTexts;
}

const make = (id: VariantId, emoji: string, deck: number, names: Record<Lang,string>, tag: Record<Lang,string>, ov: Record<Lang,string>): Variant => ({
  id, emoji, players: [2], deckSize: deck, target: 1, hasCustom: false,
  i18n: {
    name: names, tagline: tag, overview: ov,
    bidding: { fr: 'Pas d enchères. Tour à tour : 1 question oui/non. Élimine les non-conformes.', en: 'No bidding. Turn-based: 1 yes/no question. Eliminate mismatches.', ar: 'بدون مزايدة', es: 'Sin apuestas', darija: 'بلا مزايدة' },
    scoring: { fr: 'Devine = win. Faux = adversaire win. Bo3/Bo5.', en: 'Guess = win. Wrong = opponent wins.', ar: 'تخمين صحيح يفوز', es: 'Adivinar correcto gana', darija: 'تخمين صحيح ربح' },
    bonuses: { fr: 'Streak 3 = +50 coins. Devinette ≤5 questions = +20.', en: 'Streak 3 = +50. Perfect = +20.', ar: 'سلسلة 3 = +50', es: 'Racha 3 = +50', darija: 'سلسلة 3 = +50' },
    endgame: { fr: 'Premier à 3 manches.', en: 'First to 3 rounds.', ar: 'أول 3 جولات', es: 'Primero a 3', darija: 'أول 3' },
  },
});

export const VARIANTS: Variant[] = [
  make('classique', '🕵️', 24,
    { fr: 'Classique', en: 'Classic', ar: 'كلاسيكي', es: 'Clásico', darija: 'عادي' },
    { fr: '2j · 24 personnages · déduction', en: '2p · 24 chars · deduction', ar: 'استنتاج', es: 'deducción', darija: 'استنتاج' },
    { fr: 'Classique Qui est-ce ? avec 24 personnages.', en: 'Classic 24-char Guess Who.', ar: 'كلاسيكي 24', es: 'Clásico 24', darija: 'عادي 24' }),
  make('animaux', '🐾', 24,
    { fr: 'Animaux', en: 'Animals', ar: 'حيوانات', es: 'Animales', darija: 'حيوانات' },
    { fr: '24 animaux · famille', en: '24 animals · family', ar: '24 حيوان', es: '24 animales', darija: '24 حيوان' },
    { fr: '24 animaux.', en: '24 animals.', ar: '24 حيوان', es: '24 animales', darija: '24 حيوان' }),
  make('anime', '🌸', 24,
    { fr: 'Anime', en: 'Anime', ar: 'أنمي', es: 'Anime', darija: 'أنمي' },
    { fr: '24 perso anime', en: '24 anime chars', ar: 'شخصيات أنمي', es: 'personajes anime', darija: 'شخصيات أنمي' },
    { fr: '24 personnages d anime cultes.', en: '24 iconic anime characters.', ar: '24 شخصية أنمي', es: '24 anime', darija: '24 أنمي' }),
  make('sport', '⚽', 24,
    { fr: 'Sport', en: 'Sports', ar: 'رياضة', es: 'Deporte', darija: 'رياضة' },
    { fr: '24 athlètes', en: '24 athletes', ar: '24 رياضي', es: '24 atletas', darija: '24 رياضي' },
    { fr: '24 athlètes contemporains.', en: '24 contemporary athletes.', ar: '24 رياضي', es: '24 atletas', darija: '24 رياضي' }),
  make('celebrites', '🌟', 24,
    { fr: 'Célébrités', en: 'Celebs', ar: 'مشاهير', es: 'Famosos', darija: 'مشاهير' },
    { fr: '24 figures historiques', en: '24 historical figures', ar: '24 شخصية', es: '24 figuras', darija: '24 شخصية' },
    { fr: '24 figures historiques (Einstein, Mandela…).', en: '24 historical figures.', ar: '24 شخصية تاريخية', es: '24 figuras históricas', darija: '24 شخصية' }),
  make('mini-12', '⚡', 12,
    { fr: 'Mini 12', en: 'Mini 12', ar: 'ميني 12', es: 'Mini 12', darija: 'ميني 12' },
    { fr: '12 perso · rapide', en: '12 chars · fast', ar: '12 سريع', es: '12 rápido', darija: '12 بزرب' },
    { fr: 'Version courte 12 personnages.', en: '12-character quick version.', ar: 'نسخة قصيرة', es: 'versión corta', darija: 'نسخة قصيرة' }),
  make('mega-48', '🔥', 48,
    { fr: 'Mega 48', en: 'Mega 48', ar: 'ميغا 48', es: 'Mega 48', darija: 'ميغا 48' },
    { fr: '48 perso · marathon', en: '48 chars · marathon', ar: '48 ماراثون', es: '48 maratón', darija: '48 ماراثون' },
    { fr: '48 personnages — version longue.', en: '48-character marathon.', ar: '48 ماراثون', es: '48 maratón', darija: '48 ماراثون' }),
];

export function getVariant(id: VariantId): Variant {
  return VARIANTS.find(v => v.id === id) || VARIANTS[0];
}
