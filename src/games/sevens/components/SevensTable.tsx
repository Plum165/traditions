import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { formatCardLabel } from '../engine/deck';
import type { PublicTableView } from '../engine/types';
import { validateNewSet } from '../engine/validation';
import { GameCardTile } from './GameCardTile';

interface SevensTableProps {
  view: PublicTableView;
  errorMessage: string | null;
  onClearError: () => void;
  onDraw: (source: 'draw-pile' | 'discard-pile') => void;
  onPlayNewSet: (cardIds: string[]) => void;
  onAddToSet: (setId: string, cardIds: string[]) => void;
  onReplaceJoker: (setId: string, cardId: string) => void;
  onDiscard: (cardId: string) => void;
  onPlayAgain: () => void;
  onChangeSetup: () => void;
  allowDiscardPickupTop: boolean;
}

const PHASE_LABEL: Record<PublicTableView['phase'], string> = {
  DRAW: 'Step 1 of 3: Draw 1 Card',
  PLAY: 'Step 2 of 3: Play Sets or Discard',
  DISCARD: 'Step 3 of 3: Discard 1 Card',
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
}: SevensTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isHumanTurn =
    view.status === 'PLAYING' &&
    !view.awaitingPassConfirmation &&
    view.currentPlayer.type === 'human';

  const visibleHand = view.visibleHand ?? [];

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

  if (view.status === 'GAME_OVER') {
    return (
      <section
        aria-labelledby="game-over-heading"
        className="mx-auto max-w-2xl rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-6 text-center sm:p-10"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C8B08A] bg-[#FAF7F2] text-[#7C2D36]">
          <Trophy className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="mt-4 font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase">
          Round Complete · Turn {view.turnNumber}
        </p>

        <h2
          id="game-over-heading"
          className="mt-2 font-serif text-3xl font-semibold text-[#1E1A18] sm:text-4xl"
        >
          {view.winner ? `${view.winner.name} wins the round!` : 'Game Over'}
        </h2>

        <p className="mt-2 text-sm text-[#4A413B]">{view.lastActionSummary}</p>

        <div className="mt-6 rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 text-left">
          <h3 className="font-sans text-xs font-semibold tracking-wider text-[#6B6059] uppercase">
            Final Hand Counts
          </h3>
          <ul className="mt-3 divide-y divide-[#E6DED2] text-sm">
            {view.players.map((player) => (
              <li key={player.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-[#1E1A18]">
                  {player.name}
                  {player.id === view.winner?.id ? ' (Winner)' : ''}
                </span>
                <span className="font-mono text-xs text-[#524943] tabular-nums">
                  {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'} left
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedIds([]);
              onPlayAgain();
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-5 py-2.5 text-sm font-medium text-[#FAF7F2] hover:bg-[#64222A]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onChangeSetup}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-5 py-2.5 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            Change Setup
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Status & Player Positions */}
      <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD4C7] pb-3.5">
          <div>
            <p className="font-mono text-xs text-[#6B6059] tabular-nums">
              Turn {view.turnNumber} ·{' '}
              {view.mode === 'pass-and-play' ? 'Pass and Play' : 'Play Against Bots'}
            </p>
            <p className="mt-0.5 font-serif text-lg font-semibold text-[#1E1A18]">
              {view.currentPlayer.name}’s Turn — {PHASE_LABEL[view.phase]}
            </p>
          </div>

          <button
            type="button"
            onClick={onChangeSetup}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Game</span>
          </button>
        </div>

        {/* Player Seats */}
        <div
          className="mt-3.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Player positions"
        >
          {view.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-md border px-3.5 py-2.5 text-sm ${
                player.isCurrentTurn
                  ? 'border-[#7C2D36] bg-[#FAF7F2] ring-1 ring-[#7C2D36]/30'
                  : 'border-[#DDD4C7] bg-[#FAF7F2]/60'
              }`}
            >
              <div>
                <p className="font-medium text-[#1E1A18]">
                  {player.name}
                  {player.type === 'bot' ? ' (Bot)' : ''}
                </p>
                <p className="text-xs text-[#6B6059]">
                  {player.isCurrentTurn ? 'Active turn' : 'Waiting'}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#1E1A18] tabular-nums">
                {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
              </span>
            </div>
          ))}
        </div>
      </div>

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
        <p>{errorMessage ?? view.lastActionSummary}</p>
      </div>

      {/* Central Card Table */}
      <div className="rounded-lg border-2 border-[#C6B8A6] bg-[#1E3D2F] p-4 text-[#FAF7F2] sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Draw & Discard Piles */}
          <div className="flex flex-wrap items-start gap-5 lg:col-span-4 lg:border-r lg:border-[#FAF7F2]/15 lg:pr-6">
            {/* Draw Pile */}
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-[#E6DED2]">Draw Pile</span>
              <button
                type="button"
                disabled={!isHumanTurn || view.phase !== 'DRAW'}
                onClick={() => onDraw('draw-pile')}
                className={`mt-2 flex h-28 w-20 flex-col items-center justify-center rounded-md border-2 text-center transition-transform sm:h-32 sm:w-22 ${
                  isHumanTurn && view.phase === 'DRAW'
                    ? 'cursor-pointer border-[#FAF7F2] bg-[#7C2D36] text-[#FAF7F2] shadow-md hover:-translate-y-1'
                    : 'cursor-not-allowed border-[#FAF7F2]/25 bg-[#294F3E] text-[#E6DED2]/70'
                }`}
              >
                <span className="font-serif text-sm font-semibold">Draw</span>
                <span className="mt-1 font-mono text-xs tabular-nums">
                  {view.drawPileCount} left
                </span>
              </button>
              {isHumanTurn && view.phase === 'DRAW' && (
                <span className="mt-1.5 text-xs text-[#F5EBD8]">Tap to draw 1 card</span>
              )}
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-[#E6DED2] tabular-nums">
                Discard Pile ({view.discardPileCount})
              </span>
              <div className="mt-2">
                {view.topDiscard ? (
                  <GameCardTile card={view.topDiscard} size="lg" />
                ) : (
                  <div className="flex h-28 w-20 items-center justify-center rounded-md border border-dashed border-[#FAF7F2]/30 text-xs text-[#E6DED2]/70 sm:h-32 sm:w-22">
                    Empty
                  </div>
                )}
              </div>
              {allowDiscardPickupTop &&
                isHumanTurn &&
                view.phase === 'DRAW' &&
                view.topDiscard && (
                  <button
                    type="button"
                    onClick={() => onDraw('discard-pile')}
                    className="mt-2 min-h-[36px] rounded border border-[#FAF7F2]/40 bg-[#FAF7F2]/10 px-2.5 py-1 text-xs font-medium text-[#FAF7F2] hover:bg-[#FAF7F2]/20"
                  >
                    Take Top Discard
                  </button>
                )}
            </div>
          </div>

          {/* Table Sets Zone */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Sets on the Table ({view.tableSets.length})
              </h3>
              {view.hasCreatedNewSetThisTurn && isHumanTurn && (
                <span className="text-xs text-[#F5EBD8]">
                  New set played this turn · You may still add to existing sets
                </span>
              )}
            </div>

            {view.tableSets.length === 0 ? (
              <div className="mt-3 rounded-md border border-dashed border-[#FAF7F2]/25 p-6 text-center text-sm text-[#E6DED2]">
                No sets have been laid down yet. Draw a card, then select 3 or more cards in your
                hand to create a Matching Set or Consecutive Run.
              </div>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {view.tableSets.map((set) => {
                  const hasJoker = set.cards.some((c) => c.kind === 'joker');
                  const canShowExtend = isHumanTurn && view.phase === 'PLAY' && selectedIds.length >= 1;
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

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {set.cards.map((card) => (
                          <GameCardTile
                            key={card.id}
                            card={card}
                            size="sm"
                            highlight={card.kind === 'joker'}
                          />
                        ))}
                      </div>

                      {(canShowExtend || canShowJokerSwap) && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#FAF7F2]/15 pt-2.5">
                          {canShowExtend && (
                            <button
                              type="button"
                              onClick={() => handleAddToSetClick(set.id)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Add Selected</span>
                            </button>
                          )}
                          {canShowJokerSwap && (
                            <button
                              type="button"
                              onClick={() => handleReplaceJokerClick(set.id)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded border border-[#F5EBD8]/60 bg-[#6E4411] px-2.5 py-1 text-xs font-medium text-[#FAF7F2] hover:bg-[#5A360D]"
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

      {/* Player Hand & Action Controls */}
      <section
        aria-label="Your Hand and Turn Controls"
        className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DED2] pb-4">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#1E1A18]">
              {view.mode === 'pass-and-play'
                ? `${view.currentPlayer.name}’s Hand`
                : 'Your Hand'}{' '}
              <span className="font-mono text-sm font-normal text-[#6B6059] tabular-nums">
                ({visibleHand.length} cards)
              </span>
            </h3>
            <p className="mt-0.5 text-xs text-[#524943]">
              {!isHumanTurn
                ? `${view.currentPlayer.name} is taking their turn...`
                : view.phase === 'DRAW'
                  ? 'Start your turn by drawing a card from the Draw Pile above.'
                  : 'Select 3+ cards to play a new set, select 1+ cards to extend a table set, or select 1 card to discard and end your turn.'}
            </p>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="min-h-[40px] rounded-md border border-[#C6B8A6] px-3 py-1.5 text-xs font-medium text-[#4A413B] hover:bg-[#EFE8DC]"
            >
              Clear Selection ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Interactive Hand Cards */}
        <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-3">
          {visibleHand.map((card) => (
            <GameCardTile
              key={card.id}
              card={card}
              selected={selectedIds.includes(card.id)}
              disabled={!isHumanTurn || view.phase === 'DRAW'}
              onClick={() => toggleCard(card.id)}
            />
          ))}
        </div>

        {/* Live Selection Validation & Action Bar */}
        {isHumanTurn && view.phase !== 'DRAW' && (
          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {selectedCards.length === 0 ? (
                <p className="text-[#524943]">No cards selected yet.</p>
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
                        You can discard this card, add it to an existing set, or swap a Joker.
                      </p>
                    )}
                    {selectedCards.length === 2 && (
                      <p className="mt-0.5 text-xs text-[#524943]">
                        Select at least 1 more card for a new set, or add these to an existing set.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
                Play New Set
              </button>

              <button
                type="button"
                disabled={selectedIds.length !== 1}
                onClick={handleDiscardClick}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#1E1A18] bg-[#FAF7F2] px-4 py-2 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Discard Selected
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
