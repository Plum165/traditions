import type {
  CardRank,
  JokerCard,
  PlayingCard,
  StandardCard,
  StandardSuit,
  StartingHandSize,
} from './types';

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

export function createDeck(): PlayingCard[] {
  const cards: PlayingCard[] = [];

  for (const suit of STANDARD_SUITS) {
    for (const rank of CARD_RANKS) {
      const card: StandardCard = {
        id: `${suit}-${rank}`,
        kind: 'standard',
        rank,
        suit,
      };
      cards.push(card);
    }
  }

  const joker1: JokerCard = { id: 'joker-1', kind: 'joker', jokerIndex: 1 };
  const joker2: JokerCard = { id: 'joker-2', kind: 'joker', jokerIndex: 2 };
  cards.push(joker1, joker2);

  return cards;
}

export function shuffleDeck(
  deck: readonly PlayingCard[],
  rng: () => number = Math.random
): PlayingCard[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function sortHand(hand: readonly PlayingCard[]): PlayingCard[] {
  const suitOrder: Record<StandardSuit, number> = {
    diamonds: 0,
    hearts: 1,
    spades: 2,
    clubs: 3,
  };

  return [...hand].sort((a, b) => {
    if (a.kind === 'joker' && b.kind === 'joker') {
      return a.jokerIndex - b.jokerIndex;
    }
    if (a.kind === 'joker') return 1;
    if (b.kind === 'joker') return -1;
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

export function dealHands(
  deck: readonly PlayingCard[],
  playerCount: 2 | 3 | 4,
  handSize: StartingHandSize
): { hands: PlayingCard[][]; remainingDeck: PlayingCard[] } {
  const totalNeeded = playerCount * handSize;
  if (deck.length < totalNeeded) {
    throw new Error(
      `Cannot deal ${handSize} cards to ${playerCount} players from a ${deck.length}-card deck.`
    );
  }

  const hands: PlayingCard[][] = Array.from({ length: playerCount }, () => []);
  let cursor = 0;

  for (let round = 0; round < handSize; round += 1) {
    for (let p = 0; p < playerCount; p += 1) {
      hands[p].push(deck[cursor]);
      cursor += 1;
    }
  }

  return {
    hands: hands.map((hand) => sortHand(hand)),
    remainingDeck: deck.slice(cursor),
  };
}
