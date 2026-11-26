import { validateMultiplayerSeats } from '../../../types/multiplayer';
import type { StandardCard } from '../../../types/playingCard';
import { chooseBotPrediction } from './botStrategy';
import {
  createDeck,
  formatCardLabel,
  formatPredictionLabel,
  shuffleDeck,
} from './deck';
import {
  getInitialRoles,
  rotateCardCollectionTurn,
  rotateFourQuestionsTurn,
} from './turnManager';
import type {
  PublicRedOrBlackPlayer,
  PublicRedOrBlackView,
  QuestionNumber,
  RedOrBlackGameState,
  RedOrBlackMoveResult,
  RedOrBlackPlayer,
  RedOrBlackPrediction,
  RedOrBlackRulesConfig,
  RedOrBlackSetupConfig,
  RedOrBlackStanding,
  RevealOutcome,
} from './types';
import { evaluatePrediction } from './validation';

export const DEFAULT_RED_OR_BLACK_RULES: RedOrBlackRulesConfig = {
  aceRanking: 'ace-low',
  botThinkingDelayMs: 850,
  soundEnabled: true,
  animationsEnabled: true,
};

function fail(state: RedOrBlackGameState, error: string): RedOrBlackMoveResult {
  return { ok: false, error, state };
}

function buildPlayers(config: RedOrBlackSetupConfig): RedOrBlackPlayer[] {
  const validation = validateMultiplayerSeats(config.seats);
  if (!validation.valid) {
    throw new Error(validation.errors[0] ?? 'Invalid Red or Black player setup.');
  }

  return config.seats.map((seat, idx) => ({
    id: seat.id,
    name: seat.name.trim(),
    type: seat.type,
    difficulty: seat.type === 'bot' ? seat.difficulty : undefined,
    turnOrder: idx + 1,
    collectedCards: [],
    cardsCollected: 0,
    attempts: 0,
    correctAnswers: 0,
    completedSequences: 0,
  }));
}

function computeCollectionStandings(
  players: readonly RedOrBlackPlayer[]
): { standings: RedOrBlackStanding[]; winnerIds: string[]; isTie: boolean } {
  const sorted = [...players].sort((a, b) => {
    if (b.cardsCollected !== a.cardsCollected) {
      return b.cardsCollected - a.cardsCollected;
    }
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return a.turnOrder - b.turnOrder;
  });

  const highestCount = sorted[0]?.cardsCollected ?? 0;
  const winnerIds = sorted
    .filter((p) => p.cardsCollected === highestCount)
    .map((p) => p.id);

  let currentRank = 1;
  const standings: RedOrBlackStanding[] = sorted.map((p, idx) => {
    if (idx > 0 && p.cardsCollected < sorted[idx - 1].cardsCollected) {
      currentRank = idx + 1;
    }
    return {
      rank: currentRank,
      playerId: p.id,
      name: p.name,
      type: p.type,
      difficulty: p.difficulty,
      cardsCollected: p.cardsCollected,
      correctAnswers: p.correctAnswers,
      completedSequences: p.completedSequences,
      isWinner: p.cardsCollected === highestCount,
    };
  });

  return {
    standings,
    winnerIds,
    isTie: winnerIds.length > 1,
  };
}

function computeChallengeStandings(
  players: readonly RedOrBlackPlayer[],
  winnerId: string
): RedOrBlackStanding[] {
  const sorted = [...players].sort((a, b) => {
    if (a.id === winnerId) return -1;
    if (b.id === winnerId) return 1;
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return a.turnOrder - b.turnOrder;
  });

  return sorted.map((p, idx) => ({
    rank: idx + 1,
    playerId: p.id,
    name: p.name,
    type: p.type,
    difficulty: p.difficulty,
    cardsCollected: p.cardsCollected,
    correctAnswers: p.correctAnswers,
    completedSequences: p.completedSequences,
    isWinner: p.id === winnerId,
  }));
}

