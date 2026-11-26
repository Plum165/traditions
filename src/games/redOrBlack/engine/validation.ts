import { SUIT_NAMES, type StandardCard } from '../../../types/playingCard';
import { formatCardLabel, getCardColour, getCardValue } from './deck';
import type { AceRanking, QuestionNumber, RedOrBlackPrediction } from './types';

export interface PredictionEvaluation {
  valid: boolean;
  correct: boolean;
  reason: string;
}

export function evaluatePrediction(
  prediction: RedOrBlackPrediction,
  revealedCard: StandardCard,
  sequenceCards: readonly StandardCard[],
  aceRanking: AceRanking,
  expectedQuestion?: QuestionNumber
): PredictionEvaluation {
  if (expectedQuestion && prediction.question !== expectedQuestion) {
    return {
      valid: false,
      correct: false,
      reason: `Expected Question ${expectedQuestion}, received Question ${prediction.question}.`,
    };
  }

  const cardText = formatCardLabel(revealedCard);

  switch (prediction.question) {
    case 1: {
      const actualColour = getCardColour(revealedCard);
      const correct = actualColour === prediction.choice;
      const colourLabel = actualColour === 'red' ? 'Red' : 'Black';
      return {
        valid: true,
        correct,
        reason: correct
          ? `${cardText} is ${colourLabel}.`
          : `${cardText} is ${colourLabel}, not ${
              prediction.choice === 'red' ? 'Red' : 'Black'
            }.`,
      };
    }

    case 2: {
      if (sequenceCards.length < 1) {
        return {
          valid: false,
          correct: false,
          reason: 'Question 2 requires a first card to compare against.',
        };
      }
      const firstCard = sequenceCards[0];
      const firstValue = getCardValue(firstCard, aceRanking);
      const nextValue = getCardValue(revealedCard, aceRanking);
      const firstText = formatCardLabel(firstCard);

      if (nextValue === firstValue) {
        return {
          valid: true,
          correct: false,
          reason: `${cardText} equals ${firstText} in rank (equal values miss by default).`,
        };
      }

      const isHigher = nextValue > firstValue;
      const correct =
        (prediction.choice === 'higher' && isHigher) ||
        (prediction.choice === 'lower' && !isHigher);

      return {
        valid: true,
        correct,
        reason: correct
          ? `${cardText} is ${isHigher ? 'higher' : 'lower'} than ${firstText}.`
          : `${cardText} is ${isHigher ? 'higher' : 'lower'} than ${firstText}, not ${prediction.choice}.`,
      };
    }

    case 3: {
      if (sequenceCards.length < 2) {
        return {
          valid: false,
          correct: false,
          reason: 'Question 3 requires two boundary cards to compare against.',
        };
      }
      const firstValue = getCardValue(sequenceCards[0], aceRanking);
      const secondValue = getCardValue(sequenceCards[1], aceRanking);
      const low = Math.min(firstValue, secondValue);
      const high = Math.max(firstValue, secondValue);
      const nextValue = getCardValue(revealedCard, aceRanking);
      const lowText = formatCardLabel(
        firstValue <= secondValue ? sequenceCards[0] : sequenceCards[1]
      );
      const highText = formatCardLabel(
        firstValue <= secondValue ? sequenceCards[1] : sequenceCards[0]
      );

      if (nextValue === low || nextValue === high) {
        return {
          valid: true,
          correct: false,
          reason: `${cardText} matches a boundary card (${lowText}–${highText}), which misses by default.`,
        };
      }

      const isInside = nextValue > low && nextValue < high;
      const correct =
        (prediction.choice === 'inside' && isInside) ||
        (prediction.choice === 'outside' && !isInside);

      return {
        valid: true,
        correct,
        reason: correct
          ? `${cardText} is ${isInside ? 'inside' : 'outside'} ${lowText} and ${highText}.`
          : `${cardText} is ${isInside ? 'inside' : 'outside'} ${lowText} and ${highText}, not ${prediction.choice}.`,
      };
    }

    case 4: {
      const correct = revealedCard.suit === prediction.choice;
      return {
        valid: true,
        correct,
        reason: correct
          ? `${cardText} is ${SUIT_NAMES[revealedCard.suit]}.`
          : `${cardText} is ${SUIT_NAMES[revealedCard.suit]}, not ${SUIT_NAMES[prediction.choice]}.`,
      };
    }
  }
}
