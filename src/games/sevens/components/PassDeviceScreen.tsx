import { EyeOff, ShieldCheck } from 'lucide-react';
import type { PublicTableView } from '../engine/types';

interface PassDeviceScreenProps {
  view: PublicTableView;
  onConfirmReady: () => void;
}

export function PassDeviceScreen({ view, onConfirmReady }: PassDeviceScreenProps) {
  return (
    <section
      aria-labelledby="pass-device-heading"
      className="mx-auto max-w-xl rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-6 text-center sm:p-10"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#CFC4B4] bg-[#FAF7F2] text-[#7C2D36]">
        <EyeOff className="h-6 w-6" aria-hidden="true" />
      </div>

      <p className="mt-4 font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
        Turn {view.turnNumber} · Hand Hidden for Privacy
      </p>

      <h2
        id="pass-device-heading"
        className="mt-2 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
      >
        Pass the device to {view.currentPlayer.name}
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4A413B] sm:text-base">
        All player hands are hidden so no one sees the previous player’s cards. Hand the device to{' '}
        <strong className="font-semibold text-[#1E1A18]">{view.currentPlayer.name}</strong>, then
        confirm below when ready to view your cards.
      </p>

      <div className="mt-6 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] px-4 py-3 text-xs text-[#524943]">
        <p className="font-medium text-[#1E1A18]">Last move: {view.lastActionSummary}</p>
        <p className="mt-1 tabular-nums">
          Table sets: {view.tableSets.length} · Draw pile: {view.drawPileCount} cards
        </p>
      </div>

      <button
        type="button"
        onClick={onConfirmReady}
        className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>I am {view.currentPlayer.name} — Reveal My Hand</span>
      </button>
    </section>
  );
}
