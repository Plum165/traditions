import type { CardRank } from '../../../types/playingCard';
import { extractBooksFromPlayer } from './bookManager';
import { createBotObservation, recordPublicTurnMemory } from './botMemory';
import { selectBotAction } from './botStrategy';
import {
  formatRankName,
  formatRankPlural,
} from './deck';
import {
  drawSingleCardFromPond,
  getRefillDrawLimit,
  refillPlayerIfEmpty,
} from './drawManager';
import {
  addCardsToHand,
  getAvailableRanksForPlayer,
  removeRankFromHand,
} from './handManager';
import { validateRequest } from './requestValidator';
import {
  calculateWinner,
  checkVictoryCondition,
  getTotalCompletedBooks,
} from './scoring';
import {
  advanceTurn,
  applyPassProtectionForActivePlayer,
} from './turnManager';
import type {
  GoFishGameState,
  GoFishMoveResult,
  GoFishPlayer,
  GoFishTurnOutcome,
  PublicGoFishPlayerSummary,
  PublicGoFishView,
} from './types';

function fail(state: GoFishGameState, error: string): GoFishMoveResult {
  return { ok: false, error, state };
}

function formatTransferCount(count: number, rank: CardRank): string {
  const rankWord = count === 1 ? formatRankName(rank) : formatRankPlural(rank);
  const numberWord =
    count === 1 ? 'one' : count === 2 ? 'two' : count === 3 ? 'three' : String(count);
  return `${numberWord} ${rankWord}`;
}

export function getAvailableRanks(
  state: GoFishGameState,
  playerId: string
): CardRank[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return [];
  return getAvailableRanksForPlayer(player);
}

export function checkForBooks(
  state: GoFishGameState,
  playerId: string
): GoFishGameState {
  const idx = state.players.findIndex((p) => p.id === playerId);
  if (idx === -1) return state;

  const extracted = extractBooksFromPlayer(
    state.players[idx],
    state.turnNumber
  );
  if (extracted.completedRanks.length === 0) return state;

  const nextPlayers = state.players.map((p, i) =>
    i === idx ? extracted.player : p
  );

  return {
    ...state,
    players: nextPlayers,
    memory: {
      ...state.memory,
      knownBookCollections: [
        ...state.memory.knownBookCollections,
        ...extracted.completedRanks.map((rank) => ({
          playerId,
          rank,
          turnNumber: state.turnNumber,
        })),
      ],
    },
  };
}

