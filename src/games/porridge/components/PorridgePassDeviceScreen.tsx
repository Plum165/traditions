import { EyeOff, ShieldCheck } from 'lucide-react';
import type { PublicPorridgeView } from '../engine/types';

interface PorridgePassDeviceScreenProps {
  view: PublicPorridgeView;
  onConfirmReady: () => void;
}

export function PorridgePassDeviceScreen({
  view,
  onConfirmReady,
}: PorridgePassDeviceScreenProps) {
  return (
    <section
      aria-labelledby="porridge-pass-heading"
      className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-6 text-center sm:p-10"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#CFC4B4] bg-[#FAF7F2] text-[#7C2D36]">
        <EyeOff className="h-6 w-6" aria-hidden="true" />
      </div>

      <p className="mt-4 font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
        Turn {view.turnNumber} · Board Hidden for Privacy
      </p>

      <h2
        id="porridge-pass-heading"
        className="mt-2 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
      >
        Pass the device to {view.currentPlayer.name}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4A413B] sm:text-base">
        {view.previousPlayerName
          ? `Make sure ${view.previousPlayerName} has finished before continuing.`
          : 'Make sure the previous player has finished before continuing.'}{' '}
        The circle and card selection details remain hidden until{' '}
        <strong className="font-semibold text-[#1E1A18]">{view.currentPlayer.name}</strong> taps
        Ready.
      </p>

      <button
        type="button"
        onClick={onConfirmReady}
        className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>Ready ({view.currentPlayer.name})</span>
      </button>
    </section>
  );
}
