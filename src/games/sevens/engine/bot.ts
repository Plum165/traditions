import {
  addCardsToSet,
  discardCard,
  drawCard,
  playNewSet,
  replaceJokerInSet,
} from './gameEngine';
import type {
  GameState,
  JokerCard,
  PlayingCard,
  SevensRulesConfig,
  StandardCard,
  TableSet,
} from './types';
import {
  canDiscardCard,
  validateAddToSet,
  validateConsecutiveRun,
  validateMatchingSet,
  validateReplaceJoker,
} from './validation';

export type BotAction =
  | { type: 'DRAW'; source: 'draw-pile' | 'discard-pile' }
  | { type: 'PLAY_NEW_SET'; cardIds: string[] }
  | { type: 'REPLACE_JOKER'; setId: string; cardId: string }
  | { type: 'ADD_TO_SET'; setId: string; cardIds: string[] }
  | { type: 'DISCARD'; cardId: string };

function isJokerBlockedThisTurn(
  card: PlayingCard,
  retrievedJokerIds: readonly string[],
  rules: SevensRulesConfig
): boolean {
  return !rules.allowImmediateJokerReuse && retrievedJokerIds.includes(card.id);
}

function getAvailableHandCards(
  hand: readonly PlayingCard[],
  retrievedJokerIds: readonly string[],
  rules: SevensRulesConfig
): PlayingCard[] {
  return hand.filter((card) => !isJokerBlockedThisTurn(card, retrievedJokerIds, rules));
}

function findBestMatchingSet(
  hand: readonly PlayingCard[],
  requireFinalDiscard: boolean
): PlayingCard[] | null {
  const standardCards = hand.filter((c): c is StandardCard => c.kind === 'standard');
  const jokers = hand.filter((c): c is JokerCard => c.kind === 'joker');

  const byRank = new Map<number, StandardCard[]>();
  for (const card of standardCards) {
    const list = byRank.get(card.rank) ?? [];
    list.push(card);
    byRank.set(card.rank, list);
  }

  // Prefer natural 3-4 card matching sets first (save Jokers when possible)
  const candidates: PlayingCard[][] = [];

  for (const group of byRank.values()) {
    if (group.length >= 3) {
      candidates.push(group.slice(0, 4));
    } else if (group.length === 2 && jokers.length >= 1) {
      candidates.push([...group, jokers[0]]);
    } else if (group.length === 1 && jokers.length >= 2) {
      candidates.push([group[0], jokers[0], jokers[1]]);
    }
  }

  // Filter out candidates that violate requireFinalDiscard or validation
  const validCandidates = candidates.filter((candidate) => {
    if (requireFinalDiscard && hand.length - candidate.length < 1) {
      return false;
    }
    return validateMatchingSet(candidate).valid;
  });

  if (validCandidates.length === 0) {
    return null;
  }

  // Sort: fewest Jokers used first, then largest set size
  validCandidates.sort((a, b) => {
    const jokersA = a.filter((c) => c.kind === 'joker').length;
    const jokersB = b.filter((c) => c.kind === 'joker').length;
    if (jokersA !== jokersB) return jokersA - jokersB;
    return b.length - a.length;
  });

  return validCandidates[0];
}

