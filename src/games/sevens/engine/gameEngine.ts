import { createDeck, dealHands, formatCardLabel, shuffleDeck, sortHand } from './deck';
import type {
  GameSetupConfig,
  GameState,
  MoveResult,
  Player,
  PlayingCard,
  PublicTableView,
  SevensRulesConfig,
  TableSet,
} from './types';
import {
  canDiscardCard,
  validateAddToSet,
  validateNewSet,
  validateReplaceJoker,
} from './validation';

export const DEFAULT_SEVENS_RULES: SevensRulesConfig = {
  allowDiscardJoker: false,
  allowImmediateJokerReuse: true,
  allowDiscardPickupTop: false,
  requireFinalDiscard: false,
  allowExtendJokerSets: true,
};

function buildPlayers(
  config: GameSetupConfig,
  hands: PlayingCard[][]
): Player[] {
  return hands.map((hand, idx) => {
    const isBot = config.mode === 'vs-bots' && idx > 0;
    const defaultName =
      config.mode === 'vs-bots'
        ? idx === 0
          ? 'You'
          : `Bot ${idx}`
        : `Player ${idx + 1}`;
    const customName = config.playerNames?.[idx]?.trim();

    return {
      id: `player-${idx + 1}`,
      name: customName || defaultName,
      type: isBot ? 'bot' : 'human',
      hand,
    };
  });
}

function appendLog(log: readonly string[], entry: string): string[] {
  return [entry, ...log].slice(0, 30);
}

export function createGame(
  config: GameSetupConfig,
  rng: () => number = Math.random
): GameState {
  if (![2, 3, 4].includes(config.playerCount)) {
    throw new Error('Sevens supports 2 to 4 players.');
  }
  if (![7, 11].includes(config.handSize)) {
    throw new Error('Starting hand size must be 7 or 11 cards.');
  }

  const rules: SevensRulesConfig = {
    ...DEFAULT_SEVENS_RULES,
    ...config.rules,
  };

  const shuffled = shuffleDeck(createDeck(), rng);
  const { hands, remainingDeck } = dealHands(shuffled, config.playerCount, config.handSize);
  const players = buildPlayers(config, hands);

  const initialDiscard = remainingDeck[0] ? [remainingDeck[0]] : [];
  const drawPile = remainingDeck.slice(initialDiscard.length);

  const firstPlayer = players[0];
  const awaitingPassConfirmation =
    config.mode === 'pass-and-play' && firstPlayer.type === 'human';

  const summary = `New ${config.handSize}-card game started with ${config.playerCount} players.`;

  return {
    status: 'PLAYING',
    mode: config.mode,
    handSize: config.handSize,
    rules,
    players,
    currentPlayerIndex: 0,
    phase: 'DRAW',
    drawPile,
    discardPile: initialDiscard,
    tableSets: [],
    turnNumber: 1,
    hasCreatedNewSetThisTurn: false,
    retrievedJokerIdsThisTurn: [],
    awaitingPassConfirmation,
    winnerId: null,
    lastActionSummary: summary,
    actionLog: [summary],
  };
}

export function confirmPassDevice(state: GameState): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (!state.awaitingPassConfirmation) {
    return { ok: true, state };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const summary = `${currentPlayer.name} is ready to begin their turn.`;

  return {
    ok: true,
    state: {
      ...state,
      awaitingPassConfirmation: false,
      lastActionSummary: summary,
    },
  };
}

function replenishDrawPileIfEmpty(
  drawPile: readonly PlayingCard[],
  discardPile: readonly PlayingCard[],
  rng: () => number = Math.random
): { drawPile: PlayingCard[]; discardPile: PlayingCard[] } {
  if (drawPile.length > 0 || discardPile.length <= 1) {
    return {
      drawPile: [...drawPile],
      discardPile: [...discardPile],
    };
  }

  const topCard = discardPile[discardPile.length - 1];
  const recycled = shuffleDeck(discardPile.slice(0, -1), rng);
  return {
    drawPile: recycled,
    discardPile: [topCard],
  };
}

