/**
 * @file quiestce-variants.ts
 * @description Catalogue des variantes "Qui est-ce ?" (Guess Who).
 * Inclut des themes : classique, animaux, anime, célébrités, sport, custom.
 */

export type Lang = 'fr' | 'en' | 'ar' | 'es' | 'darija';
export type VariantId =
  | 'classique'  // 24 personnages adultes mixtes
  | 'animaux'    // 24 animaux
  | 'anime'      // 24 personnages anime
  | 'sport'      // 24 athlètes
  | 'celebrites' // 24 célébrités historiques
  | 'mini-12'    // version courte 12 personnages
  | 'mega-48';   // version 48 personnages

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
  id:        VariantId;
  emoji:     string;
  players:   number[];
  deckSize:  24 | 12 | 48;
  target:    number;
  hasCustom: boolean;
  i18n:      VariantTexts;
}

const CLASSIQUE: Variant = {
  id: 'classique',
  emoji: '🕵️',
  players: [2],
  deckSize: 24,
  target: 1,
  hasCustom: false,
  i18n: {
    name: {
      fr: 'Qui est-ce ? Classique', en: 'Classic Guess Who', ar: 'من هو الكلاسيكي',
      es: 'Adivina Quién Clásico', darija: 'شكون هاد كلاسيكي',
    },
    tagline: {
      fr: '2 joueurs · 24 personnages · 1v1 par déduction',
      en: '2 players · 24 characters · 1v1 deduction',
      ar: '٢ لاعبين · ٢٤ شخصية · استنتاج',
      es: '2 jugadores · 24 personajes · deducción 1v1',
      darija: '2 لاعبين · 24 شخصية',
    },
    overview: {
      fr: "Le classique « Qui est-ce ? » : 2 joueurs, chacun pioche secrètement 1 personnage parmi 24. Tour à tour, on pose une question oui/non sur les caractéristiques (« A-t-il une barbe ? », « Porte-t-il des lunettes ? ») pour éliminer les candidats. Premier à deviner le personnage adverse gagne.",
      en: 'Classic Guess Who: 2 players, each secretly picks 1 character from 24. Turn by turn, ask yes/no questions about features ("Beard?", "Glasses?") to eliminate candidates. First to guess the opponent\'s character wins.',
      ar: '٢ لاعبين، كل واحد يختار شخصية من ٢٤. أسئلة نعم/لا لإقصاء المرشحين.',
      es: '2 jugadores, cada uno elige 1 personaje de 24. Preguntas sí/no para eliminar.',
      darija: '2 لاعبين، كل واحد كياخد شخصية من 24. أسئلة آيه/لا.',
    },
    bidding: {
      fr: "Pas d'enchères — c'est un jeu de déduction. À votre tour : posez UNE question oui/non au sujet du personnage adverse. Selon la réponse, abattez (rabattez en mode bois physique, masquez en mode digital) tous les personnages qui ne collent pas à la réponse.",
      en: 'No bidding — pure deduction. On your turn: ask ONE yes/no question about the opponent\'s character. Based on the answer, flip down (mask in digital) all characters that don\'t match.',
      ar: 'بدون مزايدة — استنتاج محض. اطرح سؤالاً نعم/لا ثم احذف غير المطابقين.',
      es: 'Sin apuestas — pura deducción. Pregunta sí/no y elimina los que no coinciden.',
      darija: 'بلا مزايدة — استنتاج. سول سؤال آيه/لا وحييد اللي ما يطابقش.',
    },
    scoring: {
      fr: "Quand vous pensez avoir identifié le personnage : vous le devinez à voix haute. Si correct, vous gagnez la manche. Si faux, l'adversaire gagne automatiquement. Le but est généralement « best of 3 » ou « best of 5 ».",
      en: 'When you think you know the character: guess out loud. Correct = you win the round. Wrong = opponent wins automatically. Usually best-of-3 or best-of-5.',
      ar: 'عندما تظن أنك عرفت: قل اسمه. صحيح: تربح. خطأ: الخصم يربح.',
      es: 'Cuando crees saber: di el nombre. Acierto = ganas. Fallo = oponente gana.',
      darija: 'إيلا قلتي اسم وصاح ربحتي، إيلا غلطتي خصمك ربح.',
    },
    bonuses: {
      fr: 'Streak : 3 manches d\'affilée = +50 coins. Devinette parfaite (en ≤ 5 questions) = +20 coins. Comeback (gagner après 10 questions perdues) = +30 coins.',
      en: 'Streak: 3 wins in a row = +50 coins. Perfect guess (≤ 5 questions) = +20 coins. Comeback (win after 10 questions lost) = +30 coins.',
      ar: 'سلسلة: ٣ انتصارات متتالية = +٥٠. تخمين مثالي = +٢٠.',
      es: 'Racha: 3 victorias seguidas = +50. Adivinanza perfecta = +20.',
      darija: 'سلسلة 3 ربحات = +50. تخمين كامل = +20.',
    },
    endgame: {
      fr: 'Premier à 3 manches gagne le match. ELO mis à jour selon le rang de l\'adversaire. Match Bo5 ou Bo7 disponible en lobby personnalisé.',
      en: 'First to 3 rounds wins the match. ELO updates based on opponent rank. Bo5 or Bo7 available in custom lobby.',
      ar: 'أول من يصل ٣ جولات يفوز. ELO يتحدث.',
      es: 'El primero en 3 rondas gana. ELO actualizado.',
      darija: 'أول واحد ل3 جولات كيربح.',
    },
  },
};

