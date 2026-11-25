import type {
  JokerCard,
  PlayingCard,
  SevensRulesConfig,
  StandardCard,
  TableSet,
  ValidationResult,
} from './types';

function hasDuplicateCardIds(cards: readonly PlayingCard[]): boolean {
  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.id)) return true;
    seen.add(card.id);
  }
  return false;
}

export function validateMatchingSet(cards: readonly PlayingCard[]): ValidationResult {
  if (cards.length < 3) {
    return {
      valid: false,
      reason: 'A matching set must contain at least 3 cards.',
    };
  }

  if (cards.length > 4) {
    return {
      valid: false,
      reason: 'A matching set can contain at most 4 cards (one per suit).',
    };
  }

  if (hasDuplicateCardIds(cards)) {
    return {
      valid: false,
      reason: 'Duplicate cards cannot be included in the same set.',
    };
  }

  const standardCards = cards.filter((c): c is StandardCard => c.kind === 'standard');
  const jokers = cards.filter((c): c is JokerCard => c.kind === 'joker');

  if (standardCards.length === 0) {
    return {
      valid: false,
      reason: 'A matching set must contain at least one standard card to set the rank.',
    };
  }

  const targetRank = standardCards[0].rank;
  const suitsSeen = new Set<string>();

  for (const card of standardCards) {
    if (card.rank !== targetRank) {
      return {
        valid: false,
        reason: 'All non-Joker cards in a matching set must have the same rank.',
      };
    }
    if (suitsSeen.has(card.suit)) {
      return {
        valid: false,
        reason: 'A matching set must use different suits.',
      };
    }
    suitsSeen.add(card.suit);
  }

  return {
    valid: true,
    setType: 'matching',
    orderedCards: [...standardCards, ...jokers],
  };
}

function tryBuildConsecutiveSequence(
  standardCards: StandardCard[],
  jokers: JokerCard[],
  aceHigh: boolean
): PlayingCard[] | null {
  const rankValue = (card: StandardCard) =>
    aceHigh && card.rank === 1 ? 14 : card.rank;

  const sorted = [...standardCards].sort((a, b) => rankValue(a) - rankValue(b));

  // Ensure strictly unique ranks
  for (let i = 1; i < sorted.length; i += 1) {
    if (rankValue(sorted[i]) === rankValue(sorted[i - 1])) {
      return null;
    }
  }

  const minVal = rankValue(sorted[0]);
  const maxVal = rankValue(sorted[sorted.length - 1]);
  const spanLength = maxVal - minVal + 1;
  const internalGaps = spanLength - sorted.length;

  if (internalGaps > jokers.length) {
    return null;
  }

  const minBound = aceHigh ? 2 : 1;
  const maxBound = aceHigh ? 14 : 13;
  const totalCards = sorted.length + jokers.length;

  if (totalCards > maxBound - minBound + 1) {
    return null;
  }

  const byRank = new Map<number, StandardCard>();
  for (const card of sorted) {
    byRank.set(rankValue(card), card);
  }

  const ordered: PlayingCard[] = [];
  let jokerCursor = 0;

  // Fill internal span first
  for (let v = minVal; v <= maxVal; v += 1) {
    const existing = byRank.get(v);
    if (existing) {
      ordered.push(existing);
    } else {
      ordered.push(jokers[jokerCursor]);
      jokerCursor += 1;
    }
  }

  // Place remaining jokers cleanly at high end first, then low end
  let nextHigh = maxVal + 1;
  while (jokerCursor < jokers.length && nextHigh <= maxBound) {
    ordered.push(jokers[jokerCursor]);
    jokerCursor += 1;
    nextHigh += 1;
  }

  let nextLow = minVal - 1;
  while (jokerCursor < jokers.length && nextLow >= minBound) {
    ordered.unshift(jokers[jokerCursor]);
    jokerCursor += 1;
    nextLow -= 1;
  }

  return jokerCursor === jokers.length ? ordered : null;
}