function findBestConsecutiveRun(
  hand: readonly PlayingCard[],
  requireFinalDiscard: boolean
): PlayingCard[] | null {
  const standardCards = hand.filter((c): c is StandardCard => c.kind === 'standard');
  const jokers = hand.filter((c): c is JokerCard => c.kind === 'joker');

  const bySuit = new Map<string, StandardCard[]>();
  for (const card of standardCards) {
    const list = bySuit.get(card.suit) ?? [];
    list.push(card);
    bySuit.set(card.suit, list);
  }

  const candidates: PlayingCard[][] = [];

  for (const suitCards of bySuit.values()) {
    const sorted = [...suitCards].sort((a, b) => a.rank - b.rank);

    // 1. Check natural runs of 3+
    for (let start = 0; start < sorted.length; start += 1) {
      const run: StandardCard[] = [sorted[start]];
      for (let i = start + 1; i < sorted.length; i += 1) {
        if (sorted[i].rank === run[run.length - 1].rank + 1) {
          run.push(sorted[i]);
        } else {
          break;
        }
      }
      if (run.length >= 3) {
        candidates.push(run);
      }
    }

    // Check Q-K-A natural run
    const queen = sorted.find((c) => c.rank === 12);
    const king = sorted.find((c) => c.rank === 13);
    const ace = sorted.find((c) => c.rank === 1);
    if (queen && king && ace) {
      candidates.push([queen, king, ace]);
    }

    // 2. Check 2-card runs bridged or extended with 1 Joker
    if (jokers.length >= 1) {
      for (let i = 0; i < sorted.length - 1; i += 1) {
        const diff = sorted[i + 1].rank - sorted[i].rank;
        if (diff === 1 || diff === 2) {
          candidates.push([sorted[i], sorted[i + 1], jokers[0]]);
        }
      }
    }
  }

  const validCandidates = candidates.filter((candidate) => {
    if (requireFinalDiscard && hand.length - candidate.length < 1) {
      return false;
    }
    return validateConsecutiveRun(candidate).valid;
  });

  if (validCandidates.length === 0) {
    return null;
  }

  validCandidates.sort((a, b) => {
    const jokersA = a.filter((c) => c.kind === 'joker').length;
    const jokersB = b.filter((c) => c.kind === 'joker').length;
    if (jokersA !== jokersB) return jokersA - jokersB;
    return b.length - a.length;
  });

  return validCandidates[0];
}

function findJokerReplacementMove(
  hand: readonly PlayingCard[],
  tableSets: readonly TableSet[]
): { setId: string; cardId: string } | null {
  for (const set of tableSets) {
    if (!set.cards.some((c) => c.kind === 'joker')) continue;
    for (const card of hand) {
      if (card.kind !== 'standard') continue;
      if (validateReplaceJoker(set, card).valid) {
        return { setId: set.id, cardId: card.id };
      }
    }
  }
  return null;
}

function findAddToExistingSetMove(
  hand: readonly PlayingCard[],
  tableSets: readonly TableSet[],
  rules: SevensRulesConfig
): { setId: string; cardIds: string[] } | null {
  for (const set of tableSets) {
    for (const card of hand) {
      if (rules.requireFinalDiscard && hand.length - 1 < 1) {
        continue;
      }
      if (validateAddToSet(set, [card], rules).valid) {
        return { setId: set.id, cardIds: [card.id] };
      }
    }
  }
  return null;
}

/**
 * Scores a card's strategic value for keeping in hand. Lower score = better candidate to discard.
 */
function scoreKeepUtility(
  card: PlayingCard,
  hand: readonly PlayingCard[],
  tableSets: readonly TableSet[]
): number {
  if (card.kind === 'joker') {
    return 1000;
  }

  let score = 0;

  for (const other of hand) {
    if (other.id === card.id || other.kind !== 'standard') continue;

    // Matching rank partners are high priority in Sevens
    if (other.rank === card.rank) {
      score += 35;
    }

    // Same-suit adjacent or 1-gap connectors
    if (other.suit === card.suit) {
      const diff = Math.abs(other.rank - card.rank);
      if (diff === 1) score += 22;
      else if (diff === 2) score += 10;
    }
  }

  // Slight bonus if card could extend a table set soon
  for (const set of tableSets) {
    const firstStandard = set.cards.find((c): c is StandardCard => c.kind === 'standard');
    if (!firstStandard) continue;
    if (set.type === 'matching' && firstStandard.rank === card.rank) {
      score += 25;
    }
  }

  // Middle ranks (5-9) are slightly more flexible than extremes (A, 2, K)
  if (card.rank >= 5 && card.rank <= 9) {
    score += 3;
  }

  return score;
}

export function chooseStrategicDiscard(
  hand: readonly PlayingCard[],
  tableSets: readonly TableSet[],
  rules: SevensRulesConfig
): PlayingCard {
  const legalDiscards = hand.filter((card) => canDiscardCard(card, hand, rules).valid);
  const pool = legalDiscards.length > 0 ? legalDiscards : hand;

  const sorted = [...pool].sort((a, b) => {
    const utilA = scoreKeepUtility(a, hand, tableSets);
    const utilB = scoreKeepUtility(b, hand, tableSets);
    if (utilA !== utilB) return utilA - utilB;
    if (a.kind === 'standard' && b.kind === 'standard') {
      return b.rank - a.rank;
    }
    return 0;
  });

  return sorted[0];
}

