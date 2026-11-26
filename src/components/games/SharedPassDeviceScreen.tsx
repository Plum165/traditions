import { EyeOff, ShieldCheck } from 'lucide-react';

interface SharedPassDeviceScreenProps {
  headingId?: string;
  nextPlayerName: string;
  previousPlayerName?: string | null;
  turnNumber?: number;
  eyebrow?: string;
  privacyNote?: string;
  contextLines?: string[];
  readyLabel?: string;
  onConfirmReady: () => void;
}

export function SharedPassDeviceScreen({
  headingId = 'pass-device-heading',
  nextPlayerName,
  previousPlayerName,
  turnNumber,
  eyebrow,
  privacyNote,
  contextLines = [],
  readyLabel,
  onConfirmReady,
}: SharedPassDeviceScreenProps) {
  const defaultEyebrow = turnNumber
    ? `Turn ${turnNumber} · Screen Hidden for Privacy`
    : 'Screen Hidden for Privacy';

  const defaultPrivacyNote = `${
    previousPlayerName
      ? `Make sure ${previousPlayerName} has finished before continuing.`
      : 'Make sure the previous player has finished before continuing.'
  } The active game interface remains hidden until ${nextPlayerName} taps Ready.`;

  return (
    <section
      aria-labelledby={headingId}
      className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-6 text-center sm:p-10"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#CFC4B4] bg-[#FAF7F2] text-[#7C2D36]">
        <EyeOff className="h-6 w-6" aria-hidden="true" />
      </div>

      <p className="mt-4 font-mono text-xs font-medium tracking-wider text-[#6B6059] uppercase tabular-nums">
        {eyebrow ?? defaultEyebrow}
      </p>

      <h2
        id={headingId}
        className="mt-2 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl"
      >
        Pass the device to {nextPlayerName}.
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#4A413B] sm:text-base">
        {privacyNote ?? defaultPrivacyNote}
      </p>

      {contextLines.length > 0 && (
        <div className="mt-5 w-full max-w-md rounded-md border border-[#DDD4C7] bg-[#FAF7F2] px-4 py-3 text-xs text-[#524943]">
          <ul className="space-y-1">
            {contextLines.map((line, index) => (
              <li key={`pass-ctx-${index}`}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onConfirmReady}
        className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <span>{readyLabel ?? `Ready (${nextPlayerName})`}</span>
      </button>
    </section>
  );
}
