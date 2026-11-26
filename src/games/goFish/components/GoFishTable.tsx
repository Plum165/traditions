import { useEffect, useState } from 'react';
import { AlertCircle, Bot, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import type { CardRank, CardTexture } from '../../../types/playingCard';
import type { PublicGoFishView } from '../engine/types';
import { BookCollection } from './BookCollection';
import { FishPond } from './FishPond';
import { GameNotification } from './GameNotification';
import { GoFishVictory } from './GoFishVictory';
import { OpponentSelector } from './OpponentSelector';
import { PlayerHand } from './PlayerHand';
import { PlayerStatus } from './PlayerStatus';
import { RankSelector } from './RankSelector';
import { RequestConfirmation } from './RequestConfirmation';

interface GoFishTableProps {
  view: PublicGoFishView;
  cardTexture: CardTexture;
  errorMessage: string | null;
  onChangeCardTexture: (texture: CardTexture) => void;
  onToggleSound: () => void;
  onSubmitRequest: (
    playerId: string,
    opponentId: string,
    rank: CardRank
  ) => void;
  onAcknowledgeTurnEnd: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GoFishTable({
  view,
  cardTexture,
  errorMessage,
  onChangeCardTexture,
  onToggleSound,
  onSubmitRequest,
  onAcknowledgeTurnEnd,
  onPlayAgain,
  onNewGame,
}: GoFishTableProps) {
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(
    null
  );
  const [selectedRank, setSelectedRank] = useState<CardRank | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isPlaying = view.status === 'PLAYING';
  const isHumanTurn =
    isPlaying &&
    !view.pendingTurnAdvance &&
    !view.awaitingPassConfirmation &&
    view.currentPlayer.type === 'human';

  // Reset or sanitize local selection whenever turn, player, or available ranks change
  useEffect(() => {
    setSubmitting(false);
    if (
      selectedOpponentId &&
      !view.eligibleOpponents.some((opp) => opp.id === selectedOpponentId)
    ) {
      setSelectedOpponentId(null);
    }
    if (selectedRank !== null && !view.availableRanks.includes(selectedRank)) {
      setSelectedRank(null);
    }
  }, [
    view.turnNumber,
    view.currentPlayer.id,
    view.eligibleOpponents,
    view.availableRanks,
    selectedOpponentId,
    selectedRank,
  ]);

  // Auto-select the sole eligible opponent in 2-player games for smoother mobile play
  const effectiveOpponentId =
    selectedOpponentId ??
    (view.eligibleOpponents.length === 1 ? view.eligibleOpponents[0].id : null);

  const selectedOpponent =
    view.eligibleOpponents.find((opp) => opp.id === effectiveOpponentId) ??
    null;

  const allOtherPlayers = view.players.filter(
    (p) => p.id !== view.currentPlayer.id
  );

  const handleConfirm = () => {
    if (!isHumanTurn || submitting || !selectedOpponent || selectedRank === null) {
      return;
    }
    setSubmitting(true);
    onSubmitRequest(view.currentPlayer.id, selectedOpponent.id, selectedRank);
    setSelectedRank(null);
  };

  const handleCancel = () => {
    setSelectedRank(null);
    if (view.eligibleOpponents.length > 1) {
      setSelectedOpponentId(null);
    }
  };

  const justDrewCard =
    view.lastOutcome?.kind === 'go-fish-match' ||
    view.lastOutcome?.kind === 'go-fish-miss';

  return (
    <div className="space-y-5 overflow-x-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] px-3.5 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-xs text-[#6B6059] tabular-nums">
            Turn {view.turnNumber} ·{' '}
            {view.mode === 'vs-bots'
              ? 'Play Against Bots'
              : view.mode === 'pass-and-play'
                ? 'Pass and Play'
                : 'Mixed Players & Bots'}{' '}
            · <span className="capitalize">{view.direction}</span>
          </p>
          <p className="mt-0.5 font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
            {view.status === 'GAME_OVER'
              ? 'Game Completed'
              : `${view.currentPlayer.name}’s Turn`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={view.rules.soundEnabled}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            {view.rules.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4 text-[#6B6059]" aria-hidden="true" />
            )}
            <span>{view.rules.soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeCardTexture(
                cardTexture === 'classic' ? 'archival' : 'classic'
              )
            }
            className="inline-flex min-h-[44px] items-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            Cards: {cardTexture === 'classic' ? 'Classic' : 'Archival'}
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Inline Victory Panel (Board Remains Inspectable Below) */}
      {view.status === 'GAME_OVER' && (
        <GoFishVictory
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

      {/* Live Turn Notification */}
      <GameNotification
        view={view}
        cardTexture={cardTexture}
        onAcknowledgeTurnEnd={onAcknowledgeTurnEnd}
      />

      {/* Player Status Grid */}
      <PlayerStatus
        players={view.players}
        winnerIds={view.winnerIds}
        isGameOver={view.status === 'GAME_OVER'}
      />

      {/* Center Table: Fish Pond + Guided Asking Controls */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <FishPond
            drawPileCount={view.drawPileCount}
            totalBooksCompleted={view.totalBooksCompleted}
            justDrewCard={justDrewCard}
            animationsEnabled={view.rules.animationsEnabled}
          />
        </div>

        <div className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-5 lg:col-span-8">
          {view.status === 'GAME_OVER' ? (
            <div className="flex h-full flex-col justify-center text-center sm:text-left">
              <p className="font-serif text-lg font-semibold text-[#1E1A18]">
                Round Complete
              </p>
              <p className="mt-1 text-sm text-[#4A413B]">
                All actions are frozen. Inspect the completed books below or start a new game above.
              </p>
            </div>
          ) : view.pendingTurnAdvance ? (
            <div className="flex h-full flex-col justify-center">
              <p className="font-serif text-lg font-semibold text-[#1E1A18]">
                Turn Complete
              </p>
              <p className="mt-1 text-sm text-[#4A413B]">
                Review the drawn card shown above, then tap{' '}
                <strong>Pass Turn to Next Player</strong> when ready so the next player cannot see your hand.
              </p>
            </div>
          ) : view.currentPlayer.type === 'bot' ? (
            <div className="flex h-full items-center gap-3.5 py-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#E6D6BE] bg-[#FBF4E7] text-[#6E4411]">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif text-lg font-semibold text-[#1E1A18]">
                  {view.currentPlayer.name} is choosing a card rank…
                </p>
                <p className="mt-0.5 text-xs text-[#524943]">
                  Bot difficulty:{' '}
                  {BOT_DIFFICULTY_LABELS[view.currentPlayer.difficulty ?? 'normal']}{' '}
                  · Automated turn in progress
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <OpponentSelector
                opponents={view.eligibleOpponents}
                allOtherPlayers={allOtherPlayers}
                selectedOpponentId={effectiveOpponentId}
                disabled={!isHumanTurn || submitting}
                onSelectOpponent={setSelectedOpponentId}
              />

              <RankSelector
                availableRanks={view.availableRanks}
                hand={view.visibleHand ?? []}
                selectedRank={selectedRank}
                disabled={!isHumanTurn || submitting}
                onSelectRank={setSelectedRank}
              />

              <RequestConfirmation
                opponentName={selectedOpponent?.name ?? null}
                rank={selectedRank}
                disabled={!isHumanTurn || submitting}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active Human Player's Private Hand */}
      {view.visibleHand !== null && (
        <PlayerHand
          playerName={
            view.currentPlayer.type === 'human'
              ? view.currentPlayer.name
              : view.players.find((p) => p.type === 'human')?.name ?? 'Your'
          }
          hand={view.visibleHand}
          selectedRank={isHumanTurn ? selectedRank : null}
          newlyDrawnCardId={view.newlyDrawnCardId}
          canInteract={isHumanTurn && !submitting}
          cardTexture={cardTexture}
          onSelectRank={(rank) =>
            setSelectedRank((prev) => (prev === rank ? null : rank))
          }
        />
      )}

      {/* Completed Books Collection */}
      <BookCollection players={view.players} cardTexture={cardTexture} />
    </div>
  );
}
