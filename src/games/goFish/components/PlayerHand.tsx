import { useMemo } from 'react';
import { GameCardTile } from '../../../components/games/GameCardTile';
import type {
  CardRank,
  CardTexture,
  StandardCard,
} from '../../../types/playingCard';
import { formatCardLabel, formatRankPlural } from '../engine/deck';

interface PlayerHandProps {
  playerName: string;
  hand: StandardCard[];
  selectedRank: CardRank | null;
  newlyDrawnCardIds: string[];
  lastPickedUpCards: StandardCard[];
  canInteract: boolean;
  cardTexture: CardTexture;
  onSelectRank: (rank: CardRank) => void;
}

export function PlayerHand({
  playerName,
  hand,
  selectedRank,
  newlyDrawnCardIds,
  lastPickedUpCards,
  canInteract,
  cardTexture,
  onSelectRank,
}: PlayerHandProps) {
  const newlyDrawnSet = useMemo(
    () => new Set(newlyDrawnCardIds),
    [newlyDrawnCardIds]
  );

  const rankGroups = useMemo(() => {
    const groups = new Map<CardRank, StandardCard[]>();
    for (const card of hand) {
      const existing = groups.get(card.rank) ?? [];
      existing.push(card);
      groups.set(card.rank, existing);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [hand]);

  return (
    <section
      aria-labelledby="go-fish-hand-heading"
      className="rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E6DED2] pb-3">
        <div>
          <h2
            id="go-fish-hand-heading"
            className="font-serif text-lg font-semibold text-[#1E1A18]"
          >
            {playerName}’s Private Hand
          </h2>
          <p className="text-xs text-[#524943]">
            {canInteract
              ? 'Cards are grouped by rank. Tap any card to select its rank for your request.'
              : 'Your hand remains private to you.'}
          </p>
        </div>
        <span className="font-mono text-xs font-medium text-[#6B6059] tabular-nums">
          {hand.length} {hand.length === 1 ? 'card' : 'cards'} ·{' '}
          {rankGroups.length} {rankGroups.length === 1 ? 'rank' : 'ranks'}
        </span>
      </div>

      {lastPickedUpCards.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#1E563B]/35 bg-[#EEF6F0] px-3.5 py-2.5">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-wider text-[#184E34] uppercase">
              Last Picked Up from Fish Pond
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#1E1A18]">
              You drew:{' '}
              <span className="font-mono font-semibold tabular-nums">
                {lastPickedUpCards.map(formatCardLabel).join(', ')}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lastPickedUpCards.map((card) => (
              <GameCardTile
                key={`pickup-${card.id}`}
                card={card}
                size="sm"
                texture={cardTexture}
                isNewlyDrawn={true}
              />
            ))}
          </div>
        </div>
      )}

      {hand.length === 0 ? (
        <p className="mt-4 text-sm text-[#524943]">
          You currently hold no cards in hand.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3.5">
          {rankGroups.map(([rank, cards]) => {
            const isRankSelected = selectedRank === rank;
            return (
              <div
                key={`hand-group-${rank}`}
                className={`rounded-md border p-2.5 transition-colors ${
                  isRankSelected
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : 'border-[#E6DED2] bg-[#F4EFE7]/60'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#1E1A18] tabular-nums">
                    {formatRankPlural(rank)} ({cards.length}/4)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cards.map((card) => (
                    <GameCardTile
                      key={card.id}
                      card={card}
                      size="md"
                      texture={cardTexture}
                      selected={isRankSelected}
                      isNewlyDrawn={newlyDrawnSet.has(card.id)}
                      disabled={!canInteract}
                      onClick={
                        canInteract ? () => onSelectRank(rank) : undefined
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
