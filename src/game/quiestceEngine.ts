/**
 * QuiEstCeEngine - "Guess Who?" with Spanish cards for 2 players.
 *
 * Rules:
 * - Each player gets a random secret card from the 40-card deck
 * - All 40 cards are displayed face-up on each player's board
 * - Players take turns asking yes/no questions about the opponent's card:
 *   - Suit question: "Is it bastos?"
 *   - Value comparison: "Is the value > 7?"
 *   - Color question: "Is it red?" (copas/oros = red, bastos/espadas = black)
 * - After asking, player eliminates non-matching cards from their board
 * - Instead of asking, player can GUESS the opponent's card
 * - Correct guess = win, wrong guess = lose
 * - If both players guess wrong, it's a draw
 */

// ============================================================
// TYPES
// ============================================================

export type Suit = 'bastos' | 'copas' | 'espadas' | 'oros';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;
export type CardColor = 'red' | 'black';

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

export type QuestionType = 'suit' | 'value_gt' | 'value_lt' | 'value_eq' | 'color' | 'is_face';

export interface Question {
  type: QuestionType;
  value?: CardValue | Suit | CardColor;
  label: string;
  answer: boolean;
  askerId: string;
}

export interface PlayerState {
  id: string;
  name: string;
  secretCard: Card;
  eliminatedCardIds: Set<string>;
  board: Card[];
  isBot: boolean;
  hasLost: boolean;
}

export type GamePhase = 'asking' | 'guessing' | 'gameOver';

export interface GameState {
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  currentPlayerIndex: number;
  questionHistory: Question[];
  winnerId: string | null;
  isDraw: boolean;
  lastQuestion: Question | null;
  allCards: Card[];
}

export type GameAction =
  | { type: 'ASK_QUESTION'; questionType: QuestionType; value?: CardValue | Suit | CardColor }
  | { type: 'ELIMINATE_CARDS'; cardIds: string[] }
  | { type: 'GUESS_CARD'; cardId: string }
  | { type: 'RESET' };

// ============================================================
// CONSTANTS
// ============================================================

export const SUITS: Suit[] = ['bastos', 'copas', 'espadas', 'oros'];
export const VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export const TOTAL_CARDS = 40;

export const SUIT_COLORS: Record<Suit, CardColor> = {
  bastos: 'black',
  espadas: 'black',
  copas: 'red',
  oros: 'red',
};

export const SUIT_NAMES: Record<Suit, string> = {
  bastos: 'Bâtons',
  copas: 'Coupes',
  espadas: 'Épées',
  oros: 'Deniers',
};

export const VALUE_NAMES: Record<CardValue, string> = {
  1: 'As',
  2: 'Deux',
  3: 'Trois',
  4: 'Quatre',
  5: 'Cinq',
  6: 'Six',
  7: 'Sept',
  10: 'Sota',
  11: 'Caballo',
  12: 'Rey',
};

export const FACE_VALUES: CardValue[] = [10, 11, 12];

// ============================================================
// DECK
// ============================================================

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const valueStr = value.toString().padStart(2, '0');
      deck.push({ suit, value, id: `${valueStr}-${suit}` });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// CARD PROPERTIES
// ============================================================

export function getCardColor(card: Card): CardColor {
  return SUIT_COLORS[card.suit];
}

export function isFaceCard(card: Card): boolean {
  return FACE_VALUES.includes(card.value);
}

export function formatCard(card: Card): string {
  return `${VALUE_NAMES[card.value]} de ${SUIT_NAMES[card.suit]}`;
}

export function getCardImagePath(card: Card): string {
  return `${card.id}.png`;
}

export function getCardBackImagePath(): string {
  return 'back.png';
}

// ============================================================
// QUESTION LOGIC
// ============================================================

/** Answer a question about a card */
export function answerQuestion(card: Card, questionType: QuestionType, value?: CardValue | Suit | CardColor): boolean {
  switch (questionType) {
    case 'suit':
      return card.suit === (value as Suit);
    case 'value_gt':
      return card.value > (value as CardValue);
    case 'value_lt':
      return card.value < (value as CardValue);
    case 'value_eq':
      return card.value === (value as CardValue);
    case 'color':
      return getCardColor(card) === (value as CardColor);
    case 'is_face':
      return isFaceCard(card);
    default:
      return false;
  }
}

/** Generate a human-readable label for a question */
export function getQuestionLabel(questionType: QuestionType, value?: CardValue | Suit | CardColor): string {
  switch (questionType) {
    case 'suit':
      return `Est-ce ${SUIT_NAMES[value as Suit]} ?`;
    case 'value_gt':
      return `La valeur est > ${value} ?`;
    case 'value_lt':
      return `La valeur est < ${value} ?`;
    case 'value_eq':
      return `La valeur est ${value} ?`;
    case 'color':
      return `Est-ce ${(value as CardColor) === 'red' ? 'rouge' : 'noir'} ?`;
    case 'is_face':
      return 'Est-ce une figure (10-12) ?';
    default:
      return '';
  }
}

