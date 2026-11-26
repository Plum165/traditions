import { SharedVictoryPanel } from '../../../components/games/SharedVictoryPanel';
import { formatCardLabel } from '../engine/deck';
import type { PublicPorridgeView } from '../engine/types';

interface PorridgeVictoryProps {
  view: PublicPorridgeView;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function PorridgeVictory({
  view,
  onPlayAgain,
  onNewGame,
}: PorridgeVictoryProps) {
  const winners = view.standings.filter((s) => s.isWinner);
  const winnerSummaryText =
    winners.length === 0
      ? 'Game Over'
      : view.isTie
        ? `Tie! ${winners.map((w) => `${w.name} (${w.type === 'bot' ? 'Bot' : 'Human'})`).join(' & ')}`
        : `${winners[0].name} (${winners[0].type === 'bot' ? 'Bot' : 'Human'}) Wins!`;

  return (
    <SharedVictoryPanel
      headingId="porridge-victory-heading"
      eyebrow="Game Completed · Fewest Collected Cards Wins"
      winnerSummaryText={winnerSummaryText}
      subtitle={`${
        view.isTie
          ? 'Multiple players finished tied with the lowest card total.'
          : 'All 52 cards from the outer circle have been revealed.'
      } The completed board and central pile remain visible below.`}
      boardOnlySubtext="Viewing final board · All 52 cards played"
      standings={view.standings.map((entry) => ({
        rank: entry.rank,
        playerId: entry.playerId,
        name: entry.name,
        type: entry.type,
        metricText: `${entry.cardsCollected} ${
          entry.cardsCollected === 1 ? 'card' : 'cards'
        } collected`,
        isWinner: entry.isWinner,
      }))}
      isTie={view.isTie}
      historyTitle="View Collection Log"
      historyItems={view.collectionHistory.slice(0, 8).map((ev) => ({
        id: ev.id,
        text: `Turn ${ev.turnNumber}: ${ev.playerName} collected ${ev.collectedCount} ${
          ev.collectedCount === 1 ? 'card' : 'cards'
        } on ${formatCardLabel(ev.triggerCard)}`,
      }))}
      onPlayAgain={onPlayAgain}
      onNewGame={onNewGame}
    />
  );
}
