import type { BotDifficulty } from '../../../types/multiplayer';
import { STANDARD_SUITS, type StandardCard, type StandardSuit } from '../../../types/playingCard';
import { createDeck, getCardColour, getCardValue } from './deck';
import type {
  AceRanking,
  ColourGuess,
  HigherLowerGuess,
  InsideOutsideGuess,
  QuestionNumber,
  RedOrBlackPrediction,
} from './types';

export interface BotDecisionContext {
  currentQuestion: QuestionNumber;
  sequenceCards: readonly StandardCard[];
  knownRevealedCards: readonly StandardCard[];
  aceRanking: AceRanking;
  difficulty: BotDifficulty;
}

function pickRandom<T>(items: readonly T[], rng: () => number): T {
  const index = Math.floor(rng() * items.length);
  return items[Math.min(index, items.length - 1)];
}

function chooseFromPool(
  context: BotDecisionContext,
  pool: readonly StandardCard[],
  rng: () => number
): RedOrBlackPrediction {
  const { currentQuestion, sequenceCards, aceRanking } = context;

  switch (currentQuestion) {
    case 1: {
      let redCount = 0;
      let blackCount = 0;
      for (const card of pool) {
        if (getCardColour(card) === 'red') redCount += 1;
        else blackCount += 1;
      }
      if (redCount > blackCount) return { question: 1, choice: 'red' };
      if (blackCount > redCount) return { question: 1, choice: 'black' };
      return {
        question: 1,
        choice: pickRandom<ColourGuess>(['red', 'black'], rng),
      };
    }

    case 2: {
      const anchor = sequenceCards[0];
      if (!anchor) {
        return {
          question: 2,
          choice: pickRandom<HigherLowerGuess>(['higher', 'lower'], rng),
        };
      }
      const anchorVal = getCardValue(anchor, aceRanking);
      let higherCount = 0;
      let lowerCount = 0;
      for (const card of pool) {
        const val = getCardValue(card, aceRanking);
        if (val > anchorVal) higherCount += 1;
        else if (val < anchorVal) lowerCount += 1;
      }
      if (higherCount > lowerCount) return { question: 2, choice: 'higher' };
      if (lowerCount > higherCount) return { question: 2, choice: 'lower' };
      return {
        question: 2,
        choice: pickRandom<HigherLowerGuess>(['higher', 'lower'], rng),
      };
    }

    case 3: {
      const card1 = sequenceCards[0];
      const card2 = sequenceCards[1];
      if (!card1 || !card2) {
        return {
          question: 3,
          choice: pickRandom<InsideOutsideGuess>(['inside', 'outside'], rng),
        };
      }
      const v1 = getCardValue(card1, aceRanking);
      const v2 = getCardValue(card2, aceRanking);
      const low = Math.min(v1, v2);
      const high = Math.max(v1, v2);
      let insideCount = 0;
      let outsideCount = 0;
      for (const card of pool) {
        const val = getCardValue(card, aceRanking);
        if (val > low && val < high) insideCount += 1;
        else if (val < low || val > high) outsideCount += 1;
      }
      if (insideCount > outsideCount) return { question: 3, choice: 'inside' };
      if (outsideCount > insideCount) return { question: 3, choice: 'outside' };
      return {
        question: 3,
        choice: pickRandom<InsideOutsideGuess>(['inside', 'outside'], rng),
      };
    }

    case 4: {
      const suitCounts: Record<StandardSuit, number> = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0,
      };
      for (const card of pool) {
        suitCounts[card.suit] += 1;
      }
      const maxCount = Math.max(...STANDARD_SUITS.map((s) => suitCounts[s]));
      const bestSuits = STANDARD_SUITS.filter((s) => suitCounts[s] === maxCount);
      return {
        question: 4,
        choice: pickRandom(bestSuits, rng),
      };
    }
  }
}

/**
 * Computes a bot prediction using strictly public board state (never inspecting unrevealed drawPile).
 */
export function chooseBotPrediction(
  context: BotDecisionContext,
  rng: () => number = Math.random
): RedOrBlackPrediction {
  const { currentQuestion, sequenceCards, knownRevealedCards, difficulty } = context;

  if (difficulty === 'easy') {
    switch (currentQuestion) {
      case 1:
        return { question: 1, choice: pickRandom<ColourGuess>(['red', 'black'], rng) };
      case 2:
        return { question: 2, choice: pickRandom<HigherLowerGuess>(['higher', 'lower'], rng) };
      case 3:
        return { question: 3, choice: pickRandom<InsideOutsideGuess>(['inside', 'outside'], rng) };
      case 4:
        return { question: 4, choice: pickRandom(STANDARD_SUITS, rng) };
    }
  }

  const fullDeck = createDeck();

  if (difficulty === 'normal') {
    // Normal evaluates baseline probability excluding only the currently visible sequence cards
    const activeIds = new Set(sequenceCards.map((c) => c.id));
    const baselinePool = fullDeck.filter((c) => !activeIds.has(c.id));
    return chooseFromPool(context, baselinePool, rng);
  }

  // Hard tracks every revealed card observed so far to compute exact remaining-deck odds
  const revealedIds = new Set(knownRevealedCards.map((c) => c.id));
  for (const card of sequenceCards) {
    revealedIds.add(card.id);
  }
  const remainingPool = fullDeck.filter((c) => !revealedIds.has(c.id));
  const poolToUse = remainingPool.length > 0 ? remainingPool : fullDeck;
  return chooseFromPool(context, poolToUse, rng);
}