export function createRedOrBlackGame(
  config: RedOrBlackSetupConfig,
  rng: () => number = Math.random
): RedOrBlackGameState {
  const players = buildPlayers(config);
  const drawPile = shuffleDeck(createDeck(), rng);
  const rules: RedOrBlackRulesConfig = {
    ...DEFAULT_RED_OR_BLACK_RULES,
    ...config.rules,
  };

  const { askerIndex, answererIndex } = getInitialRoles(
    config.direction,
    players.length
  );
  const firstAnswerer = players[answererIndex];
  const firstAsker = players[askerIndex];

  const initialPhase =
    firstAnswerer.type === 'bot' ? 'bot-thinking' : 'answering';

  const variantLabel =
    config.variant === 'four-questions'
      ? 'Four Questions Challenge'
      : 'Card Collection House Rule';

  return {
    status: 'PLAYING',
    phase: initialPhase,
    variant: config.variant,
    mode: config.mode,
    direction: config.direction,
    rules,
    drawPile,
    spentCards: [],
    knownRevealedCards: [],
    sequenceCards: [],
    currentQuestion: 1,
    players,
    askerIndex,
    answererIndex,
    lastHumanPlayerId:
      firstAnswerer.type === 'human' ? firstAnswerer.id : null,
    previousHumanName: null,
    pendingRevealAdvance: false,
    awaitingPassConfirmation: false,
    turnNumber: 1,
    lastOutcome: null,
    outcomeHistory: [],
    winnerIds: [],
    isTie: false,
    standings: [],
    lastActionSummary: `${variantLabel} started (${config.direction}). ${firstAsker.name} asks · ${firstAnswerer.name} answers Question 1.`,
  };
}

