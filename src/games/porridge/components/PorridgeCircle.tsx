import { RotateCcw, RotateCw } from 'lucide-react';
import type { CardTexture, StandardCard } from '../../../types/playingCard';
import type {
  PlayDirection,
  PorridgeRuleVariation,
  PublicCircleSlot,
  RevealResult,
} from '../engine/types';
import { CentralPorridgePile } from './CentralPorridgePile';
import { CircleCard } from './CircleCard';
import { CIRCLE_SLOT_POSITIONS } from './circleLayouts';

interface PorridgeCircleProps {
  slots: PublicCircleSlot[];
  remainingCount: number;
  centralPile: StandardCard[];
  openingPileCard: StandardCard | null;
  topPileCard: StandardCard | null;
  variation: PorridgeRuleVariation;
  direction: PlayDirection;
  cardTexture: CardTexture;
  canSelect: boolean;
  isBotTurn: boolean;
  isCollecting: boolean;
  lastRevealResult: RevealResult | null;
  onSelectSlot: (positionId: string) => void;
}

export function PorridgeCircle({
  slots,
  remainingCount,
  centralPile,
  openingPileCard,
  topPileCard,
  variation,
  direction,
  cardTexture,
  canSelect,
  isBotTurn,
  isCollecting,
  lastRevealResult,
  onSelectSlot,
}: PorridgeCircleProps) {
  return (
    <div className="rounded-lg border-2 border-[#C6B8A6] bg-[#1E3D2F] p-3 text-[#FAF7F2] sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#FAF7F2]/15 pb-3 text-xs text-[#E6DED2]">
        <span className="font-mono tabular-nums">
          Outer Circle: {remainingCount} of {slots.length} face-down cards remaining
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-[#F5EBD8]">
          {direction === 'clockwise' ? (
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{direction === 'clockwise' ? 'Clockwise play' : 'Anticlockwise play'}</span>
        </span>
      </div>

      {/* Desktop & Tablet (sm+): True Concentric Circular Card Arrangement */}
      <div className="hidden sm:flex sm:justify-center">
        <div className="relative h-[560px] w-[560px] rounded-full border border-[#FAF7F2]/15 bg-[#193528] shadow-inner md:h-[650px] md:w-[650px] lg:h-[690px] lg:w-[690px]">
          {/* Subtle inner ring guide */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[21%] rounded-full border border-dashed border-[#FAF7F2]/10"
          />

          {/* 52 Positioned Circle Cards */}
          {slots.map((slot, index) => {
            const coordClass = CIRCLE_SLOT_POSITIONS[index] ?? 'left-[50%] top-[50%]';
            return (
              <div
                key={slot.positionId}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${coordClass}`}
              >
                <CircleCard
                  slot={slot}
                  disabled={!canSelect}
                  isBotSelecting={isBotTurn}
                  layoutVariant="ring"
                  onSelect={onSelectSlot}
                />
              </div>
            );
          })}

          {/* Central Porridge Pile in the open centre */}
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <CentralPorridgePile
              centralPile={centralPile}
              openingPileCard={openingPileCard}
              topPileCard={topPileCard}
              variation={variation}
              cardTexture={cardTexture}
              isCollecting={isCollecting}
              lastRevealResult={lastRevealResult}
            />
          </div>
        </div>
      </div>

      {/* Mobile (< 640px): Central Pile + Touch-Safe 5-Column Ring Grid (>= 44x44px targets, zero overflow) */}
      <div className="space-y-4 sm:hidden">
        <div className="flex justify-center">
          <CentralPorridgePile
            centralPile={centralPile}
            openingPileCard={openingPileCard}
            topPileCard={topPileCard}
            variation={variation}
            cardTexture={cardTexture}
            isCollecting={isCollecting}
            lastRevealResult={lastRevealResult}
          />
        </div>

        <div>
          <p className="mb-2 text-center text-xs text-[#E6DED2]">
            Tap any numbered face-down card around the circle (#01–#52):
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {slots.map((slot) => (
              <CircleCard
                key={slot.positionId}
                slot={slot}
                disabled={!canSelect}
                isBotSelecting={isBotTurn}
                layoutVariant="grid"
                onSelect={onSelectSlot}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
