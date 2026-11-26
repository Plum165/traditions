import type {
  GoFishGameResult,
  GoFishGameState,
  GoFishPlayer,
  GoFishStanding,
} from './types';

export const TOTAL_POSSIBLE_BOOKS = 13;

export function getTotalCompletedBooks(players: readonly GoFishPlayer[]): number {
  return players.reduce((sum, player) => sum + player.books.length, 0);
}

export function calculateWinner(
  players: readonly GoFishPlayer[],
  isStalemate = false
): GoFishGameResult {
  const sorted = [...players].sort((a, b) => {
    if (b.books.length !== a.books.length) {
      return b.books.length - a.books.length;
    }
    if (a.hand.length !== b.hand.length) {
      return a.hand.length - b.hand.length;
    }
    return a.turnOrder - b.turnOrder;
  });

  const highestBooks = sorted[0]?.books.length ?? 0;
  const winnerIds = sorted
    .filter((p) => p.books.length === highestBooks)
    .map((p) => p.id);

  let currentRank = 1;
  const standings: GoFishStanding[] = sorted.map((player, index) => {
    if (index > 0 && player.books.length < sorted[index - 1].books.length) {
      currentRank = index + 1;
    }
    return {
      rank: currentRank,
      playerId: player.id,
      name: player.name,
      type: player.type,
      difficulty: player.difficulty,
      bookCount: player.books.length,
      handCount: player.hand.length,
      isWinner: player.books.length === highestBooks,
    };
  });

  return {
    winnerIds,
    isTie: winnerIds.length > 1,
    isStalemate,
    standings,
  };
}

export function checkVictoryCondition(state: GoFishGameState): {
  ended: boolean;
  isStalemate: boolean;
  reason: string | null;
} {
  const totalBooks = getTotalCompletedBooks(state.players);
  if (totalBooks >= TOTAL_POSSIBLE_BOOKS) {
    return {
      ended: true,
      isStalemate: false,
      reason: 'All 13 books have been completed.',
    };
  }

  const drawEmpty = state.drawPile.length === 0;
  const playersWithCards = state.players.filter((p) => p.hand.length > 0);

  if (drawEmpty && playersWithCards.length === 0) {
    return {
      ended: true,
      isStalemate: false,
      reason: 'The Fish Pond and all player hands are empty.',
    };
  }

  if (drawEmpty && playersWithCards.length < 2) {
    return {
      ended: true,
      isStalemate: true,
      reason:
        'The Fish Pond is empty and no opponents have cards remaining to ask.',
    };
  }

  if (
    drawEmpty &&
    playersWithCards.length > 0 &&
    playersWithCards.every((p) => state.stalePlayerIds.includes(p.id))
  ) {
    return {
      ended: true,
      isStalemate: true,
      reason:
        'A full round passed with the Fish Pond empty and no cards transferred or books completed.',
    };
  }

  return { ended: false, isStalemate: false, reason: null };
}
