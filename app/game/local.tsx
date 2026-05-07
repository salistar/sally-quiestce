/**
 * @file game/local.tsx
 * @description Qui Est-Ce (Guess Who?) local game screen.
 * Grid of all 40 cards, tap to eliminate, question buttons at bottom.
 * Dark gradient bg with quiestce teal (#0D9488).
 */

import React, { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  GameState,
  gameReducer,
  createInitialState,
  getCurrentPlayer,
  getOpponent,
  isPlayerTurn,
  getRemainingCount,
  getAvailableQuestions,
  botChooseQuestion,
  botShouldGuess,
  botPickGuess,
  getCardsToEliminate,
  QuestionType,
  CardValue,
  Suit,
  CardColor,
  SUITS,
  VALUES,
  SUIT_NAMES,
  VALUE_NAMES,
  formatCard,
  detectStuck,
  singleCandidate,
} from '../../src/game/quiestceEngine';
import { useTranslation } from 'react-i18next';
import { getCardImage, getCardBackImage } from '../../src/game/cardAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLS = 8;
const CARD_GAP = 4;
const GRID_PAD = 8;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PAD * 2 - CARD_GAP * (GRID_COLS - 1)) / GRID_COLS;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

const BOT_DELAY = 1200;

export default function QuiEstCeLocalGame() {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, createInitialState(true));
  const [showQuestions, setShowQuestions] = useState(false);
  const [showGuessConfirm, setShowGuessConfirm] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<{ label: string; answer: boolean } | null>(null);
  const [stuckReason, setStuckReason] = useState<'inconsistent' | 'autoGuess' | null>(null);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation('game');

  const currentPlayer = getCurrentPlayer(state);
  const humanPlayer = state.players[0];
  const opponent = state.players[1];
  const isHumanTurn = isPlayerTurn(state, 'player-1');
  const humanRemaining = getRemainingCount(humanPlayer);
  const opponentRemaining = getRemainingCount(opponent);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // Détection blocage : 0 candidat (incohérence) ou 1 candidat (auto-deviner)
  useEffect(() => {
    if (stuckReason) return;
    const reason = detectStuck(state, 0);
    if (reason !== 'none') setStuckReason(reason);
  }, [state, stuckReason]);

  // Bot turn
  useEffect(() => {
    if (state.phase !== 'asking') return;
    if (isHumanTurn) return;

    botTimerRef.current = setTimeout(() => {
      // Bot decides: guess or ask
      if (botShouldGuess(opponent)) {
        const guessId = botPickGuess(opponent);
        dispatch({ type: 'GUESS_CARD', cardId: guessId });
      } else {
        const { questionType, value } = botChooseQuestion(opponent, humanPlayer);
        dispatch({ type: 'ASK_QUESTION', questionType, value });
      }
    }, BOT_DELAY);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state.phase, state.currentPlayerIndex, isHumanTurn, opponent, humanPlayer]);

  // Show answer notification
  useEffect(() => {
    if (state.lastQuestion) {
      setLastAnswer({
        label: state.lastQuestion.label,
        answer: state.lastQuestion.answer,
      });
      const timer = setTimeout(() => setLastAnswer(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [state.lastQuestion]);

  // Handle tapping a card to eliminate
  const handleCardTap = useCallback(
    (cardId: string) => {
      if (state.phase !== 'asking') return;
      if (!isHumanTurn) return;

      if (humanPlayer.eliminatedCardIds.has(cardId)) return;

      // Tap to eliminate
      dispatch({ type: 'ELIMINATE_CARDS', cardIds: [cardId] });
    },
    [state.phase, isHumanTurn, humanPlayer.eliminatedCardIds]
  );

  // Handle long press to guess
  const handleCardLongPress = useCallback(
    (cardId: string) => {
      if (state.phase !== 'asking') return;
      if (!isHumanTurn) return;
      if (humanPlayer.eliminatedCardIds.has(cardId)) return;

      setShowGuessConfirm(cardId);
    },
    [state.phase, isHumanTurn, humanPlayer.eliminatedCardIds]
  );

  // Confirm guess
  const handleConfirmGuess = useCallback(() => {
    if (!showGuessConfirm) return;
    dispatch({ type: 'GUESS_CARD', cardId: showGuessConfirm });
    setShowGuessConfirm(null);
  }, [showGuessConfirm]);

  // Ask a question
  const handleAskQuestion = useCallback(
    (questionType: QuestionType, value?: CardValue | Suit | CardColor) => {
      if (state.phase !== 'asking') return;
      if (!isHumanTurn) return;

      dispatch({ type: 'ASK_QUESTION', questionType, value });
      setShowQuestions(false);
    },
    [state.phase, isHumanTurn]
  );

  // Restart
  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESET' });
    setShowQuestions(false);
    setShowGuessConfirm(null);
    setLastAnswer(null);
  }, []);

  // Available questions
  const questions = getAvailableQuestions();

  return (
    <LinearGradient colors={['#061a18', '#0D9488', '#065f56']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('quiestce.title')}</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Info bar — joueur humain EN PREMIER (gauche), adversaire à droite */}
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('quiestce.you')}</Text>
            <Text style={styles.infoValue}>{humanRemaining} {t('quiestce.cards')}</Text>
          </View>
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              {state.phase === 'gameOver'
                ? t('quiestce.gameEnd')
                : isHumanTurn
                  ? t('quiestce.yourTurn')
                  : t('quiestce.thinking', { name: opponent.name })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{opponent.name}</Text>
            <Text style={styles.infoValue}>{opponentRemaining} {t('quiestce.cards')}</Text>
          </View>
        </View>

        {/* Answer notification */}
        {lastAnswer && (
          <View
            style={[
              styles.answerBanner,
              lastAnswer.answer ? styles.answerYes : styles.answerNo,
            ]}
          >
            <Text style={styles.answerText}>
              {lastAnswer.label} {lastAnswer.answer ? 'OUI' : 'NON'}
            </Text>
          </View>
        )}

        {/* Card grid */}
        <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
          <View style={styles.grid}>
            {state.allCards.map((card) => {
              const isEliminated = humanPlayer.eliminatedCardIds.has(card.id);
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => handleCardTap(card.id)}
                  onLongPress={() => handleCardLongPress(card.id)}
                  activeOpacity={isEliminated ? 1 : 0.7}
                  style={[styles.cardTouchable, isEliminated && styles.cardEliminated]}
                >
                  <Image
                    source={getCardImage(card.id)}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  {isEliminated && <View style={styles.eliminatedOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom bar */}
        {state.phase === 'asking' && isHumanTurn && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={() => setShowQuestions(true)}
              style={styles.askButton}
            >
              <Ionicons name="help-circle" size={20} color="#fff" />
              <Text style={styles.askButtonText}>Poser une question</Text>
            </TouchableOpacity>
            <Text style={styles.hintText}>
              Appuyez sur une carte pour l'eliminer. Maintenez pour deviner.
            </Text>
          </View>
        )}

        {/* Question modal */}
        <Modal visible={showQuestions} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Poser une question</Text>
                <TouchableOpacity onPress={() => setShowQuestions(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.questionList}>
                {/* Suit questions */}
                <Text style={styles.questionCategory}>Couleur (Suite)</Text>
                {SUITS.map((suit) => (
                  <TouchableOpacity
                    key={suit}
                    style={styles.questionBtn}
                    onPress={() => handleAskQuestion('suit', suit)}
                  >
                    <Text style={styles.questionBtnText}>
                      Est-ce {SUIT_NAMES[suit]} ?
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Color questions */}
                <Text style={styles.questionCategory}>Couleur</Text>
                <TouchableOpacity
                  style={styles.questionBtn}
                  onPress={() => handleAskQuestion('color', 'red')}
                >
                  <Text style={styles.questionBtnText}>Est-ce rouge (Coupes/Deniers) ?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.questionBtn}
                  onPress={() => handleAskQuestion('color', 'black')}
                >
                  <Text style={styles.questionBtnText}>Est-ce noir (Batons/Epees) ?</Text>
                </TouchableOpacity>

                {/* Face card question */}
                <Text style={styles.questionCategory}>Type</Text>
                <TouchableOpacity
                  style={styles.questionBtn}
                  onPress={() => handleAskQuestion('is_face')}
                >
                  <Text style={styles.questionBtnText}>Est-ce une figure (10-12) ?</Text>
                </TouchableOpacity>

                {/* Value questions */}
                <Text style={styles.questionCategory}>Valeur</Text>
                {VALUES.map((val) => (
                  <TouchableOpacity
                    key={`gt-${val}`}
                    style={styles.questionBtn}
                    onPress={() => handleAskQuestion('value_gt', val)}
                  >
                    <Text style={styles.questionBtnText}>La valeur est {'>'} {val} ?</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Guess confirmation modal */}
        <Modal visible={!!showGuessConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.guessModal}>
              <Text style={styles.guessTitle}>Deviner cette carte ?</Text>
              {showGuessConfirm && (
                <Image
                  source={getCardImage(showGuessConfirm)}
                  style={styles.guessCardImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.guessWarning}>
                Attention : une mauvaise reponse = vous perdez !
              </Text>
              <View style={styles.guessButtons}>
                <TouchableOpacity
                  onPress={() => setShowGuessConfirm(null)}
                  style={styles.guessCancelBtn}
                >
                  <Text style={styles.guessCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmGuess}
                  style={styles.guessConfirmBtn}
                >
                  <Text style={styles.guessConfirmText}>Deviner !</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Game over overlay */}
        {state.phase === 'gameOver' && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>
                {state.isDraw
                  ? 'Match Nul !'
                  : state.winnerId === 'player-1'
                    ? 'Victoire !'
                    : 'Defaite...'}
              </Text>
              <Text style={styles.gameOverSubtitle}>
                La carte secrete de {opponent.name} etait :
              </Text>
              <Image
                source={getCardImage(opponent.secretCard.id)}
                style={styles.revealCard}
                resizeMode="contain"
              />
              <Text style={styles.revealName}>{formatCard(opponent.secretCard)}</Text>
              <Text style={styles.gameOverSubtitle}>Votre carte secrete :</Text>
              <Image
                source={getCardImage(humanPlayer.secretCard.id)}
                style={styles.revealCard}
                resizeMode="contain"
              />
              <Text style={styles.revealName}>{formatCard(humanPlayer.secretCard)}</Text>
              <TouchableOpacity onPress={handleRestart} style={styles.playAgainButton}>
                <Text style={styles.playAgainText}>{t('quiestce.playAgain')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} style={styles.quitButton}>
                <Text style={styles.quitButtonText}>{t('quiestce.quit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Modal de blocage : 0 candidat (incohérence) OU 1 candidat (auto-deviner) */}
        <Modal visible={!!stuckReason} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient
              colors={stuckReason === 'inconsistent' ? ['#7F1D1D', '#1F1216'] : ['#065F46', '#0B1F18']}
              style={{ padding: 28, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: stuckReason === 'inconsistent' ? '#EF4444' : '#10B981', minWidth: 280, maxWidth: 360 }}
            >
              <Text style={{ fontSize: 56 }}>{stuckReason === 'inconsistent' ? '🤔' : '🎯'}</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 8, textAlign: 'center' }}>
                {t(`stuck.${stuckReason}.title`)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                {t(`stuck.${stuckReason}.body`)}
              </Text>
              {stuckReason === 'autoGuess' && (() => {
                const card = singleCandidate(state, 0);
                return card ? (
                  <Text style={{ color: '#FCD34D', fontSize: 16, fontWeight: '900', marginTop: 12 }}>
                    👉 {formatCard(card)}
                  </Text>
                ) : null;
              })()}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => { setStuckReason(null); dispatch({ type: 'RESET' }); }}
                  style={{ backgroundColor: stuckReason === 'inconsistent' ? '#EF4444' : '#10B981', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>🔄 {t(`stuck.${stuckReason}.again`)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStuckReason(null)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{t(`stuck.${stuckReason}.continue`)}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  restartButton: {
    padding: 8,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#99f6e4',
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  turnIndicator: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  turnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  answerBanner: {
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
  answerYes: {
    backgroundColor: 'rgba(34,197,94,0.3)',
  },
  answerNo: {
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
  answerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: GRID_PAD,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  cardTouchable: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardEliminated: {
    opacity: 0.25,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  eliminatedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  askButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2e2b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  questionList: {
    paddingHorizontal: 20,
  },
  questionCategory: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  questionBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
  },
  questionBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  guessModal: {
    backgroundColor: '#1a2e2b',
    borderRadius: 20,
    padding: 24,
    margin: 30,
    alignItems: 'center',
    alignSelf: 'center',
    width: '85%',
  },
  guessTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  guessCardImage: {
    width: 100,
    height: 145,
    borderRadius: 8,
    marginBottom: 12,
  },
  guessWarning: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  guessButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  guessCancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  guessCancelText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  guessConfirmBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  guessConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  gameOverCard: {
    backgroundColor: '#1a2e2b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '85%',
  },
  gameOverTitle: {
    color: '#0D9488',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  gameOverSubtitle: {
    color: '#99f6e4',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 8,
  },
  revealCard: {
    width: 80,
    height: 116,
    borderRadius: 6,
  },
  revealName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  playAgainButton: {
    backgroundColor: '#0D9488',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 20,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  quitButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  quitButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
});