export function validateConsecutiveRun(cards: readonly PlayingCard[]): ValidationResult {
  if (cards.length < 3) {
    return {
      valid: false,
      reason: 'A consecutive run must contain at least 3 cards.',
    };
  }

  if (cards.length > 13) {
    return {
      valid: false,
      reason: 'A consecutive run cannot exceed 13 cards in a single suit.',
    };
  }

  if (hasDuplicateCardIds(cards)) {
    return {
      valid: false,
      reason: 'Duplicate cards cannot be included in the same run.',
    };
  }

  const standardCards = cards.filter((c): c is StandardCard => c.kind === 'standard');
  const jokers = cards.filter((c): c is JokerCard => c.kind === 'joker');

  if (standardCards.length === 0) {
    return {
      valid: false,
      reason: 'A consecutive run must contain at least one standard card to set the suit.',
    };
  }

  const targetSuit = standardCards[0].suit;
  for (const card of standardCards) {
    if (card.suit !== targetSuit) {
      return {
        valid: false,
        reason: 'All non-Joker cards in a consecutive run must belong to the same suit.',
      };
    }
  }

  // Try Ace-low (A-2-3...) first, then Ace-high (...Q-K-A)
  const lowAceOrder = tryBuildConsecutiveSequence(standardCards, jokers, false);
  if (lowAceOrder) {
    return {
      valid: true,
      setType: 'run',
      orderedCards: lowAceOrder,
    };
  }

  const highAceOrder = tryBuildConsecutiveSequence(standardCards, jokers, true);
  if (highAceOrder) {
    return {
      valid: true,
      setType: 'run',
      orderedCards: highAceOrder,
    };
  }

  return {
    valid: false,
    reason:
      'Cards must form consecutive ranks in the same suit (no gaps unless filled by a Joker, and no King-Ace-2 wrap-around).',
  };
}

export function validateNewSet(cards: readonly PlayingCard[]): ValidationResult {
  if (cards.length < 3) {
    return {
      valid: false,
      reason: 'A new set must contain at least 3 cards.',
    };
  }

  const matching = validateMatchingSet(cards);
  if (matching.valid) {
    return matching;
  }

  const run = validateConsecutiveRun(cards);
  if (run.valid) {
    return run;
  }

  return {
    valid: false,
    reason:
      'Selected cards do not form a valid matching set (3+ of the same rank, different suits) or consecutive run (3+ in sequence, same suit).',
  };
}

export function validateAddToSet(
  existingSet: TableSet,
  cardsToAdd: readonly PlayingCard[],
  rules: SevensRulesConfig
): ValidationResult {
  if (cardsToAdd.length === 0) {
    return { valid: false, reason: 'Select at least one card to add to the set.' };
  }

  if (!rules.allowExtendJokerSets && existingSet.cards.some((c) => c.kind === 'joker')) {
    return {
      valid: false,
      reason: 'Current house rules do not allow extending sets that contain a Joker.',
    };
  }

  const combined = [...existingSet.cards, ...cardsToAdd];
  if (existingSet.type === 'matching') {
    return validateMatchingSet(combined);
  }
  return validateConsecutiveRun(combined);
}

export function validateReplaceJoker(
  existingSet: TableSet,
  replacementCard: PlayingCard
): {
  valid: boolean;
  reason?: string;
  orderedCards?: PlayingCard[];
  retrievedJoker?: JokerCard;
} {
  if (replacementCard.kind !== 'standard') {
    return {
      valid: false,
      reason: 'Only a standard card can replace a Joker on the table.',
    };
  }

  const jokerIndex = existingSet.cards.findIndex((c) => c.kind === 'joker');
  if (jokerIndex === -1) {
    return {
      valid: false,
      reason: 'This set does not contain a Joker to replace.',
    };
  }

  const retrievedJoker = existingSet.cards[jokerIndex] as JokerCard;

  // Test replacing that Joker with the candidate card, keeping all other cards intact
  const candidateCards = existingSet.cards.map((card, idx) =>
    idx === jokerIndex ? replacementCard : card
  );

  const validation =
    existingSet.type === 'matching'
      ? validateMatchingSet(candidateCards)
      : validateConsecutiveRun(candidateCards);

  if (!validation.valid || !validation.orderedCards) {
    return {
      valid: false,
      reason:
        'That card does not match the missing card represented by the Joker in this set.',
    };
  }

  return {
    valid: true,
    orderedCards: validation.orderedCards,
    retrievedJoker,
  };
}

export function canDiscardCard(
  card: PlayingCard,
  hand: readonly PlayingCard[],
  rules: SevensRulesConfig
): { valid: boolean; reason?: string } {
  if (card.kind === 'joker' && !rules.allowDiscardJoker) {
    // Safety valve: if player literally only holds Jokers, allow discard so turn cannot deadlock
    const hasStandard = hand.some((c) => c.kind === 'standard');
    if (hasStandard) {
      return {
        valid: false,
        reason: 'Current house rules prohibit discarding a Joker while you hold standard cards.',
      };
    }
  }
  return { valid: true };
}
