import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Eye,
  Film,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { formatCardLabel } from '../engine/deck';
import type {
  CardTexture,
  DrawSource,
  PublicTableView,
  ReplayActionType,
} from '../engine/types';
import { validateNewSet } from '../engine/validation';
import { GameCardTile } from './GameCardTile';
import { SevensReplayViewer } from './SevensReplayViewer';

interface SevensTableProps {
  view: PublicTableView;
  errorMessage: string | null;
  onClearError: () => void;
  onDraw: (source: DrawSource) => void;
  onPlayNewSet: (cardIds: string[]) => void;
  onAddToSet: (setId: string, cardIds: string[]) => void;
  onReplaceJoker: (setId: string, cardId: string) => void;
  onDiscard: (cardId: string) => void;
  onPlayAgain: () => void;
  onChangeSetup: () => void;
  allowDiscardPickupTop: boolean;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
}

const PHASE_LABEL: Record<PublicTableView['phase'], string> = {
  DRAW: 'Step 1 of 3: Draw 1 Card',
  PLAY: 'Step 2 of 3: Play Sets or Discard',
  DISCARD: 'Step 3 of 3: Discard 1 Card',
};

const BOT_PHASE_PROMPT: Record<PublicTableView['phase'], string> = {
  DRAW: 'Evaluating the top discard card vs. drawing from the deck...',
  PLAY: 'Scanning hand for matching sets, runs, extensions, or Joker swaps...',
  DISCARD: 'Selecting a strategic card to discard...',
};

const BOT_ACTION_TAG: Record<ReplayActionType, string> = {
  START: 'Start',
  DRAW_DECK: 'Drew Deck',
  DRAW_DISCARD: 'Took Discard',
  PLAY_NEW_SET: 'New Set',
  ADD_TO_SET: 'Added',
  REPLACE_JOKER: 'Joker Swap',
  DISCARD: 'Discarded',
  VICTORY: 'Won',
};

