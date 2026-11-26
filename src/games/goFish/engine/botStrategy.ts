import type { BotDifficulty } from '../../../types/multiplayer';
import type { CardRank } from '../../../types/playingCard';
import type { BotAction, BotObservation, PlayerMemory } from './types';

interface RankEvidence {
  knownByOpponent: boolean;
  lastKnownTurn: number;
  lastDeniedTurn: number;
  lastGaveAwayTurn: number;
}

function getAvailableRanksFromHand(observation: BotObservation): CardRank[] {
  const counts = new Map<CardRank, number>();
  for (const card of observation.botHand) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  return Array.from(counts.keys()).sort((a, b) => a - b);
}

function getRankCountInHand(
  observation: BotObservation,
  rank: CardRank
): number {
  let count = 0;
  for (const card of observation.botHand) {
    if (card.rank === rank) count += 1;
  }
  return count;
}

function analyzeOpponentRankEvidence(
  memory: PlayerMemory,
  opponentId: string,
  rank: CardRank
): RankEvidence {
  let lastKnownTurn = -1;
  let lastDeniedTurn = -1;
  let lastGaveAwayTurn = -1;

  for (const success of memory.successfulRequests) {
    if (success.rank !== rank) continue;
    // If the opponent asked for this rank or received this rank, they held it on that turn.
    if (success.requesterId === opponentId) {
      lastKnownTurn = Math.max(lastKnownTurn, success.turnNumber);
    }
    // If the opponent gave away all cards of this rank, they had 0 right after that turn.
    if (success.opponentId === opponentId) {
      lastGaveAwayTurn = Math.max(lastGaveAwayTurn, success.turnNumber);
    }
  }

  for (const failed of memory.failedRequests) {
    if (failed.rank !== rank) continue;
    // Asking for a rank proves the requester held at least 1 card of that rank on that turn!
    if (failed.requesterId === opponentId) {
      lastKnownTurn = Math.max(lastKnownTurn, failed.turnNumber);
    }
    // Denying a rank proves the opponent had 0 cards of that rank on that turn.
    if (failed.opponentId === opponentId) {
      lastDeniedTurn = Math.max(lastDeniedTurn, failed.turnNumber);
    }
  }

  const booked = memory.knownBookCollections.some((b) => b.rank === rank);
  const invalidatedAt = Math.max(lastDeniedTurn, lastGaveAwayTurn);
  const knownByOpponent = !booked && lastKnownTurn > invalidatedAt;

  return {
    knownByOpponent,
    lastKnownTurn,
    lastDeniedTurn,
    lastGaveAwayTurn,
  };
}

function selectEasyBotAction(
  observation: BotObservation,
  eligibleOpponents: BotObservation['players'],
  availableRanks: CardRank[],
  rng: () => number
): BotAction {
  const oppIdx = Math.floor(rng() * eligibleOpponents.length);
  const rankIdx = Math.floor(rng() * availableRanks.length);
  return {
    opponentId: eligibleOpponents[oppIdx].id,
    rank: availableRanks[rankIdx],
  };
}

function selectNormalBotAction(
  observation: BotObservation,
  eligibleOpponents: BotObservation['players'],
  availableRanks: CardRank[],
  rng: () => number
): BotAction {
  let bestScore = -Infinity;
  let tiedBest: BotAction[] = [];

  for (const rank of availableRanks) {
    const myCount = getRankCountInHand(observation, rank);
    const multiplicityBonus = myCount === 3 ? 28 : myCount === 2 ? 16 : 4;

    for (const opp of eligibleOpponents) {
      const evidence = analyzeOpponentRankEvidence(
        observation.memory,
        opp.id,
        rank
      );

      let score = multiplicityBonus;
      if (evidence.knownByOpponent) {
        const turnsAgo = Math.max(0, observation.turnNumber - evidence.lastKnownTurn);
        score += Math.max(24, 52 - turnsAgo * 3);
      }

      if (evidence.lastDeniedTurn >= 0) {
        const turnsSinceDeny = observation.turnNumber - evidence.lastDeniedTurn;
        if (turnsSinceDeny <= 3 && evidence.lastKnownTurn < evidence.lastDeniedTurn) {
          score -= 35;
        } else if (observation.drawPileCount === 0 && evidence.lastKnownTurn < evidence.lastDeniedTurn) {
          // If Fish Pond is empty and opponent didn't get cards from anyone since denying, unlikely to have it
          score -= 22;
        } else if (turnsSinceDeny <= 6) {
          score -= 10;
        }
      }

      if (evidence.lastGaveAwayTurn >= 0 && evidence.lastKnownTurn <= evidence.lastGaveAwayTurn) {
        score -= 25;
      }

      // Slight preference for opponents with larger hands
      score += opp.handCount * 0.6;

      if (score > bestScore + 1e-6) {
        bestScore = score;
        tiedBest = [{ opponentId: opp.id, rank }];
      } else if (Math.abs(score - bestScore) <= 1e-6) {
        tiedBest.push({ opponentId: opp.id, rank });
      }
    }
  }

  const pickIdx = Math.floor(rng() * tiedBest.length);
  return tiedBest[pickIdx];
}

