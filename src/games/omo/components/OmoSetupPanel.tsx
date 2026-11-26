import { useEffect, useState } from 'react';
import { Minus, Plus, Volume2, VolumeX } from 'lucide-react';
import {
  MultiplayerSetupForm,
  buildDefaultSeats,
} from '../../../components/games/MultiplayerSetupForm';
import type {
  BotDifficulty,
  MultiplayerGameMode,
  PlayDirection,
  PlayerSeatConfig,
} from '../../../types/multiplayer';
import type { CardTexture } from '../../../types/playingCard';
import {
  OMO_GRID_PRESETS,
  clampGridDimension,
  getResponsiveGridLimits,
} from '../engine/gridManager';
import type { OmoSetupConfig } from '../engine/types';

interface OmoSetupPanelProps {
  initialConfig?: OmoSetupConfig;
  onStartGame: (config: OmoSetupConfig) => void;
}

const OMO_BOT_DESCRIPTIONS: Record<BotDifficulty, string> = {
  easy: 'Plays mostly random legal moves with an occasional immediate OMO.',
  normal: 'Captures immediate and multi-OMOs, blocks obvious threats, and develops setups.',
  hard: 'Evaluates O and M with lookahead, bonus-turn chains, and opponent response awareness.',
};

const NOOP_TEXTURE_CHANGE = (_texture: CardTexture) => {};

function readViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

