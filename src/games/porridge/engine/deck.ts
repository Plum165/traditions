import {
  CARD_RANKS,
  STANDARD_SUITS,
  SUIT_NAMES,
  SUIT_SYMBOLS,
  formatCardLabel,
  formatRankLabel,
  type StandardCard,
} from '../../../types/playingCard';

export { SUIT_NAMES, SUIT_SYMBOLS, formatCardLabel, formatRankLabel };

/**
 * Generates a standard 52-card playing deck (4 suits × 13 ranks, no Jokers).
 */
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

/**
 * Pure Fisher-Yates shuffle returning a new array without mutating input.
 */
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
