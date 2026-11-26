import { SharedVictoryPanel } from '../../../components/games/SharedVictoryPanel';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import type { PublicGoFishView } from '../engine/types';

interface GoFishVictoryProps {
  view: PublicGoFishView;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GoFishVictory({
  view,
  onPlayAgain,
  onNewGame,
}: GoFishVictoryProps) {
  const winners = view.standings.filter((s) => s.isWinner);
  const formatParticipant = (w: (typeof winners)[number]) =>
    `${w.name} (${
      w.type === 'bot'
        ? `Bot${w.difficulty ? ` · ${BOT_DIFFICULTY_LABELS[w.difficulty]}` : ''}`
        : 'Human'
    })`;

  const winnerSummaryText =
    winners.length === 0
      ? 'Game Over'
      : view.isTie
        ? `Tie! ${winners.map(formatParticipant).join(' & ')}`
        : `${formatParticipant(winners[0])} Wins!`;

  const eyebrow = view.isStalemate
    ? 'Fish Pond Empty · Final Standings'
    : 'All Books Collected · Final Standings';

  const subtitle = view.isStalemate
    ? `${
        view.isTie
          ? 'A complete round passed with no transfers or new books, ending in a tie.'
          : 'A complete round passed with the Fish Pond empty and no transfers or new books.'
      } All completed books remain visible below.`
    : `${
        view.isTie
          ? 'Multiple players finished tied with the most completed books.'
          : `${winners[0]?.name ?? 'The winner'} finished with the most completed books.`
      } Completed books and final counts remain inspectable below.`;

  return (
    <SharedVictoryPanel
      headingId="go-fish-victory-heading"
      eyebrow={eyebrow}
      winnerSummaryText={winnerSummaryText}
      subtitle={subtitle}
      boardOnlySubtext={`Viewing final board · ${view.totalBooksCompleted} of 13 books completed`}
      standings={view.standings.map((entry) => ({
        rank: entry.rank,
        playerId: entry.playerId,
        name: entry.name,
        type: entry.type,
        difficultyLabel: entry.difficulty
          ? BOT_DIFFICULTY_LABELS[entry.difficulty]
          : undefined,
        metricText: `${entry.bookCount} ${
          entry.bookCount === 1 ? 'book' : 'books'
        }`,
        isWinner: entry.isWinner,
      }))}
      isTie={view.isTie}
      historyTitle="View Turn History"
      historyItems={view.outcomeHistory.slice(0, 12).map((item) => ({
        id: item.id,
        text: `Turn ${item.turnNumber}: ${item.publicMessage}`,
      }))}
      onPlayAgain={onPlayAgain}
      onNewGame={onNewGame}
    />
  );
}