export function resolveRequest(
  state: GoFishGameState,
  playerId: string,
  opponentId: string,
  rank: CardRank
): GoFishMoveResult {
  const validation = validateRequest(state, playerId, opponentId, rank);
  if (!validation.valid) {
    return fail(state, validation.error ?? 'Invalid request.');
  }

  const requesterIndex = state.players.findIndex((p) => p.id === playerId);
  const opponentIndex = state.players.findIndex((p) => p.id === opponentId);
  const requester = state.players[requesterIndex];
  const opponent = state.players[opponentIndex];

  const rankPlural = formatRankPlural(rank);
  const rankName = formatRankName(rank);
  const refillLimit = getRefillDrawLimit(state);

  let workingPlayers = [...state.players];
  let workingDrawPile = [...state.drawPile];
  let outcome: GoFishTurnOutcome;
  let newlyDrawnCardId: string | null = null;
  let completedBooksForMemory: { playerId: string; rank: CardRank }[] = [];
  let nextStalePlayerIds = [...state.stalePlayerIds];
  const nextDrawnCardsByPlayer: Record<string, typeof state.drawPile> = {
    ...state.lastDrawnCardsByPlayer,
    [requester.id]: [],
  };

  const { removed: matchingCards, remaining: opponentRemaining } =
    removeRankFromHand(opponent.hand, rank);

  if (matchingCards.length > 0) {
    // Opponent has at least 1 card of the requested rank -> transfer ALL matching cards
    let updatedRequester: GoFishPlayer = {
      ...requester,
      hand: addCardsToHand(requester.hand, matchingCards),
      isInactiveForAsking: false,
    };

    const bookCheck = extractBooksFromPlayer(updatedRequester, state.turnNumber);
    updatedRequester = bookCheck.player;

    const reqRefill = refillPlayerIfEmpty(
      updatedRequester,
      workingDrawPile,
      refillLimit,
      state.turnNumber
    );
    updatedRequester = reqRefill.player;
    workingDrawPile = reqRefill.drawPile;

    const oppRefill = refillPlayerIfEmpty(
      { ...opponent, hand: opponentRemaining },
      workingDrawPile,
      refillLimit,
      state.turnNumber
    );
    const updatedOpponent = oppRefill.player;
    workingDrawPile = oppRefill.drawPile;

    if (reqRefill.refilledCards.length > 0) {
      nextDrawnCardsByPlayer[requester.id] = reqRefill.refilledCards;
    }
    if (oppRefill.refilledCards.length > 0) {
      nextDrawnCardsByPlayer[opponent.id] = oppRefill.refilledCards;
    }

    workingPlayers[requesterIndex] = updatedRequester;
    workingPlayers[opponentIndex] = updatedOpponent;

    const allBooksByRequester = [
      ...bookCheck.completedRanks,
      ...reqRefill.booksFromRefill,
    ];
    completedBooksForMemory = [
      ...allBooksByRequester.map((r) => ({ playerId: requester.id, rank: r })),
      ...oppRefill.booksFromRefill.map((r) => ({
        playerId: opponent.id,
        rank: r,
      })),
    ];

    // Successful transfer resets stalemate tracker
    nextStalePlayerIds = [];

    const transferPhrase = formatTransferCount(matchingCards.length, rank);
    const bookNotice =
      allBooksByRequester.length > 0
        ? ` ${requester.name} completed a book of ${allBooksByRequester
            .map(formatRankPlural)
            .join(', ')}!`
        : '';
    const refillNotice =
      reqRefill.refilledCount > 0
        ? ` ${requester.name} refilled ${reqRefill.refilledCount} cards.`
        : '';

    const canContinueAsking = updatedRequester.hand.length > 0;
    const message = `${requester.name} received ${transferPhrase} from ${opponent.name}!${bookNotice}${refillNotice}${
      canContinueAsking ? ` ${requester.name} gets another turn.` : ''
    }`;

    outcome = {
      id: `turn-${state.turnNumber}-${requester.id}-${rank}`,
      turnNumber: state.turnNumber,
      requesterId: requester.id,
      requesterName: requester.name,
      opponentId: opponent.id,
      opponentName: opponent.name,
      rank,
      kind: 'transferred',
      cardsTransferred: matchingCards.length,
      transferredCards: matchingCards,
      drawnCard: null,
      drawnCardPubliclyShown: false,
      completedBooks: allBooksByRequester,
      refilledCount: reqRefill.refilledCount,
      opponentRefilledCount: oppRefill.refilledCount,
      grantsAnotherTurn: canContinueAsking,
      publicMessage: message,
      privateMessage: message,
    };
  } else {
    // Opponent does NOT have the requested rank -> Go Fish!
    const { drawnCard, remainingDrawPile } = drawSingleCardFromPond(state);
    workingDrawPile = remainingDrawPile;

    if (!drawnCard) {
      // Fish Pond was already empty
      const nextPlayersAfterEmpty = [...workingPlayers];
      if (!nextStalePlayerIds.includes(requester.id)) {
        nextStalePlayerIds.push(requester.id);
      }

      const publicMsg = `${opponent.name} doesn't have any ${rankPlural}. Go Fish! The Fish Pond is empty — turn ends.`;
      outcome = {
        id: `turn-${state.turnNumber}-${requester.id}-${rank}`,
        turnNumber: state.turnNumber,
        requesterId: requester.id,
        requesterName: requester.name,
        opponentId: opponent.id,
        opponentName: opponent.name,
        rank,
        kind: 'go-fish-empty-pond',
        cardsTransferred: 0,
        transferredCards: [],
        drawnCard: null,
        drawnCardPubliclyShown: false,
        completedBooks: [],
        refilledCount: 0,
        opponentRefilledCount: 0,
        grantsAnotherTurn: false,
        publicMessage: publicMsg,
        privateMessage: publicMsg,
      };
      workingPlayers = nextPlayersAfterEmpty;
    } else {
      newlyDrawnCardId = drawnCard.id;
      const drawnMatchesRequested = drawnCard.rank === rank;

      let updatedRequester: GoFishPlayer = {
        ...requester,
        hand: addCardsToHand(requester.hand, [drawnCard]),
        isInactiveForAsking: false,
      };

      const bookCheck = extractBooksFromPlayer(
        updatedRequester,
        state.turnNumber
      );
      updatedRequester = bookCheck.player;

      const reqRefill = refillPlayerIfEmpty(
        updatedRequester,
        workingDrawPile,
        refillLimit,
        state.turnNumber
      );
      updatedRequester = reqRefill.player;
      workingDrawPile = reqRefill.drawPile;

      nextDrawnCardsByPlayer[requester.id] = [
        drawnCard,
        ...reqRefill.refilledCards,
      ];

      workingPlayers[requesterIndex] = updatedRequester;

      const allBooksByRequester = [
        ...bookCheck.completedRanks,
        ...reqRefill.booksFromRefill,
      ];
      completedBooksForMemory = allBooksByRequester.map((r) => ({
        playerId: requester.id,
        rank: r,
      }));

      // If pond just ran empty and no book was completed, note stale player; otherwise reset
      if (workingDrawPile.length === 0 && allBooksByRequester.length === 0) {
        if (!nextStalePlayerIds.includes(requester.id)) {
          nextStalePlayerIds.push(requester.id);
        }
      } else {
        nextStalePlayerIds = [];
      }

      const drawnRankName = formatRankName(drawnCard.rank);
      const bookNotice =
        allBooksByRequester.length > 0
          ? ` ${requester.name} completed a book of ${allBooksByRequester
              .map(formatRankPlural)
              .join(', ')}!`
          : '';
      const refillNotice =
        reqRefill.refilledCount > 0
          ? ` ${requester.name} refilled ${reqRefill.refilledCount} cards.`
          : '';

      const extraTurnFromRule =
        drawnMatchesRequested ||
        (state.rules.extraTurnOnBook && allBooksByRequester.length > 0);
      const canContinueAsking =
        extraTurnFromRule && updatedRequester.hand.length > 0;

      if (drawnMatchesRequested) {
        const publicMsg = `${opponent.name} doesn't have any ${rankPlural}. Go Fish! ${requester.name} drew a ${drawnRankName}!${bookNotice}${refillNotice}${
          canContinueAsking ? ` ${requester.name} gets another turn.` : ''
        }`;
        const privateMsg =
          requester.type === 'human'
            ? `${opponent.name} doesn't have any ${rankPlural}. Go Fish! You drew a ${drawnRankName}!${bookNotice}${refillNotice}${
                canContinueAsking ? ' You get another turn.' : ''
              }`
            : publicMsg;

        outcome = {
          id: `turn-${state.turnNumber}-${requester.id}-${rank}`,
          turnNumber: state.turnNumber,
          requesterId: requester.id,
          requesterName: requester.name,
          opponentId: opponent.id,
          opponentName: opponent.name,
          rank,
          kind: 'go-fish-match',
          cardsTransferred: 0,
          transferredCards: [],
          drawnCard,
          drawnCardPubliclyShown: true,
          completedBooks: allBooksByRequester,
          refilledCount: reqRefill.refilledCount,
          opponentRefilledCount: 0,
          grantsAnotherTurn: canContinueAsking,
          publicMessage: publicMsg,
          privateMessage: privateMsg,
        };
      } else {
        const publicMsg = `${opponent.name} doesn't have any ${rankPlural}. Go Fish! ${requester.name} drew a card from the Fish Pond.${bookNotice}${refillNotice}${
          canContinueAsking ? ` ${requester.name} gets another turn.` : ''
        }`;
        const privateMsg =
          requester.type === 'human'
            ? `${opponent.name} doesn't have any ${rankPlural}. Go Fish! You drew a ${drawnRankName}.${bookNotice}${refillNotice}${
                canContinueAsking ? ' You get another turn.' : ' Your turn is over.'
              }`
            : publicMsg;

        outcome = {
          id: `turn-${state.turnNumber}-${requester.id}-${rank}`,
          turnNumber: state.turnNumber,
          requesterId: requester.id,
          requesterName: requester.name,
          opponentId: opponent.id,
          opponentName: opponent.name,
          rank,
          kind: 'go-fish-miss',
          cardsTransferred: 0,
          transferredCards: [],
          drawnCard,
          drawnCardPubliclyShown: false,
          completedBooks: allBooksByRequester,
          refilledCount: reqRefill.refilledCount,
          opponentRefilledCount: 0,
          grantsAnotherTurn: canContinueAsking,
          publicMessage: publicMsg,
          privateMessage: privateMsg,
        };
      }
    }
  }

  const nextMemory = recordPublicTurnMemory(state.memory, {
    requesterId: requester.id,
    opponentId: opponent.id,
    rank,
    cardsTransferred: matchingCards.length,
    completedBooks: completedBooksForMemory,
    turnNumber: state.turnNumber,
  });

  const updatedState: GoFishGameState = {
    ...state,
    players: workingPlayers,
    drawPile: workingDrawPile,
    memory: nextMemory,
    stalePlayerIds: nextStalePlayerIds,
    newlyDrawnCardId,
    lastDrawnCardsByPlayer: nextDrawnCardsByPlayer,
    lastOutcome: outcome,
    outcomeHistory: [outcome, ...state.outcomeHistory].slice(0, 60),
    lastActionSummary: outcome.publicMessage,
  };

  // 1. Check immediate victory or stalemate before advancing
  const victory = checkVictoryCondition(updatedState);
  if (victory.ended) {
    const result = calculateWinner(
      updatedState.players,
      victory.isStalemate
    );
    const winners = result.standings.filter((s) => s.isWinner);
    const winnerText = result.isTie
      ? `Tie between ${winners.map((w) => w.name).join(' and ')}`
      : `${winners[0]?.name ?? 'Winner'} wins`;

    return {
      ok: true,
      state: {
        ...updatedState,
        status: 'GAME_OVER',
        phase: 'game-completed',
        awaitingPassConfirmation: false,
        pendingTurnAdvance: false,
        winnerIds: result.winnerIds,
        isTie: result.isTie,
        isStalemate: result.isStalemate,
        standings: result.standings,
        lastActionSummary: `${outcome.publicMessage} ${victory.reason ?? ''} ${winnerText} with ${winners[0]?.bookCount ?? 0} books.`,
      },
    };
  }

  // 2. If the requester gets another turn, keep currentPlayerIndex and increment turnNumber
  if (outcome.grantsAnotherTurn) {
    const continuedState: GoFishGameState = {
      ...updatedState,
      turnNumber: updatedState.turnNumber + 1,
    };
    return {
      ok: true,
      state: applyPassProtectionForActivePlayer(
        continuedState,
        requester.type === 'human' ? requester.id : updatedState.lastHumanPlayerId,
        requester.type === 'human' ? requester.name : updatedState.previousHumanName
      ),
    };
  }

  // 3. Otherwise turn ends!
  // In multi-human tables, if a human just drew a card and lost the turn, pause briefly so they
  // can see the drawn card on screen before hiding the board behind Pass-and-Play!
  const humanCount = updatedState.players.filter((p) => p.type === 'human').length;
  if (requester.type === 'human' && humanCount > 1) {
    return {
      ok: true,
      state: {
        ...updatedState,
        pendingTurnAdvance: true,
        phase: 'reveal-pause',
      },
    };
  }

  // For solo human vs bots or bot turns, advance immediately to next eligible player
  return {
    ok: true,
    state: advanceTurn(updatedState),
  };
}

