import type { StandardCard } from '../../../types/playingCard';
import { selectRandomCardForBot } from './botStrategy';
import { createCircle, getAvailableCircleSlots } from './circle';
import { createDeck, formatCardLabel, shuffleDeck } from './deck';
import { evaluatePorridgeRule } from './rules';
import { calculateWinner } from './scoring';
import type {
  CircleCardSlot,
  CollectionEvent,
  PorridgeGameState,
  PorridgeMoveResult,
  PorridgePlayer,
  PorridgeRulesConfig,
  PorridgeSetupConfig,
  PublicCircleSlot,
  PublicPorridgePlayer,
  PublicPorridgeView,
} from './types';

export const DEFAULT_PORRIDGE_RULES: PorridgeRulesConfig = {
  aceRanking: 'ace-high',
  highestColourReference: 'first-in-pile',
};

function fail(state: PorridgeGameState, error: string): PorridgeMoveResult {
  return { ok: false, error, state };
}

function buildPlayers(config: PorridgeSetupConfig): PorridgePlayer[] {
  if (config.seats.length < 2 || config.seats.length > 4) {
    throw new Error('Porridge supports between 2 and 4 players.');
  }

  let humanNumber = 0;
  let botNumber = 0;

  return config.seats.map((seat, idx) => {
    if (seat.type === 'human') {
      humanNumber += 1;
    } else {
      botNumber += 1;
    }

    const fallbackName =
      seat.type === 'bot' ? `Bot ${botNumber}` : `Player ${humanNumber}`;
    const trimmed = seat.name.trim();

    return {
      id: `player-${idx + 1}`,
      name: trimmed.length > 0 ? trimmed : fallbackName,
      type: seat.type,
      turnOrder: idx + 1,
      collectedCards: [],
      cardsCollected: 0,
    };
  });
}

export function createPorridgeGame(
  config: PorridgeSetupConfig,
  rng: () => number = Math.random
): PorridgeGameState {
  const players = buildPlayers(config);
  const shuffledDeck = shuffleDeck(createDeck(), rng);
  const circle = createCircle(shuffledDeck);
  const rules: PorridgeRulesConfig = {
    ...DEFAULT_PORRIDGE_RULES,
    ...config.rules,
  };

  const firstPlayer = players[0];
  const initialPhase =
    firstPlayer.type === 'bot' ? 'bot-thinking' : 'selecting-card';

  const variationLabel =
    config.variation === 'same-suit' ? 'Same-Suit Porridge' : 'Highest-Colour Porridge';

  return {
    status: 'PLAYING',
    phase: initialPhase,
    mode: config.mode,
    variation: config.variation,
    direction: config.direction,
    rules,
    circle,
    centralPile: [],
    players,
    currentPlayerIndex: 0,
    previousPlayerName: null,
    selectedPositionId: null,
    pendingTurnAdvance: false,
    awaitingPassConfirmation: false,
    turnNumber: 1,
    lastRevealResult: null,
    collectionHistory: [],
    winnerIds: [],
    isTie: false,
    standings: [],
    lastActionSummary: `${variationLabel} started (${config.direction}). ${firstPlayer.name} goes first.`,
  };
}

export function selectCard(
  state: PorridgeGameState,
  positionId: string,
  playerId: string
): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  if (state.awaitingPassConfirmation || state.phase === 'passing-device') {
    return fail(state, 'Tap Ready on the pass-device screen before selecting a card.');
  }
  if (state.pendingTurnAdvance) {
    return fail(state, 'Wait for the current card reveal to finish.');
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'human') {
    return fail(state, 'You cannot select a card during a bot turn.');
  }
  if (currentPlayer.id !== playerId) {
    return fail(state, `It is currently ${currentPlayer.name}’s turn.`);
  }
  if (state.phase !== 'selecting-card' && state.phase !== 'confirming-selection') {
    return fail(state, 'Card selection is not active right now.');
  }

  const targetSlot = state.circle.find((slot) => slot.positionId === positionId);
  if (!targetSlot) {
    return fail(state, 'Selected card position was not found.');
  }
  if (targetSlot.status === 'removed') {
    return fail(state, 'That card has already been removed from the circle.');
  }
  if (targetSlot.status === 'selected' && state.selectedPositionId === positionId) {
    return { ok: true, state };
  }

  const nextCircle: CircleCardSlot[] = state.circle.map((slot) => {
    if (slot.positionId === positionId) {
      return { ...slot, status: 'selected' };
    }
    if (slot.status === 'selected') {
      return { ...slot, status: 'face-down' };
    }
    return slot;
  });

  return {
    ok: true,
    state: {
      ...state,
      phase: 'confirming-selection',
      circle: nextCircle,
      selectedPositionId: positionId,
      lastActionSummary: `${currentPlayer.name} selected circle position #${targetSlot.positionIndex + 1}. Confirm to reveal.`,
    },
  };
}