export function OmoSetupPanel({
  initialConfig,
  onStartGame,
}: OmoSetupPanelProps) {
  const [viewport, setViewport] = useState(readViewportSize);

  useEffect(() => {
    const handleResize = () => {
      setViewport(readViewportSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const limits = getResponsiveGridLimits(viewport.width, viewport.height);

  const [mode, setMode] = useState<MultiplayerGameMode>(
    initialConfig?.mode ?? 'vs-bots'
  );
  const [direction, setDirection] = useState<PlayDirection>(
    initialConfig?.direction ?? 'clockwise'
  );
  const [seats, setSeats] = useState<PlayerSeatConfig[]>(
    initialConfig?.seats ?? buildDefaultSeats('vs-bots', 2)
  );
  const [rows, setRows] = useState<number>(() =>
    clampGridDimension(
      initialConfig?.rules.rows ?? limits.recommendedPreset.rows,
      limits.minRows,
      limits.maxRows
    )
  );
  const [cols, setCols] = useState<number>(() =>
    clampGridDimension(
      initialConfig?.rules.cols ?? limits.recommendedPreset.cols,
      limits.minCols,
      limits.maxCols
    )
  );
  const [botThinkingDelayMs, setBotThinkingDelayMs] = useState<number>(
    initialConfig?.rules.botThinkingDelayMs ?? 700
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    initialConfig?.rules.soundEnabled ?? true
  );

  // Clamp rows/cols automatically if the viewport shrinks into tighter device limits
  const safeRows = clampGridDimension(rows, limits.minRows, limits.maxRows);
  const safeCols = clampGridDimension(cols, limits.minCols, limits.maxCols);

  const handleSubmit = (validatedSeats: PlayerSeatConfig[]) => {
    onStartGame({
      mode,
      direction,
      seats: validatedSeats,
      rules: {
        rows: safeRows,
        cols: safeCols,
        botThinkingDelayMs,
        soundEnabled,
      },
    });
  };

  const tierLabel =
    limits.tier === 'mobile'
      ? 'Mobile'
      : limits.tier === 'tablet'
        ? 'Tablet'
        : 'Desktop';

  const gridConfigSlot = (
    <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#1E1A18]">
            Grid Dimensions
          </h3>
          <p className="mt-0.5 text-xs text-[#524943]">
            Choose a preset or set custom rows and columns. Limits adapt automatically for{' '}
            <strong className="font-medium text-[#1E1A18]">{tierLabel}</strong> screens (up to{' '}
            <span className="font-mono tabular-nums">
              {limits.maxRows} × {limits.maxCols}
            </span>
            ).
          </p>
        </div>
        <span className="rounded border border-[#C6B8A6] bg-[#FAF7F2] px-2.5 py-1 font-mono text-xs font-semibold text-[#7C2D36] tabular-nums">
          {safeRows} × {safeCols} ({safeRows * safeCols} cells)
        </span>
      </div>

      {/* Grid Size Presets */}
      <fieldset className="mt-4">
        <legend className="text-xs font-semibold text-[#524943]">
          Suggested Presets
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OMO_GRID_PRESETS.map((preset) => {
            const supported =
              preset.rows <= limits.maxRows && preset.cols <= limits.maxCols;
            const active =
              supported && safeRows === preset.rows && safeCols === preset.cols;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={!supported}
                onClick={() => {
                  setRows(preset.rows);
                  setCols(preset.cols);
                }}
                aria-pressed={active}
                className={`flex min-h-[52px] flex-col items-start justify-center rounded-md border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                    : supported
                      ? 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                      : 'cursor-not-allowed border-[#E2D9CC] bg-[#EFE8DC]/60 text-[#8A7D74] opacity-75'
                }`}
              >
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {preset.label}
                </span>
                <span
                  className={`text-[11px] ${
                    active ? 'text-[#F4EFE7]' : 'text-[#6B6059]'
                  }`}
                >
                  {supported ? preset.description : 'Larger screens'}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Custom Rows & Columns */}
      <div className="mt-4 grid gap-4 border-t border-[#DDD4C7] pt-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="omo-rows-input"
            className="block text-xs font-semibold text-[#1E1A18]"
          >
            Rows ({limits.minRows}–{limits.maxRows})
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              disabled={safeRows <= limits.minRows}
              onClick={() => setRows(Math.max(limits.minRows, safeRows - 1))}
              aria-label="Decrease rows"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              id="omo-rows-input"
              type="number"
              min={limits.minRows}
              max={limits.maxRows}
              value={safeRows}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) {
                  setRows(
                    clampGridDimension(parsed, limits.minRows, limits.maxRows)
                  );
                }
              }}
              className="min-h-[44px] w-full rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-semibold text-[#1E1A18] tabular-nums focus:border-[#7C2D36] focus:outline-none"
            />
            <button
              type="button"
              disabled={safeRows >= limits.maxRows}
              onClick={() => setRows(Math.min(limits.maxRows, safeRows + 1))}
              aria-label="Increase rows"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="omo-cols-input"
            className="block text-xs font-semibold text-[#1E1A18]"
          >
            Columns ({limits.minCols}–{limits.maxCols})
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              disabled={safeCols <= limits.minCols}
              onClick={() => setCols(Math.max(limits.minCols, safeCols - 1))}
              aria-label="Decrease columns"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              id="omo-cols-input"
              type="number"
              min={limits.minCols}
              max={limits.maxCols}
              value={safeCols}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) {
                  setCols(
                    clampGridDimension(parsed, limits.minCols, limits.maxCols)
                  );
                }
              }}
              className="min-h-[44px] w-full rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-semibold text-[#1E1A18] tabular-nums focus:border-[#7C2D36] focus:outline-none"
            />
            <button
              type="button"
              disabled={safeCols >= limits.maxCols}
              onClick={() => setCols(Math.min(limits.maxCols, safeCols + 1))}
              aria-label="Increase columns"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const extraSettingsSlot = (
    <>
      <fieldset>
        <legend className="text-xs font-semibold text-[#1E1A18]">
          Bot Thinking Pace
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { label: 'Fast', value: 450 },
            { label: 'Natural', value: 700 },
            { label: 'Deliberate', value: 1150 },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setBotThinkingDelayMs(opt.value)}
              aria-pressed={botThinkingDelayMs === opt.value}
              className={`min-h-[40px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                botThinkingDelayMs === opt.value
                  ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                  : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-4 border-t border-[#DDD4C7] pt-3">
        <div>
          <p className="text-xs font-semibold text-[#1E1A18]">Sound Cues</p>
          <p className="text-xs text-[#524943]">
            Play subtle audio tones for OMO scores, bonus turns, and game end.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          aria-pressed={soundEnabled}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1E1A18] hover:bg-[#EFE8DC]"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-[#6B6059]" aria-hidden="true" />
              <span>Muted</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <MultiplayerSetupForm
      title="Start a Game of OMO"
      description="Configure your grid size, select Play Against Bots, Pass and Play, or Mixed multiplayer, choose bot difficulty levels, and arrange player turn order."
      submitLabel="Start OMO Game"
      mode={mode}
      onChangeMode={setMode}
      direction={direction}
      onChangeDirection={setDirection}
      seats={seats}
      onChangeSeats={setSeats}
      cardTexture="archival"
      onChangeCardTexture={NOOP_TEXTURE_CHANGE}
      showBotDifficulty
      showCardTextureSelector={false}
      botDifficultyHint="Bot levels: Easy (mostly random), Normal (scores & blocks immediate OMOs), Hard (lookahead with bonus-turn simulation)."
      botDifficultyDescriptions={OMO_BOT_DESCRIPTIONS}
      extraSettingsTitle="Pace & Audio Options"
      gameOptionsSlot={gridConfigSlot}
      extraSettingsSlot={extraSettingsSlot}
      onSubmitValid={handleSubmit}
    />
  );
}
