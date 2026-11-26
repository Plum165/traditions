import { useState } from 'react';
import {
  MultiplayerSetupForm,
  buildDefaultSeats,
} from '../../../components/games/MultiplayerSetupForm';
import type {
  MultiplayerGameMode,
  PlayDirection,
  PlayerSeatConfig,
} from '../../../types/multiplayer';
import type { CardTexture } from '../../../types/playingCard';
import { DEFAULT_GO_FISH_RULES } from '../engine/deal';
import type { GoFishRulesConfig, GoFishSetupConfig } from '../engine/types';

interface GoFishSetupPanelProps {
  initialConfig?: GoFishSetupConfig;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onStartGame: (config: GoFishSetupConfig) => void;
}

const DELAY_OPTIONS = [
  { label: 'Fast (450ms)', value: 450 },
  { label: 'Normal (850ms)', value: 850 },
  { label: 'Deliberate (1.4s)', value: 1400 },
] as const;

export function GoFishSetupPanel({
  initialConfig,
  cardTexture,
  onChangeCardTexture,
  onStartGame,
}: GoFishSetupPanelProps) {
  const [mode, setMode] = useState<MultiplayerGameMode>(
    initialConfig?.mode ?? 'vs-bots'
  );
  const [direction, setDirection] = useState<PlayDirection>(
    initialConfig?.direction ?? 'clockwise'
  );
  const [seats, setSeats] = useState<PlayerSeatConfig[]>(
    initialConfig?.seats ?? buildDefaultSeats('vs-bots', 3, 0, 'normal')
  );
  const [rules, setRules] = useState<GoFishRulesConfig>({
    ...DEFAULT_GO_FISH_RULES,
    ...initialConfig?.rules,
  });

  return (
    <MultiplayerSetupForm
      title="Set up your game of Go Fish"
      description="Uses a standard 52-card deck (no Jokers). Deal 7 cards each for 2–3 players or 5 cards each for 4 players, ask opponents for ranks you hold, draw from the Fish Pond, and collect four-card books."
      submitLabel="Deal Hands & Start Go Fish"
      mode={mode}
      onChangeMode={setMode}
      direction={direction}
      onChangeDirection={setDirection}
      seats={seats}
      onChangeSeats={setSeats}
      cardTexture={cardTexture}
      onChangeCardTexture={onChangeCardTexture}
      showBotDifficulty={true}
      extraSettingsTitle="House Rule & Experience Options"
      extraSettingsSlot={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-[#1E1A18]">Initial Deal Size</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRules((r) => ({ ...r, dealRule: 'standard' }))}
                  aria-pressed={rules.dealRule === 'standard'}
                  className={`min-h-[44px] rounded border px-2.5 py-1.5 text-xs font-medium ${
                    rules.dealRule === 'standard'
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  7 (2–3p) / 5 (4p)
                </button>
                <button
                  type="button"
                  onClick={() => setRules((r) => ({ ...r, dealRule: 'always-five' }))}
                  aria-pressed={rules.dealRule === 'always-five'}
                  className={`min-h-[44px] rounded border px-2.5 py-1.5 text-xs font-medium ${
                    rules.dealRule === 'always-five'
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Always 5 Cards
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1E1A18]">Empty Hand Refill</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRules((r) => ({ ...r, emptyHandRule: 'five-cards' }))
                  }
                  aria-pressed={rules.emptyHandRule === 'five-cards'}
                  className={`min-h-[44px] rounded border px-2.5 py-1.5 text-xs font-medium ${
                    rules.emptyHandRule === 'five-cards'
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Up to 5 Cards
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRules((r) => ({ ...r, emptyHandRule: 'single-card' }))
                  }
                  aria-pressed={rules.emptyHandRule === 'single-card'}
                  className={`min-h-[44px] rounded border px-2.5 py-1.5 text-xs font-medium ${
                    rules.emptyHandRule === 'single-card'
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  1 Card Only
                </button>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#1E1A18]">Bot Thinking Delay</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DELAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setRules((r) => ({ ...r, botThinkingDelayMs: opt.value }))
                  }
                  aria-pressed={rules.botThinkingDelayMs === opt.value}
                  className={`min-h-[44px] rounded border px-2.5 py-1.5 text-xs font-medium tabular-nums ${
                    rules.botThinkingDelayMs === opt.value
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-[#1E1A18]">Sound Effects</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRules((r) => ({ ...r, soundEnabled: true }))}
                  aria-pressed={rules.soundEnabled}
                  className={`min-h-[44px] rounded border px-3 py-1.5 text-xs font-medium ${
                    rules.soundEnabled
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Sound On
                </button>
                <button
                  type="button"
                  onClick={() => setRules((r) => ({ ...r, soundEnabled: false }))}
                  aria-pressed={!rules.soundEnabled}
                  className={`min-h-[44px] rounded border px-3 py-1.5 text-xs font-medium ${
                    !rules.soundEnabled
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Sound Off
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1E1A18]">Card Animations</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRules((r) => ({ ...r, animationsEnabled: true }))
                  }
                  aria-pressed={rules.animationsEnabled}
                  className={`min-h-[44px] rounded border px-3 py-1.5 text-xs font-medium ${
                    rules.animationsEnabled
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Animations On
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRules((r) => ({ ...r, animationsEnabled: false }))
                  }
                  aria-pressed={!rules.animationsEnabled}
                  className={`min-h-[44px] rounded border px-3 py-1.5 text-xs font-medium ${
                    !rules.animationsEnabled
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18]'
                  }`}
                >
                  Reduced
                </button>
              </div>
            </div>
          </div>
        </>
      }
      onSubmitValid={(validatedSeats) =>
        onStartGame({
          mode,
          direction,
          seats: validatedSeats,
          rules,
        })
      }
    />
  );
}
