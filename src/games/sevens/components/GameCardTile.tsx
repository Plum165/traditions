import { Check } from 'lucide-react';
import { SUIT_SYMBOLS, formatCardLabel, formatRankLabel } from '../engine/deck';
import type { PlayingCard, StandardSuit } from '../engine/types';

interface GameCardTileProps {
  card: PlayingCard;
  selected?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SUIT_STYLES: Record<
  StandardSuit | 'joker',
  { text: string; bg: string; symbol: string; suitName: string }
> = {
  hearts: {
    text: 'text-[#9B1C2E]',
    bg: 'bg-[#FFFDF9]',
    symbol: SUIT_SYMBOLS.hearts,
    suitName: 'Hearts',
  },
  diamonds: {
    text: 'text-[#9B1C2E]',
    bg: 'bg-[#FFFDF9]',
    symbol: SUIT_SYMBOLS.diamonds,
    suitName: 'Diamonds',
  },
  spades: {
    text: 'text-[#1E1A18]',
    bg: 'bg-[#FFFDF9]',
    symbol: SUIT_SYMBOLS.spades,
    suitName: 'Spades',
  },
  clubs: {
    text: 'text-[#1E1A18]',
    bg: 'bg-[#FFFDF9]',
    symbol: SUIT_SYMBOLS.clubs,
    suitName: 'Clubs',
  },
  joker: {
    text: 'text-[#6E4411]',
    bg: 'bg-[#F8EEDB]',
    symbol: '★',
    suitName: 'Joker',
  },
};

const SIZE_CLASSES: Record<NonNullable<GameCardTileProps['size']>, string> = {
  sm: 'h-20 w-14 p-1.5',
  md: 'h-26 w-[4.5rem] p-2 sm:h-28 sm:w-20 sm:p-2.5',
  lg: 'h-28 w-20 p-2.5 sm:h-32 sm:w-22',
};

export function GameCardTile({
  card,
  selected = false,
  disabled = false,
  highlight = false,
  size = 'md',
  onClick,
}: GameCardTileProps) {
  const isJoker = card.kind === 'joker';
  const style = isJoker ? SUIT_STYLES.joker : SUIT_STYLES[card.suit];
  const rankDisplay = isJoker ? 'JKR' : formatRankLabel(card.rank);
  const fullLabel = isJoker
    ? `Joker ${card.jokerIndex}`
    : `${rankDisplay} of ${style.suitName}`;

  const containerClasses = [
    'relative flex flex-col justify-between rounded-md border text-left select-none transition-transform duration-150',
    SIZE_CLASSES[size],
    style.bg,
    selected
      ? '-translate-y-2 border-[#7C2D36] ring-2 ring-[#7C2D36]/40 shadow-md'
      : highlight
        ? 'border-[#8A5A19] ring-1 ring-[#8A5A19]/30 shadow-xs'
        : 'border-[#C9BCAE] shadow-xs',
    onClick && !disabled
      ? 'cursor-pointer hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#7C2D36]'
      : '',
    disabled ? 'opacity-65 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {selected && (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#7C2D36] text-[#FAF7F2] shadow-xs"
        >
          <Check className="h-3 w-3" />
        </span>
      )}

      <div className={`flex items-start justify-between leading-none ${style.text}`}>
        <span className="font-mono text-xs font-semibold tracking-tight tabular-nums sm:text-sm">
          {rankDisplay}
        </span>
        <span className="text-xs sm:text-sm" aria-hidden="true">
          {style.symbol}
        </span>
      </div>

      <div
        className={`flex flex-1 items-center justify-center ${style.text}`}
        aria-hidden="true"
      >
        {isJoker ? (
          <span className="font-serif text-[11px] font-semibold tracking-wide uppercase sm:text-xs">
            Joker
          </span>
        ) : (
          <span className={size === 'sm' ? 'text-xl' : 'text-2xl sm:text-3xl'}>
            {style.symbol}
          </span>
        )}
      </div>

      <div
        className={`flex items-end justify-between leading-none ${style.text}`}
        aria-hidden="true"
      >
        <span className="text-xs sm:text-sm">{style.symbol}</span>
        <span className="font-mono text-xs font-semibold tracking-tight tabular-nums sm:text-sm">
          {rankDisplay}
        </span>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={`${fullLabel}${selected ? ', selected' : ''}`}
        title={formatCardLabel(card)}
        className={containerClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <div role="img" aria-label={fullLabel} className={containerClasses}>
      {content}
    </div>
  );
}
