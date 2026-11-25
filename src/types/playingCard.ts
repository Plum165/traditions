export type StandardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface StandardCard {
  id: string;
  kind: 'standard';
  rank: CardRank;
  suit: StandardSuit;
}

export interface JokerCard {
  id: string;
  kind: 'joker';
  jokerIndex: 1 | 2;
}

export type PlayingCard = StandardCard | JokerCard;

export type CardTexture = 'archival' | 'classic';

export const STANDARD_SUITS: readonly StandardSuit[] = [
  'spades',
  'hearts',
  'diamonds',
  'clubs',
];

export const CARD_RANKS: readonly CardRank[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
];

export const SUIT_SYMBOLS: Record<StandardSuit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_NAMES: Record<StandardSuit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
};

export function formatRankLabel(rank: CardRank): string {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return String(rank);
  }
}

export function formatCardLabel(card: PlayingCard): string {
  if (card.kind === 'joker') {
    return `Joker ${card.jokerIndex}`;
  }
  return `${formatRankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]}`;
}
