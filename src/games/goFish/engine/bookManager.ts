import type { CardRank, StandardCard } from '../../../types/playingCard';
import { sortHandByRank } from './deck';
import type { CompletedBook, GoFishPlayer } from './types';

export function findCompletedBookRanks(hand: readonly StandardCard[]): CardRank[] {
  const counts = new Map<CardRank, number>();
  for (const card of hand) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  const completed: CardRank[] = [];
  for (const [rank, count] of counts.entries()) {
    if (count === 4) {
      completed.push(rank);
    }
  }
  return completed.sort((a, b) => a - b);
}

export function extractBooksFromPlayer(
  player: GoFishPlayer,
  turnNumber: number
): {
  player: GoFishPlayer;
  completedRanks: CardRank[];
} {
  const completedRanks = findCompletedBookRanks(player.hand);
  if (completedRanks.length === 0) {
    return { player, completedRanks: [] };
  }

  const completedSet = new Set<CardRank>(completedRanks);
  const newBooks: CompletedBook[] = completedRanks.map((rank) => ({
    rank,
    cards: sortHandByRank(player.hand.filter((card) => card.rank === rank)),
    completedOnTurn: turnNumber,
  }));

  const remainingHand = sortHandByRank(
    player.hand.filter((card) => !completedSet.has(card.rank))
  );

  return {
    player: {
      ...player,
      hand: remainingHand,
      books: [...player.books, ...newBooks],
    },
    completedRanks,
  };
}
