import { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { GameCardTile } from '../../../components/games/GameCardTile';
import type { CardTexture } from '../../../types/playingCard';
import type { PublicGoFishView } from '../engine/types';

interface GameNotificationProps {
  view: PublicGoFishView;
  cardTexture: CardTexture;
  onAcknowledgeTurnEnd: () => void;
}

export function GameNotification({
  view,
  cardTexture,
  onAcknowledgeTurnEnd,
}: GameNotificationProps) {
  const [showHistory, setShowHistory] = useState(false);

  const outcome = view.lastOutcome;
  const isSuccess =
    outcome?.kind === 'transferred' || outcome?.kind === 'go-fish-match';

  return (
    <section
      aria-live="polite"
      className={`rounded-lg border p-3.5 sm:p-4 ${
        isSuccess
          ? 'border-[#1E563B]/45 bg-[#EEF6F0]'
          : 'border-[#DDD4C7] bg-[#F4EFE7]'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-[#184E34]"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-[#7C2D36]"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#6B6059] uppercase tabular-nums">
              {outcome ? `Turn ${outcome.turnNumber} Update` : 'Opening Deal'}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#1E1A18] sm:text-base">
              {outcome ? outcome.message : view.lastActionSummary}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {outcome?.drawnCard && (
            <div className="shrink-0">
              <GameCardTile
                card={outcome.drawnCard}
                size="sm"
                texture={cardTexture}
                isNewlyDrawn={true}
              />
            </div>
          )}

          {view.pendingTurnAdvance && (
            <button
              type="button"
              onClick={onAcknowledgeTurnEnd}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-4 py-2 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A]"
            >
              <span>Pass Turn to Next Player</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {view.outcomeHistory.length > 1 && (
        <div className="mt-3 border-t border-[#DDD4C7]/80 pt-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-[#524943] hover:text-[#7C2D36]"
          >
            <span>
              {showHistory
                ? 'Hide Recent Turn Log'
                : `View Recent Turn Log (${view.outcomeHistory.length})`}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showHistory ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {showHistory && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-[#4A413B]">
              {view.outcomeHistory.slice(0, 15).map((entry) => (
                <li key={entry.id} className="font-sans">
                  <span className="font-mono text-[#6B6059] tabular-nums">
                    T{entry.turnNumber}:
                  </span>{' '}
                  {entry.publicMessage}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
