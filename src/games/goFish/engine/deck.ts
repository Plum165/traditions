import {
  CARD_RANKS,
  STANDARD_SUITS,
  formatCardLabel as sharedFormatCardLabel,
  formatRankLabel as sharedFormatRankLabel,
  type CardRank,
  type StandardCard,
} from '../../../types/playingCard';

export function createDeck(): StandardCard[] {
  const cards: StandardCard[] = [];
  for (const suit of STANDARD_SUITS) {
    for (const rank of CARD_RANKS) {
      cards.push({
        id: `${suit}-${rank}`,
        kind: 'standard',
        rank,
        suit,
      });
    }
  }
  return cards;
}

export function shuffleDeck(
  deck: readonly StandardCard[],
  rng: () => number = Math.random
): StandardCard[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function formatCardLabel(card: StandardCard): string {
  return sharedFormatCardLabel(card);
}

export function formatRankLabel(rank: CardRank): string {
  return sharedFormatRankLabel(rank);
}

export function formatRankPlural(rank: CardRank): string {
  switch (rank) {
    case 1:
      return 'Aces';
    case 6:
      return '6s';
    case 11:
      return 'Jacks';
    case 12:
      return 'Queens';
    case 13:
      return 'Kings';
    default:
      return `${rank}s`;
  }
}

export function formatRankName(rank: CardRank): string {
  switch (rank) {
    case 1:
      return 'Ace';
    case 11:
      return 'Jack';
    case 12:
      return 'Queen';
    case 13:
      return 'King';
    default:
      return String(rank);
  }
}

export function sortHandByRank(hand: readonly StandardCard[]): StandardCard[] {
  const suitOrder: Record<StandardCard['suit'], number> = {
    spades: 0,
    hearts: 1,
    diamonds: 2,
    clubs: 3,
  };
  return [...hand].sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}