export function drawCard(
  state: GameState,
  source: 'draw-pile' | 'discard-pile' = 'draw-pile',
  rng: () => number = Math.random
): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.awaitingPassConfirmation) {
    return { ok: false, error: 'Confirm device pass before drawing a card.', state };
  }
  if (state.phase !== 'DRAW') {
    return { ok: false, error: 'You have already drawn a card this turn.', state };
  }

  const activePlayer = state.players[state.currentPlayerIndex];

  if (source === 'discard-pile') {
    if (!state.rules.allowDiscardPickupTop) {
      return {
        ok: false,
        error: 'Current table rules require drawing from the draw pile.',
        state,
      };
    }
    if (state.discardPile.length === 0) {
      return { ok: false, error: 'The discard pile is empty.', state };
    }

    const drawn = state.discardPile[state.discardPile.length - 1];
    const nextDiscard = state.discardPile.slice(0, -1);
    const updatedPlayers = state.players.map((p, idx) =>
      idx === state.currentPlayerIndex
        ? { ...p, hand: sortHand([...p.hand, drawn]) }
        : p
    );

    const summary = `${activePlayer.name} picked up ${formatCardLabel(drawn)} from the discard pile.`;
    return {
      ok: true,
      state: {
        ...state,
        players: updatedPlayers,
        discardPile: nextDiscard,
        phase: 'PLAY',
        lastActionSummary: summary,
        actionLog: appendLog(state.actionLog, summary),
      },
    };
  }

  const { drawPile, discardPile } = replenishDrawPileIfEmpty(
    state.drawPile,
    state.discardPile,
    rng
  );

  if (drawPile.length === 0) {
    const summary = `${activePlayer.name} could not draw because no cards remain in the draw pile.`;
    return {
      ok: true,
      state: {
        ...state,
        phase: 'PLAY',
        lastActionSummary: summary,
        actionLog: appendLog(state.actionLog, summary),
      },
    };
  }

  const drawn = drawPile[0];
  const nextDrawPile = drawPile.slice(1);
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex
      ? { ...p, hand: sortHand([...p.hand, drawn]) }
      : p
  );

  const summary =
    activePlayer.type === 'human' && state.mode === 'pass-and-play'
      ? `${activePlayer.name} drew a card.`
      : `${activePlayer.name} drew a card from the deck.`;

  return {
    ok: true,
    state: {
      ...state,
      players: updatedPlayers,
      drawPile: nextDrawPile,
      discardPile,
      phase: 'PLAY',
      lastActionSummary: summary,
      actionLog: appendLog(state.actionLog, summary),
    },
  };
}

function checkRetrievedJokerRestriction(
  cards: readonly PlayingCard[],
  state: GameState
): string | null {
  if (state.rules.allowImmediateJokerReuse) {
    return null;
  }

  const blocked = cards.find((c) => state.retrievedJokerIdsThisTurn.includes(c.id));
  if (blocked) {
    return 'Current house rules prevent reusing a retrieved Joker during the same turn.';
  }
  return null;
}

function applyWinIfHandEmpty(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (player.hand.length > 0) {
    return state;
  }

  const summary = `${player.name} cleared all cards and won the game!`;
  return {
    ...state,
    status: 'GAME_OVER',
    winnerId: player.id,
    awaitingPassConfirmation: false,
    lastActionSummary: summary,
    actionLog: appendLog(state.actionLog, summary),
  };
}

export function playNewSet(state: GameState, cardIds: readonly string[]): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.awaitingPassConfirmation) {
    return { ok: false, error: 'Confirm device pass before playing.', state };
  }
  if (state.phase !== 'PLAY') {
    return {
      ok: false,
      error:
        state.phase === 'DRAW'
          ? 'Draw a card first before playing sets.'
          : 'You cannot play sets during the discard step.',
      state,
    };
  }
  if (state.hasCreatedNewSetThisTurn) {
    return {
      ok: false,
      error: 'You may create a maximum of one new set per turn.',
      state,
    };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  const selectedCards = cardIds
    .map((id) => activePlayer.hand.find((c) => c.id === id))
    .filter((c): c is PlayingCard => Boolean(c));

  if (selectedCards.length !== cardIds.length) {
    return { ok: false, error: 'Some selected cards are not in your hand.', state };
  }

  const jokerReuseError = checkRetrievedJokerRestriction(selectedCards, state);
  if (jokerReuseError) {
    return { ok: false, error: jokerReuseError, state };
  }

  if (
    state.rules.requireFinalDiscard &&
    activePlayer.hand.length - selectedCards.length < 1
  ) {
    return {
      ok: false,
      error: 'Current house rules require keeping at least 1 card to discard at the end of your turn.',
      state,
    };
  }

  const validation = validateNewSet(selectedCards);
  if (!validation.valid || !validation.setType || !validation.orderedCards) {
    return { ok: false, error: validation.reason ?? 'Invalid set.', state };
  }

  const newSet: TableSet = {
    id: `set-${state.turnNumber}-${state.tableSets.length + 1}`,
    type: validation.setType,
    cards: validation.orderedCards,
    createdByPlayerId: activePlayer.id,
    createdTurn: state.turnNumber,
  };

  const selectedSet = new Set(cardIds);
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex
      ? { ...p, hand: p.hand.filter((c) => !selectedSet.has(c.id)) }
      : p
  );

  const label = validation.orderedCards.map(formatCardLabel).join(', ');
  const summary = `${activePlayer.name} played a new ${
    validation.setType === 'matching' ? 'matching set' : 'consecutive run'
  }: ${label}.`;

  const nextState = applyWinIfHandEmpty(
    {
      ...state,
      players: updatedPlayers,
      tableSets: [...state.tableSets, newSet],
      hasCreatedNewSetThisTurn: true,
      lastActionSummary: summary,
      actionLog: appendLog(state.actionLog, summary),
    },
    state.currentPlayerIndex
  );

  return { ok: true, state: nextState };
}