export function cancelSelection(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  if (state.phase !== 'confirming-selection' || !state.selectedPositionId) {
    return fail(state, 'No pending card selection to cancel.');
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'human') {
    return fail(state, 'Cannot cancel a bot selection.');
  }

  const nextCircle: CircleCardSlot[] = state.circle.map((slot) =>
    slot.status === 'selected' ? { ...slot, status: 'face-down' } : slot
  );

  return {
    ok: true,
    state: {
      ...state,
      phase: 'selecting-card',
      circle: nextCircle,
      selectedPositionId: null,
      lastActionSummary: `${currentPlayer.name} cancelled their selection. Choose another face-down card.`,
    },
  };
}

export function collectCentralPile(
  players: readonly PorridgePlayer[],
  centralPile: readonly StandardCard[],
  playerId: string,
  turnNumber: number,
  triggerCard: StandardCard,
  reason: string
): {
  players: PorridgePlayer[];
  centralPile: StandardCard[];
  event: CollectionEvent;
} {
  const collectedCount = centralPile.length;
  const target = players.find((p) => p.id === playerId);
  if (!target) {
    throw new Error(`Player ${playerId} not found while collecting central pile.`);
  }

  const nextPlayers = players.map((player) => {
    if (player.id !== playerId) return player;
    const nextCollected = [...player.collectedCards, ...centralPile];
    return {
      ...player,
      collectedCards: nextCollected,
      cardsCollected: nextCollected.length,
    };
  });

  const event: CollectionEvent = {
    id: `collect-${turnNumber}-${playerId}`,
    turnNumber,
    playerId,
    playerName: target.name,
    collectedCount,
    triggerCard,
    reason,
  };

  return {
    players: nextPlayers,
    centralPile: [],
    event,
  };
}

