import { Check, X } from 'lucide-react';
import type { CardRank } from '../../../types/playingCard';
import { formatRankPlural } from '../engine/deck';

interface RequestConfirmationProps {
  opponentName: string | null;
  rank: CardRank | null;
  disabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RequestConfirmation({
  opponentName,
  rank,
  disabled,
  onConfirm,
  onCancel,
}: RequestConfirmationProps) {
  const readyToConfirm = Boolean(opponentName && rank !== null);

  return (
    <div className="rounded-md border border-[#DDD4C7] bg-[#F4EFE7] p-3.5 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-wider text-[#6B6059] uppercase">
            3. Confirm Request
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#1E1A18]">
            {readyToConfirm && rank !== null
              ? `Ask ${opponentName} for all their ${formatRankPlural(rank)}?`
              : 'Select an opponent and a rank above to ask.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || !readyToConfirm}
            onClick={onConfirm}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-[#7C2D36] px-4 py-2 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Confirm Request</span>
          </button>

          {readyToConfirm && (
            <button
              type="button"
              disabled={disabled}
              onClick={onCancel}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3.5 py-2 text-sm font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