export function addCardsToSet(
  state: GameState,
  setId: string,
  cardIds: readonly string[]
): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.awaitingPassConfirmation) {
    return { ok: false, error: 'Confirm device pass before playing.', state };
  }
  if (state.phase !== 'PLAY') {
    return { ok: false, error: 'You can only add to sets during the Play phase.', state };
  }

  const targetSet = state.tableSets.find((s) => s.id === setId);
  if (!targetSet) {
    return { ok: false, error: 'Target table set not found.', state };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  const selectedCards = cardIds
    .map((id) => activePlayer.hand.find((c) => c.id === id))
    .filter((c): c is PlayingCard => Boolean(c));

  if (selectedCards.length !== cardIds.length) {
    return { ok: false, error: 'Some selected cards are not in your hand.', state };
  }

  const jokerReuseError = checkRetrievedJokerRestriction(selectedCards, state);
  if (jokerReuseError) {
    return { ok: false, error: jokerReuseError, state };
  }

  if (
    state.rules.requireFinalDiscard &&
    activePlayer.hand.length - selectedCards.length < 1
  ) {
    return {
      ok: false,
      error: 'Current house rules require keeping at least 1 card to discard.',
      state,
    };
  }

  const validation = validateAddToSet(targetSet, selectedCards, state.rules);
  if (!validation.valid || !validation.orderedCards) {
    return {
      ok: false,
      error: validation.reason ?? 'Cannot add selected cards to that set.',
      state,
    };
  }

  const selectedSet = new Set(cardIds);
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex
      ? { ...p, hand: p.hand.filter((c) => !selectedSet.has(c.id)) }
      : p
  );

  const updatedTableSets = state.tableSets.map((s) =>
    s.id === setId ? { ...s, cards: validation.orderedCards! } : s
  );

  const addedLabel = selectedCards.map(formatCardLabel).join(', ');
  const summary = `${activePlayer.name} added ${addedLabel} to an existing ${
    targetSet.type === 'matching' ? 'matching set' : 'run'
  }.`;

  const nextState = applyWinIfHandEmpty(
    {
      ...state,
      players: updatedPlayers,
      tableSets: updatedTableSets,
      lastActionSummary: summary,
      actionLog: appendLog(state.actionLog, summary),
    },
    state.currentPlayerIndex
  );

  return { ok: true, state: nextState };
}

export function replaceJokerInSet(
  state: GameState,
  setId: string,
  cardId: string
): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.awaitingPassConfirmation) {
    return { ok: false, error: 'Confirm device pass before playing.', state };
  }
  if (state.phase !== 'PLAY') {
    return { ok: false, error: 'You can only replace a Joker during the Play phase.', state };
  }

  const targetSet = state.tableSets.find((s) => s.id === setId);
  if (!targetSet) {
    return { ok: false, error: 'Target table set not found.', state };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  const card = activePlayer.hand.find((c) => c.id === cardId);
  if (!card) {
    return { ok: false, error: 'Selected card is not in your hand.', state };
  }

  const replacement = validateReplaceJoker(targetSet, card);
  if (!replacement.valid || !replacement.orderedCards || !replacement.retrievedJoker) {
    return {
      ok: false,
      error: replacement.reason ?? 'Cannot replace Joker with that card.',
      state,
    };
  }

  const updatedHand = sortHand([
    ...activePlayer.hand.filter((c) => c.id !== cardId),
    replacement.retrievedJoker,
  ]);

  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex ? { ...p, hand: updatedHand } : p
  );

  const updatedTableSets = state.tableSets.map((s) =>
    s.id === setId ? { ...s, cards: replacement.orderedCards! } : s
  );

  const summary = `${activePlayer.name} replaced a Joker using ${formatCardLabel(
    card
  )} and retrieved ${formatCardLabel(replacement.retrievedJoker)}.`;

  return {
    ok: true,
    state: {
      ...state,
      players: updatedPlayers,
      tableSets: updatedTableSets,
      retrievedJokerIdsThisTurn: [
        ...state.retrievedJokerIdsThisTurn,
        replacement.retrievedJoker.id,
      ],
      lastActionSummary: summary,
      actionLog: appendLog(state.actionLog, summary),
    },
  };
}

