import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  ChevronDown,
  Play,
  SlidersHorizontal,
  User,
} from 'lucide-react';
import {
  BOT_DIFFICULTY_DESCRIPTIONS,
  BOT_DIFFICULTY_LABELS,
  validateMultiplayerSeats,
  type BotDifficulty,
  type MultiplayerGameMode,
  type PlayDirection,
  type PlayerSeatConfig,
} from '../../types/multiplayer';
import type { CardTexture, StandardCard } from '../../types/playingCard';
import { GameCardTile } from './GameCardTile';

interface MultiplayerSetupFormProps {
  title: string;
  description: string;
  submitLabel: string;
  mode: MultiplayerGameMode;
  onChangeMode: (mode: MultiplayerGameMode) => void;
  direction: PlayDirection;
  onChangeDirection: (direction: PlayDirection) => void;
  seats: PlayerSeatConfig[];
  onChangeSeats: (seats: PlayerSeatConfig[]) => void;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  showBotDifficulty?: boolean;
  extraSettingsTitle?: string;
  gameOptionsSlot?: ReactNode;
  extraSettingsSlot?: ReactNode;
  onSubmitValid: (validatedSeats: PlayerSeatConfig[]) => void;
}

const PREVIEW_EIGHT_DIAMONDS: StandardCard = {
  id: 'shared-setup-preview-diamonds-8',
  kind: 'standard',
  rank: 8,
  suit: 'diamonds',
};

const ORDINALS = ['1st', '2nd', '3rd', '4th'] as const;
const DIFFICULTIES: readonly BotDifficulty[] = ['easy', 'normal', 'hard'];

export function buildDefaultSeats(
  mode: MultiplayerGameMode,
  count: 2 | 3 | 4,
  humanFirstIndex = 0,
  defaultDifficulty: BotDifficulty = 'normal'
): PlayerSeatConfig[] {
  if (mode === 'vs-bots') {
    const safeHumanIndex = Math.min(humanFirstIndex, count - 1);
    let botNum = 0;
    return Array.from({ length: count }, (_, idx) => {
      if (idx === safeHumanIndex) {
        return {
          id: `seat-${idx + 1}`,
          type: 'human' as const,
          name: 'You',
          difficulty: defaultDifficulty,
        };
      }
      botNum += 1;
      return {
        id: `seat-${idx + 1}`,
        type: 'bot' as const,
        name: `Bot ${botNum}`,
        difficulty: defaultDifficulty,
      };
    });
  }

  if (mode === 'pass-and-play') {
    return Array.from({ length: count }, (_, idx) => ({
      id: `seat-${idx + 1}`,
      type: 'human' as const,
      name: `Player ${idx + 1}`,
      difficulty: defaultDifficulty,
    }));
  }

  // Mixed default: alternate Human and Bot
  let humanNum = 0;
  let botNum = 0;
  return Array.from({ length: count }, (_, idx) => {
    if (idx % 2 === 0) {
      humanNum += 1;
      return {
        id: `seat-${idx + 1}`,
        type: 'human' as const,
        name: `Player ${humanNum}`,
        difficulty: defaultDifficulty,
      };
    }
    botNum += 1;
    return {
      id: `seat-${idx + 1}`,
      type: 'bot' as const,
      name: `Bot ${botNum}`,
      difficulty: defaultDifficulty,
    };
  });
}

export function normalizeSeats(
  seats: readonly PlayerSeatConfig[]
): PlayerSeatConfig[] {
  let botNum = 0;
  return seats.map((seat, idx) => {
    const stableId = seat.id || `seat-${idx + 1}`;
    if (seat.type !== 'bot') {
      return { ...seat, id: stableId };
    }
    botNum += 1;
    const trimmed = seat.name.trim();
    if (/^Bot \d+$/i.test(trimmed) || trimmed === '') {
      return { ...seat, id: stableId, name: `Bot ${botNum}` };
    }
    return { ...seat, id: stableId };
  });
}