export function submitPrediction(
  state: RedOrBlackGameState,
  playerId: string,
  prediction: RedOrBlackPrediction,
  rng: () => number = Math.random
): RedOrBlackMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already finished.');
  }
  if (state.awaitingPassConfirmation || state.phase === 'passing-device') {
    return fail(state, 'Confirm Ready on the pass-device screen before answering.');
  }
  if (state.pendingRevealAdvance || state.phase === 'reveal-pause') {
    return fail(state, 'Continue to the next turn before making another prediction.');
  }

  const answerer = state.players[state.answererIndex];
  const asker = state.players[state.askerIndex];

  if (answerer.id !== playerId) {
    return fail(state, `It is ${answerer.name}’s turn to answer.`);
  }

  // Ensure a card is available from drawPile
  let activeDrawPile = [...state.drawPile];
  let activeSpent = [...state.spentCards];
  let activeKnownRevealed = [...state.knownRevealedCards];

  if (activeDrawPile.length === 0) {
    if (state.variant === 'four-questions' && activeSpent.length > 0) {
      activeDrawPile = shuffleDeck(activeSpent, rng);
      activeSpent = [];
      // Reset card-counting knowledge on a full deck reshuffle
      activeKnownRevealed = [...state.sequenceCards];
    } else {
      return fail(state, 'The deck has run out of cards.');
    }
  }

  const revealedCard = activeDrawPile[0];
  const remainingDrawPile = activeDrawPile.slice(1);

  const evaluation = evaluatePrediction(
    prediction,
    revealedCard,
    state.sequenceCards,
    state.rules.aceRanking,
    state.currentQuestion
  );

  if (!evaluation.valid) {
    return fail(state, evaluation.reason);
  }

  const nextKnownRevealed = [...activeKnownRevealed, revealedCard];
  const predictionLabel = formatPredictionLabel(prediction);
  const cardLabel = formatCardLabel(revealedCard);

  if (state.variant === 'four-questions') {
    const nextSequenceCards = [...state.sequenceCards, revealedCard];
    const isFinalQuestion = state.currentQuestion === 4;

    if (evaluation.correct && isFinalQuestion) {
      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.answererIndex
          ? {
              ...p,
              attempts: p.attempts + 1,
              correctAnswers: p.correctAnswers + 1,
              completedSequences: p.completedSequences + 1,
            }
          : p
      );

      const outcome: RevealOutcome = {
        id: `outcome-${state.turnNumber}-${state.outcomeHistory.length + 1}`,
        turnNumber: state.turnNumber,
        questionNumber: state.currentQuestion,
        predictionLabel,
        revealedCard,
        correct: true,
        answererId: answerer.id,
        answererName: answerer.name,
        askerId: asker.id,
        askerName: asker.name,
        awardedToPlayerId: answerer.id,
        awardedToPlayerName: answerer.name,
        summary: `${answerer.name} predicted ${predictionLabel} and revealed ${cardLabel} — completed all four questions!`,
      };

      const standings = computeChallengeStandings(updatedPlayers, answerer.id);

      return {
        ok: true,
        state: {
          ...state,
          status: 'GAME_OVER',
          phase: 'game-over',
          drawPile: remainingDrawPile,
          spentCards: activeSpent,
          knownRevealedCards: nextKnownRevealed,
          sequenceCards: nextSequenceCards,
          players: updatedPlayers,
          pendingRevealAdvance: false,
          lastOutcome: outcome,
          outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
          winnerIds: [answerer.id],
          isTie: false,
          standings,
          lastActionSummary: outcome.summary,
        },
      };
    }

    if (evaluation.correct) {
      const nextQuestion = (state.currentQuestion + 1) as QuestionNumber;
      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.answererIndex
          ? {
              ...p,
              attempts: p.attempts + 1,
              correctAnswers: p.correctAnswers + 1,
            }
          : p
      );

      const outcome: RevealOutcome = {
        id: `outcome-${state.turnNumber}-${state.outcomeHistory.length + 1}`,
        turnNumber: state.turnNumber,
        questionNumber: state.currentQuestion,
        predictionLabel,
        revealedCard,
        correct: true,
        answererId: answerer.id,
        answererName: answerer.name,
        askerId: asker.id,
        askerName: asker.name,
        awardedToPlayerId: null,
        awardedToPlayerName: null,
        summary: `${answerer.name} answered ${predictionLabel} on Q${state.currentQuestion} (${cardLabel}) — Correct! Moving to Question ${nextQuestion}.`,
      };

      return {
        ok: true,
        state: {
          ...state,
          phase: answerer.type === 'bot' ? 'bot-thinking' : 'answering',
          drawPile: remainingDrawPile,
          spentCards: activeSpent,
          knownRevealedCards: nextKnownRevealed,
          sequenceCards: nextSequenceCards,
          currentQuestion: nextQuestion,
          players: updatedPlayers,
          pendingRevealAdvance: false,
          lastOutcome: outcome,
          outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
          lastActionSummary: outcome.summary,
        },
      };
    }

    // Incorrect in Four Questions Challenge -> pause on reveal so players see the card, then rotate
    const updatedPlayers = state.players.map((p, idx) =>
      idx === state.answererIndex
        ? {
            ...p,
            attempts: p.attempts + 1,
          }
        : p
    );

    const outcome: RevealOutcome = {
      id: `outcome-${state.turnNumber}-${state.outcomeHistory.length + 1}`,
      turnNumber: state.turnNumber,
      questionNumber: state.currentQuestion,
      predictionLabel,
      revealedCard,
      correct: false,
      answererId: answerer.id,
      answererName: answerer.name,
      askerId: asker.id,
      askerName: asker.name,
      awardedToPlayerId: null,
      awardedToPlayerName: null,
      summary: `${answerer.name} guessed ${predictionLabel} on Q${state.currentQuestion}, revealed ${cardLabel} — Missed! ${evaluation.reason}`,
    };

    return {
      ok: true,
      state: {
        ...state,
        phase: 'reveal-pause',
        drawPile: remainingDrawPile,
        spentCards: activeSpent,
        knownRevealedCards: nextKnownRevealed,
        sequenceCards: nextSequenceCards,
        players: updatedPlayers,
        pendingRevealAdvance: true,
        lastOutcome: outcome,
        outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
        lastActionSummary: outcome.summary,
      },
    };
  }

  // Variant 2: Card Collection House Rule
  const awardedIndex = evaluation.correct
    ? state.answererIndex
    : state.askerIndex;
  const awardedPlayer = state.players[awardedIndex];

  const updatedPlayers = state.players.map((p, idx) => {
    const isAnswerer = idx === state.answererIndex;
    const isAwarded = idx === awardedIndex;
    return {
      ...p,
      attempts: isAnswerer ? p.attempts + 1 : p.attempts,
      correctAnswers:
        isAnswerer && evaluation.correct ? p.correctAnswers + 1 : p.correctAnswers,
      collectedCards: isAwarded
        ? [...p.collectedCards, revealedCard]
        : p.collectedCards,
      cardsCollected: isAwarded ? p.cardsCollected + 1 : p.cardsCollected,
    };
  });

  const outcome: RevealOutcome = {
    id: `outcome-${state.turnNumber}-${state.outcomeHistory.length + 1}`,
    turnNumber: state.turnNumber,
    questionNumber: 1,
    predictionLabel,
    revealedCard,
    correct: evaluation.correct,
    answererId: answerer.id,
    answererName: answerer.name,
    askerId: asker.id,
    askerName: asker.name,
    awardedToPlayerId: awardedPlayer.id,
    awardedToPlayerName: awardedPlayer.name,
    summary: evaluation.correct
      ? `${answerer.name} guessed ${predictionLabel} (${cardLabel}) — Correct! ${answerer.name} collects ${cardLabel} and restarts at Question 1.`
      : `${answerer.name} guessed ${predictionLabel} (${cardLabel}) — Incorrect! ${asker.name} collects ${cardLabel} and the deck passes.`,
  };

  // Deck exhausted -> immediate game over
  if (remainingDrawPile.length === 0) {
    const { standings, winnerIds, isTie } =
      computeCollectionStandings(updatedPlayers);
    const winnerText = isTie
      ? `Tie between ${standings
          .filter((s) => s.isWinner)
          .map((s) => s.name)
          .join(' & ')}`
      : `${standings[0].name} wins`;

    return {
      ok: true,
      state: {
        ...state,
        status: 'GAME_OVER',
        phase: 'game-over',
        drawPile: remainingDrawPile,
        spentCards: activeSpent,
        knownRevealedCards: nextKnownRevealed,
        sequenceCards: [revealedCard],
        currentQuestion: 1,
        players: updatedPlayers,
        pendingRevealAdvance: false,
        lastOutcome: outcome,
        outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
        winnerIds,
        isTie,
        standings,
        lastActionSummary: `${outcome.summary} Deck exhausted — ${winnerText}!`,
      },
    };
  }

  // Correct answer in Card Collection -> same answerer keeps answering at Q1
  if (evaluation.correct) {
    return {
      ok: true,
      state: {
        ...state,
        phase: answerer.type === 'bot' ? 'bot-thinking' : 'answering',
        drawPile: remainingDrawPile,
        spentCards: activeSpent,
        knownRevealedCards: nextKnownRevealed,
        sequenceCards: [revealedCard],
        currentQuestion: 1,
        players: updatedPlayers,
        pendingRevealAdvance: false,
        lastOutcome: outcome,
        outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
        lastActionSummary: outcome.summary,
      },
    };
  }

  // Incorrect answer in Card Collection -> reveal pause before passing the deck
  return {
    ok: true,
    state: {
      ...state,
      phase: 'reveal-pause',
      drawPile: remainingDrawPile,
      spentCards: activeSpent,
      knownRevealedCards: nextKnownRevealed,
      sequenceCards: [revealedCard],
      currentQuestion: 1,
      players: updatedPlayers,
      pendingRevealAdvance: true,
      lastOutcome: outcome,
      outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 24),
      lastActionSummary: outcome.summary,
    },
  };
}