/** Determine which cards should be eliminated based on the question answer */
export function getCardsToEliminate(
  board: Card[],
  eliminatedIds: Set<string>,
  questionType: QuestionType,
  value: CardValue | Suit | CardColor | undefined,
  answer: boolean
): string[] {
  return board
    .filter((card) => !eliminatedIds.has(card.id))
    .filter((card) => {
      const matches = answerQuestion(card, questionType, value);
      // If answer is YES, eliminate cards that DON'T match
      // If answer is NO, eliminate cards that DO match
      return answer ? !matches : matches;
    })
    .map((card) => card.id);
}

// ============================================================
// BOT AI
// ============================================================

interface BotAnalysis {
  questionType: QuestionType;
  value?: CardValue | Suit | CardColor;
  expectedEliminations: number;
}

/** Bot chooses the best question to narrow down remaining cards */
export function botChooseQuestion(
  botState: PlayerState,
  opponentState: PlayerState
): { questionType: QuestionType; value?: CardValue | Suit | CardColor } {
  const remaining = botState.board.filter(
    (c) => !botState.eliminatedCardIds.has(c.id)
  );

  // If only 1-3 cards remain, guess
  if (remaining.length <= 3) {
    // Return a guess action instead
    return { questionType: 'suit', value: remaining[0].suit }; // Placeholder, bot will guess
  }

  const candidates: BotAnalysis[] = [];

  // Suit questions
  for (const suit of SUITS) {
    const matchCount = remaining.filter((c) => c.suit === suit).length;
    const eliminations = Math.min(matchCount, remaining.length - matchCount);
    candidates.push({
      questionType: 'suit',
      value: suit,
      expectedEliminations: eliminations,
    });
  }

  // Color questions
  for (const color of ['red', 'black'] as CardColor[]) {
    const matchCount = remaining.filter((c) => getCardColor(c) === color).length;
    const eliminations = Math.min(matchCount, remaining.length - matchCount);
    candidates.push({
      questionType: 'color',
      value: color,
      expectedEliminations: eliminations,
    });
  }

  // Value comparison questions
  for (const val of VALUES) {
    const gtCount = remaining.filter((c) => c.value > val).length;
    const gtElim = Math.min(gtCount, remaining.length - gtCount);
    candidates.push({
      questionType: 'value_gt',
      value: val,
      expectedEliminations: gtElim,
    });
  }

  // Face card question
  const faceCount = remaining.filter((c) => isFaceCard(c)).length;
  candidates.push({
    questionType: 'is_face',
    expectedEliminations: Math.min(faceCount, remaining.length - faceCount),
  });

  // Pick the question that best splits remaining cards (closest to 50/50)
  candidates.sort((a, b) => b.expectedEliminations - a.expectedEliminations);

  const best = candidates[0];
  return { questionType: best.questionType, value: best.value };
}

/** Bot decides whether to guess or ask */
export function botShouldGuess(botState: PlayerState): boolean {
  const remaining = botState.board.filter(
    (c) => !botState.eliminatedCardIds.has(c.id)
  );
  return remaining.length <= 2;
}

/** Bot picks a card to guess */
export function botPickGuess(botState: PlayerState): string {
  const remaining = botState.board.filter(
    (c) => !botState.eliminatedCardIds.has(c.id)
  );
  if (remaining.length === 0) return botState.board[0].id;
  return remaining[Math.floor(Math.random() * remaining.length)].id;
}

// ============================================================
// PLAYERS
// ============================================================

export function createPlayers(allCards: Card[], isBot: boolean = true): [PlayerState, PlayerState] {
  const shuffled = shuffle(allCards);
  const secret1 = shuffled[0];
  const secret2 = shuffled[1];

  return [
    {
      id: 'player-1',
      name: 'Vous',
      secretCard: secret1,
      eliminatedCardIds: new Set(),
      board: [...allCards],
      isBot: false,
      hasLost: false,
    },
    {
      id: 'player-2',
      name: isBot ? 'Hamza' : 'Joueur 2',
      secretCard: secret2,
      eliminatedCardIds: new Set(),
      board: [...allCards],
      isBot,
      hasLost: false,
    },
  ];
}

// ============================================================
// INITIAL STATE
// ============================================================

export function createInitialState(vsBot: boolean = true): GameState {
  const allCards = createDeck();
  const players = createPlayers(allCards, vsBot);

  return {
    phase: 'asking',
    players,
    currentPlayerIndex: 0,
    questionHistory: [],
    winnerId: null,
    isDraw: false,
    lastQuestion: null,
    allCards,
  };
}

