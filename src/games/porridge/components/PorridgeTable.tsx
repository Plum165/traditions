import { AlertCircle, ArrowRight, Bot, Layers, RotateCcw } from 'lucide-react';
import type { CardTexture } from '../../../types/playingCard';
import { formatCardLabel } from '../engine/deck';
import type { PublicPorridgeView } from '../engine/types';
import { PlayerStatus } from './PlayerStatus';
import { PorridgeCircle } from './PorridgeCircle';
import { PorridgeVictory } from './PorridgeVictory';
import { SelectionConfirmation } from './SelectionConfirmation';

interface PorridgeTableProps {
  view: PublicPorridgeView;
  errorMessage: string | null;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onSelectCard: (positionId: string, playerId: string) => void;
  onConfirmSelection: () => void;
  onCancelSelection: () => void;
  onContinueTurn: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function PorridgeTable({
  view,
  errorMessage,
  cardTexture,
  onChangeCardTexture,
  onSelectCard,
  onConfirmSelection,
  onCancelSelection,
  onContinueTurn,
  onPlayAgain,
  onNewGame,
}: PorridgeTableProps) {
  const isGameOver = view.status === 'GAME_OVER' || view.phase === 'game-completed';
  const isBotTurn =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    view.currentPlayer.type === 'bot';
  const isHumanSelecting =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    !view.pendingTurnAdvance &&
    view.currentPlayer.type === 'human' &&
    (view.phase === 'selecting-card' || view.phase === 'confirming-selection');

  const selectedSlot = view.selectedPositionId
    ? view.publicCircle.find((s) => s.positionId === view.selectedPositionId) ?? null
    : null;

  const variationLabel =
    view.variation === 'same-suit'
      ? 'Version 1: Same-Suit Porridge'
      : 'Version 2: Highest-Colour Porridge';

  const isCollecting =
    view.phase === 'collecting-pile' ||
    (isGameOver && Boolean(view.lastRevealResult?.collected));

  const recentCollectorId =
    view.pendingTurnAdvance && view.lastRevealResult?.collected
      ? view.lastRevealResult.playerId
      : null;
  const recentCollectedCount =
    view.pendingTurnAdvance && view.lastRevealResult?.collected
      ? view.lastRevealResult.collectedCount
      : 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Persistent Victory Screen */}
      {isGameOver && (
        <PorridgeVictory
          view={view}
          onPlayAgain={onPlayAgain}
          onNewGame={onNewGame}
        />
      )}

      {/* Top Section: Game Name, Variation, Turn Indicator, Player Seats */}
      <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD4C7] pb-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs text-[#6B6059] tabular-nums">
              Porridge (Sekaku) · {variationLabel} · Turn {view.turnNumber}
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
              {isGameOver
                ? 'Final Board State'
                : view.pendingTurnAdvance && view.lastRevealResult
                  ? `${view.lastRevealResult.playerName} revealed ${formatCardLabel(
                      view.lastRevealResult.card
                    )}`
                  : `${view.currentPlayer.name}’s Turn (${
                      view.currentPlayer.type === 'bot' ? 'Bot' : 'Human'
                    })`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onChangeCardTexture(cardTexture === 'classic' ? 'archival' : 'classic')
              }
              aria-pressed={cardTexture === 'classic'}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              <span>
                Cards: {cardTexture === 'classic' ? 'Everyday Classic' : 'Archival Minimal'}
              </span>
            </button>

            <button
              type="button"
              onClick={onNewGame}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Game</span>
            </button>
          </div>
        </div>

        <div className="mt-3.5">
          <PlayerStatus
            players={view.players}
            winnerIds={view.winnerIds}
            isGameOver={isGameOver}
            recentCollectorId={recentCollectorId}
            recentCollectedCount={recentCollectedCount}
          />
        </div>
      </div>

      {/* Human Selection Confirmation */}
      {isHumanSelecting &&
        view.phase === 'confirming-selection' &&
        selectedSlot && (
          <SelectionConfirmation
            positionNumber={selectedSlot.positionIndex + 1}
            playerName={view.currentPlayer.name}
            onConfirm={onConfirmSelection}
            onCancel={onCancelSelection}
          />
        )}

      {/* Bot Action Prompt */}
      {isBotTurn && !view.pendingTurnAdvance && (
        <section
          role="status"
          aria-live="polite"
          className="rounded-lg border-2 border-[#8A5A19] bg-[#FBF4E7] p-4 text-[#1E1A18]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#6E4411] text-[#FAF7F2]">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold text-[#1E1A18]">
                {selectedSlot
                  ? `${view.currentPlayer.name} selected position #${
                      selectedSlot.positionIndex + 1
                    } — revealing card…`
                  : `${view.currentPlayer.name} is choosing a face-down card from the circle…`}
              </p>
              <p className="mt-0.5 text-xs text-[#5A360D]">
                Bots select randomly from remaining face-down positions without seeing card
                values.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Post-Reveal Collection / Outcome Banner */}
      {view.pendingTurnAdvance && view.lastRevealResult && (
        <section
          role="status"
          aria-live="polite"
          className={`flex flex-col gap-3 rounded-lg border-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
            view.lastRevealResult.collected
              ? 'border-[#8A5A19] bg-[#FBF4E7] text-[#1E1A18]'
              : 'border-[#1E563B] bg-[#EAF4EE] text-[#1E1A18]'
          }`}
        >
          <div>
            <p className="font-serif text-base font-semibold sm:text-lg">
              {view.lastRevealResult.collected
                ? `${view.lastRevealResult.playerName} collected ${
                    view.lastRevealResult.collectedCount
                  } ${view.lastRevealResult.collectedCount === 1 ? 'card' : 'cards'}!`
                : `${view.lastRevealResult.playerName} revealed ${formatCardLabel(
                    view.lastRevealResult.card
                  )} — Safe`}
            </p>
            <p className="mt-0.5 text-xs text-[#3F3833] sm:text-sm">
              {view.lastRevealResult.reason}
            </p>
          </div>

          <button
            type="button"
            onClick={onContinueTurn}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-4 py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#64222A] sm:text-sm"
          >
            <span>
              {view.players.filter((p) => p.type === 'human').length > 1
                ? 'Pass Device Next'
                : 'Continue'}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </section>
      )}

      {/* Status / Validation Message */}
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm ${
          errorMessage
            ? 'border-[#7C2D36] bg-[#FDF2F2] text-[#7C2D36]'
            : 'border-[#DDD4C7] bg-[#FAF7F2] text-[#3F3833]'
        }`}
      >
        {errorMessage ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Layers className="mt-0.5 h-4 w-4 shrink-0 text-[#6B6059]" aria-hidden="true" />
        )}
        <p className="min-w-0 break-words">{errorMessage ?? view.lastActionSummary}</p>
      </div>

      {/* Main Circular Arrangement + Central Porridge Pile */}
      <PorridgeCircle
        slots={view.publicCircle}
        remainingCount={view.remainingCircleCount}
        centralPile={view.centralPile}
        openingPileCard={view.openingPileCard}
        topPileCard={view.topPileCard}
        variation={view.variation}
        direction={view.direction}
        cardTexture={cardTexture}
        canSelect={isHumanSelecting}
        isBotTurn={isBotTurn}
        isCollecting={isCollecting}
        lastRevealResult={view.lastRevealResult}
        onSelectSlot={(positionId) =>
          onSelectCard(positionId, view.currentPlayer.id)
        }
      />
    </div>
  );
}