export function acknowledgeTurnEnd(
  state: GoFishGameState
): GoFishMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already completed.');
  }
  if (!state.pendingTurnAdvance) {
    return fail(state, 'No turn transition is waiting for confirmation.');
  }
  return {
    ok: true,
    state: advanceTurn({
      ...state,
      pendingTurnAdvance: false,
    }),
  };
}

export function executeBotTurnStep(
  state: GoFishGameState,
  rng: () => number = Math.random
): GoFishMoveResult {
  if (state.status !== 'PLAYING') {
    return fail(state, 'The game has already ended.');
  }
  if (state.awaitingPassConfirmation) {
    return fail(state, 'Cannot run bot turn during Pass-and-Play handover.');
  }
  if (state.pendingTurnAdvance) {
    return fail(state, 'Waiting for turn transition confirmation.');
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.type !== 'bot') {
    return fail(state, 'Current player is not a bot.');
  }

  const observation = createBotObservation(state, currentPlayer.id);
  const action = selectBotAction(
    observation,
    currentPlayer.difficulty ?? 'normal',
    rng
  );

  return resolveRequest(state, currentPlayer.id, action.opponentId, action.rank);
}

export function getPublicGoFishView(state: GoFishGameState): PublicGoFishView {
  const players: PublicGoFishPlayerSummary[] = state.players.map((p, idx) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    difficulty: p.difficulty,
    turnOrder: p.turnOrder,
    handCount: p.hand.length,
    books: p.books,
    bookCount: p.books.length,
    isInactiveForAsking: p.isInactiveForAsking,
    isCurrentTurn: idx === state.currentPlayerIndex,
  }));

  const currentPlayerSummary = players[state.currentPlayerIndex];
  const currentPlayerFull = state.players[state.currentPlayerIndex];
  const humanPlayers = state.players.filter((p) => p.type === 'human');

  // Privacy rule:
  // - Never expose hands when awaitingPassConfirmation.
  // - In Pass-and-Play / Mixed with 2+ humans, show ONLY the active human player's hand,
  //   and hide hands during bot turns so no previous human's hand lingers on screen.
  // - In solo vs-bots (1 human), keep that 1 human's hand visible even while bots take turns.
  let visibleHand: GoFishGameState['players'][number]['hand'] | null = null;
  let visibleOwnerId: string | null = null;
  if (!state.awaitingPassConfirmation && state.status !== 'GAME_OVER') {
    if (currentPlayerFull.type === 'human') {
      visibleHand = currentPlayerFull.hand;
      visibleOwnerId = currentPlayerFull.id;
    } else if (humanPlayers.length === 1) {
      visibleHand = humanPlayers[0].hand;
      visibleOwnerId = humanPlayers[0].id;
    }
  }

  const visibleHandIds = new Set((visibleHand ?? []).map((c) => c.id));
  const rawPickedUpCards =
    visibleOwnerId !== null
      ? state.lastDrawnCardsByPlayer[visibleOwnerId] ?? []
      : [];
  const lastPickedUpCards = visibleHand
    ? rawPickedUpCards.filter((c) => visibleHandIds.has(c.id))
    : [];
  const newlyDrawnCardIds = lastPickedUpCards.map((c) => c.id);
  const resolvedNewlyDrawnCardId =
    visibleHand &&
    state.newlyDrawnCardId &&
    visibleHandIds.has(state.newlyDrawnCardId)
      ? state.newlyDrawnCardId
      : newlyDrawnCardIds[0] ?? null;

  const availableRanks =
    visibleHand && currentPlayerFull.type === 'human' && !state.pendingTurnAdvance
      ? getAvailableRanksForPlayer(currentPlayerFull)
      : [];

  const eligibleOpponents = players.filter(
    (p) => p.id !== currentPlayerSummary.id && p.handCount > 0 && !p.isInactiveForAsking
  );

  let projectedOutcome: PublicGoFishView['lastOutcome'] = null;
  if (state.lastOutcome) {
    const isActiveHumanRequester =
      !state.awaitingPassConfirmation &&
      ((currentPlayerFull.type === 'human' &&
        currentPlayerFull.id === state.lastOutcome.requesterId) ||
        (humanPlayers.length === 1 &&
          humanPlayers[0].id === state.lastOutcome.requesterId));

    const canSeeDrawnCard =
      state.lastOutcome.drawnCardPubliclyShown || isActiveHumanRequester;

    projectedOutcome = {
      id: state.lastOutcome.id,
      turnNumber: state.lastOutcome.turnNumber,
      requesterId: state.lastOutcome.requesterId,
      requesterName: state.lastOutcome.requesterName,
      opponentId: state.lastOutcome.opponentId,
      opponentName: state.lastOutcome.opponentName,
      rank: state.lastOutcome.rank,
      kind: state.lastOutcome.kind,
      cardsTransferred: state.lastOutcome.cardsTransferred,
      transferredCards: state.lastOutcome.transferredCards,
      drawnCard: canSeeDrawnCard ? state.lastOutcome.drawnCard : null,
      drawnCardPubliclyShown: state.lastOutcome.drawnCardPubliclyShown,
      completedBooks: state.lastOutcome.completedBooks,
      refilledCount: state.lastOutcome.refilledCount,
      opponentRefilledCount: state.lastOutcome.opponentRefilledCount,
      grantsAnotherTurn: state.lastOutcome.grantsAnotherTurn,
      publicMessage: state.lastOutcome.publicMessage,
      message: isActiveHumanRequester
        ? state.lastOutcome.privateMessage
        : state.lastOutcome.publicMessage,
    };
  }

  return {
    status: state.status,
    phase: state.phase,
    mode: state.mode,
    direction: state.direction,
    rules: state.rules,
    players,
    currentPlayer: currentPlayerSummary,
    visibleHand,
    availableRanks,
    eligibleOpponents,
    newlyDrawnCardId: resolvedNewlyDrawnCardId,
    newlyDrawnCardIds,
    lastPickedUpCards,
    drawPileCount: state.drawPile.length,
    totalBooksCompleted: getTotalCompletedBooks(state.players),
    turnNumber: state.turnNumber,
    awaitingPassConfirmation: state.awaitingPassConfirmation,
    pendingTurnAdvance: state.pendingTurnAdvance,
    previousHumanName: state.previousHumanName,
    lastOutcome: projectedOutcome,
    outcomeHistory: state.outcomeHistory.map((item) => ({
      id: item.id,
      turnNumber: item.turnNumber,
      publicMessage: item.publicMessage,
    })),
    winnerIds: state.winnerIds,
    isTie: state.isTie,
    isStalemate: state.isStalemate,
    standings: state.standings,
    lastActionSummary: state.lastActionSummary,
  };
}
