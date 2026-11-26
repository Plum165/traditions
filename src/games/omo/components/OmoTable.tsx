import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Grid3X3,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { OmoCellCoord, OmoLetter, OmoPublicView } from '../engine/types';
import { OmoBoard } from './OmoBoard';
import { OmoScoreboard } from './OmoScoreboard';
import { OmoVictoryPanel } from './OmoVictoryPanel';

interface OmoTableProps {
  view: OmoPublicView;
  errorMessage: string | null;
  onPlaceLetter: (
    playerId: string,
    row: number,
    col: number,
    letter: OmoLetter
  ) => void;
  onToggleSound: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function OmoTable({
  view,
  errorMessage,
  onPlaceLetter,
  onToggleSound,
  onPlayAgain,
  onNewGame,
}: OmoTableProps) {
  const [selectedCell, setSelectedCell] = useState<OmoCellCoord | null>(null);

  const isHumanTurn =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    view.activePlayer.type === 'human';

  // Clear selection whenever turn passes away from human or cell becomes occupied
  useEffect(() => {
    if (!isHumanTurn) {
      setSelectedCell(null);
      return;
    }
    if (
      selectedCell &&
      view.board[selectedCell.row]?.[selectedCell.col] !== null
    ) {
      setSelectedCell(null);
    }
  }, [isHumanTurn, selectedCell, view.board]);

  // Keyboard shortcuts when an empty cell is selected: O, M, Escape
  useEffect(() => {
    if (!isHumanTurn || !selectedCell) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCell(null);
        return;
      }
      const upper = event.key.toUpperCase();
      if (upper === 'O' || upper === 'M') {
        event.preventDefault();
        onPlaceLetter(
          view.activePlayer.id,
          selectedCell.row,
          selectedCell.col,
          upper
        );
        setSelectedCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHumanTurn, selectedCell, view.activePlayer.id, onPlaceLetter]);

  const handleChooseLetter = (letter: OmoLetter) => {
    if (!isHumanTurn || !selectedCell) return;
    onPlaceLetter(
      view.activePlayer.id,
      selectedCell.row,
      selectedCell.col,
      letter
    );
    setSelectedCell(null);
  };

  const renderFeedbackMessage = () => {
    if (view.status === 'GAME_OVER') {
      return {
        tone: 'neutral' as const,
        headline: 'Final board complete — no empty cells remaining.',
        detail: `${view.scoredCombinations.length} total ${
          view.scoredCombinations.length === 1 ? 'OMO' : 'OMOs'
        } formed across the ${view.rows} × ${view.cols} grid.`,
      };
    }

    const last = view.lastPlacement;
    if (last && last.pointsEarned > 0) {
      return {
        tone: 'score' as const,
        headline: `OMO completed! +${last.pointsEarned} ${
          last.pointsEarned === 1 ? 'point' : 'points'
        } for ${last.playerName}`,
        detail: last.earnedBonusTurn
          ? view.activePlayer.type === 'human'
            ? `Bonus turn! ${view.activePlayer.name} plays again.`
            : `Bonus turn! ${view.activePlayer.name} is thinking of another placement...`
          : `${view.activePlayer.name}'s turn.`,
      };
    }

    if (last) {
      return {
        tone: 'neutral' as const,
        headline: `${last.playerName} placed ${last.letter} at Row ${
          last.row + 1
        }, Col ${last.col + 1}.`,
        detail:
          view.activePlayer.type === 'bot'
            ? `${view.activePlayer.name} (${view.activePlayer.difficulty}) is choosing a cell...`
            : `${view.activePlayer.name}'s turn — select an empty cell to place O or M.`,
      };
    }

    return {
      tone: 'neutral' as const,
      headline:
        view.activePlayer.type === 'bot'
          ? `${view.activePlayer.name} goes first and is choosing a move...`
          : `${view.activePlayer.name} goes first — tap any empty cell to begin.`,
      detail: 'Build consecutive O-M-O lines horizontally, vertically, or diagonally.',
    };
  };

  const feedback = renderFeedbackMessage();

  return (
    <div className="space-y-5">
      {/* Top Status & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#524943]">
          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#1E1A18] tabular-nums">
            <Grid3X3 className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
            <span>
              {view.rows} × {view.cols} Grid
            </span>
          </span>
          <span className="font-mono tabular-nums">
            {view.emptyCellsRemaining} / {view.totalCells} empty
          </span>
          <span className="font-mono tabular-nums">
            {view.scoredCombinations.length}{' '}
            {view.scoredCombinations.length === 1 ? 'OMO' : 'OMOs'} scored
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={view.rules.soundEnabled}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            {view.rules.soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#7C2D36]" aria-hidden="true" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 text-[#6B6059]" aria-hidden="true" />
                <span>Muted</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Setup</span>
          </button>
        </div>
      </div>

      {/* Victory Panel (keeps final board visible below) */}
      {view.status === 'GAME_OVER' && (
        <OmoVictoryPanel
          view={view}
          onPlayAgain={onPlayAgain}
          onNewGame={onNewGame}
        />
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-[#C98B8D] bg-[#FBF2F2] px-4 py-3 text-sm text-[#7C2D36]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Main Board Column */}
        <div className="space-y-4 lg:col-span-8">
          {/* Turn & Scoring Feedback Banner */}
          <div
            aria-live="polite"
            className={`rounded-lg border px-4 py-3 ${
              feedback.tone === 'score'
                ? 'border-[#7C2D36] bg-[#F7E6E8]'
                : 'border-[#DDD4C7] bg-[#FAF7F2]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedback.tone === 'score' && (
                <Sparkles
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#7C2D36]"
                  aria-hidden="true"
                />
              )}
              <div>
                <p className="text-sm font-semibold text-[#1E1A18]">
                  {feedback.headline}
                </p>
                <p className="mt-0.5 text-xs text-[#4A413B]">{feedback.detail}</p>
              </div>
            </div>
          </div>

          {/* Letter Selection Bar (always visible & touch-friendly when cell is selected) */}
          {isHumanTurn && (
            <div className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] px-4 py-3">
              {selectedCell ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#7C2D36] uppercase tabular-nums">
                      Row {selectedCell.row + 1}, Column {selectedCell.col + 1} Selected
                    </p>
                    <p className="text-sm text-[#3F3833]">
                      Choose which letter to place (or press O / M):
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleChooseLetter('O')}
                      className="inline-flex min-h-[48px] min-w-[76px] flex-1 items-center justify-center rounded-md bg-[#7C2D36] px-5 py-2 font-serif text-xl font-bold text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:flex-none"
                    >
                      O
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChooseLetter('M')}
                      className="inline-flex min-h-[48px] min-w-[76px] flex-1 items-center justify-center rounded-md bg-[#1E1A18] px-5 py-2 font-serif text-xl font-bold text-[#FAF7F2] transition-colors hover:bg-[#3A322E] sm:flex-none"
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCell(null)}
                      aria-label="Cancel cell selection"
                      className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 text-xs font-medium text-[#4A413B] hover:bg-[#EFE8DC]"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#4A413B]">
                  <strong className="font-semibold text-[#1E1A18]">
                    {view.activePlayer.name}’s turn:
                  </strong>{' '}
                  Tap any empty square on the grid below, then choose{' '}
                  <strong className="font-serif text-[#7C2D36]">O</strong> or{' '}
                  <strong className="font-serif text-[#1E1A18]">M</strong>.
                </p>
              )}
            </div>
          )}

          {/* Grid Board */}
          <OmoBoard
            view={view}
            selectedCell={selectedCell}
            interactive={isHumanTurn}
            onSelectCell={(coord) => setSelectedCell(coord)}
          />
        </div>

        {/* Scoreboard & Recent Moves Column */}
        <aside className="space-y-5 lg:col-span-4">
          <OmoScoreboard view={view} />

          {view.history.length > 0 && (
            <div className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4">
              <h3 className="font-serif text-base font-semibold text-[#1E1A18]">
                Recent Placements
              </h3>
              <ol className="mt-2.5 space-y-1.5 text-xs text-[#4A413B]">
                {[...view.history]
                  .reverse()
                  .slice(0, 6)
                  .map((item) => (
                    <li
                      key={`hist-${item.moveNumber}`}
                      className="flex items-baseline justify-between gap-2 border-t border-[#E6DED2] pt-1.5 first:border-t-0 first:pt-0"
                    >
                      <span>
                        <span className="font-mono text-[#6B6059] tabular-nums">
                          #{item.moveNumber}
                        </span>{' '}
                        <strong className="font-medium text-[#1E1A18]">
                          {item.playerName}
                        </strong>{' '}
                        → {item.letter} ({item.row + 1},{item.col + 1})
                      </span>
                      {item.pointsEarned > 0 && (
                        <span className="shrink-0 font-mono font-semibold text-[#7C2D36] tabular-nums">
                          +{item.pointsEarned}
                        </span>
                      )}
                    </li>
                  ))}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
