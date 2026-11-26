import {
  SharedVictoryPanel,
  type VictoryStandingRow,
} from '../../../components/games/SharedVictoryPanel';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import type { OmoPublicView } from '../engine/types';

interface OmoVictoryPanelProps {
  view: OmoPublicView;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function OmoVictoryPanel({
  view,
  onPlayAgain,
  onNewGame,
}: OmoVictoryPanelProps) {
  const winners = view.standings.filter((s) => s.isWinner);
  const topScore = winners[0]?.score ?? 0;

  const winnerSummaryText = view.isTie
    ? `Draw Game! ${winners.map((w) => w.name).join(' & ')} (${topScore} ${
        topScore === 1 ? 'pt' : 'pts'
      })`
    : `${winners[0]?.name ?? 'Winner'} Wins with ${topScore} ${
        topScore === 1 ? 'Point' : 'Points'
      }!`;

  const subtitle = view.isTie
    ? `All ${view.totalCells} cells on the ${view.rows} × ${view.cols} grid are filled with a ${topScore}-point draw (${view.scoredCombinations.length} total OMOs created).`
    : `The ${view.rows} × ${view.cols} grid is full! ${winners[0]?.name} won by ${view.scoreDifference} ${
        view.scoreDifference === 1 ? 'point' : 'points'
      } (${view.scoredCombinations.length} total OMOs created).`;

  const standings: VictoryStandingRow[] = view.standings.map((entry) => ({
    rank: entry.rank,
    playerId: entry.playerId,
    name: entry.name,
    type: entry.type,
    difficultyLabel:
      entry.type === 'bot' ? BOT_DIFFICULTY_LABELS[entry.difficulty] : undefined,
    metricText: `${entry.score} ${entry.score === 1 ? 'pt' : 'pts'} · ${
      entry.omosCreated
    } OMOs · ${entry.bonusTurnsEarned} bonus`,
    isWinner: entry.isWinner,
  }));

  const scoringHistoryItems = view.history
    .filter((move) => move.pointsEarned > 0)
    .slice(-15)
    .map((move) => ({
      id: `omo-move-${move.moveNumber}`,
      text: `Move #${move.moveNumber}: ${move.playerName} placed ${move.letter} at (${
        move.row + 1
      }, ${move.col + 1}) → +${move.pointsEarned} ${
        move.pointsEarned === 1 ? 'OMO' : 'OMOs'
      }`,
    }));

  return (
    <SharedVictoryPanel
      headingId="omo-victory-heading"
      eyebrow={`Game Complete · ${view.rows} × ${view.cols} Grid`}
      winnerSummaryText={winnerSummaryText}
      subtitle={subtitle}
      boardOnlySubtext={`Score difference: ${view.scoreDifference} ${
        view.scoreDifference === 1 ? 'pt' : 'pts'
      } · ${view.scoredCombinations.length} OMOs`}
      standings={standings}
      isTie={view.isTie}
      historyTitle="View Scoring Moves"
      historyItems={scoringHistoryItems}
      onPlayAgain={onPlayAgain}
      onNewGame={onNewGame}
    />
  );
}
