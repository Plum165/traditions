import type { PlayDirection } from '../../../types/multiplayer';
import { getRefillDrawLimit, refillPlayerIfEmpty } from './drawManager';
import { calculateWinner, checkVictoryCondition } from './scoring';
import type { GoFishGameState, GoFishMoveResult } from './types';

export function getStepOffset(direction: PlayDirection): number {
  return direction === 'clockwise' ? 1 : -1;
}

export function findNextEligiblePlayerIndex(
  state: GoFishGameState,
  fromIndex: number
): number | null {
  const count = state.players.length;
  const step = getStepOffset(state.direction);

  for (let offset = 1; offset <= count; offset += 1) {
    const candidateIndex = (fromIndex + offset * step + count * 4) % count;
    const candidate = state.players[candidateIndex];
    if (candidate.hand.length > 0 || state.drawPile.length > 0) {
      return candidateIndex;
    }
  }
  return null;
}

export function applyPassProtectionForActivePlayer(
  state: GoFishGameState,
  previousHumanId: string | null,
  previousHumanName: string | null
): GoFishGameState {
  if (state.status !== 'PLAYING') {
    return {
      ...state,
      awaitingPassConfirmation: false,
      pendingTurnAdvance: false,
      phase: 'game-completed',
    };
  }

  const nextPlayer = state.players[state.currentPlayerIndex];
  if (nextPlayer.type === 'bot') {
    return {
      ...state,
      awaitingPassConfirmation: false,
      pendingTurnAdvance: false,
      phase: 'bot-thinking',
    };
  }

  const humanCount = state.players.filter((p) => p.type === 'human').length;
  const needsPassScreen =
    humanCount > 1 &&
    previousHumanId !== null &&
    previousHumanId !== nextPlayer.id;

  return {
    ...state,
    awaitingPassConfirmation: needsPassScreen,
    pendingTurnAdvance: false,
    lastHumanPlayerId: needsPassScreen ? state.lastHumanPlayerId : nextPlayer.id,
    previousHumanName: needsPassScreen ? previousHumanName : null,
    phase: needsPassScreen ? 'passing-device' : 'waiting-for-player',
  };
}

export function advanceTurn(state: GoFishGameState): GoFishGameState {
  const victory = checkVictoryCondition(state);
  if (victory.ended) {
    const result = calculateWinner(state.players, victory.isStalemate);
    const winners = result.standings.filter((s) => s.isWinner);
    const winnerText = result.isTie
      ? `Tie between ${winners.map((w) => w.name).join(' and ')}`
      : `${winners[0]?.name ?? 'Winner'} wins`;

    return {
      ...state,
      status: 'GAME_OVER',
      phase: 'game-completed',
      awaitingPassConfirmation: false,
      pendingTurnAdvance: false,
      winnerIds: result.winnerIds,
      isTie: result.isTie,
      isStalemate: result.isStalemate,
      standings: result.standings,
      lastActionSummary: `${victory.reason ?? 'Game complete.'} ${winnerText} with ${winners[0]?.bookCount ?? 0} books.`,
    };
  }

  const nextIndex = findNextEligiblePlayerIndex(state, state.currentPlayerIndex);
  if (nextIndex === null) {
    const result = calculateWinner(state.players, true);
    return {
      ...state,
      status: 'GAME_OVER',
      phase: 'game-completed',
      awaitingPassConfirmation: false,
      pendingTurnAdvance: false,
      winnerIds: result.winnerIds,
      isTie: result.isTie,
      isStalemate: true,
      standings: result.standings,
      lastActionSummary: 'No active players remain. Final standings calculated.',
    };
  }

  // Ensure the incoming player has cards if their hand is empty and Fish Pond has cards
  const incoming = state.players[nextIndex];
  let workingState = state;
  if (incoming.hand.length === 0 && state.drawPile.length > 0) {
    const refill = refillPlayerIfEmpty(
      incoming,
      state.drawPile,
      getRefillDrawLimit(state),
      state.turnNumber + 1
    );
    const nextPlayers = state.players.map((p, idx) =>
      idx === nextIndex ? refill.player : p
    );
    workingState = {
      ...state,
      players: nextPlayers,
      drawPile: refill.drawPile,
      memory: {
        ...state.memory,
        knownBookCollections: [
          ...state.memory.knownBookCollections,
          ...refill.booksFromRefill.map((rank) => ({
            playerId: incoming.id,
            rank,
            turnNumber: state.turnNumber + 1,
          })),
        ],
      },
    };
  }

  const postRefillVictory = checkVictoryCondition(workingState);
  if (postRefillVictory.ended) {
    const result = calculateWinner(
      workingState.players,
      postRefillVictory.isStalemate
    );
    return {
      ...workingState,
      status: 'GAME_OVER',
      phase: 'game-completed',
      awaitingPassConfirmation: false,
      pendingTurnAdvance: false,
      winnerIds: result.winnerIds,
      isTie: result.isTie,
      isStalemate: result.isStalemate,
      standings: result.standings,
      lastActionSummary:
        postRefillVictory.reason ?? 'Game complete. Final standings calculated.',
    };
  }

  const previousPlayer = workingState.players[workingState.currentPlayerIndex];
  const previousHumanId =
    previousPlayer.type === 'human'
      ? previousPlayer.id
      : workingState.lastHumanPlayerId;
  const previousHumanName =
    previousPlayer.type === 'human'
      ? previousPlayer.name
      : workingState.previousHumanName ??
        workingState.players.find((p) => p.id === workingState.lastHumanPlayerId)
          ?.name ??
        null;

  const movedState: GoFishGameState = {
    ...workingState,
    currentPlayerIndex: nextIndex,
    turnNumber: workingState.turnNumber + 1,
    newlyDrawnCardId: null,
    lastHumanPlayerId: previousHumanId,
    previousHumanName,
  };

  return applyPassProtectionForActivePlayer(
    movedState,
    previousHumanId,
    previousHumanName
  );
}

export function confirmPassDevice(state: GoFishGameState): GoFishMoveResult {
  if (state.status !== 'PLAYING') {
    return {
      ok: false,
      error: 'The game has already completed.',
      state,
    };
  }
  if (!state.awaitingPassConfirmation) {
    return {
      ok: false,
      error: 'No pass-device confirmation is pending.',
      state,
    };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  return {
    ok: true,
    state: {
      ...state,
      awaitingPassConfirmation: false,
      lastHumanPlayerId:
        activePlayer.type === 'human' ? activePlayer.id : state.lastHumanPlayerId,
      previousHumanName: null,
      phase: activePlayer.type === 'bot' ? 'bot-thinking' : 'waiting-for-player',
    },
  };
}
