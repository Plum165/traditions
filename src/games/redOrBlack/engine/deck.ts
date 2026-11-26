import {
  CARD_RANKS,
  STANDARD_SUITS,
  SUIT_NAMES,
  formatCardLabel as sharedFormatCardLabel,
  type StandardCard,
} from '../../../types/playingCard';
import type { AceRanking, ColourGuess, RedOrBlackPrediction } from './types';

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
  cards: readonly StandardCard[],
  rng: () => number = Math.random
): StandardCard[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function getCardValue(card: StandardCard, aceRanking: AceRanking): number {
  if (card.rank === 1) {
    return aceRanking === 'ace-high' ? 14 : 1;
  }
  return card.rank;
}

export function getCardColour(card: StandardCard): ColourGuess {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
}

export function formatCardLabel(card: StandardCard): string {
  return sharedFormatCardLabel(card);
}

export function formatPredictionLabel(prediction: RedOrBlackPrediction): string {
  switch (prediction.question) {
    case 1:
      return prediction.choice === 'red' ? 'Red' : 'Black';
    case 2:
      return prediction.choice === 'higher' ? 'Higher' : 'Lower';
    case 3:
      return prediction.choice === 'inside' ? 'Inside' : 'Outside';
    case 4:
      return SUIT_NAMES[prediction.choice];
  }
}