export function proceedToDiscard(state: GameState): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.phase !== 'PLAY') {
    return { ok: false, error: 'You can only proceed to discard from the Play phase.', state };
  }

  return {
    ok: true,
    state: {
      ...state,
      phase: 'DISCARD',
    },
  };
}

export function discardCard(state: GameState, cardId: string): MoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'Game is already over.', state };
  }
  if (state.awaitingPassConfirmation) {
    return { ok: false, error: 'Confirm device pass before discarding.', state };
  }
  if (state.phase !== 'PLAY' && state.phase !== 'DISCARD') {
    return { ok: false, error: 'Draw a card first before discarding.', state };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  const card = activePlayer.hand.find((c) => c.id === cardId);
  if (!card) {
    return { ok: false, error: 'Selected card is not in your hand.', state };
  }

  const discardCheck = canDiscardCard(card, activePlayer.hand, state.rules);
  if (!discardCheck.valid) {
    return { ok: false, error: discardCheck.reason ?? 'Cannot discard that card.', state };
  }

  const nextHand = activePlayer.hand.filter((c) => c.id !== cardId);
  const updatedPlayers = state.players.map((p, idx) =>
    idx === state.currentPlayerIndex ? { ...p, hand: nextHand } : p
  );

  const nextDiscardPile = [...state.discardPile, card];
  const summary = `${activePlayer.name} discarded ${formatCardLabel(card)}.`;

  const stateAfterDiscard: GameState = {
    ...state,
    players: updatedPlayers,
    discardPile: nextDiscardPile,
    lastActionSummary: summary,
    actionLog: appendLog(state.actionLog, summary),
  };

  if (nextHand.length === 0) {
    return {
      ok: true,
      state: applyWinIfHandEmpty(stateAfterDiscard, state.currentPlayerIndex),
    };
  }

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextPlayerIndex];
  const needsPassScreen =
    state.mode === 'pass-and-play' && nextPlayer.type === 'human';

  return {
    ok: true,
    state: {
      ...stateAfterDiscard,
      currentPlayerIndex: nextPlayerIndex,
      phase: 'DRAW',
      turnNumber: state.turnNumber + 1,
      hasCreatedNewSetThisTurn: false,
      retrievedJokerIdsThisTurn: [],
      awaitingPassConfirmation: needsPassScreen,
    },
  };
}

/**
 * Returns a privacy-safe projection of the game table.
 * Never exposes other players' hands or the active player's hand while Pass-and-Play confirmation is pending.
 */
export function getPublicTableView(state: GameState): PublicTableView {
  const players = state.players.map((p, idx) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    cardCount: p.hand.length,
    isCurrentTurn: idx === state.currentPlayerIndex,
  }));

  const currentPlayerSummary = players[state.currentPlayerIndex];
  const activePlayer = state.players[state.currentPlayerIndex];

  let visibleHand: PlayingCard[] | null = null;
  if (state.status === 'PLAYING' && !state.awaitingPassConfirmation) {
    if (state.mode === 'pass-and-play') {
      visibleHand = [...activePlayer.hand];
    } else {
      // In vs-bots mode, always show the human player's hand (index 0) without exposing bot hands
      const humanPlayer = state.players.find((p) => p.type === 'human');
      visibleHand = humanPlayer ? [...humanPlayer.hand] : null;
    }
  }

  const winner = state.winnerId
    ? players.find((p) => p.id === state.winnerId) ?? null
    : null;

  return {
    status: state.status,
    mode: state.mode,
    phase: state.phase,
    turnNumber: state.turnNumber,
    hasCreatedNewSetThisTurn: state.hasCreatedNewSetThisTurn,
    awaitingPassConfirmation: state.awaitingPassConfirmation,
    currentPlayer: currentPlayerSummary,
    players,
    visibleHand,
    drawPileCount: state.drawPile.length,
    topDiscard:
      state.discardPile.length > 0
        ? state.discardPile[state.discardPile.length - 1]
        : null,
    discardPileCount: state.discardPile.length,
    tableSets: state.tableSets,
    winner,
    lastActionSummary: state.lastActionSummary,
  };
}