export function MultiplayerSetupForm({
  title,
  description,
  submitLabel,
  mode,
  onChangeMode,
  direction,
  onChangeDirection,
  seats,
  onChangeSeats,
  cardTexture,
  onChangeCardTexture,
  showBotDifficulty = false,
  extraSettingsTitle = 'House Rule & Experience Options',
  gameOptionsSlot,
  extraSettingsSlot,
  onSubmitValid,
}: MultiplayerSetupFormProps) {
  const [showExtraSettings, setShowExtraSettings] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const playerCount = seats.length as 2 | 3 | 4;
  const humanTurnIndex = seats.findIndex((s) => s.type === 'human');
  const hasBots = seats.some((s) => s.type === 'bot');
  const validation = validateMultiplayerSeats(seats);

  const handleModeChange = (nextMode: MultiplayerGameMode) => {
    setAttemptedSubmit(false);
    const currentDifficulty =
      seats.find((s) => s.type === 'bot')?.difficulty ?? 'normal';
    onChangeMode(nextMode);
    onChangeSeats(buildDefaultSeats(nextMode, playerCount, 0, currentDifficulty));
  };

  const handlePlayerCountChange = (nextCount: 2 | 3 | 4) => {
    if (nextCount === seats.length) return;
    setAttemptedSubmit(false);
    const currentDifficulty =
      seats.find((s) => s.type === 'bot')?.difficulty ?? 'normal';

    if (mode === 'vs-bots') {
      const clampedHumanIdx = Math.min(
        Math.max(0, humanTurnIndex),
        nextCount - 1
      );
      const currentHumanName =
        seats.find((s) => s.type === 'human')?.name ?? 'You';
      const rebuilt = buildDefaultSeats(
        'vs-bots',
        nextCount,
        clampedHumanIdx,
        currentDifficulty
      ).map((seat) =>
        seat.type === 'human'
          ? { ...seat, name: currentHumanName }
          : seat
      );
      onChangeSeats(rebuilt);
      return;
    }

    if (nextCount < seats.length) {
      const sliced = seats.slice(0, nextCount);
      const hasHuman = sliced.some((s) => s.type === 'human');
      if (!hasHuman) {
        sliced[0] = {
          id: sliced[0]?.id ?? 'seat-1',
          type: 'human',
          name: 'Player 1',
          difficulty: currentDifficulty,
        };
      }
      onChangeSeats(normalizeSeats(sliced));
      return;
    }

    const extraCount = nextCount - seats.length;
    const additions: PlayerSeatConfig[] = Array.from(
      { length: extraCount },
      (_, offset) => {
        const idx = seats.length + offset;
        const nextId = `seat-${idx + 1}`;
        if (mode === 'pass-and-play') {
          return {
            id: nextId,
            type: 'human',
            name: `Player ${idx + 1}`,
            difficulty: currentDifficulty,
          };
        }
        return idx % 2 === 0
          ? {
              id: nextId,
              type: 'human',
              name: `Player ${idx + 1}`,
              difficulty: currentDifficulty,
            }
          : {
              id: nextId,
              type: 'bot',
              name: `Bot ${idx + 1}`,
              difficulty: currentDifficulty,
            };
      }
    );
    onChangeSeats(normalizeSeats([...seats, ...additions]));
  };

  const handleMoveHumanPosition = (targetIndex: number) => {
    if (mode !== 'vs-bots') return;
    const humanSeat = seats.find((s) => s.type === 'human') ?? {
      id: 'seat-1',
      type: 'human' as const,
      name: 'You',
      difficulty: 'normal' as BotDifficulty,
    };
    const botSeats = seats.filter((s) => s.type === 'bot');
    const nextSeats: PlayerSeatConfig[] = [];
    let botCursor = 0;
    for (let i = 0; i < seats.length; i += 1) {
      if (i === targetIndex) {
        nextSeats.push(humanSeat);
      } else {
        nextSeats.push(
          botSeats[botCursor] ?? {
            id: `seat-${i + 1}`,
            type: 'bot',
            name: `Bot ${botCursor + 1}`,
            difficulty: 'normal',
          }
        );
        botCursor += 1;
      }
    }
    onChangeSeats(normalizeSeats(nextSeats));
  };

  const handleMoveSeat = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= seats.length) return;
    const next = [...seats];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChangeSeats(normalizeSeats(next));
  };

  const handleToggleSeatType = (index: number) => {
    if (mode !== 'mixed') return;
    const current = seats[index];
    const humanCount = seats.filter((s) => s.type === 'human').length;
    if (current.type === 'human' && humanCount <= 1) {
      return;
    }
    const nextType: 'human' | 'bot' = current.type === 'human' ? 'bot' : 'human';
    const nextSeats: PlayerSeatConfig[] = seats.map((seat, idx) => {
      if (idx !== index) return seat;
      return {
        ...seat,
        type: nextType,
        name: nextType === 'human' ? `Player ${idx + 1}` : `Bot ${idx + 1}`,
      };
    });
    onChangeSeats(normalizeSeats(nextSeats));
  };

  const handleNameChange = (index: number, value: string) => {
    onChangeSeats(
      seats.map((seat, i) => (i === index ? { ...seat, name: value } : seat))
    );
  };

  const handleSeatDifficultyChange = (index: number, difficulty: BotDifficulty) => {
    onChangeSeats(
      seats.map((seat, i) => (i === index ? { ...seat, difficulty } : seat))
    );
  };

  const handleApplyAllBotDifficulty = (difficulty: BotDifficulty) => {
    onChangeSeats(
      seats.map((seat) =>
        seat.type === 'bot' ? { ...seat, difficulty } : seat
      )
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    const normalized = normalizeSeats(seats).map((seat) => ({
      ...seat,
      name: seat.name.trim(),
    }));
    const check = validateMultiplayerSeats(normalized);
    if (!check.valid) {
      return;
    }
    onSubmitValid(normalized);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto max-w-3xl rounded-lg border border-[#DDD4C7] bg-[#FAF7F2] p-4 sm:p-8"
    >
      <div className="border-b border-[#E6DED2] pb-5">
        <p className="font-sans text-xs font-medium tracking-wider text-[#6B6059] uppercase">
          Table Setup
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1E1A18] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">{description}</p>
      </div>

      <div className="mt-6 space-y-6">
        {gameOptionsSlot}

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
                1 human vs 1–3 automated bots.
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
              {mode === 'vs-bots'
                ? 'Total Players (You + Bots)'
                : 'Number of Players'}
            </legend>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  aria-pressed={playerCount === count}
                  className={`min-h-[44px] rounded-md border px-2.5 py-2 text-xs font-medium tabular-nums transition-colors sm:text-sm ${
                    playerCount === count
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {mode === 'vs-bots'
                    ? `${count} (${count - 1} ${count - 1 === 1 ? 'Bot' : 'Bots'})`
                    : `${count} Players`}
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
                  onClick={() => onChangeDirection(dir)}
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
                Turn Sequence & Players
              </h3>
              <p className="mt-0.5 text-xs text-[#524943]">
                {mode === 'vs-bots'
                  ? 'Choose whether you play first or later, rename players, or reorder seats below.'
                  : mode === 'mixed'
                    ? 'Toggle each seat between Human and Bot (at least 1 human) and arrange turn order.'
                    : 'Name players and arrange who takes the 1st, 2nd, 3rd, or 4th turn.'}
              </p>
            </div>

            {showBotDifficulty && hasBots && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-[#524943]">
                  All Bots:
                </span>
                {DIFFICULTIES.map((level) => (
                  <button
                    key={`all-bots-${level}`}
                    type="button"
                    onClick={() => handleApplyAllBotDifficulty(level)}
                    className="min-h-[36px] rounded border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 py-1 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
                  >
                    {BOT_DIFFICULTY_LABELS[level]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showBotDifficulty && hasBots && (
            <p className="mt-2 text-xs text-[#524943]">
              Bot levels: <strong>Easy</strong> (random), <strong>Normal</strong>{' '}
              (baseline deck odds), <strong>Hard</strong> (tracks revealed cards).
            </p>
          )}

          {mode === 'vs-bots' && (
            <fieldset className="mt-4">
              <legend className="text-xs font-semibold text-[#524943]">
                When do you want to go?
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
              const seatError = attemptedSubmit ? validation.seatErrors[idx] : undefined;

              return (
                <li
                  key={seat.id}
                  className="rounded-md border border-[#DDD4C7] bg-[#FAF7F2] p-3"
                >
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span className="inline-flex h-10 w-11 shrink-0 items-center justify-center rounded border border-[#C6B8A6] bg-[#EFE8DC] font-mono text-xs font-semibold text-[#1E1A18] tabular-nums">
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
                              : `Switch ${seat.name || `Seat ${idx + 1}`} between Human and Bot`
                          }
                          className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
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
                          className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${
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
                        aria-invalid={Boolean(seatError)}
                        value={seat.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        className={`min-h-[44px] min-w-[120px] flex-1 rounded-md border bg-[#FAF7F2] px-3 py-1.5 text-sm text-[#1E1A18] focus:border-[#7C2D36] focus:outline-none ${
                          seatError ? 'border-[#9B1C2E]' : 'border-[#C6B8A6]'
                        }`}
                      />

                      {showBotDifficulty && !isHuman && (
                        <div
                          className="flex shrink-0 items-center gap-1"
                          role="group"
                          aria-label={`${seat.name || `Bot ${idx + 1}`} difficulty`}
                        >
                          {DIFFICULTIES.map((level) => (
                            <button
                              key={`${seat.id}-${level}`}
                              type="button"
                              onClick={() => handleSeatDifficultyChange(idx, level)}
                              aria-pressed={seat.difficulty === level}
                              title={BOT_DIFFICULTY_DESCRIPTIONS[level]}
                              className={`min-h-[44px] rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                                seat.difficulty === level
                                  ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                                  : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                              }`}
                            >
                              {BOT_DIFFICULTY_LABELS[level]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSeat(idx, -1)}
                        aria-label={`Move ${seat.name || `Seat ${idx + 1}`} earlier`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === seats.length - 1}
                        onClick={() => handleMoveSeat(idx, 1)}
                        aria-label={`Move ${seat.name || `Seat ${idx + 1}`} later`}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {seatError && (
                    <p className="mt-1.5 text-xs font-medium text-[#9B1C2E]" role="alert">
                      {seatError}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          {attemptedSubmit && !validation.valid && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-md border border-[#C98B8D] bg-[#FBF2F2] p-3 text-xs text-[#7C2D36]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <ul className="space-y-0.5">
                {validation.errors.map((err, index) => (
                  <li key={`setup-err-${index}`}>{err}</li>
                ))}
              </ul>
            </div>
          )}
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

        {extraSettingsSlot && (
          <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7]">
            <button
              type="button"
              onClick={() => setShowExtraSettings((prev) => !prev)}
              aria-expanded={showExtraSettings}
              aria-controls="shared-extra-settings"
              className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1E1A18]"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
                <span>{extraSettingsTitle}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B6059] transition-transform duration-150 ${
                  showExtraSettings ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {showExtraSettings && (
              <div
                id="shared-extra-settings"
                className="space-y-4 border-t border-[#DDD4C7] px-4 py-4 text-sm"
              >
                {extraSettingsSlot}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[#E6DED2] pt-6">
        <button
          type="submit"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-[#7C2D36] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[#64222A] sm:w-auto"
        >
          <Play className="h-4 w-4" aria-hidden="true" />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