const ANIMAUX: Variant = {
  ...CLASSIQUE,
  id: 'animaux',
  emoji: '🐾',
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Qui est-ce ? Animaux', en: 'Guess Who? Animals', ar: 'من هو · حيوانات',
      es: 'Adivina Quién · Animales', darija: 'شكون هاد · حيوانات',
    },
    tagline: {
      fr: '24 animaux · idéal famille et enfants',
      en: '24 animals · family + kids edition',
      ar: '٢٤ حيواناً · للعائلة والأطفال',
      es: '24 animales · familia y niños',
      darija: '24 حيوان · للعائلة',
    },
    overview: {
      fr: '24 animaux variés (lion, renard, dauphin, papillon, etc.). Caractéristiques : pattes (4/2/0), poils/plumes/écailles, vit en eau/terre/air, carnivore/herbivore, taille. Plus pédagogique que la version classique, idéal enfants 6+.',
      en: '24 varied animals (lion, fox, dolphin, butterfly, etc.). Features: legs (4/2/0), fur/feathers/scales, lives in water/land/air, diet, size. Educational, ideal for kids 6+.',
      ar: '٢٤ حيواناً متنوعاً. الخصائص: أرجل، فرو/ريش، يعيش في الماء/البر، حجم.',
      es: '24 animales variados. Características: patas, pelaje/plumas, vive en, tamaño.',
      darija: '24 حيوان مختلف. الخصائص: أرجل، فرو/ريش، أين يعيش.',
    },
  },
};

const ANIME: Variant = {
  ...CLASSIQUE,
  id: 'anime',
  emoji: '🌸',
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Qui est-ce ? Anime', en: 'Guess Who? Anime', ar: 'من هو · أنمي',
      es: 'Adivina Quién · Anime', darija: 'شكون هاد · أنمي',
    },
    tagline: {
      fr: '24 personnages d\'anime cultes (Naruto, One Piece, etc.)',
      en: '24 iconic anime characters (Naruto, One Piece, etc.)',
      ar: '٢٤ شخصية أنمي شهيرة',
      es: '24 personajes anime icónicos',
      darija: '24 شخصية أنمي مشهورة',
    },
    overview: {
      fr: '24 personnages cultes d\'anime : Naruto, Goku, Luffy, Sailor Moon, Pikachu, Saitama, etc. Caractéristiques : pouvoirs, couleur de cheveux, sexe, série d\'origine, époque (90\'s / 2000\'s / 2010\'s).',
      en: '24 iconic anime characters: Naruto, Goku, Luffy, Sailor Moon, Pikachu, Saitama, etc. Features: powers, hair color, gender, source series, era (90s/2000s/2010s).',
      ar: '٢٤ شخصية أنمي شهيرة. الخصائص: قوى، لون الشعر، السلسلة الأصلية.',
      es: '24 personajes anime icónicos. Características: poderes, color de pelo, serie origen.',
      darija: '24 شخصية أنمي. الخصائص: قدرات، شعر، السلسلة.',
    },
  },
};

const SPORT: Variant = {
  ...CLASSIQUE,
  id: 'sport',
  emoji: '⚽',
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Qui est-ce ? Sport', en: 'Guess Who? Sports', ar: 'من هو · رياضة',
      es: 'Adivina Quién · Deporte', darija: 'شكون هاد · رياضة',
    },
    tagline: {
      fr: '24 athlètes contemporains (foot, basket, tennis...)',
      en: '24 contemporary athletes (football, basketball, tennis...)',
      ar: '٢٤ رياضياً معاصراً',
      es: '24 deportistas contemporáneos',
      darija: '24 رياضي معاصر',
    },
    overview: {
      fr: '24 athlètes contemporains représentant les sports majeurs : Messi, Ronaldo, LeBron, Serena, Nadal, etc. Caractéristiques : sport, pays, droite/gauche, nombre de trophées, époque de carrière.',
      en: '24 contemporary athletes across major sports: Messi, Ronaldo, LeBron, Serena, Nadal, etc. Features: sport, country, righty/lefty, trophies count, career era.',
      ar: '٢٤ رياضياً معاصراً. الخصائص: الرياضة، البلد، اليد المفضلة.',
      es: '24 atletas contemporáneos. Características: deporte, país, mano dominante.',
      darija: '24 رياضي. الخصائص: الرياضة، البلد، اليد.',
    },
  },
};