// ============================================================
// REDUCER
// ============================================================

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ASK_QUESTION': {
      if (state.phase !== 'asking') return state;

      const currentPlayer = state.players[state.currentPlayerIndex];
      const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
      const opponent = state.players[opponentIndex];

      // Answer the question using the opponent's secret card
      const answer = answerQuestion(opponent.secretCard, action.questionType, action.value);

      const question: Question = {
        type: action.questionType,
        value: action.value,
        label: getQuestionLabel(action.questionType, action.value),
        answer,
        askerId: currentPlayer.id,
      };

      // Auto-eliminate cards based on the answer
      const cardsToEliminate = getCardsToEliminate(
        currentPlayer.board,
        currentPlayer.eliminatedCardIds,
        action.questionType,
        action.value,
        answer
      );

      const newEliminatedIds = new Set(currentPlayer.eliminatedCardIds);
      for (const id of cardsToEliminate) {
        newEliminatedIds.add(id);
      }

      const newPlayers: [PlayerState, PlayerState] = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        eliminatedCardIds: newEliminatedIds,
      };

      // Switch to next player
      const nextPlayerIndex = opponentIndex;

      return {
        ...state,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        questionHistory: [...state.questionHistory, question],
        lastQuestion: question,
      };
    }

    case 'ELIMINATE_CARDS': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const newEliminatedIds = new Set(currentPlayer.eliminatedCardIds);
      for (const id of action.cardIds) {
        newEliminatedIds.add(id);
      }

      const newPlayers: [PlayerState, PlayerState] = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        eliminatedCardIds: newEliminatedIds,
      };

      return {
        ...state,
        players: newPlayers,
      };
    }

    case 'GUESS_CARD': {
      if (state.phase !== 'asking') return state;

      const currentPlayer = state.players[state.currentPlayerIndex];
      const opponentIndex = state.currentPlayerIndex === 0 ? 1 : 0;
      const opponent = state.players[opponentIndex];

      const isCorrect = opponent.secretCard.id === action.cardId;

      if (isCorrect) {
        return {
          ...state,
          phase: 'gameOver',
          winnerId: currentPlayer.id,
          isDraw: false,
        };
      }

      // Wrong guess: this player loses
      const newPlayers: [PlayerState, PlayerState] = [...state.players];
      newPlayers[state.currentPlayerIndex] = {
        ...currentPlayer,
        hasLost: true,
      };

      // If the other player also already lost, it's a draw
      if (opponent.hasLost) {
        return {
          ...state,
          phase: 'gameOver',
          players: newPlayers,
          winnerId: null,
          isDraw: true,
        };
      }

      // Other player wins (by default, since this player made a wrong guess)
      return {
        ...state,
        phase: 'gameOver',
        players: newPlayers,
        winnerId: opponent.id,
        isDraw: false,
      };
    }

    case 'RESET':
      return createInitialState(state.players[1].isBot);

    default:
      return state;
  }
}

// ============================================================
// HELPERS
// ============================================================

/** Get current player */
export function getCurrentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}

/** Get opponent */
export function getOpponent(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex === 0 ? 1 : 0];
}

/** Check if it's a specific player's turn */
export function isPlayerTurn(state: GameState, playerId: string): boolean {
  return getCurrentPlayer(state).id === playerId;
}

/** Get remaining (non-eliminated) cards for a player */
export function getRemainingCards(playerState: PlayerState): Card[] {
  return playerState.board.filter((c) => !playerState.eliminatedCardIds.has(c.id));
}

/** Get remaining card count for a player */
export function getRemainingCount(playerState: PlayerState): number {
  return getRemainingCards(playerState).length;
}

/** Get all available questions */
export function getAvailableQuestions(): Array<{ type: QuestionType; value?: CardValue | Suit | CardColor; label: string }> {
  const questions: Array<{ type: QuestionType; value?: CardValue | Suit | CardColor; label: string }> = [];

  // Suit questions
  for (const suit of SUITS) {
    questions.push({
      type: 'suit',
      value: suit,
      label: getQuestionLabel('suit', suit),
    });
  }

  // Color questions
  questions.push({ type: 'color', value: 'red', label: getQuestionLabel('color', 'red') });
  questions.push({ type: 'color', value: 'black', label: getQuestionLabel('color', 'black') });

  // Face card question
  questions.push({ type: 'is_face', label: getQuestionLabel('is_face') });

  // Value comparison questions
  for (const val of VALUES) {
    questions.push({
      type: 'value_gt',
      value: val,
      label: getQuestionLabel('value_gt', val),
    });
  }

  return questions;
}

/**
 * Détection de blocage Qui est-ce :
 *  - 'inconsistent' : il ne reste PLUS aucun candidat sur le plateau
 *    (incohérence logique — mensonge adverse ou erreur d'élimination du joueur).
 *  - 'autoGuess' : il reste exactement 1 candidat — la devinette est triviale,
 *    on suggère au joueur de la tenter directement.
 *  - 'none' : la partie progresse normalement.
 */
export type StuckReason = 'inconsistent' | 'autoGuess' | 'none';

export function detectStuck(state: GameState, playerIndex: number): StuckReason {
  if (state.phase !== 'asking') return 'none';
  const me = state.players[playerIndex];
  const remaining = me.board.filter((c) => !me.eliminatedCardIds.has(c.id));
  if (remaining.length === 0) return 'inconsistent';
  if (remaining.length === 1) return 'autoGuess';
  return 'none';
}

/** Helper : retourne la carte unique restante quand reason === 'autoGuess'. */
export function singleCandidate(state: GameState, playerIndex: number): Card | null {
  const me = state.players[playerIndex];
  const remaining = me.board.filter((c) => !me.eliminatedCardIds.has(c.id));
  return remaining.length === 1 ? remaining[0] : null;
}
