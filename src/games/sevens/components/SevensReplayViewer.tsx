import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { formatCardLabel } from '../engine/deck';
import type { ReplayActionType, ReplayFrame } from '../engine/types';
import { GameCardTile } from './GameCardTile';

interface SevensReplayViewerProps {
  frames: ReplayFrame[];
  onClose?: () => void;
}

const ACTION_LABELS: Record<ReplayActionType, string> = {
  START: 'Initial Deal',
  DRAW_DECK: 'Draw from Deck',
  DRAW_DISCARD: 'Take Top Discard',
  PLAY_NEW_SET: 'Play New Set',
  ADD_TO_SET: 'Extend Table Set',
  REPLACE_JOKER: 'Replace Joker',
  DISCARD: 'Discard Card',
  VICTORY: 'Match Won',
};

export function SevensReplayViewer({ frames, onClose }: SevensReplayViewerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxIndex = Math.max(0, frames.length - 1);
  const safeIndex = Math.min(Math.max(0, stepIndex), maxIndex);
  const frame = frames[safeIndex];

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [frames]);

  useEffect(() => {
    if (!isPlaying) return;
    if (safeIndex >= maxIndex) {
      setIsPlaying(false);
      return;
    }

    const timerId = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= maxIndex) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1150);

    return () => window.clearInterval(timerId);
  }, [isPlaying, safeIndex, maxIndex]);

  if (!frame) {
    return null;
  }

  const highlightedSet = new Set(frame.highlightedCardIds);
  const isDrawStep =
    frame.actionType === 'DRAW_DECK' || frame.actionType === 'DRAW_DISCARD';

  const handleTogglePlay = () => {
    if (safeIndex >= maxIndex && !isPlaying) {
      setStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <section
      aria-labelledby="sevens-replay-heading"
      className="rounded-lg border-2 border-[#C6B8A6] bg-[#FAF7F2] p-4 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#DDD4C7] pb-4">
        <div>
          <p className="font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
            Post-Game Match Replay · Step {safeIndex + 1} of {frames.length} · Turn{' '}
            {frame.turnNumber}
          </p>
          <h3
            id="sevens-replay-heading"
            className="mt-1 font-serif text-xl font-semibold text-[#1E1A18] sm:text-2xl"
          >
            Revealed Hands &amp; Bot Play-by-Play
          </h3>
          <p className="mt-1 text-xs text-[#524943] sm:text-sm">
            Step through the full round with every player’s and bot’s hand revealed.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#F4EFE7] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>Hide Replay</span>
          </button>
        )}
      </div>

      {/* Controls & Timeline Scrubber */}
      <div className="mt-4 rounded-md border border-[#DDD4C7] bg-[#F4EFE7] p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(0);
            }}
            disabled={safeIndex === 0}
            aria-label="Jump to first step"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={safeIndex === 0}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-[#7C2D36] px-4 text-xs font-semibold text-[#FAF7F2] hover:bg-[#64222A]"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                <span>{safeIndex >= maxIndex ? 'Replay Again' : 'Auto-Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex((prev) => Math.min(maxIndex, prev + 1));
            }}
            disabled={safeIndex >= maxIndex}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setStepIndex(maxIndex);
            }}
            disabled={safeIndex >= maxIndex}
            aria-label="Jump to final step"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mt-2 flex w-full items-center gap-3 sm:mt-0 sm:ml-2 sm:flex-1">
            <label htmlFor="replay-scrubber" className="sr-only">
              Replay step scrubber
            </label>
            <input
              id="replay-scrubber"
              type="range"
              min={0}
              max={maxIndex}
              value={safeIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setStepIndex(Number(e.target.value));
              }}
              className="h-2 w-full cursor-pointer accent-[#7C2D36]"
            />
          </div>
        </div>

        {/* Step Move Prompt */}
        <div
          role="status"
          aria-live="polite"
          className="mt-3.5 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] px-3.5 py-3"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-xs bg-[#1E1A18] px-2 py-0.5 font-mono font-semibold text-[#FAF7F2] uppercase">
              {ACTION_LABELS[frame.actionType]}
            </span>
            <span className="font-semibold text-[#7C2D36]">
              {frame.actorName}
              {frame.actorType === 'bot'
                ? ' (Bot)'
                : frame.actorType === 'human'
                  ? ' (Human)'
                  : ''}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-[#1E1A18]">{frame.description}</p>
        </div>
      </div>

      {/* Revealed Hands (Humans & Bots) */}
      <div className="mt-5">
        <h4 className="font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
          All Hands at Step {safeIndex + 1}
        </h4>
        <div className="mt-3 grid gap-3.5 lg:grid-cols-2">
          {frame.players.map((player) => {
            const isActor = frame.actorId === player.id;
            return (
              <div
                key={player.id}
                className={`rounded-md border p-3.5 ${
                  isActor
                    ? 'border-[#7C2D36] bg-[#FBF8F3] ring-1 ring-[#7C2D36]/30'
                    : 'border-[#DDD4C7] bg-[#F4EFE7]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-serif text-sm font-semibold text-[#1E1A18] sm:text-base">
                    {player.name}{' '}
                    <span className="font-sans text-xs font-normal text-[#6B6059]">
                      ({player.type === 'bot' ? 'Bot' : 'Human'})
                    </span>
                    {isActor && (
                      <span className="ml-2 font-mono text-[11px] font-semibold text-[#7C2D36] uppercase">
                        · Acting
                      </span>
                    )}
                  </p>
                  <span className="font-mono text-xs text-[#524943] tabular-nums">
                    {player.hand.length} {player.hand.length === 1 ? 'card' : 'cards'}
                  </span>
                </div>

                {player.hand.length === 0 ? (
                  <p className="mt-3 text-xs font-medium text-[#14532D]">
                    Empty hand (0 cards remaining)
                  </p>
                ) : (
                  <div className="mt-2.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-1">
                    {player.hand.map((card) => {
                      const isCardHighlighted = highlightedSet.has(card.id);
                      return (
                        <div key={card.id} className="shrink-0">
                          <GameCardTile
                            card={card}
                            size="sm"
                            isNewlyDrawn={isDrawStep && isCardHighlighted}
                            highlight={!isDrawStep && isCardHighlighted}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table State Snapshot */}
      <div className="mt-5 rounded-md border border-[#C6B8A6] bg-[#1E3D2F] p-4 text-[#FAF7F2]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FAF7F2]/15 pb-3">
          <h4 className="font-serif text-base font-semibold">
            Table State at Step {safeIndex + 1}
          </h4>
          <span className="font-mono text-xs text-[#E6DED2] tabular-nums">
            Draw Pile: {frame.drawPileCount} remaining
          </span>
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-3">
            <p className="text-xs font-medium text-[#E6DED2]">Top Discard</p>
            <div className="mt-2">
              {frame.topDiscard ? (
                <GameCardTile
                  card={frame.topDiscard}
                  size="sm"
                  highlight={
                    frame.actionType === 'DISCARD' &&
                    highlightedSet.has(frame.topDiscard.id)
                  }
                />
              ) : (
                <div className="flex h-20 w-14 items-center justify-center rounded-md border border-dashed border-[#FAF7F2]/30 text-[11px] text-[#E6DED2]/70">
                  Empty
                </div>
              )}
            </div>
            {frame.topDiscard && (
              <p className="mt-1.5 font-mono text-[11px] text-[#E6DED2]">
                {formatCardLabel(frame.topDiscard)}
              </p>
            )}
          </div>

          <div className="sm:col-span-9">
            <p className="text-xs font-medium text-[#E6DED2]">
              Sets on Table ({frame.tableSets.length})
            </p>
            {frame.tableSets.length === 0 ? (
              <p className="mt-2 text-xs text-[#E6DED2]/80">
                No sets laid down at this step.
              </p>
            ) : (
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {frame.tableSets.map((set) => (
                  <div
                    key={set.id}
                    className="rounded-md border border-[#FAF7F2]/20 bg-[#152D22] p-2.5"
                  >
                    <p className="text-[11px] text-[#E6DED2]">
                      {set.type === 'matching' ? 'Matching Set' : 'Consecutive Run'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {set.cards.map((card) => (
                        <GameCardTile
                          key={card.id}
                          card={card}
                          size="sm"
                          highlight={
                            highlightedSet.has(card.id) || card.kind === 'joker'
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
