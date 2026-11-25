import type { CardRank, StandardCard, StandardSuit } from '../../../types/playingCard';
import { SUIT_NAMES, SUIT_SYMBOLS, formatCardLabel } from './deck';
import type {
  AceRankingMode,
  PorridgeRuleVariation,
  PorridgeRulesConfig,
  RuleEvaluationResult,
} from './types';

export type CardColour = 'red' | 'black';

const CARD_COLOUR_MAP: Record<StandardSuit, CardColour> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

/**
 * Central rank value mapping supporting configurable Ace ranking (default: Ace high).
 */
export function getCardRankValue(
  rank: CardRank,
  aceRanking: AceRankingMode = 'ace-high'
): number {
  if (rank === 1) {
    return aceRanking === 'ace-high' ? 14 : 1;
  }
  return rank;
}

export function getCardColour(suit: StandardSuit): CardColour {
  return CARD_COLOUR_MAP[suit];
}

export function formatColourLabel(colour: CardColour): string {
  return colour === 'red' ? 'Red' : 'Black';
}

/**
 * Version One: Same-Suit Porridge.
 * Compares the newly revealed card's suit against the previous top card of the central pile.
 */
export function resolveSameSuitRule(
  newCard: StandardCard,
  previousCard: StandardCard | null
): RuleEvaluationResult {
  if (!previousCard) {
    return {
      shouldCollect: false,
      comparisonCard: null,
      reason: `${formatCardLabel(newCard)} starts a fresh central porridge pile.`,
    };
  }

  const sameSuit = newCard.suit === previousCard.suit;
  const suitLabel = `${SUIT_NAMES[newCard.suit]} ${SUIT_SYMBOLS[newCard.suit]}`;

  if (sameSuit) {
    return {
      shouldCollect: true,
      comparisonCard: previousCard,
      reason: `${formatCardLabel(newCard)} matches ${formatCardLabel(previousCard)} (${suitLabel}) — pile collected!`,
    };
  }

  return {
    shouldCollect: false,
    comparisonCard: previousCard,
    reason: `${formatCardLabel(newCard)} does not match ${formatCardLabel(previousCard)} (${SUIT_NAMES[previousCard.suit]}).`,
  };
}

/**
 * Version Two: Highest-Colour Porridge (House Rule).
 * Compares the newly revealed card against the first card in the current central pile
 * (or previous top card if explicitly configured).
 */
export function resolveHighestColourRule(
  newCard: StandardCard,
  centralPileBeforeReveal: readonly StandardCard[],
  rules: Pick<PorridgeRulesConfig, 'aceRanking' | 'highestColourReference'> = {
    aceRanking: 'ace-high',
    highestColourReference: 'first-in-pile',
  }
): RuleEvaluationResult {
  if (centralPileBeforeReveal.length === 0) {
    return {
      shouldCollect: false,
      comparisonCard: null,
      reason: `${formatCardLabel(newCard)} starts a fresh central pile (${formatColourLabel(getCardColour(newCard.suit))}).`,
    };
  }

  const referenceCard =
    rules.highestColourReference === 'previous-top'
      ? centralPileBeforeReveal[centralPileBeforeReveal.length - 1]
      : centralPileBeforeReveal[0];

  const newColour = getCardColour(newCard.suit);
  const referenceColour = getCardColour(referenceCard.suit);
  const newValue = getCardRankValue(newCard.rank, rules.aceRanking);
  const refValue = getCardRankValue(referenceCard.rank, rules.aceRanking);

  if (newColour === referenceColour && newValue > refValue) {
    return {
      shouldCollect: true,
      comparisonCard: referenceCard,
      reason: `${formatCardLabel(newCard)} is ${formatColourLabel(newColour)} and higher than ${formatCardLabel(referenceCard)} — pile collected!`,
    };
  }

  if (newColour !== referenceColour) {
    return {
      shouldCollect: false,
      comparisonCard: referenceCard,
      reason: `${formatCardLabel(newCard)} (${formatColourLabel(newColour)}) is a different colour from ${formatCardLabel(referenceCard)} (${formatColourLabel(referenceColour)}).`,
    };
  }

  return {
    shouldCollect: false,
    comparisonCard: referenceCard,
    reason: `${formatCardLabel(newCard)} (${formatColourLabel(newColour)}) is not higher than ${formatCardLabel(referenceCard)}.`,
  };
}

export function evaluatePorridgeRule(
  variation: PorridgeRuleVariation,
  newCard: StandardCard,
  centralPileBeforeReveal: readonly StandardCard[],
  rules: PorridgeRulesConfig
): RuleEvaluationResult {
  if (variation === 'same-suit') {
    const previousCard =
      centralPileBeforeReveal.length > 0
        ? centralPileBeforeReveal[centralPileBeforeReveal.length - 1]
        : null;
    return resolveSameSuitRule(newCard, previousCard);
  }

  return resolveHighestColourRule(newCard, centralPileBeforeReveal, rules);
}
