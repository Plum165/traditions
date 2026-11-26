import type { CardRank, StandardCard } from '../../../types/playingCard';
import { extractBooksFromPlayer } from './bookManager';
import { addCardsToHand } from './handManager';
import type { GoFishGameState, GoFishPlayer } from './types';

export function getRefillDrawLimit(state: GoFishGameState): number {
  return state.rules.emptyHandRule === 'single-card' ? 1 : 5;
}

export function drawSingleCardFromPond(state: GoFishGameState): {
  drawnCard: StandardCard | null;
  remainingDrawPile: StandardCard[];
} {
  if (state.drawPile.length === 0) {
    return {
      drawnCard: null,
      remainingDrawPile: state.drawPile,
    };
  }
  const [drawnCard, ...remainingDrawPile] = state.drawPile;
  return {
    drawnCard,
    remainingDrawPile,
  };
}

export function refillPlayerIfEmpty(
  player: GoFishPlayer,
  drawPile: StandardCard[],
  maxRefill: number,
  turnNumber: number
): {
  player: GoFishPlayer;
  drawPile: StandardCard[];
  refilledCount: number;
  refilledCards: StandardCard[];
  booksFromRefill: CardRank[];
} {
  if (player.hand.length > 0) {
    return {
      player: { ...player, isInactiveForAsking: false },
      drawPile,
      refilledCount: 0,
      refilledCards: [],
      booksFromRefill: [],
    };
  }

  if (drawPile.length === 0) {
    return {
      player: { ...player, isInactiveForAsking: true },
      drawPile,
      refilledCount: 0,
      refilledCards: [],
      booksFromRefill: [],
    };
  }

  let workingPlayer: GoFishPlayer = { ...player, isInactiveForAsking: false };
  let workingPile = [...drawPile];
  let totalDrawn = 0;
  const refilledCards: StandardCard[] = [];
  const booksFromRefill: CardRank[] = [];

  while (workingPlayer.hand.length === 0 && workingPile.length > 0) {
    const drawCount = Math.min(maxRefill, workingPile.length);
    const drawn = workingPile.slice(0, drawCount);
    workingPile = workingPile.slice(drawCount);
    totalDrawn += drawn.length;
    refilledCards.push(...drawn);

    workingPlayer = {
      ...workingPlayer,
      hand: addCardsToHand(workingPlayer.hand, drawn),
      isInactiveForAsking: false,
    };

    const bookCheck = extractBooksFromPlayer(workingPlayer, turnNumber);
    workingPlayer = bookCheck.player;
    booksFromRefill.push(...bookCheck.completedRanks);
  }

  if (workingPlayer.hand.length === 0 && workingPile.length === 0) {
    workingPlayer = {
      ...workingPlayer,
      isInactiveForAsking: true,
    };
  }

  return {
    player: workingPlayer,
    drawPile: workingPile,
    refilledCount: totalDrawn,
    refilledCards,
    booksFromRefill,
  };
}

export function drawCard(
  state: GoFishGameState,
  playerId: string
): GoFishGameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1 || state.drawPile.length === 0) {
    return state;
  }

  const { drawnCard, remainingDrawPile } = drawSingleCardFromPond(state);
  if (!drawnCard) return state;

  const target = state.players[playerIndex];
  const updatedWithCard: GoFishPlayer = {
    ...target,
    hand: addCardsToHand(target.hand, [drawnCard]),
    isInactiveForAsking: false,
  };

  const bookCheck = extractBooksFromPlayer(updatedWithCard, state.turnNumber);
  const refillResult = refillPlayerIfEmpty(
    bookCheck.player,
    remainingDrawPile,
    getRefillDrawLimit(state),
    state.turnNumber
  );

  const nextPlayers = state.players.map((p, idx) =>
    idx === playerIndex ? refillResult.player : p
  );

  const newKnownBooks = [
    ...bookCheck.completedRanks,
    ...refillResult.booksFromRefill,
  ].map((rank) => ({
    playerId,
    rank,
    turnNumber: state.turnNumber,
  }));

  const combinedDrawn = [drawnCard, ...refillResult.refilledCards];

  return {
    ...state,
    players: nextPlayers,
    drawPile: refillResult.drawPile,
    newlyDrawnCardId: drawnCard.id,
    lastDrawnCardsByPlayer: {
      ...state.lastDrawnCardsByPlayer,
      [playerId]: combinedDrawn,
    },
    memory: {
      ...state.memory,
      knownBookCollections: [
        ...state.memory.knownBookCollections,
        ...newKnownBooks,
      ],
    },
  };
}

export function refillEmptyHand(
  state: GoFishGameState,
  playerId: string
): GoFishGameState {
  const playerIndex = state.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return state;

  const refillResult = refillPlayerIfEmpty(
    state.players[playerIndex],
    state.drawPile,
    getRefillDrawLimit(state),
    state.turnNumber
  );

  const nextPlayers = state.players.map((p, idx) =>
    idx === playerIndex ? refillResult.player : p
  );

  const newKnownBooks = refillResult.booksFromRefill.map((rank) => ({
    playerId,
    rank,
    turnNumber: state.turnNumber,
  }));

  return {
    ...state,
    players: nextPlayers,
    drawPile: refillResult.drawPile,
    lastDrawnCardsByPlayer:
      refillResult.refilledCards.length > 0
        ? {
            ...state.lastDrawnCardsByPlayer,
            [playerId]: refillResult.refilledCards,
          }
        : state.lastDrawnCardsByPlayer,
    memory: {
      ...state.memory,
      knownBookCollections: [
        ...state.memory.knownBookCollections,
        ...newKnownBooks,
      ],
    },
  };
}
