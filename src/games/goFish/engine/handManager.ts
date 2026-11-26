import type { CardRank, StandardCard } from '../../../types/playingCard';
import { sortHandByRank } from './deck';
import type { GoFishPlayer } from './types';

export function getAvailableRanksForPlayer(player: GoFishPlayer): CardRank[] {
  const seen = new Set<CardRank>();
  for (const card of player.hand) {
    seen.add(card.rank);
  }
  return Array.from(seen).sort((a, b) => a - b);
}

export function addCardsToHand(
  hand: readonly StandardCard[],
  cards: readonly StandardCard[]
): StandardCard[] {
  return sortHandByRank([...hand, ...cards]);
}

export function removeRankFromHand(
  hand: readonly StandardCard[],
  rank: CardRank
): {
  removed: StandardCard[];
  remaining: StandardCard[];
} {
  const removed: StandardCard[] = [];
  const remaining: StandardCard[] = [];
  for (const card of hand) {
    if (card.rank === rank) {
      removed.push(card);
    } else {
      remaining.push(card);
    }
  }
  return {
    removed: sortHandByRank(removed),
    remaining: sortHandByRank(remaining),
  };
}
