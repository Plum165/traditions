import type { CardExampleItem, CardSuit } from '../../types/game';

interface PlayingCardDiagramProps {
  title: string;
  description?: string;
  cards: CardExampleItem[];
  caption?: string;
}

const SUIT_META: Record<
  CardSuit,
  { symbol: string; name: string; textColor: string; accentBg: string }
> = {
  hearts: {
    symbol: '♥',
    name: 'Hearts',
    textColor: 'text-[#8B2230]',
    accentBg: 'bg-[#FAF7F2]',
  },
  diamonds: {
    symbol: '♦',
    name: 'Diamonds',
    textColor: 'text-[#8B2230]',
    accentBg: 'bg-[#FAF7F2]',
  },
  spades: {
    symbol: '♠',
    name: 'Spades',
    textColor: 'text-[#1E1A18]',
    accentBg: 'bg-[#FAF7F2]',
  },
  clubs: {
    symbol: '♣',
    name: 'Clubs',
    textColor: 'text-[#1E1A18]',
    accentBg: 'bg-[#FAF7F2]',
  },
  joker: {
    symbol: '★',
    name: 'Joker',
    textColor: 'text-[#6E4411]',
    accentBg: 'bg-[#F5EBD8]',
  },
};

export function PlayingCardDiagram({
  title,
  description,
  cards,
  caption,
}: PlayingCardDiagramProps) {
  return (
    <figure className="my-6 rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-6">
      <div className="mb-4">
        <h4 className="font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-[#524943]">{description}</p>
        )}
      </div>

      <div
        className="flex flex-wrap items-center gap-2.5 sm:gap-3.5"
        role="list"
        aria-label={title}
      >
        {cards.map((card, index) => {
          const meta = SUIT_META[card.suit];
          const isJoker = card.suit === 'joker';
          const ariaText = card.label ?? (isJoker ? 'Joker card' : `${card.rank} of ${meta.name}`);

          return (
            <div
              key={`${card.rank}-${card.suit}-${index}`}
              role="listitem"
              aria-label={ariaText}
              className={`relative flex h-24 w-[4.35rem] flex-col justify-between rounded-md border p-2 shadow-xs sm:h-28 sm:w-20 sm:p-2.5 ${
                card.highlight
                  ? 'border-[#8A5A19] ring-1 ring-[#8A5A19]/30'
                  : 'border-[#CFC4B4]'
              } ${meta.accentBg}`}
            >
              <div className={`flex items-start justify-between leading-none ${meta.textColor}`}>
                <span className="font-mono text-xs font-semibold tracking-tight sm:text-sm tabular-nums">
                  {isJoker ? 'JKR' : card.rank}
                </span>
                <span className="text-xs sm:text-sm" aria-hidden="true">
                  {meta.symbol}
                </span>
              </div>

              <div
                className={`flex flex-1 items-center justify-center ${meta.textColor}`}
                aria-hidden="true"
              >
                {isJoker ? (
                  <span className="font-serif text-xs font-semibold tracking-wide uppercase">
                    Joker
                  </span>
                ) : (
                  <span className="text-2xl sm:text-3xl">{meta.symbol}</span>
                )}
              </div>

              <div
                className={`flex items-end justify-between leading-none ${meta.textColor}`}
                aria-hidden="true"
              >
                <span className="text-xs sm:text-sm">{meta.symbol}</span>
                <span className="font-mono text-xs font-semibold tracking-tight sm:text-sm tabular-nums">
                  {isJoker ? 'JKR' : card.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {caption && (
        <figcaption className="mt-4 border-t border-[#DDD4C7] pt-3 text-xs italic text-[#6B6059]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
