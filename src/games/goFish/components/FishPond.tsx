import { Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface FishPondProps {
  drawPileCount: number;
  totalBooksCompleted: number;
  justDrewCard: boolean;
  animationsEnabled: boolean;
}

export function FishPond({
  drawPileCount,
  totalBooksCompleted,
  justDrewCard,
  animationsEnabled,
}: FishPondProps) {
  const isEmpty = drawPileCount === 0;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 text-center sm:p-5">
      <p className="font-mono text-[11px] font-semibold tracking-wider text-[#6B6059] uppercase">
        Fish Pond (Draw Pile)
      </p>

      <div className="relative mt-3 flex h-28 w-24 items-center justify-center">
        {isEmpty ? (
          <div className="flex h-24 w-16 flex-col items-center justify-center rounded-md border border-dashed border-[#B9AA98] bg-[#FAF7F2] px-2 text-center">
            <Layers className="h-4 w-4 text-[#8A7D74]" aria-hidden="true" />
            <span className="mt-1 font-mono text-[10px] font-medium text-[#6B6059]">
              Empty
            </span>
          </div>
        ) : (
          <motion.div
            key={drawPileCount}
            initial={
              animationsEnabled && justDrewCard
                ? { scale: 0.96, y: -4 }
                : false
            }
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {drawPileCount > 4 && (
              <div
                aria-hidden="true"
                className="absolute top-1.5 left-1.5 h-24 w-16 rounded-md border border-[#5B1E25] bg-[#5B1E25]/85"
              />
            )}
            {drawPileCount > 1 && (
              <div
                aria-hidden="true"
                className="absolute top-0.5 left-0.5 h-24 w-16 rounded-md border border-[#64222A] bg-[#64222A]"
              />
            )}
            <div
              role="img"
              aria-label={`Fish Pond draw pile with ${drawPileCount} face-down ${
                drawPileCount === 1 ? 'card' : 'cards'
              }`}
              className="relative flex h-24 w-16 flex-col items-center justify-center rounded-md border border-[#4C171E] bg-[#7C2D36] p-1.5 shadow-sm"
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xs border border-[#C8B08A]/55">
                <span className="font-mono text-lg font-bold text-[#FAF7F2] tabular-nums">
                  {drawPileCount}
                </span>
                <span className="text-[9px] tracking-wider text-[#EFE8DC] uppercase">
                  {drawPileCount === 1 ? 'card' : 'cards'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <p className="mt-3 font-mono text-xs text-[#4A413B] tabular-nums">
        {isEmpty
          ? 'No cards left in the Fish Pond'
          : `${drawPileCount} ${drawPileCount === 1 ? 'card' : 'cards'} remaining`}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-[#6B6059] tabular-nums">
        Books claimed: {totalBooksCompleted} / 13
      </p>
    </div>
  );
}