export function advanceAfterReveal(
  state: RedOrBlackGameState
): RedOrBlackMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already finished.');
  }
  if (!state.pendingRevealAdvance) {
    return fail(state, 'No reveal transition is currently pending.');
  }

  const nextRoles =
    state.variant === 'four-questions'
      ? rotateFourQuestionsTurn(
          state.answererIndex,
          state.direction,
          state.players.length
        )
      : rotateCardCollectionTurn(
          state.askerIndex,
          state.direction,
          state.players.length
        );

  const nextAnswerer = state.players[nextRoles.answererIndex];
  const nextAsker = state.players[nextRoles.askerIndex];
  const spentAddition =
    state.variant === 'four-questions' ? state.sequenceCards : [];

  const humanCount = state.players.filter((p) => p.type === 'human').length;
  const previousHuman = state.players.find(
    (p) => p.id === state.lastHumanPlayerId
  );

  // Trigger Pass-and-Play privacy handover only when moving to a human player
  // in a multi-human game and the device needs to pass to a different human.
  const needsPassScreen =
    humanCount >= 2 &&
    nextAnswerer.type === 'human' &&
    state.lastHumanPlayerId !== nextAnswerer.id;

  const nextPhase = needsPassScreen
    ? 'passing-device'
    : nextAnswerer.type === 'bot'
      ? 'bot-thinking'
      : 'answering';

  return {
    ok: true,
    state: {
      ...state,
      phase: nextPhase,
      spentCards: [...state.spentCards, ...spentAddition],
      sequenceCards: [],
      currentQuestion: 1,
      askerIndex: nextRoles.askerIndex,
      answererIndex: nextRoles.answererIndex,
      previousHumanName: previousHuman?.name ?? null,
      lastHumanPlayerId:
        nextAnswerer.type === 'human' && !needsPassScreen
          ? nextAnswerer.id
          : state.lastHumanPlayerId,
      pendingRevealAdvance: false,
      awaitingPassConfirmation: needsPassScreen,
      turnNumber: state.turnNumber + 1,
      lastActionSummary: `${nextAsker.name} now asks · ${nextAnswerer.name} answers Question 1.`,
    },
  };
}

