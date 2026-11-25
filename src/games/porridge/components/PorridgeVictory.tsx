import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Eye, RotateCcw, Trophy } from 'lucide-react';
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
  const [viewingBoardOnly, setViewingBoardOnly] = useState(false);
  const [showCollectionLog, setShowCollectionLog] = useState(false);

  const winners = view.standings.filter((s) => s.isWinner);
  const winnerSummaryText =
    winners.length === 0
      ? 'Game Over'
      : view.isTie
        ? `Tie! ${winners.map((w) => `${w.name} (${w.type === 'bot' ? 'Bot' : 'Human'})`).join(' & ')}`
        : `${winners[0].name} (${winners[0].type === 'bot' ? 'Bot' : 'Human'}) Wins!`;

  if (viewingBoardOnly) {
    return (
      <section
        role="region"
        aria-labelledby="porridge-victory-heading"
        className="rounded-lg border-2 border-[#7C2D36] bg-[#F4EFE7] p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 shrink-0 text-[#7C2D36]" aria-hidden="true" />
            <div>
              <h2
                id="porridge-victory-heading"
                className="font-serif text-lg font-semibold text-[#1E1A18]"
              >
                {winnerSummaryText}
              </h2>
              <p className="text-xs text-[#524943] tabular-nums">
                Viewing final board · All 52 cards played
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setViewingBoardOnly(false)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>Show Final Standings</span>
            </button>
            <button
              type="button"
              onClick={onNewGame}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#64222A]"
            >
              New Game
            </button>
            <Link
              to="/games"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              Return to Games Library
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      role="region"
      aria-labelledby="porridge-victory-heading"
      className="rounded-lg border-2 border-[#7C2D36] bg-[#F4EFE7] p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C8B08A] bg-[#FAF7F2] text-[#7C2D36]">
          <Trophy className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
            Game Completed · Fewest Collected Cards Wins
          </p>
          <h2
            id="porridge-victory-heading"
            className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
          >
            {winnerSummaryText}
          </h2>
          <p className="mt-1 text-sm text-[#4A413B]">
            {view.isTie
              ? 'Multiple players finished tied with the lowest card total.'
              : 'All 52 cards from the outer circle have been revealed.'}{' '}
            The completed board and central pile remain visible below.
          </p>
        </div>
      </div>

      {/* Final Standings */}
      <div className="mt-4 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
            Final Standings
          </h3>
          {view.collectionHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCollectionLog((prev) => !prev)}
              aria-expanded={showCollectionLog}
              className="inline-flex min-h-[36px] items-center gap-1 text-xs font-medium text-[#7C2D36] hover:text-[#5B1E25]"
            >
              <span>{showCollectionLog ? 'Hide Collection Log' : 'View Collection Log'}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  showCollectionLog ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <ul className="mt-2.5 divide-y divide-[#E6DED2] text-sm">
          {view.standings.map((entry) => (
            <li
              key={entry.playerId}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <span className="font-medium text-[#1E1A18]">
                <span className="mr-2 font-mono text-xs text-[#6B6059] tabular-nums">
                  #{entry.rank}
                </span>
                {entry.name} ({entry.type === 'bot' ? 'Bot' : 'Human'})
                {entry.isWinner ? (view.isTie ? ' — Tied Winner' : ' — Winner') : ''}
              </span>
              <span className="font-mono text-xs font-semibold text-[#524943] tabular-nums">
                {entry.cardsCollected} {entry.cardsCollected === 1 ? 'card' : 'cards'} collected
              </span>
            </li>
          ))}
        </ul>

        {showCollectionLog && view.collectionHistory.length > 0 && (
          <div className="mt-3 border-t border-[#E6DED2] pt-3 text-xs text-[#4A413B]">
            <p className="font-medium text-[#6B6059]">Pile Collections This Round:</p>
            <ul className="mt-1.5 space-y-1">
              {view.collectionHistory.slice(0, 8).map((ev) => (
                <li key={ev.id}>
                  Turn {ev.turnNumber}: {ev.playerName} collected {ev.collectedCount}{' '}
                  {ev.collectedCount === 1 ? 'card' : 'cards'} on{' '}
                  {formatCardLabel(ev.triggerCard)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Explicit Action Buttons */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => setViewingBoardOnly(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#B9AA98] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          <span>View Final Board</span>
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-4 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>New Game</span>
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
        >
          Play Again (Same Setup)
        </button>
        <Link
          to="/games"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#7C2D36] hover:bg-[#EFE8DC]"
        >
          Return to Games Library
        </Link>
      </div>
    </section>
  );
}
