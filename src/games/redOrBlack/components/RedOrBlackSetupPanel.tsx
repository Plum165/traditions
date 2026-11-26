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
import { DEFAULT_RED_OR_BLACK_RULES } from '../engine/gameEngine';
import type {
  RedOrBlackRulesConfig,
  RedOrBlackSetupConfig,
  RedOrBlackVariant,
} from '../engine/types';

interface RedOrBlackSetupPanelProps {
  initialConfig?: RedOrBlackSetupConfig;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onStartGame: (config: RedOrBlackSetupConfig) => void;
}

const DELAY_OPTIONS = [
  { label: 'Fast (450ms)', value: 450 },
  { label: 'Normal (850ms)', value: 850 },
  { label: 'Deliberate (1.4s)', value: 1400 },
] as const;

export function RedOrBlackSetupPanel({
  initialConfig,
  cardTexture,
  onChangeCardTexture,
  onStartGame,
}: RedOrBlackSetupPanelProps) {
  const [variant, setVariant] = useState<RedOrBlackVariant>(
    initialConfig?.variant ?? 'four-questions'
  );
  const [mode, setMode] = useState<MultiplayerGameMode>(
    initialConfig?.mode ?? 'vs-bots'
  );
  const [direction, setDirection] = useState<PlayDirection>(
    initialConfig?.direction ?? 'clockwise'
  );
  const [seats, setSeats] = useState<PlayerSeatConfig[]>(
    initialConfig?.seats ?? buildDefaultSeats('vs-bots', 2, 0, 'normal')
  );
  const [rules, setRules] = useState<RedOrBlackRulesConfig>({
    ...DEFAULT_RED_OR_BLACK_RULES,
    ...initialConfig?.rules,
  });

  return (
    <MultiplayerSetupForm
      title="Set up your game of Red or Black"
      description="Uses a standard 52-card deck. Choose between the Four Questions Challenge or the Card Collection house rule, configure 2–4 human or bot players, and set bot difficulty."
      submitLabel="Shuffle Deck & Start Game"
      mode={mode}
      onChangeMode={setMode}
      direction={direction}
      onChangeDirection={setDirection}
      seats={seats}
      onChangeSeats={setSeats}
      cardTexture={cardTexture}
      onChangeCardTexture={onChangeCardTexture}
      showBotDifficulty={true}
      extraSettingsTitle="Bot Pace & Experience Options"
      gameOptionsSlot={
        <div className="space-y-6">
          <fieldset>
            <legend className="text-sm font-semibold text-[#1E1A18]">
              Game Variant
            </legend>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setVariant('four-questions')}
                aria-pressed={variant === 'four-questions'}
                className={`flex min-h-[72px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                  variant === 'four-questions'
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
                }`}
              >
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Four Questions Challenge
                </span>
                <span className="mt-1 text-xs leading-relaxed text-[#524943]">
                  Answer Colour, Higher/Lower, Inside/Outside, and Suit in order. First player to complete all four wins.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVariant('card-collection')}
                aria-pressed={variant === 'card-collection'}
                className={`flex min-h-[72px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                  variant === 'card-collection'
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
                }`}
              >
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Card Collection House Rule
                </span>
                <span className="mt-1 text-xs leading-relaxed text-[#524943]">
                  Correct answers award cards to the answerer and reset to Question 1; misses award cards to the asker and pass the deck.
                </span>
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-[#1E1A18]">
              Ace Value (Card Ranking)
            </legend>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRules((r) => ({ ...r, aceRanking: 'ace-low' }))}
                aria-pressed={rules.aceRanking === 'ace-low'}
                className={`flex min-h-[60px] flex-col items-start rounded-md border p-3.5 text-left transition-colors ${
                  rules.aceRanking === 'ace-low'
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
                }`}
              >
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Ace = 1 (Lowest · Default)
                </span>
                <span className="mt-1 text-xs text-[#524943]">
                  Order: A (1), 2, 3 … 10, J (11), Q (12), K (13).
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRules((r) => ({ ...r, aceRanking: 'ace-high' }))}
                aria-pressed={rules.aceRanking === 'ace-high'}
                className={`flex min-h-[60px] flex-col items-start rounded-md border p-3.5 text-left transition-colors ${
                  rules.aceRanking === 'ace-high'
                    ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
                }`}
              >
                <span className="font-serif text-base font-semibold text-[#1E1A18]">
                  Ace = 14 (Highest Value)
                </span>
                <span className="mt-1 text-xs text-[#524943]">
                  Order: 2, 3 … 10, J (11), Q (12), K (13), A (14).
                </span>
              </button>
            </div>
          </fieldset>
        </div>
      }
      extraSettingsSlot={
        <>

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
                  onClick={() => setRules((r) => ({ ...r, animationsEnabled: true }))}
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
                  onClick={() => setRules((r) => ({ ...r, animationsEnabled: false }))}
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
          variant,
          mode,
          direction,
          seats: validatedSeats,
          rules,
        })
      }
    />
  );
}
