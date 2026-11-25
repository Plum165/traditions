import { Layers } from 'lucide-react';
import { GameCardTile } from '../../../components/games/GameCardTile';
import type { CardTexture, StandardCard } from '../../../types/playingCard';
import { formatCardLabel } from '../engine/deck';
import { formatColourLabel, getCardColour } from '../engine/rules';
import type { PorridgeRuleVariation, RevealResult } from '../engine/types';

interface CentralPorridgePileProps {
  centralPile: StandardCard[];
  openingPileCard: StandardCard | null;
  topPileCard: StandardCard | null;
  variation: PorridgeRuleVariation;
  cardTexture: CardTexture;
  isCollecting: boolean;
  lastRevealResult: RevealResult | null;
}

export function CentralPorridgePile({
  centralPile,
  openingPileCard,
  topPileCard,
  variation,
  cardTexture,
  isCollecting,
  lastRevealResult,
}: CentralPorridgePileProps) {
  const pileCount = centralPile.length;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full border-2 p-3 text-center transition-transform duration-200 ${
        isCollecting
          ? 'scale-95 border-[#F59E0B] bg-[#2D2418]/90 ring-2 ring-[#F59E0B]/50'
          : 'border-[#FAF7F2]/25 bg-[#152D22]/95'
      } h-44 w-44 sm:h-48 sm:w-48`}
    >
      <p className="font-mono text-[10px] font-semibold tracking-wider text-[#E6DED2]/85 uppercase tabular-nums">
        Porridge Pile · {pileCount} {pileCount === 1 ? 'card' : 'cards'}
      </p>

      <div className="mt-2 flex items-center justify-center">
        {isCollecting && lastRevealResult?.collected ? (
          <div className="flex flex-col items-center justify-center px-2 py-2">
            <Layers className="h-6 w-6 text-[#FDE68A]" aria-hidden="true" />
            <p className="mt-1.5 font-serif text-xs font-semibold text-[#FDE68A]">
              {lastRevealResult.playerName} collected {lastRevealResult.collectedCount}{' '}
              {lastRevealResult.collectedCount === 1 ? 'card' : 'cards'}!
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-[#FAF7F2]/85">
              Trigger: {formatCardLabel(lastRevealResult.card)}
            </p>
          </div>
        ) : topPileCard ? (
          <div className="relative">
            {pileCount > 1 && (
              <div
                aria-hidden="true"
                className="absolute top-1 left-1 h-20 w-14 rounded-md border border-[#FAF7F2]/30 bg-[#EFE8DC]/70"
              />
            )}
            <div className="relative">
              <GameCardTile
                card={topPileCard}
                size="sm"
                texture={cardTexture}
                highlight={Boolean(lastRevealResult && !lastRevealResult.collected)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-20 w-14 flex-col items-center justify-center rounded-md border border-dashed border-[#FAF7F2]/35 px-1 text-[10px] leading-tight text-[#E6DED2]/75">
            Empty Pile
          </div>
        )}
      </div>

      {!isCollecting && variation === 'highest-colour' && openingPileCard && (
        <p className="mt-1.5 font-mono text-[10px] text-[#F5EBD8] tabular-nums">
          1st: {formatCardLabel(openingPileCard)} (
          {formatColourLabel(getCardColour(openingPileCard.suit))})
        </p>
      )}
      {!isCollecting && variation === 'same-suit' && topPileCard && (
        <p className="mt-1.5 font-mono text-[10px] text-[#F5EBD8] tabular-nums">
          Match check: {formatCardLabel(topPileCard)}
        </p>
      )}
    </div>
  );
}
