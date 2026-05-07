/**
 * @file variants.ts — Catalogue Qui est-ce ? (Guess Who?).
 * Multi >1 joueur : socket+STUN/TURN+Jitsi via /room/create. Solo vs-ai sans socket.
 */

export type VariantKey =
  | 'classic-24' | 'mena-personalities' | 'sourates-24'
  | 'capitales-24' | 'drapeaux-24' | 'disney-24'
  | 'double-character' | 'speed-round' | 'limited-questions'
  | 'bluff-mode' | 'forced-guess-10' | 'coop-2v2'
  | 'vs-ai';

export interface Variant {
  key: VariantKey;
  engine: 'quiestce' | 'vs-ai';
  emoji: string;
  name: string;
  shortDesc: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  winRate: string;
  duration: string;
  cards: number;
  rules: { title: string; body: string }[];
  available: boolean;
  options?: {
    players?: 2 | 4;
    pack?: 'classic' | 'mena' | 'sourates' | 'capitales' | 'drapeaux' | 'disney';
    doubleCharacter?: boolean;
    timer?: number;             // sec par question
    questionLimit?: number;     // 15 questions max
    bluff?: boolean;
    forcedGuessAt?: number;
    teams?: boolean;
    multi?: boolean;
  };
}

export const VARIANTS: Variant[] = [
  {
    key: 'classic-24', engine: 'quiestce', emoji: '🤔', name: 'Classique 24',
    shortDesc: '24 personnages classiques (homme/femme, attributs visibles).',
    difficulty: 2, winRate: '~50%', duration: '~10 min', cards: 24, available: true,
    options: { players: 2, pack: 'classic', multi: true },
    rules: [
      { title: 'Vue d\'ensemble', body: 'Jeu de déduction logique 1v1 (ou 2v2 en équipes). Devine le personnage adverse via questions oui/non.' },
      { title: 'Mise en place', body: 'Chaque joueur tire en aveugle 1 personnage parmi 24. Les 24 portraits sont visibles "ouverts" sur le plateau.' },
      { title: 'Tour de jeu', body: 'À ton tour, pose une question fermée (oui/non) sur un attribut visible. Adversaire répond. Tu rabats les personnages éliminés.' },
      { title: 'Questions valides', body: '"Est-ce un homme ?" "A-t-il les cheveux blonds ?" "Porte-t-il des lunettes ?" — sur des attributs visibles.' },
      { title: 'Questions interdites', body: '"S\'appelle-t-il Pierre ?" → c\'est une devinette (fin de partie). Pas de questions composées (1 question = 1 attribut).' },
      { title: 'Tentative de devinette', body: 'À la place d\'une question, annonce un nom. Juste = victoire immédiate. Faux = défaite immédiate.' },
      { title: 'Stratégie d\'entropie', body: 'À chaque question, vise à éliminer ~50% des candidats. "Homme/femme ?" élimine 12/24 = parfait.' },
      { title: 'Théorie info', body: 'Log2(24) ≈ 4.58 → 5 questions optimales suffisent en théorie.' },
      { title: 'Victoire', body: 'Identifier correctement le personnage adverse.' },
    ],
  },
  {
    key: 'mena-personalities', engine: 'quiestce', emoji: '🌍', name: 'Personnalités MENA',
    shortDesc: '24 personnalités du monde arabe et MENA (artistes, sportifs, historiques).',
    difficulty: 3, winRate: '~50%', duration: '~12 min', cards: 24, available: true,
    options: { players: 2, pack: 'mena', multi: true },
    rules: [
      { title: 'Pack', body: '24 personnalités MENA : Oum Kalthoum, Mohamed Salah, Nawal El Saadawi, etc.' },
      { title: 'Attributs', body: 'Sexe, époque, domaine (musique/sport/littérature/politique), nationalité, accessoire emblématique.' },
      { title: 'Pédagogique', body: 'Excellent pour découvrir la culture MENA.' },
    ],
  },
  {
    key: 'sourates-24', engine: 'quiestce', emoji: '📖', name: 'Sourates',
    shortDesc: '24 sourates avec attributs (longueur, période, thème).',
    difficulty: 4, winRate: '~50%', duration: '~12 min', cards: 24, available: true,
    options: { players: 2, pack: 'sourates', multi: true },
    rules: [
      { title: 'Pack', body: '24 sourates du Coran avec attributs.' },
      { title: 'Attributs', body: 'Longueur (courte/moyenne/longue), période (mecquoise/médinoise), thème (foi, droit, narration), numéro pair/impair.' },
      { title: 'Mode éducatif', body: 'Apprendre les caractéristiques des sourates.' },
    ],
  },
  {
    key: 'capitales-24', engine: 'quiestce', emoji: '🌐', name: 'Capitales du Monde',
    shortDesc: '24 capitales mondiales avec attributs géographiques.',
    difficulty: 3, winRate: '~50%', duration: '~12 min', cards: 24, available: true,
    options: { players: 2, pack: 'capitales', multi: true },
    rules: [
      { title: 'Pack', body: '24 capitales : Paris, Tokyo, Brasilia, Le Caire, Rabat, Stockholm, etc.' },
      { title: 'Attributs', body: 'Continent, hémisphère, climat, langue officielle, sur la côte/intérieure.' },
      { title: 'Pédagogique', body: 'Géographie ludique.' },
    ],
  },
  {
    key: 'drapeaux-24', engine: 'quiestce', emoji: '🏳️', name: 'Drapeaux',
    shortDesc: '24 drapeaux Afrique/Asie/Europe avec attributs visuels.',
    difficulty: 3, winRate: '~50%', duration: '~12 min', cards: 24, available: true,
    options: { players: 2, pack: 'drapeaux', multi: true },
    rules: [
      { title: 'Pack', body: '24 drapeaux nationaux.' },
      { title: 'Attributs', body: 'Couleurs principales (rouge/bleu/vert), nb de bandes, croissant, étoile, contient une croix.' },
    ],
  },
  {
    key: 'disney-24', engine: 'quiestce', emoji: '🏰', name: 'Disney 24',
    shortDesc: '24 personnages des films Disney.',
    difficulty: 2, winRate: '~50%', duration: '~10 min', cards: 24, available: true,
    options: { players: 2, pack: 'disney', multi: true },
    rules: [
      { title: 'Pack', body: '24 personnages Disney : Mickey, Elsa, Simba, Buzz, etc.' },
      { title: 'Pour enfants', body: 'Idéal famille, attributs simples (animal/humain, princesse, vilain, ami…).' },
    ],
  },
  {
    key: 'double-character', engine: 'quiestce', emoji: '👯', name: 'Double Personnage',
    shortDesc: 'Chaque joueur choisit 2 personnages, doit deviner les 2.',
    difficulty: 4, winRate: '~30%', duration: '~20 min', cards: 24, available: true,
    options: { players: 2, doubleCharacter: true, multi: true },
    rules: [
      { title: 'Mode', body: 'Chaque joueur choisit 2 personnages secrets (au lieu d\'1).' },
      { title: 'Objectif', body: 'Identifier les 2 personnages adverses.' },
      { title: 'Stratégie', body: 'Plus complexe : tes questions doivent permettre d\'identifier 2 cibles à la fois.' },
    ],
  },
  {
    key: 'speed-round', engine: 'quiestce', emoji: '⚡', name: 'Speed Round',
    shortDesc: '30 sec par question (timer). Pression intense.',
    difficulty: 4, winRate: '~50%', duration: '~5 min', cards: 24, available: true,
    options: { players: 2, timer: 30, multi: true },
    rules: [
      { title: 'Mode', body: '30 secondes par question. Si tu dépasses → tour passé.' },
      { title: 'Pression', body: 'Très tendu, force à des questions instinctives.' },
    ],
  },
  {
    key: 'limited-questions', engine: 'quiestce', emoji: '🔢', name: 'Questions Limitées',
    shortDesc: '15 questions max. Sinon défaite.',
    difficulty: 4, winRate: '~50%', duration: '~10 min', cards: 24, available: true,
    options: { players: 2, questionLimit: 15, multi: true },
    rules: [
      { title: 'Mode', body: '15 questions maximum par joueur. Au-delà → défaite automatique.' },
      { title: 'Optimisation', body: 'Force chaque question à être maximalement informative (entropie).' },
    ],
  },
  {
    key: 'bluff-mode', engine: 'quiestce', emoji: '🎭', name: 'Mode Bluff',
    shortDesc: 'L\'adversaire peut mentir 1 fois. Tu peux accuser.',
    difficulty: 5, winRate: '~50%', duration: '~15 min', cards: 24, available: true,
    options: { players: 2, bluff: true, multi: true },
    rules: [
      { title: 'Bluff', body: 'L\'adversaire peut MENTIR une fois par partie.' },
      { title: 'Accusation', body: 'Tu peux ACCUSER de mentir : si juste, l\'adversaire perd ; si faux, TU perds.' },
      { title: 'Niveau', body: 'Très psychologique. Lecture de l\'adversaire.' },
    ],
  },
  {
    key: 'forced-guess-10', engine: 'quiestce', emoji: '🎯', name: 'Devinette Imposée',
    shortDesc: 'Devinette obligatoire à la 10e question pile.',
    difficulty: 4, winRate: '~50%', duration: '~10 min', cards: 24, available: true,
    options: { players: 2, forcedGuessAt: 10, multi: true },
    rules: [
      { title: 'Mode', body: 'Au lieu de "deviner quand tu veux", tu DOIS deviner à la 10e question pile.' },
      { title: 'Élimine les hâtives', body: 'Pas de devinette précoce. Force à exploiter ses 10 questions.' },
    ],
  },
  {
    key: 'coop-2v2', engine: 'quiestce', emoji: '🤝', name: 'Équipes 2v2',
    shortDesc: '4 joueurs, 2 équipes de 2. Communication interdite pendant tour adverse.',
    difficulty: 4, winRate: '~50%', duration: '~20 min', cards: 24, available: true,
    options: { players: 4, teams: true, multi: true },
    rules: [
      { title: 'Mode', body: '2 équipes de 2. Chaque équipe choisit 1 personnage commun.' },
      { title: 'Tours', body: 'Les 2 joueurs d\'une équipe se relaient pour poser des questions.' },
      { title: 'Communication', body: 'INTERDITE entre équipiers pendant le tour adverse.' },
    ],
  },
  {
    key: 'vs-ai', engine: 'vs-ai', emoji: '🤖', name: 'Solo vs IA',
    shortDesc: 'Solo contre IA (Gemini) avec stratégie d\'entropie optimale.',
    difficulty: 4, winRate: '~50%', duration: '~10 min', cards: 24, available: true,
    options: { players: 2, pack: 'classic' },
    rules: [
      { title: 'Mode', body: 'Solo contre une IA qui joue avec stratégie optimale (entropie).' },
      { title: 'Difficulté', body: 'Easy (questions random) / Smart (entropie partielle) / Optimal (entropie max).' },
      { title: 'Coach', body: 'En post-partie : "ta question 3 a éliminé 4 personnages, mais une autre aurait pu en éliminer 8".' },
      { title: 'Hors-ligne', body: 'Pas de socket.' },
    ],
  },
];

export const AVAILABLE_VARIANTS = VARIANTS.filter((v) => v.available);
export function findVariant(key: string): Variant | undefined {
  return VARIANTS.find((v) => v.key === key);
}
