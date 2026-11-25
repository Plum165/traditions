import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bot,
  ChevronDown,
  Play,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import { GameCardTile } from '../../../components/games/GameCardTile';
import type { CardTexture, StandardCard } from '../../../types/playingCard';
import { DEFAULT_PORRIDGE_RULES } from '../engine/gameEngine';
import type {
  PlayDirection,
  PorridgeGameMode,
  PorridgeRuleVariation,
  PorridgeRulesConfig,
  PorridgeSeatConfig,
  PorridgeSetupConfig,
} from '../engine/types';

interface PorridgeSetupPanelProps {
  initialConfig?: PorridgeSetupConfig;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onStartGame: (config: PorridgeSetupConfig) => void;
}

const PREVIEW_EIGHT_DIAMONDS: StandardCard = {
  id: 'porridge-preview-diamonds-8',
  kind: 'standard',
  rank: 8,
  suit: 'diamonds',
};

const ORDINALS = ['1st', '2nd', '3rd', '4th'] as const;

function buildDefaultSeats(
  mode: PorridgeGameMode,
  count: 2 | 3 | 4,
  humanFirstIndex = 0
): PorridgeSeatConfig[] {
  if (mode === 'vs-bots') {
    const safeHumanIndex = Math.min(humanFirstIndex, count - 1);
    let botNum = 0;
    return Array.from({ length: count }, (_, idx) => {
      if (idx === safeHumanIndex) {
        return { type: 'human' as const, name: 'You' };
      }
      botNum += 1;
      return { type: 'bot' as const, name: `Bot ${botNum}` };
    });
  }

  if (mode === 'pass-and-play') {
    return Array.from({ length: count }, (_, idx) => ({
      type: 'human' as const,
      name: `Player ${idx + 1}`,
    }));
  }

  // Mixed default: alternate Human and Bot
  let humanNum = 0;
  let botNum = 0;
  return Array.from({ length: count }, (_, idx) => {
    if (idx % 2 === 0) {
      humanNum += 1;
      return { type: 'human' as const, name: `Player ${humanNum}` };
    }
    botNum += 1;
    return { type: 'bot' as const, name: `Bot ${botNum}` };
  });
}

function normalizeBotNames(seats: PorridgeSeatConfig[]): PorridgeSeatConfig[] {
  let botNum = 0;
  return seats.map((seat) => {
    if (seat.type !== 'bot') return seat;
    botNum += 1;
    if (/^Bot \d+$/i.test(seat.name.trim()) || seat.name.trim() === '') {
      return { ...seat, name: `Bot ${botNum}` };
    }
    return seat;
  });
}