function resolveSelectedSlot(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  if (!state.selectedPositionId) {
    return fail(state, 'Select a card before confirming.');
  }

  const selectedSlot = state.circle.find(
    (slot) => slot.positionId === state.selectedPositionId
  );
  if (!selectedSlot || selectedSlot.status !== 'selected') {
    return fail(state, 'Selected card position is no longer available.');
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const revealedCard = selectedSlot.card;

  const nextCircle: CircleCardSlot[] = state.circle.map((slot) =>
    slot.positionId === selectedSlot.positionId
      ? { ...slot, status: 'removed' }
      : slot
  );

  const ruleResult = evaluatePorridgeRule(
    state.variation,
    revealedCard,
    state.centralPile,
    state.rules
  );

  const pileWithNewCard = [...state.centralPile, revealedCard];
  let nextPlayers = state.players;
  let nextPile = pileWithNewCard;
  let nextCollectionHistory = state.collectionHistory;
  let collectedCount = 0;

  if (ruleResult.shouldCollect) {
    const collected = collectCentralPile(
      state.players,
      pileWithNewCard,
      currentPlayer.id,
      state.turnNumber,
      revealedCard,
      ruleResult.reason
    );
    nextPlayers = collected.players;
    nextPile = collected.centralPile;
    nextCollectionHistory = [collected.event, ...state.collectionHistory];
    collectedCount = collected.event.collectedCount;
  }

  const lastRevealResult = {
    turnNumber: state.turnNumber,
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    playerType: currentPlayer.type,
    positionId: selectedSlot.positionId,
    card: revealedCard,
    collected: ruleResult.shouldCollect,
    collectedCount,
    reason: ruleResult.reason,
    pileCountAfter: nextPile.length,
  };

  const summary = ruleResult.shouldCollect
    ? `${currentPlayer.name} revealed ${formatCardLabel(revealedCard)} and collected ${collectedCount} ${
        collectedCount === 1 ? 'card' : 'cards'
      }!`
    : `${currentPlayer.name} revealed ${formatCardLabel(revealedCard)}. ${ruleResult.reason}`;

  const remainingSlots = getAvailableCircleSlots(nextCircle);
  if (remainingSlots.length === 0) {
    const result = calculateWinner(nextPlayers);
    const winnerNames = result.winners.map((w) => w.name).join(' & ');
    const winSummary = result.isTie
      ? `All 52 cards played! Tied winners: ${winnerNames} (${result.lowestCount} cards).`
      : `All 52 cards played! ${winnerNames} wins with ${result.lowestCount} ${
          result.lowestCount === 1 ? 'card' : 'cards'
        }!`;

    return {
      ok: true,
      state: {
        ...state,
        status: 'GAME_OVER',
        phase: 'game-completed',
        circle: nextCircle,
        centralPile: nextPile,
        players: nextPlayers,
        selectedPositionId: null,
        pendingTurnAdvance: false,
        awaitingPassConfirmation: false,
        lastRevealResult,
        collectionHistory: nextCollectionHistory,
        winnerIds: result.winnerIds,
        isTie: result.isTie,
        standings: result.standings,
        lastActionSummary: `${summary} ${winSummary}`,
      },
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      phase: ruleResult.shouldCollect ? 'collecting-pile' : 'revealing-card',
      circle: nextCircle,
      centralPile: nextPile,
      players: nextPlayers,
      selectedPositionId: null,
      pendingTurnAdvance: true,
      lastRevealResult,
      collectionHistory: nextCollectionHistory,
      lastActionSummary: summary,
    },
  };
}

export function confirmSelection(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'human') {
    return fail(state, 'Only human turns require manual confirmation.');
  }
  if (state.phase !== 'confirming-selection') {
    return fail(state, 'No card selection is awaiting confirmation.');
  }

  return resolveSelectedSlot(state);
}

/**
 * Step 1 of a bot turn: selects a random remaining face-down position and highlights it.
 */
export function chooseBotCardPosition(
  state: PorridgeGameState,
  rng: () => number = Math.random
): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  if (state.awaitingPassConfirmation) {
    return fail(state, 'Cannot take a bot turn while awaiting device handover.');
  }
  if (state.pendingTurnAdvance) {
    return fail(state, 'Turn transition is pending.');
  }
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'bot') {
    return fail(state, 'Bots cannot act during a human turn.');
  }
  if (state.phase !== 'bot-thinking') {
    return fail(state, 'Bot selection is not active.');
  }

  const chosen = selectRandomCardForBot(state, rng);
  if (!chosen) {
    return fail(state, 'No face-down cards remain in the circle.');
  }

  const nextCircle: CircleCardSlot[] = state.circle.map((slot) => {
    if (slot.positionId === chosen.positionId) {
      return { ...slot, status: 'selected' };
    }
    if (slot.status === 'selected') {
      return { ...slot, status: 'face-down' };
    }
    return slot;
  });

  return {
    ok: true,
    state: {
      ...state,
      circle: nextCircle,
      selectedPositionId: chosen.positionId,
      lastActionSummary: `${currentPlayer.name} is reaching for circle position #${chosen.positionIndex + 1}…`,
    },
  };
}

/**
 * Step 2 of a bot turn: reveals the highlighted position and applies the exact same rule pipeline.
 */
export function confirmBotSelection(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'bot') {
    return fail(state, 'Only bot turns can use bot confirmation.');
  }
  if (state.phase !== 'bot-thinking' || !state.selectedPositionId) {
    return fail(state, 'Bot has not chosen a circle position yet.');
  }

  return resolveSelectedSlot(state);
}

/**
 * Convenience atomic bot execution for deterministic engine tests.
 */
