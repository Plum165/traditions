import { Check, Crown } from 'lucide-react';
import {
  SUIT_NAMES,
  SUIT_SYMBOLS,
  formatCardLabel,
  formatRankLabel,
  type CardRank,
  type CardTexture,
  type PlayingCard,
  type StandardSuit,
} from '../../types/playingCard';

interface GameCardTileProps {
  card: PlayingCard;
  selected?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  isNewlyDrawn?: boolean;
  texture?: CardTexture;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SUIT_STYLES: Record<
  StandardSuit | 'joker',
  {
    text: string;
    classicText: string;
    bg: string;
    classicBg: string;
    drawnBg: string;
    symbol: string;
    suitName: string;
  }
> = {
  hearts: {
    text: 'text-[#9B1C2E]',
    classicText: 'text-[#C81E2B]',
    bg: 'bg-[#FFFDF9]',
    classicBg: 'bg-[#FFFFFF]',
    drawnBg: 'bg-[#DCECE1]',
    symbol: SUIT_SYMBOLS.hearts,
    suitName: SUIT_NAMES.hearts,
  },
  diamonds: {
    text: 'text-[#9B1C2E]',
    classicText: 'text-[#C81E2B]',
    bg: 'bg-[#FFFDF9]',
    classicBg: 'bg-[#FFFFFF]',
    drawnBg: 'bg-[#DCECE1]',
    symbol: SUIT_SYMBOLS.diamonds,
    suitName: SUIT_NAMES.diamonds,
  },
  spades: {
    text: 'text-[#1E1A18]',
    classicText: 'text-[#171717]',
    bg: 'bg-[#FFFDF9]',
    classicBg: 'bg-[#FFFFFF]',
    drawnBg: 'bg-[#DCECE1]',
    symbol: SUIT_SYMBOLS.spades,
    suitName: SUIT_NAMES.spades,
  },
  clubs: {
    text: 'text-[#1E1A18]',
    classicText: 'text-[#171717]',
    bg: 'bg-[#FFFDF9]',
    classicBg: 'bg-[#FFFFFF]',
    drawnBg: 'bg-[#DCECE1]',
    symbol: SUIT_SYMBOLS.clubs,
    suitName: SUIT_NAMES.clubs,
  },
  joker: {
    text: 'text-[#6E4411]',
    classicText: 'text-[#8B1E2B]',
    bg: 'bg-[#F8EEDB]',
    classicBg: 'bg-[#FFFFFF]',
    drawnBg: 'bg-[#E1E8D0]',
    symbol: '★',
    suitName: 'Joker',
  },
};

const SIZE_CLASSES: Record<NonNullable<GameCardTileProps['size']>, string> = {
  sm: 'h-20 w-14 p-1',
  md: 'h-26 w-[4.5rem] p-1.5 sm:h-28 sm:w-20 sm:p-2',
  lg: 'h-28 w-20 p-2 sm:h-32 sm:w-22 sm:p-2',
};

interface PipCoordinate {
  posClass: string;
  inverted?: boolean;
}

const PIP_LAYOUTS: Record<number, PipCoordinate[]> = {
  1: [{ posClass: 'left-[50%] top-[50%]' }],
  2: [
    { posClass: 'left-[50%] top-[18%]' },
    { posClass: 'left-[50%] top-[82%]', inverted: true },
  ],
  3: [
    { posClass: 'left-[50%] top-[18%]' },
    { posClass: 'left-[50%] top-[50%]' },
    { posClass: 'left-[50%] top-[82%]', inverted: true },
  ],
  4: [
    { posClass: 'left-[28%] top-[20%]' },
    { posClass: 'left-[72%] top-[20%]' },
    { posClass: 'left-[28%] top-[80%]', inverted: true },
    { posClass: 'left-[72%] top-[80%]', inverted: true },
  ],
  5: [
    { posClass: 'left-[28%] top-[20%]' },
    { posClass: 'left-[72%] top-[20%]' },
    { posClass: 'left-[50%] top-[50%]' },
    { posClass: 'left-[28%] top-[80%]', inverted: true },
    { posClass: 'left-[72%] top-[80%]', inverted: true },
  ],
  6: [
    { posClass: 'left-[28%] top-[18%]' },
    { posClass: 'left-[72%] top-[18%]' },
    { posClass: 'left-[28%] top-[50%]' },
    { posClass: 'left-[72%] top-[50%]' },
    { posClass: 'left-[28%] top-[82%]', inverted: true },
    { posClass: 'left-[72%] top-[82%]', inverted: true },
  ],
  7: [
    { posClass: 'left-[28%] top-[18%]' },
    { posClass: 'left-[72%] top-[18%]' },
    { posClass: 'left-[50%] top-[34%]' },
    { posClass: 'left-[28%] top-[50%]' },
    { posClass: 'left-[72%] top-[50%]' },
    { posClass: 'left-[28%] top-[82%]', inverted: true },
    { posClass: 'left-[72%] top-[82%]', inverted: true },
  ],
  8: [
    { posClass: 'left-[28%] top-[18%]' },
    { posClass: 'left-[72%] top-[18%]' },
    { posClass: 'left-[50%] top-[34%]' },
    { posClass: 'left-[28%] top-[50%]' },
    { posClass: 'left-[72%] top-[50%]' },
    { posClass: 'left-[50%] top-[66%]', inverted: true },
    { posClass: 'left-[28%] top-[82%]', inverted: true },
    { posClass: 'left-[72%] top-[82%]', inverted: true },
  ],
  9: [
    { posClass: 'left-[28%] top-[15%]' },
    { posClass: 'left-[72%] top-[15%]' },
    { posClass: 'left-[28%] top-[38%]' },
    { posClass: 'left-[72%] top-[38%]' },
    { posClass: 'left-[50%] top-[50%]' },
    { posClass: 'left-[28%] top-[62%]', inverted: true },
    { posClass: 'left-[72%] top-[62%]', inverted: true },
    { posClass: 'left-[28%] top-[85%]', inverted: true },
    { posClass: 'left-[72%] top-[85%]', inverted: true },
  ],
  10: [
    { posClass: 'left-[28%] top-[15%]' },
    { posClass: 'left-[72%] top-[15%]' },
    { posClass: 'left-[50%] top-[26%]' },
    { posClass: 'left-[28%] top-[38%]' },
    { posClass: 'left-[72%] top-[38%]' },
    { posClass: 'left-[28%] top-[62%]', inverted: true },
    { posClass: 'left-[72%] top-[62%]', inverted: true },
    { posClass: 'left-[50%] top-[74%]', inverted: true },
    { posClass: 'left-[28%] top-[85%]', inverted: true },
    { posClass: 'left-[72%] top-[85%]', inverted: true },
  ],
};

function getPipSizeClass(rank: CardRank, size: NonNullable<GameCardTileProps['size']>): string {
  if (rank === 1) {
    return size === 'sm' ? 'text-xl' : 'text-3xl sm:text-4xl';
  }
  if (rank >= 8) {
    return size === 'sm' ? 'text-[8px]' : 'text-[11px] sm:text-xs';
  }
  return size === 'sm' ? 'text-[9px]' : 'text-xs sm:text-sm';
}

export function GameCardTile({
  card,
  selected = false,
  disabled = false,
  highlight = false,
  isNewlyDrawn = false,
  texture = 'archival',
  size = 'md',
  onClick,
}: GameCardTileProps) {
  const isJoker = card.kind === 'joker';
  const isClassic = texture === 'classic';
  const style = isJoker ? SUIT_STYLES.joker : SUIT_STYLES[card.suit];
  const rankDisplay = isJoker ? 'JKR' : formatRankLabel(card.rank);
  const fullLabel = isJoker
    ? `Joker ${card.jokerIndex}`
    : `${rankDisplay} of ${style.suitName}`;

  const stateLabel = [
    fullLabel,
    isNewlyDrawn ? 'newly drawn' : '',
    highlight && !isNewlyDrawn ? 'highlighted' : '',
    selected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(', ');

  const bgClass = isNewlyDrawn
    ? style.drawnBg
    : isClassic
      ? style.classicBg
      : style.bg;

  const textClass = isClassic ? style.classicText : style.text;

  const containerClasses = [
    'relative flex flex-col justify-between rounded-md border text-left select-none transition-transform duration-150',
    SIZE_CLASSES[size],
    bgClass,
    selected
      ? '-translate-y-2 border-[#7C2D36] ring-2 ring-[#7C2D36]/40 shadow-md'
      : isNewlyDrawn
        ? 'border-[#1E563B] ring-2 ring-[#1E563B]/35 shadow-sm'
        : highlight
          ? 'border-[#8A5A19] ring-1 ring-[#8A5A19]/35 shadow-xs'
          : isClassic
            ? 'border-[#B8B2A6] shadow-sm'
            : 'border-[#C9BCAE] shadow-xs',
    onClick && !disabled
      ? 'cursor-pointer hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#7C2D36]'
      : '',
    disabled ? 'opacity-65 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderClassicBody = () => {
    if (isJoker) {
      return (
        <div className={`relative flex flex-1 flex-col justify-between ${textClass}`}>
          <div className="flex flex-col items-start leading-none">
            <span className="font-mono text-[9px] font-bold tracking-tight uppercase sm:text-[10px]">
              JKR
            </span>
            <span className="text-[9px] sm:text-[10px]" aria-hidden="true">
              ★
            </span>
          </div>

          <div
            aria-hidden="true"
            className="mx-auto flex w-[72%] flex-1 flex-col items-center justify-center rounded-xs border border-[#D8C7B2] bg-[#FAF6EE] px-1 py-1 text-center"
          >
            <Crown className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
            <span className="mt-0.5 font-serif text-[8px] font-bold tracking-wider uppercase sm:text-[10px]">
              Joker
            </span>
          </div>

          <div
            className="flex rotate-180 flex-col items-start leading-none"
            aria-hidden="true"
          >
            <span className="font-mono text-[9px] font-bold tracking-tight uppercase sm:text-[10px]">
              JKR
            </span>
            <span className="text-[9px] sm:text-[10px]">★</span>
          </div>
        </div>
      );
    }

    const rank = card.rank;
    const isCourt = rank >= 11;
    const pips = PIP_LAYOUTS[rank];
    const cornerIndexSize =
      size === 'sm' ? 'text-[9px]' : 'text-[11px] sm:text-xs';

    return (
      <div className={`relative h-full w-full ${textClass}`}>
        <div className="absolute top-0 left-0 flex flex-col items-center leading-none">
          <span className={`font-sans font-bold tracking-tight tabular-nums ${cornerIndexSize}`}>
            {rankDisplay}
          </span>
          <span className={size === 'sm' ? 'text-[8px]' : 'text-[10px] sm:text-[11px]'} aria-hidden="true">
            {style.symbol}
          </span>
        </div>

        <div
          aria-hidden="true"
          className={
            size === 'sm'
              ? 'absolute inset-x-2.5 inset-y-1.5'
              : 'absolute inset-x-3 inset-y-2 sm:inset-x-3.5 sm:inset-y-2'
          }
        >
          {isCourt ? (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xs border border-[#D4CCB8] bg-[#FBF9F4] text-center">
              <Crown className={size === 'sm' ? 'h-3 w-3 opacity-80' : 'h-4 w-4 opacity-85'} />
              <span
                className={`mt-0.5 font-serif font-bold leading-none ${
                  size === 'sm' ? 'text-xs' : 'text-base sm:text-lg'
                }`}
              >
                {rankDisplay}
              </span>
              <span className={size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm'}>
                {style.symbol}
              </span>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {pips?.map((pip, index) => (
                <span
                  key={`pip-${rank}-${index}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 leading-none ${
                    pip.posClass
                  } ${pip.inverted ? 'rotate-180' : ''} ${getPipSizeClass(rank, size)}`}
                >
                  {style.symbol}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          aria-hidden="true"
          className="absolute right-0 bottom-0 flex rotate-180 flex-col items-center leading-none"
        >
          <span className={`font-sans font-bold tracking-tight tabular-nums ${cornerIndexSize}`}>
            {rankDisplay}
          </span>
          <span className={size === 'sm' ? 'text-[8px]' : 'text-[10px] sm:text-[11px]'}>
            {style.symbol}
          </span>
        </div>
      </div>
    );
  };

  const renderArchivalBody = () => (
    <>
      <div className={`flex items-start justify-between leading-none ${textClass}`}>
        <span className="font-mono text-xs font-semibold tracking-tight tabular-nums sm:text-sm">
          {rankDisplay}
        </span>
        <span className="text-xs sm:text-sm" aria-hidden="true">
          {style.symbol}
        </span>
      </div>

      <div
        className={`flex flex-1 items-center justify-center ${textClass}`}
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
        className={`flex items-end justify-between leading-none ${textClass}`}
        aria-hidden="true"
      >
        <span className="text-xs sm:text-sm">{style.symbol}</span>
        <span className="font-mono text-xs font-semibold tracking-tight tabular-nums sm:text-sm">
          {rankDisplay}
        </span>
      </div>
    </>
  );

  const content = (
    <>
      {selected && (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#7C2D36] text-[#FAF7F2] shadow-xs"
        >
          <Check className="h-3 w-3" />
        </span>
      )}

      {isNewlyDrawn && (
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-xs bg-[#184E34] px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-[#FAF7F2] uppercase shadow-xs"
        >
          Drawn
        </span>
      )}

      {isClassic ? renderClassicBody() : renderArchivalBody()}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={stateLabel}
        title={`${formatCardLabel(card)}${isNewlyDrawn ? ' (Newly Drawn)' : ''}`}
        className={containerClasses}
      >
        {content}
      </button>
    );
  }

  return (
    <div role="img" aria-label={stateLabel} className={containerClasses}>
      {content}
    </div>
  );
}
