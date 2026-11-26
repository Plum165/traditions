import { useState } from 'react';
import {
  MultiplayerSetupForm,
  buildDefaultSeats,
} from '../../../components/games/MultiplayerSetupForm';
import type { PlayerSeatConfig } from '../../../types/multiplayer';
import type { CardTexture } from '../../../types/playingCard';
import { DEFAULT_PORRIDGE_RULES } from '../engine/gameEngine';
import type {
  PlayDirection,
  PorridgeGameMode,
  PorridgeRuleVariation,
  PorridgeRulesConfig,
  PorridgeSetupConfig,
} from '../engine/types';

interface PorridgeSetupPanelProps {
  initialConfig?: PorridgeSetupConfig;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onStartGame: (config: PorridgeSetupConfig) => void;
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
  const [seats, setSeats] = useState<PlayerSeatConfig[]>(() =>
    initialConfig?.seats
      ? initialConfig.seats.map((seat, idx) => ({
          id: `seat-${idx + 1}`,
          type: seat.type,
          name: seat.name,
          difficulty: 'normal',
        }))
      : buildDefaultSeats('vs-bots', 3, 0)
  );
  const [rules, setRules] = useState<PorridgeRulesConfig>({
    ...DEFAULT_PORRIDGE_RULES,
    ...initialConfig?.rules,
  });

  return (
    <MultiplayerSetupForm
      title="Set up your game of Porridge (Sekaku)"
      description="Spreads all 52 cards (no Jokers) face down in a circle. Pick a rule version, choose your players, and lay out who plays first."
      submitLabel="Spread Circle & Start Porridge"
      mode={mode}
      onChangeMode={setMode}
      direction={direction}
      onChangeDirection={setDirection}
      seats={seats}
      onChangeSeats={setSeats}
      cardTexture={cardTexture}
      onChangeCardTexture={onChangeCardTexture}
      showBotDifficulty={false}
      extraSettingsTitle="House Rule Options (Ace Rank & Comparison Reference)"
      gameOptionsSlot={
        <fieldset>
          <legend className="text-sm font-semibold text-[#1E1A18]">
            Rule Variation
          </legend>
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
      }
      extraSettingsSlot={
        <>
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
        </>
      }
      onSubmitValid={(validatedSeats) =>
        onStartGame({
          mode,
          variation,
          direction,
          seats: validatedSeats.map((s) => ({ type: s.type, name: s.name })),
          rules,
        })
      }
    />
  );
}