const CELEBRITES: Variant = {
  ...CLASSIQUE,
  id: 'celebrites',
  emoji: '🌟',
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Qui est-ce ? Célébrités', en: 'Guess Who? Celebrities', ar: 'من هو · مشاهير',
      es: 'Adivina Quién · Famosos', darija: 'شكون هاد · مشاهير',
    },
    tagline: {
      fr: '24 célébrités historiques (scientifiques, artistes, leaders)',
      en: '24 historical figures (scientists, artists, leaders)',
      ar: '٢٤ شخصية تاريخية',
      es: '24 figuras históricas',
      darija: '24 شخصية تاريخية',
    },
    overview: {
      fr: '24 figures historiques : Einstein, Mandela, Curie, Picasso, Mozart, Cleopatra, Gandhi, etc. Caractéristiques : siècle (avant 1800 / 1800-1900 / 1900+ / vivant), profession, sexe, continent.',
      en: '24 historical figures: Einstein, Mandela, Curie, Picasso, Mozart, Cleopatra, Gandhi, etc. Features: century, profession, gender, continent.',
      ar: '٢٤ شخصية تاريخية. الخصائص: القرن، المهنة، الجنس، القارة.',
      es: '24 figuras históricas. Características: siglo, profesión, continente.',
      darija: '24 شخصية تاريخية. الخصائص: القرن، الحرفة، القارة.',
    },
  },
};

const MINI: Variant = {
  ...CLASSIQUE,
  id: 'mini-12',
  emoji: '⚡',
  deckSize: 12,
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Mini 12', en: 'Mini 12', ar: 'ميني ١٢',
      es: 'Mini 12', darija: 'ميني 12',
    },
    tagline: {
      fr: 'Version courte 12 personnages · parties rapides',
      en: 'Short 12-character version · quick matches',
      ar: 'نسخة قصيرة ١٢ شخصية',
      es: 'Versión corta 12 personajes',
      darija: 'نسخة قصيرة 12 شخصية',
    },
    overview: {
      fr: '12 personnages au lieu de 24 — idéal pour des parties éclair (~3 minutes). Toutes les autres règles sont identiques au classique. Recommandé pour la pause café ou découvrir le jeu.',
      en: '12 characters instead of 24 — ideal for quick matches (~3 min). All other rules identical to classic. Recommended for coffee breaks or onboarding new players.',
      ar: '١٢ شخصية بدل ٢٤ — مباريات سريعة (٣ دقائق).',
      es: '12 personajes en lugar de 24 — partidas rápidas (~3 min).',
      darija: '12 شخصية بدل 24 — مباريات سريعة.',
    },
  },
};

const MEGA: Variant = {
  ...CLASSIQUE,
  id: 'mega-48',
  emoji: '🔥',
  deckSize: 48,
  i18n: {
    ...CLASSIQUE.i18n,
    name: {
      fr: 'Mega 48', en: 'Mega 48', ar: 'ميغا ٤٨',
      es: 'Mega 48', darija: 'ميغا 48',
    },
    tagline: {
      fr: '48 personnages · jeu marathon longue durée',
      en: '48 characters · marathon game',
      ar: '٤٨ شخصية · ماراثون',
      es: '48 personajes · maratón',
      darija: '48 شخصية · ماراثون',
    },
    overview: {
      fr: '48 personnages — deux fois plus que le classique. Parties de 15+ minutes. Pose plus de défis stratégiques : il faut éliminer 47 candidats avant de deviner. Pour les fans hardcore.',
      en: '48 characters — twice the classic. 15+ min matches. More strategic depth: must eliminate 47 candidates before guessing. For hardcore fans.',
      ar: '٤٨ شخصية — ضعف الكلاسيكي. مباريات ١٥ دقيقة فما فوق.',
      es: '48 personajes — el doble. Partidas de 15+ min.',
      darija: '48 شخصية — ضعف. مباريات 15+ دقيقة.',
    },
  },
};

export const VARIANTS: Variant[] = [
  CLASSIQUE, ANIMAUX, ANIME, SPORT, CELEBRITES, MINI, MEGA,
];

export function getVariant(id: VariantId): Variant {
  return VARIANTS.find(v => v.id === id) || CLASSIQUE;
}

export function variantsForPlayerCount(n: number): Variant[] {
  return VARIANTS.filter(v => v.players.includes(n));
}
