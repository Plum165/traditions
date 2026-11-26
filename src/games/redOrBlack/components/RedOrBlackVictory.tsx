import { SharedVictoryPanel } from '../../../components/games/SharedVictoryPanel';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import { formatCardLabel } from '../engine/deck';
import type { PublicRedOrBlackView } from '../engine/types';

interface RedOrBlackVictoryProps {
  view: PublicRedOrBlackView;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function RedOrBlackVictory({
  view,
  onPlayAgain,
  onNewGame,
}: RedOrBlackVictoryProps) {
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

  const isFourQuestions = view.variant === 'four-questions';

  return (
    <SharedVictoryPanel
      headingId="red-or-black-victory-heading"
      eyebrow={
        isFourQuestions
          ? 'Four Questions Completed'
          : 'Deck Exhausted · Most Collected Cards Wins'
      }
      winnerSummaryText={winnerSummaryText}
      subtitle={
        isFourQuestions
          ? `${winners[0]?.name ?? 'Winner'} answered all four questions in sequence. The completed sequence remains on the table below.`
          : `${
              view.isTie
                ? 'Multiple players finished tied with the highest card total.'
                : 'All 52 cards have been revealed and collected.'
            } Final totals and the last board state remain visible below.`
      }
      boardOnlySubtext={
        isFourQuestions
          ? 'Viewing final board · All 4 questions completed'
          : `Viewing final board · ${view.knownRevealedCount} cards revealed`
      }
      standings={view.standings.map((entry) => ({
        rank: entry.rank,
        playerId: entry.playerId,
        name: entry.name,
        type: entry.type,
        difficultyLabel: entry.difficulty
          ? BOT_DIFFICULTY_LABELS[entry.difficulty]
          : undefined,
        metricText: isFourQuestions
          ? entry.isWinner
            ? `4/4 Sequence Completed (${entry.correctAnswers} correct)`
            : `${entry.correctAnswers} correct ${
                entry.correctAnswers === 1 ? 'guess' : 'guesses'
              }`
          : `${entry.cardsCollected} ${
              entry.cardsCollected === 1 ? 'card' : 'cards'
            } collected`,
        isWinner: entry.isWinner,
      }))}
      isTie={view.isTie}
      historyTitle="View Recent Reveal Log"
      historyItems={view.outcomeHistory.slice(0, 10).map((item) => ({
        id: item.id,
        text: `Turn ${item.turnNumber} (Q${item.questionNumber}): ${item.answererName} guessed ${item.predictionLabel} -> ${formatCardLabel(item.revealedCard)} (${
          item.correct ? 'Correct' : 'Incorrect'
        })`,
      }))}
      onPlayAgain={onPlayAgain}
      onNewGame={onNewGame}
    />
  );
}