function selectHardBotAction(
  observation: BotObservation,
  eligibleOpponents: BotObservation['players'],
  availableRanks: CardRank[],
  rng: () => number
): BotAction {
  const totalOpponentCards = eligibleOpponents.reduce(
    (sum, opp) => sum + opp.handCount,
    0
  );
  const totalUnseenCards = totalOpponentCards + observation.drawPileCount;

  // Estimate per-rank likelihood for each opponent using public conservation & evidence
  let bestScore = -Infinity;
  let tiedBest: BotAction[] = [];

  for (const rank of availableRanks) {
    const myCount = getRankCountInHand(observation, rank);
    const unseenCopiesOfRank = Math.max(0, 4 - myCount);
    if (unseenCopiesOfRank === 0) continue;

    // Book completion urgency: holding 3 means 1 more completes a book immediately!
    const completionWeight = myCount === 3 ? 2.4 : myCount === 2 ? 1.55 : 1.0;

    for (const opp of eligibleOpponents) {
      const evidence = analyzeOpponentRankEvidence(
        observation.memory,
        opp.id,
        rank
      );

      // Baseline hypergeometric-style probability that opp holds >= 1 copy among unseen cards
      const safeDenominator = Math.max(1, totalUnseenCards);
      const baseProb =
        1 -
        Math.pow(
          Math.max(0, 1 - opp.handCount / safeDenominator),
          unseenCopiesOfRank
        );

      let estimatedProb = baseProb;

      if (evidence.knownByOpponent) {
        // Opponent recently asked for or received this rank and hasn't given it away or booked it
        const turnsAgo = Math.max(0, observation.turnNumber - evidence.lastKnownTurn);
        const recencyConfidence = Math.max(0.55, 0.96 - turnsAgo * 0.05);
        estimatedProb = Math.max(estimatedProb, recencyConfidence);
      } else {
        const lastZeroTurn = Math.max(
          evidence.lastDeniedTurn,
          evidence.lastGaveAwayTurn
        );
        if (lastZeroTurn >= 0) {
          // Check if opponent may have drawn/received cards since that zero-turn
          const turnsSinceZero = Math.max(0, observation.turnNumber - lastZeroTurn);
          if (observation.drawPileCount === 0) {
            // Check whether opponent asked/received ANY cards after lastZeroTurn; if not, they still have 0
            const gainedSinceZero = observation.memory.successfulRequests.some(
              (s) => s.requesterId === opp.id && s.turnNumber > lastZeroTurn
            );
            estimatedProb = gainedSinceZero ? baseProb * 0.45 : 0.02;
          } else {
            // Recovery scales gently with elapsed turns while Fish Pond still has cards
            const recoveryFactor = Math.min(0.7, 0.08 + turnsSinceZero * 0.09);
            estimatedProb = baseProb * recoveryFactor;
          }
        }
      }

      // Bonus if another opponent is NOT holding it (already denied), concentrating remaining copies
      const otherOpponentsDenied = eligibleOpponents.filter((other) => {
        if (other.id === opp.id) return false;
        const otherEv = analyzeOpponentRankEvidence(
          observation.memory,
          other.id,
          rank
        );
        return (
          otherEv.lastDeniedTurn >= Math.max(0, observation.turnNumber - 4) &&
          otherEv.lastKnownTurn < otherEv.lastDeniedTurn
        );
      }).length;

      const concentrationBoost = 1 + otherOpponentsDenied * 0.12;
      const expectedValue =
        estimatedProb *
        concentrationBoost *
        completionWeight *
        (1 + unseenCopiesOfRank * 0.1);

      if (expectedValue > bestScore + 1e-6) {
        bestScore = expectedValue;
        tiedBest = [{ opponentId: opp.id, rank }];
      } else if (Math.abs(expectedValue - bestScore) <= 1e-6) {
        tiedBest.push({ opponentId: opp.id, rank });
      }
    }
  }

  const pickIdx = Math.floor(rng() * tiedBest.length);
  return tiedBest[pickIdx];
}

export function selectBotAction(
  observation: BotObservation,
  difficulty: BotDifficulty = 'normal',
  rng: () => number = Math.random
): BotAction {
  const eligibleOpponents = observation.players.filter(
    (p) => p.id !== observation.botId && p.handCount > 0 && !p.isInactiveForAsking
  );

  if (eligibleOpponents.length === 0) {
    throw new Error('No eligible opponents with cards available for bot request.');
  }

  const availableRanks = getAvailableRanksFromHand(observation);
  if (availableRanks.length === 0) {
    throw new Error('Bot has no cards in hand to request.');
  }

  if (difficulty === 'easy') {
    return selectEasyBotAction(observation, eligibleOpponents, availableRanks, rng);
  }
  if (difficulty === 'normal') {
    return selectNormalBotAction(
      observation,
      eligibleOpponents,
      availableRanks,
      rng
    );
  }
  return selectHardBotAction(observation, eligibleOpponents, availableRanks, rng);
}