export function runBotTurn(
  state: PorridgeGameState,
  rng: () => number = Math.random
): PorridgeMoveResult {
  const step1 = chooseBotCardPosition(state, rng);
  if (!step1.ok) return step1;
  return confirmBotSelection(step1.state);
}

export function advanceTurn(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'Game is already completed.');
  }
  if (!state.pendingTurnAdvance) {
    return fail(state, 'Cannot advance turn before resolving a card.');
  }

  const previousPlayer = state.players[state.currentPlayerIndex];
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextIndex];
  const humanCount = state.players.filter((p) => p.type === 'human').length;

  const needsPassScreen = nextPlayer.type === 'human' && humanCount > 1;
  const nextPhase =
    nextPlayer.type === 'bot'
      ? 'bot-thinking'
      : needsPassScreen
        ? 'passing-device'
        : 'selecting-card';

  return {
    ok: true,
    state: {
      ...state,
      phase: nextPhase,
      currentPlayerIndex: nextIndex,
      previousPlayerName: previousPlayer.name,
      pendingTurnAdvance: false,
      awaitingPassConfirmation: needsPassScreen,
      turnNumber: state.turnNumber + 1,
      lastActionSummary: needsPassScreen
        ? `Pass the device to ${nextPlayer.name}.`
        : `${nextPlayer.name}’s turn.`,
    },
  };
}

export function confirmPassDevice(state: PorridgeGameState): PorridgeMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'Game has already ended.');
  }
  if (!state.awaitingPassConfirmation) {
    return { ok: true, state };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  return {
    ok: true,
    state: {
      ...state,
      phase: 'selecting-card',
      awaitingPassConfirmation: false,
      lastActionSummary: `${currentPlayer.name}, select a face-down card from the circle.`,
    },
  };
}

/**
 * Projects a privacy-safe view for the UI:
 * - Never exposes unrevealed face-down or merely selected card identities.
 * - Hides board details during Pass-and-Play handover confirmation.
 */
export function getPublicPorridgeView(
  state: PorridgeGameState
): PublicPorridgeView {
  const hideBoardForPrivacy =
    state.status === 'PLAYING' && state.awaitingPassConfirmation;

  const publicPlayers: PublicPorridgePlayer[] = state.players.map((p, idx) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    turnOrder: p.turnOrder,
    cardsCollected: p.cardsCollected,
    isCurrentTurn: state.status === 'PLAYING' && idx === state.currentPlayerIndex,
  }));

  const publicCircle: PublicCircleSlot[] = hideBoardForPrivacy
    ? []
    : state.circle.map((slot) => ({
        positionId: slot.positionId,
        positionIndex: slot.positionIndex,
        status: slot.status,
        isSelected: state.selectedPositionId === slot.positionId,
      }));

  const remainingCircleCount = getAvailableCircleSlots(state.circle).length;
  const visiblePile = hideBoardForPrivacy ? [] : state.centralPile;

  return {
    status: state.status,
    phase: state.phase,
    mode: state.mode,
    variation: state.variation,
    direction: state.direction,
    rules: state.rules,
    hideBoardForPrivacy,
    awaitingPassConfirmation: state.awaitingPassConfirmation,
    pendingTurnAdvance: state.pendingTurnAdvance,
    turnNumber: state.turnNumber,
    remainingCircleCount,
    publicCircle,
    centralPile: visiblePile,
    openingPileCard: visiblePile.length > 0 ? visiblePile[0] : null,
    topPileCard:
      visiblePile.length > 0 ? visiblePile[visiblePile.length - 1] : null,
    players: publicPlayers,
    currentPlayer: publicPlayers[state.currentPlayerIndex],
    previousPlayerName: state.previousPlayerName,
    selectedPositionId: hideBoardForPrivacy ? null : state.selectedPositionId,
    lastRevealResult: hideBoardForPrivacy ? null : state.lastRevealResult,
    collectionHistory: hideBoardForPrivacy ? [] : state.collectionHistory,
    standings: state.standings,
    winnerIds: state.winnerIds,
    isTie: state.isTie,
    lastActionSummary: state.lastActionSummary,
  };
}
