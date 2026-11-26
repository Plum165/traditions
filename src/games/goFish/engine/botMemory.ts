import type { CardRank } from '../../../types/playingCard';
import type {
  BotObservation,
  GoFishGameState,
  PlayerMemory,
  PublicGoFishPlayerSummary,
} from './types';

export function recordPublicTurnMemory(
  memory: PlayerMemory,
  params: {
    requesterId: string;
    opponentId: string;
    rank: CardRank;
    cardsTransferred: number;
    completedBooks: { playerId: string; rank: CardRank }[];
    turnNumber: number;
  }
): PlayerMemory {
  const nextSuccessful =
    params.cardsTransferred > 0
      ? [
          ...memory.successfulRequests,
          {
            requesterId: params.requesterId,
            opponentId: params.opponentId,
            rank: params.rank,
            cardsTransferred: params.cardsTransferred,
            turnNumber: params.turnNumber,
          },
        ]
      : memory.successfulRequests;

  const nextFailed =
    params.cardsTransferred === 0
      ? [
          ...memory.failedRequests,
          {
            requesterId: params.requesterId,
            opponentId: params.opponentId,
            rank: params.rank,
            turnNumber: params.turnNumber,
          },
        ]
      : memory.failedRequests;

  const nextBooks =
    params.completedBooks.length > 0
      ? [
          ...memory.knownBookCollections,
          ...params.completedBooks.map((b) => ({
            playerId: b.playerId,
            rank: b.rank,
            turnNumber: params.turnNumber,
          })),
        ]
      : memory.knownBookCollections;

  return {
    ...memory,
    successfulRequests: nextSuccessful,
    failedRequests: nextFailed,
    knownBookCollections: nextBooks,
  };
}

export function createBotObservation(
  state: GoFishGameState,
  botId: string
): BotObservation {
  const bot = state.players.find((p) => p.id === botId);
  if (!bot) {
    throw new Error(`Bot player "${botId}" not found.`);
  }

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

  // Notice: BotObservation intentionally omits all other players' hands and the undealt drawPile.
  return {
    botId: bot.id,
    botHand: [...bot.hand],
    players,
    drawPileCount: state.drawPile.length,
    turnNumber: state.turnNumber,
    memory: {
      playerId: bot.id,
      successfulRequests: [...state.memory.successfulRequests],
      failedRequests: [...state.memory.failedRequests],
      knownBookCollections: [...state.memory.knownBookCollections],
    },
  };
}