export function PorridgeSetupPanel({
  initialConfig,
  cardTexture,
  onChangeCardTexture,
  onStartGame,
}: PorridgeSetupPanelProps) {
  const [mode, setMode] = useState<PorridgeGameMode>(
    initialConfig?.mode ?? 'vs-bots'
  );
  const [variation, setVariation] = useState<PorridgeRuleVariation>(
    initialConfig?.variation ?? 'same-suit'
  );
  const [direction, setDirection] = useState<PlayDirection>(
    initialConfig?.direction ?? 'clockwise'
  );
  const [seats, setSeats] = useState<PorridgeSeatConfig[]>(
    initialConfig?.seats ?? buildDefaultSeats('vs-bots', 3, 0)
  );
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [rules, setRules] = useState<PorridgeRulesConfig>({
    ...DEFAULT_PORRIDGE_RULES,
    ...initialConfig?.rules,
  });

  const playerCount = seats.length as 2 | 3 | 4;
  const humanTurnIndex = seats.findIndex((s) => s.type === 'human');

  const handleModeChange = (nextMode: PorridgeGameMode) => {
    setMode(nextMode);
    setSeats(buildDefaultSeats(nextMode, playerCount, 0));
  };

  const handlePlayerCountChange = (nextCount: 2 | 3 | 4) => {
    if (nextCount === seats.length) return;
    if (mode === 'vs-bots') {
      const clampedHumanIdx = Math.min(
        Math.max(0, humanTurnIndex),
        nextCount - 1
      );
      const currentHumanName =
        seats.find((s) => s.type === 'human')?.name ?? 'You';
      const rebuilt = buildDefaultSeats('vs-bots', nextCount, clampedHumanIdx).map(
        (seat) =>
          seat.type === 'human' ? { ...seat, name: currentHumanName } : seat
      );
      setSeats(rebuilt);
      return;
    }

    if (nextCount < seats.length) {
      const sliced = seats.slice(0, nextCount);
      const hasHuman = sliced.some((s) => s.type === 'human');
      if (!hasHuman) {
        sliced[0] = { type: 'human', name: 'Player 1' };
      }
      setSeats(normalizeBotNames(sliced));
      return;
    }

    const extraCount = nextCount - seats.length;
    const additions: PorridgeSeatConfig[] = Array.from(
      { length: extraCount },
      (_, offset) => {
        const idx = seats.length + offset;
        if (mode === 'pass-and-play') {
          return { type: 'human', name: `Player ${idx + 1}` };
        }
        return idx % 2 === 0
          ? { type: 'human', name: `Player ${idx + 1}` }
          : { type: 'bot', name: `Bot ${idx + 1}` };
      }
    );
    setSeats(normalizeBotNames([...seats, ...additions]));
  };

  const handleMoveHumanPosition = (targetIndex: number) => {
    if (mode !== 'vs-bots') return;
    const humanSeat = seats.find((s) => s.type === 'human') ?? {
      type: 'human' as const,
      name: 'You',
    };
    const botSeats = seats.filter((s) => s.type === 'bot');
    const nextSeats: PorridgeSeatConfig[] = [];
    let botCursor = 0;
    for (let i = 0; i < seats.length; i += 1) {
      if (i === targetIndex) {
        nextSeats.push(humanSeat);
      } else {
        nextSeats.push(botSeats[botCursor] ?? { type: 'bot', name: `Bot ${botCursor + 1}` });
        botCursor += 1;
      }
    }
    setSeats(normalizeBotNames(nextSeats));
  };

  const handleMoveSeat = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= seats.length) return;
    const next = [...seats];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setSeats(normalizeBotNames(next));
  };

  const handleToggleSeatType = (index: number) => {
    if (mode !== 'mixed') return;
    const current = seats[index];
    const humanCount = seats.filter((s) => s.type === 'human').length;
    if (current.type === 'human' && humanCount <= 1) {
      return; // Keep at least 1 human seat in mixed mode
    }
    const nextType = (current.type === 'human' ? 'bot' : 'human') as 'human' | 'bot';
    const nextSeats: PorridgeSeatConfig[] = seats.map((seat, idx) => {
      if (idx !== index) return seat;
      return {
        type: nextType,
        name: nextType === 'human' ? `Player ${idx + 1}` : `Bot ${idx + 1}`,
      };
    });
    setSeats(normalizeBotNames(nextSeats));
  };

  const handleNameChange = (index: number, value: string) => {
    setSeats((prev) =>
      prev.map((seat, i) => (i === index ? { ...seat, name: value } : seat))
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onStartGame({
      mode,
      variation,
      direction,
      seats: normalizeBotNames(seats),
      rules,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-5 sm:p-8"
    >
      <div className="border-b border-[#E6DED2] pb-5">
        <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
          Table Setup
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
          Set up your game of Porridge (Sekaku)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
          Spreads all 52 cards (no Jokers) face down in a circle. Pick a rule version, choose your
          players, and lay out who plays first.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Rule Variation */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#1E1A18]">Rule Variation</legend>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setVariation('same-suit')}
              aria-pressed={variation === 'same-suit'}
              className={`flex min-h-[64px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                variation === 'same-suit'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Version 1: Same-Suit Porridge
              </span>
              <span className="mt-1 text-xs leading-relaxed text-[#524943]">
                Collect the central pile if your revealed card matches the previous top card’s suit.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVariation('highest-colour')}
              aria-pressed={variation === 'highest-colour'}
              className={`flex min-h-[64px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                variation === 'highest-colour'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Version 2: Highest Colour (House Rule)
              </span>
              <span className="mt-1 text-xs leading-relaxed text-[#524943]">
                Collect the central pile if your card is the same colour (Red/Black) and higher rank
                than the pile’s benchmark card.
              </span>
            </button>
          </div>
        </fieldset>

        {/* Play Mode */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#1E1A18]">Play Mode</legend>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => handleModeChange('vs-bots')}
              aria-pressed={mode === 'vs-bots'}
              className={`flex min-h-[64px] flex-col items-start rounded-md border p-3.5 text-left transition-colors ${
                mode === 'vs-bots'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Play Against Bots
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                You vs 1–3 automated bots.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('pass-and-play')}
              aria-pressed={mode === 'pass-and-play'}
              className={`flex min-h-[64px] flex-col items-start rounded-md border p-3.5 text-left transition-colors ${
                mode === 'pass-and-play'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Pass and Play
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                2–4 human players with privacy screens.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('mixed')}
              aria-pressed={mode === 'mixed'}
              className={`flex min-h-[64px] flex-col items-start rounded-md border p-3.5 text-left transition-colors ${
                mode === 'mixed'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Mixed Players & Bots
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                Custom humans + bots in any sequence.
              </span>
            </button>
          </div>
        </fieldset>

        {/* Total Players & Direction */}
        <div className="grid gap-6 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-semibold text-[#1E1A18]">
              Number of Players
            </legend>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  aria-pressed={playerCount === count}
                  className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                    playerCount === count
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#1E1A18]">
              Play Direction
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {(['clockwise', 'anticlockwise'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setDirection(dir)}
                  aria-pressed={direction === dir}
                  className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    direction === dir
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Turn Order & Sequence Layout */}
        <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                Turn Sequence & Players
              </h3>
              <p className="mt-0.5 text-xs text-[#524943]">
                {mode === 'vs-bots'
                  ? 'Choose whether you play first or later, or reorder seats below.'
                  : mode === 'mixed'
                    ? 'Toggle each seat between Human and Bot and arrange the exact turn order.'
                    : 'Rename players and arrange who plays 1st, 2nd, 3rd, or 4th.'}
              </p>
            </div>
          </div>

          {mode === 'vs-bots' && (
            <fieldset className="mt-4">
              <legend className="text-xs font-semibold text-[#524943]">
                When do you want to play?
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {seats.map((_, idx) => (
                  <button
                    key={`turn-pos-${idx}`}
                    type="button"
                    onClick={() => handleMoveHumanPosition(idx)}
                    aria-pressed={humanTurnIndex === idx}
                    className={`min-h-[44px] rounded-md border px-3 py-2 text-xs font-medium tabular-nums transition-colors sm:text-sm ${
                      humanTurnIndex === idx
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                    }`}
                  >
                    {idx === 0 ? 'Go 1st (First)' : `Go ${ORDINALS[idx]}`}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <ol className="mt-4 space-y-2.5" aria-label="Turn sequence order">
            {seats.map((seat, idx) => {
              const isHuman = seat.type === 'human';
              const humanCount = seats.filter((s) => s.type === 'human').length;
              const disableDemoteLastHuman =
                mode === 'mixed' && isHuman && humanCount <= 1;

              return (
                <li
                  key={`seat-row-${idx}`}
                  className="flex flex-col gap-2.5 rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded border border-[#C6B8A6] bg-[#EFE8DC] font-mono text-xs font-semibold text-[#1E1A18] tabular-nums">
                      {ORDINALS[idx]}
                    </span>

                    {mode === 'mixed' ? (
                      <button
                        type="button"
                        disabled={disableDemoteLastHuman}
                        onClick={() => handleToggleSeatType(idx)}
                        title={
                          disableDemoteLastHuman
                            ? 'At least one human player is required'
                            : `Switch ${seat.name} between Human and Bot`
                        }
                        className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          isHuman
                            ? 'border-[#7C2D36] bg-[#F4EFE7] text-[#7C2D36]'
                            : 'border-[#8A5A19] bg-[#FBF4E7] text-[#6E4411]'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isHuman ? (
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{isHuman ? 'Human' : 'Bot'}</span>
                      </button>
                    ) : (
                      <span
                        className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${
                          isHuman
                            ? 'border-[#DDD4C7] bg-[#F4EFE7] text-[#7C2D36]'
                            : 'border-[#E6D6BE] bg-[#FBF4E7] text-[#6E4411]'
                        }`}
                      >
                        {isHuman ? (
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{isHuman ? 'Human' : 'Bot'}</span>
                      </span>
                    )}

                    <input
                      type="text"
                      maxLength={24}
                      aria-label={`Turn ${idx + 1} player name`}
                      value={seat.name}
                      disabled={!isHuman}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      className="min-h-[40px] min-w-0 flex-1 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-sm text-[#1E1A18] focus:border-[#7C2D36] focus:outline-none disabled:bg-[#F4EFE7] disabled:text-[#524943]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSeat(idx, -1)}
                      aria-label={`Move ${seat.name} earlier`}
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === seats.length - 1}
                      onClick={() => handleMoveSeat(idx, 1)}
                      aria-label={`Move ${seat.name} later`}
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Card Texture Selector */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#1E1A18]">Card Texture</legend>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onChangeCardTexture('classic')}
              aria-pressed={cardTexture === 'classic'}
              className={`flex min-h-[84px] items-center gap-3.5 rounded-md border p-3.5 text-left transition-colors ${
                cardTexture === 'classic'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <div className="shrink-0">
                <GameCardTile
                  card={PREVIEW_EIGHT_DIAMONDS}
                  texture="classic"
                  size="sm"
                />
              </div>
              <div>
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Everyday Classic Cards
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-[#524943]">
                  White card stock with full pip counts (8♦ shows 8 diamonds) and court frames.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeCardTexture('archival')}
              aria-pressed={cardTexture === 'archival'}
              className={`flex min-h-[84px] items-center gap-3.5 rounded-md border p-3.5 text-left transition-colors ${
                cardTexture === 'archival'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <div className="shrink-0">
                <GameCardTile
                  card={PREVIEW_EIGHT_DIAMONDS}
                  texture="archival"
                  size="sm"
                />
              </div>
              <div>
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Archival Minimal Cards
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-[#524943]">
                  Warm ivory archive stock with corner rank and centered suit symbol.
                </span>
              </div>
            </button>
          </div>
        </fieldset>

        {/* Configurable House Rules (Highest-Colour Options) */}
        <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7]">
          <button
            type="button"
            onClick={() => setShowHouseRules((prev) => !prev)}
            aria-expanded={showHouseRules}
            aria-controls="porridge-house-rules"
            className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1E1A18]"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
              <span>House Rule Options (Ace Rank & Comparison Reference)</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#6B6059] transition-transform duration-150 ${
                showHouseRules ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {showHouseRules && (
            <div
              id="porridge-house-rules"
              className="space-y-4 border-t border-[#DDD4C7] px-4 py-4 text-sm"
            >
              <div>
                <p className="text-xs font-semibold text-[#1E1A18]">
                  Ace Value (Used in Highest-Colour Porridge)
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRules((r) => ({ ...r, aceRanking: 'ace-high' }))}
                    aria-pressed={rules.aceRanking === 'ace-high'}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      rules.aceRanking === 'ace-high'
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    Ace High (2 … K &lt; A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRules((r) => ({ ...r, aceRanking: 'ace-low' }))}
                    aria-pressed={rules.aceRanking === 'ace-low'}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      rules.aceRanking === 'ace-low'
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    Ace Low (A &lt; 2 … K)
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#1E1A18]">
                  Highest-Colour Comparison Card
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRules((r) => ({ ...r, highestColourReference: 'first-in-pile' }))
                    }
                    aria-pressed={rules.highestColourReference === 'first-in-pile'}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      rules.highestColourReference === 'first-in-pile'
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    First Card in Pile (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRules((r) => ({ ...r, highestColourReference: 'previous-top' }))
                    }
                    aria-pressed={rules.highestColourReference === 'previous-top'}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      rules.highestColourReference === 'previous-top'
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    Previous Top Card
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#1E1A18]">
                  After Collecting the Pile
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRules((r) => ({ ...r, collectorStartsNextPile: true }))
                    }
                    aria-pressed={rules.collectorStartsNextPile}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      rules.collectorStartsNextPile
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    Collector Picks Next Card (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRules((r) => ({ ...r, collectorStartsNextPile: false }))
                    }
                    aria-pressed={!rules.collectorStartsNextPile}
                    className={`min-h-[40px] rounded border px-3 py-1.5 text-xs font-medium ${
                      !rules.collectorStartsNextPile
                        ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                        : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                    }`}
                  >
                    Next Player Starts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-[#E6DED2] pt-6">
        <button
          type="submit"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          <span>Spread Circle & Start Porridge</span>
        </button>
      </div>
    </form>
  );
}
