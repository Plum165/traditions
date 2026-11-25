import { Bot, Check } from 'lucide-react';
import type { PublicCircleSlot } from '../engine/types';

interface CircleCardProps {
  slot: PublicCircleSlot;
  disabled: boolean;
  isBotSelecting?: boolean;
  layoutVariant: 'ring' | 'grid';
  onSelect: (positionId: string) => void;
}

export function CircleCard({
  slot,
  disabled,
  isBotSelecting = false,
  layoutVariant,
  onSelect,
}: CircleCardProps) {
  const positionNumber = slot.positionIndex + 1;

  if (slot.status === 'removed') {
    return (
      <div
        aria-hidden="true"
        className={
          layoutVariant === 'ring'
            ? 'h-14 w-11 rounded border border-dashed border-[#FAF7F2]/15 bg-[#152D22]/35 md:h-16 md:w-12'
            : 'flex min-h-[54px] w-full items-center justify-center rounded border border-dashed border-[#FAF7F2]/15 bg-[#152D22]/35 font-mono text-[10px] text-[#FAF7F2]/25 tabular-nums'
        }
      >
        {layoutVariant === 'grid' ? '—' : null}
      </div>
    );
  }

  const isSelected = slot.status === 'selected' || slot.isSelected;
  const sizeClass =
    layoutVariant === 'ring'
      ? 'h-14 w-11 md:h-16 md:w-12'
      : 'min-h-[54px] w-full py-1.5';

  const stateClasses = isSelected
    ? isBotSelecting
      ? 'z-20 scale-110 border-2 border-[#F59E0B] bg-[#5E2027] ring-2 ring-[#F59E0B]/70 shadow-md'
      : 'z-20 scale-110 border-2 border-[#FAF7F2] bg-[#9E3540] ring-2 ring-[#F5EBD8] shadow-md'
    : 'border border-[#FAF7F2]/45 bg-[#7C2D36] shadow-xs hover:border-[#FAF7F2] hover:bg-[#8E353F]';

  const interactionClasses = disabled
    ? 'cursor-not-allowed opacity-90'
    : 'cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-[#FAF7F2]';

  const statusDescription = isSelected
    ? isBotSelecting
      ? 'selected by bot'
      : 'selected, awaiting confirmation'
    : 'face down, available';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(slot.positionId)}
      aria-pressed={isSelected}
      aria-label={`Circle card position ${positionNumber}, ${statusDescription}`}
      className={`relative flex flex-col items-center justify-center rounded transition-transform duration-150 select-none ${sizeClass} ${stateClasses} ${interactionClasses}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none flex h-[82%] w-[80%] flex-col items-center justify-center rounded-xs border border-[#FAF7F2]/30"
      >
        {isSelected ? (
          isBotSelecting ? (
            <Bot className="h-3.5 w-3.5 text-[#FDE68A]" />
          ) : (
            <Check className="h-3.5 w-3.5 text-[#FAF7F2]" />
          )
        ) : null}
        <span className="font-mono text-[10px] font-semibold text-[#FAF7F2]/90 tabular-nums">
          {String(positionNumber).padStart(2, '0')}
        </span>
      </span>
    </button>
  );
}
