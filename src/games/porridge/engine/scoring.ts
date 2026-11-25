import type { PorridgeGameResult, PorridgePlayer, PorridgeStanding } from './types';

/**
 * Calculates final standings where the lowest collected-card count wins.
 * Ties are reported directly without inventing extra tie-break rules.
 */
export function calculateWinner(
  players: readonly PorridgePlayer[]
): PorridgeGameResult {
  if (players.length === 0) {
    return {
      winners: [],
      winnerIds: [],
      isTie: false,
      lowestCount: 0,
      standings: [],
    };
  }

  const lowestCount = Math.min(...players.map((p) => p.cardsCollected));
  const winners = players.filter((p) => p.cardsCollected === lowestCount);
  const winnerIds = winners.map((p) => p.id);

  const sorted = [...players].sort((a, b) => {
    if (a.cardsCollected !== b.cardsCollected) {
      return a.cardsCollected - b.cardsCollected;
    }
    return a.turnOrder - b.turnOrder;
  });

  const standings: PorridgeStanding[] = [];
  let currentRank = 1;

  sorted.forEach((player, index) => {
    if (index > 0 && player.cardsCollected > sorted[index - 1].cardsCollected) {
      currentRank = index + 1;
    }
    standings.push({
      rank: currentRank,
      playerId: player.id,
      name: player.name,
      type: player.type,
      cardsCollected: player.cardsCollected,
      isWinner: player.cardsCollected === lowestCount,
    });
  });

  return {
    winners,
    winnerIds,
    isTie: winners.length > 1,
    lowestCount,
    standings,
  };
}
