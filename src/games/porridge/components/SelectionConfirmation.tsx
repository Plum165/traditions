import { Check, HelpCircle, RotateCcw } from 'lucide-react';

interface SelectionConfirmationProps {
  positionNumber: number;
  playerName: string;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SelectionConfirmation({
  positionNumber,
  playerName,
  disabled = false,
  onConfirm,
  onCancel,
}: SelectionConfirmationProps) {
  return (
    <section
      role="region"
      aria-labelledby="selection-confirm-heading"
      className="rounded-lg border-2 border-[#7C2D36] bg-[#FAF7F2] p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#7C2D36] text-[#FAF7F2]">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-mono text-xs font-semibold tracking-wider text-[#6B6059] uppercase tabular-nums">
              {playerName} · Circle Position #{String(positionNumber).padStart(2, '0')}
            </p>
            <h3
              id="selection-confirm-heading"
              className="mt-0.5 font-serif text-lg font-semibold text-[#1E1A18] sm:text-xl"
            >
              You selected a card
            </h3>
            <p className="mt-0.5 text-sm text-[#4A413B]">
              Are you sure you want to reveal this card? It stays hidden until confirmed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            disabled={disabled}
            onClick={onConfirm}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-4 py-2.5 text-sm font-semibold text-[#FAF7F2] transition-colors hover:bg-[#64222A] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Confirm Selection</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onCancel}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-[#B9AA98] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium text-[#1E1A18] transition-colors hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Choose Another Card</span>
          </button>
        </div>
      </div>
    </section>
  );
}
