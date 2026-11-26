import type { CardRank, StandardCard } from '../../../types/playingCard';
import { formatRankLabel, formatRankPlural } from '../engine/deck';

interface RankSelectorProps {
  availableRanks: CardRank[];
  hand: StandardCard[];
  selectedRank: CardRank | null;
  disabled: boolean;
  onSelectRank: (rank: CardRank) => void;
}

export function RankSelector({
  availableRanks,
  hand,
  selectedRank,
  disabled,
  onSelectRank,
}: RankSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#1E1A18]">
        2. Which rank are you asking for?
      </legend>
      <p className="mt-0.5 text-xs text-[#524943]">
        You can only ask for ranks currently in your hand.
      </p>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {availableRanks.map((rank) => {
          const countInHand = hand.filter((c) => c.rank === rank).length;
          const isSelected = selectedRank === rank;
          return (
            <button
              key={`ask-rank-${rank}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRank(rank)}
              aria-pressed={isSelected}
              aria-label={`Ask for ${formatRankPlural(rank)} (you hold ${countInHand})`}
              className={`inline-flex min-h-[44px] min-w-[52px] items-center justify-center gap-1 rounded-md border px-3 py-2 font-mono text-sm font-semibold tabular-nums transition-colors ${
                isSelected
                  ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                  : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
              }`}
            >
              <span>{formatRankLabel(rank)}</span>
              <span
                className={`text-[11px] font-normal ${
                  isSelected ? 'text-[#EFE8DC]' : 'text-[#6B6059]'
                }`}
              >
                ×{countInHand}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