export function confirmPassDevice(
  state: RedOrBlackGameState
): RedOrBlackMoveResult {
  if (state.status !== 'PLAYING' || !state.awaitingPassConfirmation) {
    return fail(state, 'No device handover is waiting for confirmation.');
  }

  const answerer = state.players[state.answererIndex];
  return {
    ok: true,
    state: {
      ...state,
      phase: answerer.type === 'bot' ? 'bot-thinking' : 'answering',
      awaitingPassConfirmation: false,
      lastHumanPlayerId:
        answerer.type === 'human' ? answerer.id : state.lastHumanPlayerId,
    },
  };
}

export function executeBotTurnStep(
  state: RedOrBlackGameState,
  rng: () => number = Math.random
): RedOrBlackMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already finished.');
  }
  if (state.awaitingPassConfirmation || state.phase === 'passing-device') {
    return fail(state, 'Waiting for human Pass-and-Play confirmation.');
  }
  if (state.pendingRevealAdvance) {
    return advanceAfterReveal(state);
  }

  const answerer = state.players[state.answererIndex];
  if (answerer.type !== 'bot') {
    return fail(state, 'It is currently a human player’s turn.');
  }

  const prediction = chooseBotPrediction(
    {
      currentQuestion: state.currentQuestion,
      sequenceCards: state.sequenceCards,
      knownRevealedCards: state.knownRevealedCards,
      aceRanking: state.rules.aceRanking,
      difficulty: answerer.difficulty ?? 'normal',
    },
    rng
  );

  return submitPrediction(state, answerer.id, prediction, rng);
}

export function getPublicRedOrBlackView(
  state: RedOrBlackGameState
): PublicRedOrBlackView {
  const hideBoardForPrivacy =
    state.status === 'PLAYING' && state.awaitingPassConfirmation;

  const publicPlayers: PublicRedOrBlackPlayer[] = state.players.map(
    (p, idx) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      difficulty: p.difficulty,
      turnOrder: p.turnOrder,
      cardsCollected: p.cardsCollected,
      attempts: p.attempts,
      correctAnswers: p.correctAnswers,
      completedSequences: p.completedSequences,
      isAsker: idx === state.askerIndex,
      isAnswerer: idx === state.answererIndex,
    })
  );

  return {
    status: state.status,
    phase: state.phase,
    variant: state.variant,
    mode: state.mode,
    direction: state.direction,
    rules: state.rules,
    drawPileCount: state.drawPile.length,
    knownRevealedCount: state.knownRevealedCards.length,
    knownRevealedCards: hideBoardForPrivacy ? [] : [...state.knownRevealedCards],
    sequenceCards: hideBoardForPrivacy ? [] : [...state.sequenceCards],
    currentQuestion: state.currentQuestion,
    players: publicPlayers,
    asker: publicPlayers[state.askerIndex],
    answerer: publicPlayers[state.answererIndex],
    previousHumanName: state.previousHumanName,
    pendingRevealAdvance: state.pendingRevealAdvance,
    awaitingPassConfirmation: state.awaitingPassConfirmation,
    hideBoardForPrivacy,
    turnNumber: state.turnNumber,
    lastOutcome: hideBoardForPrivacy ? null : state.lastOutcome,
    outcomeHistory: hideBoardForPrivacy ? [] : [...state.outcomeHistory],
    winnerIds: [...state.winnerIds],
    isTie: state.isTie,
    standings: [...state.standings],
    lastActionSummary: hideBoardForPrivacy
      ? `Waiting for ${publicPlayers[state.answererIndex].name} to confirm Ready.`
      : state.lastActionSummary,
  };
}