export function SevensTable({
  view,
  errorMessage,
  onClearError,
  onDraw,
  onPlayNewSet,
  onAddToSet,
  onReplaceJoker,
  onDiscard,
  onPlayAgain,
  onChangeSetup,
  allowDiscardPickupTop,
  cardTexture,
  onChangeCardTexture,
}: SevensTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [victoryDismissed, setVictoryDismissed] = useState(false);
  const [showVictoryDetails, setShowVictoryDetails] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  const isGameOver = view.status === 'GAME_OVER';
  const isHumanTurn =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    view.currentPlayer.type === 'human';
  const isBotTurn =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    view.currentPlayer.type === 'bot';

  const canDrawFromDeck =
    isHumanTurn && view.phase === 'DRAW' && !view.hasDrawnThisTurn && view.drawPileCount > 0;
  const canDrawFromDiscard =
    isHumanTurn &&
    view.phase === 'DRAW' &&
    !view.hasDrawnThisTurn &&
    allowDiscardPickupTop &&
    view.discardPileCount > 0 &&
    view.topDiscard !== null;

  const visibleHand = view.visibleHand ?? [];
  const drawnCard = useMemo(
    () =>
      view.drawnCardId
        ? visibleHand.find((card) => card.id === view.drawnCardId) ?? null
        : null,
    [visibleHand, view.drawnCardId]
  );

  const selectedCards = useMemo(
    () => visibleHand.filter((card) => selectedIds.includes(card.id)),
    [visibleHand, selectedIds]
  );

  const selectionSetValidation = useMemo(() => {
    if (selectedCards.length === 0) return null;
    return validateNewSet(selectedCards);
  }, [selectedCards]);

  const toggleCard = (cardId: string) => {
    if (!isHumanTurn) return;
    onClearError();
    setSelectedIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handlePlayNewSetClick = () => {
    onPlayNewSet(selectedIds);
    setSelectedIds([]);
  };

  const handleAddToSetClick = (setId: string) => {
    onAddToSet(setId, selectedIds);
    setSelectedIds([]);
  };

  const handleReplaceJokerClick = (setId: string) => {
    if (selectedIds.length !== 1) return;
    onReplaceJoker(setId, selectedIds[0]);
    setSelectedIds([]);
  };

  const handleDiscardClick = () => {
    if (selectedIds.length !== 1) return;
    const cardId = selectedIds[0];
    setSelectedIds([]);
    onDiscard(cardId);
  };

  const victoryHeadline = view.winner
    ? view.winner.type === 'bot'
      ? `Game Over! ${view.winner.name} (Bot) has won!`
      : view.mode === 'vs-bots' && view.winner.name === 'You'
        ? 'Congratulations! You won Sevens!'
        : `Congratulations! ${view.winner.name} won Sevens!`
    : 'Game Over';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Persistent Victory Notification (Preserves Game Table Below) */}
      {isGameOver && (
        <section
          role="region"
          aria-labelledby="victory-banner-heading"
          className="rounded-lg border-2 border-[#7C2D36] bg-[#F4EFE7] p-4 shadow-sm sm:p-6"
        >
          {victoryDismissed ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 shrink-0 text-[#7C2D36]" aria-hidden="true" />
                <div>
                  <h2
                    id="victory-banner-heading"
                    className="font-serif text-lg font-semibold text-[#1E1A18]"
                  >
                    {victoryHeadline}
                  </h2>
                  <p className="text-xs text-[#524943]">
                    Viewing final game state · Turn {view.turnNumber}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {view.replayFrames && view.replayFrames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplay((prev) => !prev)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#7C2D36] bg-[#FAF7F2] px-3.5 py-2 text-xs font-semibold text-[#7C2D36] hover:bg-[#EFE8DC]"
                  >
                    <Film className="h-4 w-4" aria-hidden="true" />
                    <span>{showReplay ? 'Hide Match Replay' : 'Watch Match Replay'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVictoryDismissed(false)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>Show Standings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplay(false);
                    onChangeSetup();
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2 text-xs font-medium text-[#FAF7F2] hover:bg-[#64222A]"
                >
                  New Game
                </button>
                <Link
                  to="/games"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                >
                  Return to Games
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C8B08A] bg-[#FAF7F2] text-[#7C2D36]">
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
                      Game Completed · Turn {view.turnNumber} · Winner Type:{' '}
                      {view.winnerType === 'bot' ? 'Bot' : 'Human'}
                    </p>
                    <h2
                      id="victory-banner-heading"
                      className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
                    >
                      {victoryHeadline}
                    </h2>
                    <p className="mt-1 text-sm text-[#4A413B]">
                      The final table, played sets, and player positions remain visible below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Standings */}
              <div className="mt-4 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
                    Final Player Standings
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVictoryDetails((prev) => !prev)}
                    aria-expanded={showVictoryDetails}
                    className="inline-flex min-h-[36px] items-center gap-1 text-xs font-medium text-[#7C2D36] hover:text-[#5B1E25]"
                  >
                    <span>{showVictoryDetails ? 'Hide Details' : 'View More Details'}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        showVictoryDetails ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
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
                        {entry.isWinner ? ' — Winner' : ''}
                      </span>
                      <span className="font-mono text-xs text-[#524943] tabular-nums">
                        {entry.cardsRemaining}{' '}
                        {entry.cardsRemaining === 1 ? 'card' : 'cards'} remaining
                      </span>
                    </li>
                  ))}
                </ul>

                {showVictoryDetails && (
                  <div className="mt-3 border-t border-[#E6DED2] pt-3 text-xs text-[#4A413B]">
                    <p className="font-medium text-[#1E1A18]">
                      Table Summary: {view.tableSets.length} completed sets ·{' '}
                      {view.drawPileCount} cards left in draw pile · {view.discardPileCount} in
                      discard pile
                    </p>
                    <p className="mt-2 font-medium text-[#6B6059]">Recent Moves:</p>
                    <ul className="mt-1 space-y-1">
                      {view.actionLog.slice(0, 5).map((entry, idx) => (
                        <li key={`log-${idx}`}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Explicit User Navigation Actions */}
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                {view.replayFrames && view.replayFrames.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplay((prev) => !prev)}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border-2 border-[#7C2D36] bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-[#7C2D36] hover:bg-[#EFE8DC]"
                  >
                    <Film className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {showReplay
                        ? 'Hide Match Replay'
                        : 'Watch Match Replay (See Bot Cards)'}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setVictoryDismissed(true)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#B9AA98] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                >
                  Continue Viewing Game
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    setVictoryDismissed(false);
                    setShowReplay(false);
                    onChangeSetup();
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-4 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>New Game</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    setVictoryDismissed(false);
                    setShowReplay(false);
                    onPlayAgain();
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                >
                  Play Again (Same Setup)
                </button>
                <Link
                  to="/games"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#7C2D36] hover:bg-[#EFE8DC]"
                >
                  Return to Games
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Post-Game Match Replay Viewer */}
      {isGameOver && showReplay && view.replayFrames && view.replayFrames.length > 0 && (
        <SevensReplayViewer
          frames={view.replayFrames}
          cardTexture={cardTexture}
          onClose={() => setShowReplay(false)}
        />
      )}

      {/* Top Status & Player Positions */}
      <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD4C7] pb-3.5">
          <div className="min-w-0">
            <p className="font-mono text-xs text-[#6B6059] tabular-nums">
              Turn {view.turnNumber} ·{' '}
              {view.mode === 'pass-and-play'
                ? view.players.some((p) => p.type === 'bot')
                  ? 'Pass and Play + Bots'
                  : 'Pass and Play'
                : 'Play Against Bots'}
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
              {isGameOver
                ? 'Final Board State'
                : `${view.currentPlayer.name}’s Turn — ${PHASE_LABEL[view.phase]}`}
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
              onClick={onChangeSetup}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Game</span>
            </button>
          </div>
        </div>

        {/* Player Seats */}
        <div
          className="mt-3.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4"
          aria-label="Player positions"
        >
          {view.players.map((player) => {
            const isWinner = view.winner?.id === player.id;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-xs sm:px-3.5 sm:text-sm ${
                  isWinner
                    ? 'border-[#7C2D36] bg-[#FAF7F2] ring-1 ring-[#7C2D36]'
                    : player.isCurrentTurn
                      ? 'border-[#7C2D36] bg-[#FAF7F2] ring-1 ring-[#7C2D36]/30'
                      : 'border-[#DDD4C7] bg-[#FAF7F2]/70'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1E1A18]">
                    {player.name}
                    {player.type === 'bot' ? ' (Bot)' : ''}
                  </p>
                  <p className="text-[11px] text-[#6B6059] sm:text-xs">
                    {isWinner
                      ? 'Winner'
                      : player.isCurrentTurn
                        ? 'Active turn'
                        : isGameOver
                          ? 'Finished'
                          : 'Waiting'}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold text-[#1E1A18] tabular-nums">
                  {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bot Move Telegraph / Recent Bot Activity Prompt */}
      {isBotTurn ? (
        <section
          role="status"
          aria-live="polite"
          aria-label="Bot Move in Progress"
          className="rounded-lg border-2 border-[#8A5A19] bg-[#FBF4E7] p-4 text-[#1E1A18] shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#6E4411] text-[#FAF7F2]">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-serif text-base font-semibold text-[#1E1A18]">
                  {view.currentPlayer.name} (Bot) is thinking…
                </p>
                <span className="rounded-xs bg-[#6E4411] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#FAF7F2] uppercase">
                  {view.phase}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-[#5A360D] sm:text-sm">
                {BOT_PHASE_PROMPT[view.phase]}
              </p>
              <p className="mt-1.5 text-xs text-[#4A413B] sm:text-sm">
                Latest update: <span className="font-medium text-[#1E1A18]">{view.lastActionSummary}</span>
              </p>

              {view.botTurnFeed.length > 0 && (
                <ul className="mt-2.5 space-y-1 border-t border-[#E6D6BE] pt-2 text-xs text-[#3F3833]">
                  {view.botTurnFeed.slice(-4).map((entry) => (
                    <li key={entry.id} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 rounded-xs bg-[#E6D6BE] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#4A2E0B] uppercase">
                        {BOT_ACTION_TAG[entry.actionType]}
                      </span>
                      <span>{entry.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : (
        isHumanTurn &&
        view.botTurnFeed.length > 0 && (
          <section
            aria-label="Recent Bot Moves"
            className="rounded-lg border border-[#D4C3AA] bg-[#FAF5EC] p-3.5 text-[#1E1A18] sm:p-4"
          >
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 shrink-0 text-[#6E4411]" aria-hidden="true" />
              <h3 className="font-serif text-sm font-semibold text-[#1E1A18] sm:text-base">
                What the Bots Just Played
              </h3>
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-[#3F3833] sm:text-sm">
              {view.botTurnFeed.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline gap-2">
                  <span className="shrink-0 rounded-xs bg-[#EAE0D0] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#4A2E0B] uppercase">
                    {BOT_ACTION_TAG[entry.actionType]}
                  </span>
                  <span>{entry.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      )}

      {/* Live Action / Error Banner */}
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

      {/* Central Card Table */}
      <div className="rounded-lg border-2 border-[#C6B8A6] bg-[#1E3D2F] p-3.5 text-[#FAF7F2] sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Option A (Draw Pile) & Option B (Discard Pile) */}
          <div className="grid grid-cols-2 gap-3 border-b border-[#FAF7F2]/15 pb-5 lg:col-span-4 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
            {/* Option A: Face-Down Draw Pile */}
            <div className="flex flex-col items-center rounded-md border border-[#FAF7F2]/15 bg-[#152D22] p-3 text-center">
              <span className="text-xs font-medium text-[#E6DED2]">Draw Pile</span>
              <span className="mt-0.5 font-mono text-[11px] text-[#E6DED2]/80 tabular-nums">
                {view.drawPileCount} remaining
              </span>

              <div
                aria-hidden="true"
                className="mt-2.5 flex h-24 w-[4.25rem] flex-col items-center justify-center rounded-md border-2 border-[#FAF7F2]/40 bg-[#7C2D36] text-[#FAF7F2] shadow-sm sm:h-28 sm:w-20"
              >
                <span className="font-serif text-xs font-semibold">Deck</span>
                <span className="mt-1 font-mono text-xs tabular-nums">
                  {view.drawPileCount}
                </span>
              </div>

              <button
                type="button"
                disabled={!canDrawFromDeck}
                onClick={() => onDraw('draw-pile')}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Draw
              </button>
            </div>

            {/* Option B: Face-Up Discard Pile */}
            <div className="flex flex-col items-center rounded-md border border-[#FAF7F2]/15 bg-[#152D22] p-3 text-center">
              <span className="text-xs font-medium text-[#E6DED2]">Discard Pile</span>
              <span className="mt-0.5 font-mono text-[11px] text-[#E6DED2]/80 tabular-nums">
                {view.discardPileCount}{' '}
                {view.discardPileCount === 1 ? 'card' : 'cards'}
              </span>

              <div className="mt-2.5">
                {view.topDiscard ? (
                  <GameCardTile
                    card={view.topDiscard}
                    texture={cardTexture}
                    size="md"
                  />
                ) : (
                  <div className="flex h-24 w-[4.25rem] items-center justify-center rounded-md border border-dashed border-[#FAF7F2]/30 text-xs text-[#E6DED2]/70 sm:h-28 sm:w-20">
                    Empty
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!canDrawFromDiscard}
                onClick={() => onDraw('discard-pile')}
                title={
                  view.topDiscard
                    ? `Take ${formatCardLabel(view.topDiscard)} from discard pile`
                    : 'Discard pile is empty'
                }
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-[#FAF7F2]/60 bg-[#FAF7F2]/10 px-2.5 py-2 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#FAF7F2]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {view.topDiscard ? `Take ${formatCardLabel(view.topDiscard)}` : 'Take Discard'}
              </button>
            </div>
          </div>

          {/* Table Sets Zone */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Sets on the Table ({view.tableSets.length})
              </h3>
              {view.hasCreatedNewSetThisTurn && isHumanTurn && (
                <span className="text-xs text-[#F5EBD8]">
                  New set played · You can still extend existing sets
                </span>
              )}
            </div>

            {view.tableSets.length === 0 ? (
              <div className="mt-3 rounded-md border border-dashed border-[#FAF7F2]/25 p-5 text-center text-sm text-[#E6DED2]">
                No sets have been laid down yet. Draw from the Draw Pile or take the top Discard
                card, then select 3 or more cards to play a Matching Set or Consecutive Run.
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {view.tableSets.map((set) => {
                  const hasJoker = set.cards.some((c) => c.kind === 'joker');
                  const canShowExtend =
                    isHumanTurn && view.phase === 'PLAY' && selectedIds.length >= 1;
                  const canShowJokerSwap =
                    isHumanTurn &&
                    view.phase === 'PLAY' &&
                    hasJoker &&
                    selectedIds.length === 1;

                  return (
                    <div
                      key={set.id}
                      className="rounded-md border border-[#FAF7F2]/20 bg-[#152D22] p-3"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-[#E6DED2]">
                        <span>
                          {set.type === 'matching' ? 'Matching Set' : 'Consecutive Run'}
                        </span>
                        <span className="font-mono tabular-nums">{set.cards.length} cards</span>
                      </div>

                      <div className="mt-2.5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                        {set.cards.map((card) => (
                          <div key={card.id} className="shrink-0">
                            <GameCardTile
                              card={card}
                              size="sm"
                              texture={cardTexture}
                              highlight={card.kind === 'joker'}
                            />
                          </div>
                        ))}
                      </div>

                      {(canShowExtend || canShowJokerSwap) && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#FAF7F2]/15 pt-2.5">
                          {canShowExtend && (
                            <button
                              type="button"
                              onClick={() => handleAddToSetClick(set.id)}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Add Selected</span>
                            </button>
                          )}
                          {canShowJokerSwap && (
                            <button
                              type="button"
                              onClick={() => handleReplaceJokerClick(set.id)}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded border border-[#F5EBD8]/60 bg-[#6E4411] px-3 py-1.5 text-xs font-medium text-[#FAF7F2] hover:bg-[#5A360D]"
                            >
                              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Replace Joker</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Hand & Touch-Friendly Turn Controls */}
      {view.visibleHand !== null && (
        <section
          aria-label="Your Hand and Turn Controls"
          className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DED2] pb-3.5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18] sm:text-xl">
                {view.mode === 'pass-and-play'
                  ? `${view.currentPlayer.name}’s Hand`
                  : 'Your Hand'}{' '}
                <span className="font-mono text-sm font-normal text-[#6B6059] tabular-nums">
                  ({visibleHand.length} {visibleHand.length === 1 ? 'card' : 'cards'})
                </span>
              </h3>
              <p className="mt-0.5 text-xs text-[#524943]">
                {isGameOver
                  ? 'Game completed. Controls are locked while viewing the final board.'
                  : !isHumanTurn
                    ? `${view.currentPlayer.name} is taking their turn...`
                    : view.phase === 'DRAW'
                      ? 'Choose Draw or Take Discard above to start your turn.'
                      : drawnCard
                        ? `Newly drawn card (shaded green): ${formatCardLabel(
                            drawnCard
                          )} · Tap cards to select.`
                        : 'Tap cards to select. Swipe hand sideways if needed on small screens.'}
              </p>
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="min-h-[44px] rounded-md border border-[#C6B8A6] px-3.5 py-2 text-xs font-medium text-[#4A413B] hover:bg-[#EFE8DC]"
              >
                Deselect All ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Mobile: Horizontal scrollable rail without cramped overlap; Desktop: Clean wrapped grid */}
          {visibleHand.length === 0 ? (
            <p className="mt-4 text-sm font-medium text-[#14532D]">
              Hand is empty (0 cards left).
            </p>
          ) : (
            <div className="mt-3 flex flex-nowrap gap-2.5 overflow-x-auto px-1 pt-3 pb-4 sm:flex-wrap sm:gap-3 sm:overflow-visible">
              {visibleHand.map((card) => (
                <div key={card.id} className="shrink-0">
                  <GameCardTile
                    card={card}
                    selected={selectedIds.includes(card.id)}
                    isNewlyDrawn={view.drawnCardId === card.id}
                    texture={cardTexture}
                    disabled={!isHumanTurn || view.phase === 'DRAW'}
                    onClick={() => toggleCard(card.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Turn Action Bar */}
          {isHumanTurn && view.phase !== 'DRAW' && (
            <div className="mt-4 flex flex-col gap-4 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                {selectedCards.length === 0 ? (
                  <p className="text-[#524943]">
                    Tap 3+ cards for a new set, 1+ cards to extend a table set, or 1 card to
                    discard.
                  </p>
                ) : (
                  <div className="flex items-start gap-2">
                    {selectionSetValidation?.valid && !view.hasCreatedNewSetThisTurn ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#14532D]"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div>
                      <p className="font-medium text-[#1E1A18]">
                        Selected: {selectedCards.map(formatCardLabel).join(', ')}
                      </p>
                      {selectedCards.length >= 3 && selectionSetValidation && (
                        <p
                          className={`mt-0.5 text-xs ${
                            selectionSetValidation.valid ? 'text-[#14532D]' : 'text-[#7C2D36]'
                          }`}
                        >
                          {selectionSetValidation.valid
                            ? view.hasCreatedNewSetThisTurn
                              ? 'Valid set, but you have already created 1 new set this turn.'
                              : `Valid ${
                                  selectionSetValidation.setType === 'matching'
                                    ? 'Matching Set'
                                    : 'Consecutive Run'
                                } ready to play.`
                            : selectionSetValidation.reason}
                        </p>
                      )}
                      {selectedCards.length === 1 && (
                        <p className="mt-0.5 text-xs text-[#524943]">
                          Tap Discard Selected to end your turn, or tap Add Selected / Replace
                          Joker on a table set above.
                        </p>
                      )}
                      {selectedCards.length === 2 && (
                        <p className="mt-0.5 text-xs text-[#524943]">
                          Select 1 more card for a new set, or tap Add Selected on an existing set
                          above.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:shrink-0">
                <button
                  type="button"
                  disabled={
                    view.phase !== 'PLAY' ||
                    view.hasCreatedNewSetThisTurn ||
                    !selectionSetValidation?.valid
                  }
                  onClick={handlePlayNewSetClick}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#7C2D36] px-4 py-2 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Play Set
                </button>

                <button
                  type="button"
                  disabled={selectedIds.length !== 1}
                  onClick={handleDiscardClick}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#1E1A18] bg-[#FAF7F2] px-4 py-2 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
