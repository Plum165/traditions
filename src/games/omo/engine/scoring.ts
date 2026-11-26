import type { OmoPlayerState, OmoStanding } from './types';

export interface OmoScoreResolution {
  standings: OmoStanding[];
  winnerIds: string[];
  isTie: boolean;
  scoreDifference: number;
}

export function computeOmoStandings(
  players: readonly OmoPlayerState[]
): OmoScoreResolution {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.bonusTurnsEarned - a.bonusTurnsEarned;
  });

  const highestScore = sorted[0]?.score ?? 0;
  const secondScore = sorted[1]?.score ?? highestScore;
  const winners = sorted.filter((player) => player.score === highestScore);
  const winnerIds = winners.map((player) => player.id);
  const isTie = winners.length > 1;
  const scoreDifference = isTie ? 0 : Math.max(0, highestScore - secondScore);

  let currentRank = 1;
  const standings: OmoStanding[] = sorted.map((player, index) => {
    if (index > 0 && sorted[index - 1].score > player.score) {
      currentRank = index + 1;
    }
    return {
      rank: currentRank,
      playerId: player.id,
      name: player.name,
      type: player.type,
      difficulty: player.difficulty,
      score: player.score,
      omosCreated: player.omosCreated,
      turnsTaken: player.turnsTaken,
      bonusTurnsEarned: player.bonusTurnsEarned,
      isWinner: player.score === highestScore,
    };
  });

  return {
    standings,
    winnerIds,
    isTie,
    scoreDifference,
  };
}