/**
 * Computes the next legal deterministic action for the current bot player.
 * Bots only inspect their own hand and public table state (never other players' private hands).
 */
export function chooseBotNextAction(state: GameState): BotAction | null {
  if (state.status !== 'PLAYING') return null;

  const bot = state.players[state.currentPlayerIndex];
  if (bot.type !== 'bot') return null;

  if (state.phase === 'DRAW') {
    if (state.rules.allowDiscardPickupTop && state.discardPile.length > 0) {
      const topDiscard = state.discardPile[state.discardPile.length - 1];
      const hypotheticalHand = [...bot.hand, topDiscard];
      const createsMatching = findBestMatchingSet(
        hypotheticalHand,
        state.rules.requireFinalDiscard
      );
      if (createsMatching?.some((c) => c.id === topDiscard.id)) {
        return { type: 'DRAW', source: 'discard-pile' };
      }
    }
    return { type: 'DRAW', source: 'draw-pile' };
  }

  if (state.phase === 'PLAY') {
    const usableHand = getAvailableHandCards(
      bot.hand,
      state.retrievedJokerIdsThisTurn,
      state.rules
    );

    // Priority 1 & 2: Create at most one new set, prioritising Matching Sets over Consecutive Runs
    if (!state.hasCreatedNewSetThisTurn) {
      const matchingSet = findBestMatchingSet(usableHand, state.rules.requireFinalDiscard);
      if (matchingSet) {
        return {
          type: 'PLAY_NEW_SET',
          cardIds: matchingSet.map((c) => c.id),
        };
      }

      const consecutiveRun = findBestConsecutiveRun(
        usableHand,
        state.rules.requireFinalDiscard
      );
      if (consecutiveRun) {
        return {
          type: 'PLAY_NEW_SET',
          cardIds: consecutiveRun.map((c) => c.id),
        };
      }
    }

    // Priority 5/6: Replace Jokers on the table when holding the actual missing card
    const jokerReplacement = findJokerReplacementMove(bot.hand, state.tableSets);
    if (jokerReplacement) {
      return {
        type: 'REPLACE_JOKER',
        setId: jokerReplacement.setId,
        cardId: jokerReplacement.cardId,
      };
    }

    // Priority 5: Add cards to existing table sets
    const extendMove = findAddToExistingSetMove(usableHand, state.tableSets, state.rules);
    if (extendMove) {
      return {
        type: 'ADD_TO_SET',
        setId: extendMove.setId,
        cardIds: extendMove.cardIds,
      };
    }

    // Priority 7: Discard strategically to end turn
    const discard = chooseStrategicDiscard(bot.hand, state.tableSets, state.rules);
    return { type: 'DISCARD', cardId: discard.id };
  }

  const discard = chooseStrategicDiscard(bot.hand, state.tableSets, state.rules);
  return { type: 'DISCARD', cardId: discard.id };
}

export function applyBotAction(
  state: GameState,
  action: BotAction,
  rng: () => number = Math.random
): GameState {
  switch (action.type) {
    case 'DRAW':
      return drawCard(state, action.source, rng).state;
    case 'PLAY_NEW_SET':
      return playNewSet(state, action.cardIds).state;
    case 'REPLACE_JOKER':
      return replaceJokerInSet(state, action.setId, action.cardId).state;
    case 'ADD_TO_SET':
      return addCardsToSet(state, action.setId, action.cardIds).state;
    case 'DISCARD':
      return discardCard(state, action.cardId).state;
  }
}

/**
 * Executes a complete bot turn through the validated game engine until turn passes or game ends.
 */
export function executeFullBotTurn(
  initialState: GameState,
  rng: () => number = Math.random
): GameState {
  let state = initialState;
  const startingTurn = state.turnNumber;
  let safetyCounter = 0;

  while (
    state.status === 'PLAYING' &&
    state.turnNumber === startingTurn &&
    state.players[state.currentPlayerIndex].type === 'bot' &&
    safetyCounter < 20
  ) {
    const action = chooseBotNextAction(state);
    if (!action) break;
    const next = applyBotAction(state, action, rng);
    if (next === state) break;
    state = next;
    safetyCounter += 1;
  }

  return state;
}
