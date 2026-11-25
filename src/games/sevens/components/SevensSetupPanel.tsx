import { useState } from 'react';
import { ChevronDown, Play, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_SEVENS_RULES } from '../engine/gameEngine';
import type {
  GameMode,
  GameSetupConfig,
  SevensRulesConfig,
  StartingHandSize,
} from '../engine/types';

interface SevensSetupPanelProps {
  initialConfig?: GameSetupConfig;
  onStartGame: (config: GameSetupConfig) => void;
}

export function SevensSetupPanel({
  initialConfig,
  onStartGame,
}: SevensSetupPanelProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(
    initialConfig?.playerCount ?? 2
  );
  const [handSize, setHandSize] = useState<StartingHandSize>(
    initialConfig?.handSize ?? 7
  );
  const [mode, setMode] = useState<GameMode>(initialConfig?.mode ?? 'vs-bots');
  const [playerNames, setPlayerNames] = useState<string[]>(
    initialConfig?.playerNames ?? ['You', 'Player 2', 'Player 3', 'Player 4']
  );
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [rules, setRules] = useState<SevensRulesConfig>({
    ...DEFAULT_SEVENS_RULES,
    ...initialConfig?.rules,
  });

  const handleNameChange = (index: number, value: string) => {
    setPlayerNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const resolvedNames = Array.from({ length: playerCount }, (_, idx) => {
      if (mode === 'vs-bots') {
        return idx === 0 ? playerNames[0]?.trim() || 'You' : `Bot ${idx}`;
      }
      return playerNames[idx]?.trim() || `Player ${idx + 1}`;
    });

    onStartGame({
      playerCount,
      handSize,
      mode,
      playerNames: resolvedNames,
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
          Set up your game of Sevens
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#4A413B]">
          Uses a shuffled 54-card deck (52 standard cards + 2 Jokers). Choose your table size,
          starting hand variation, and whether you want to play against bots or pass the device.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Game Mode */}
        <fieldset>
          <legend className="text-sm font-semibold text-[#1E1A18]">Play Mode</legend>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('vs-bots')}
              aria-pressed={mode === 'vs-bots'}
              className={`flex min-h-[56px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                mode === 'vs-bots'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Play Against Bots
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                You take one seat while rule-based bots fill the remaining seats.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pass-and-play')}
              aria-pressed={mode === 'pass-and-play'}
              className={`flex min-h-[56px] flex-col items-start rounded-md border p-4 text-left transition-colors ${
                mode === 'pass-and-play'
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : 'border-[#DDD4C7] bg-[#FAF7F2] hover:bg-[#F4EFE7]/60'
              }`}
            >
              <span className="font-serif text-base font-semibold text-[#1E1A18]">
                Pass and Play
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                All players are human on this device, with a privacy screen between turns.
              </span>
            </button>
          </div>
        </fieldset>

        {/* Player Count & Starting Hand */}
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
                  onClick={() => setPlayerCount(count)}
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
              Starting Hand Version
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {([7, 11] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setHandSize(size)}
                  aria-pressed={handSize === size}
                  className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                    handSize === size
                      ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                      : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                  }`}
                >
                  {size}-Card Version
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Player Names */}
        <div>
          <p className="text-sm font-semibold text-[#1E1A18]">
            {mode === 'vs-bots' ? 'Your Name' : 'Player Names'}
          </p>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            {Array.from(
              { length: mode === 'vs-bots' ? 1 : playerCount },
              (_, idx) => (
                <div key={`player-name-${idx}`}>
                  <label
                    htmlFor={`setup-player-${idx}`}
                    className="block text-xs font-medium text-[#6B6059]"
                  >
                    {mode === 'vs-bots' ? 'Human Player' : `Player ${idx + 1}`}
                  </label>
                  <input
                    id={`setup-player-${idx}`}
                    type="text"
                    maxLength={24}
                    value={playerNames[idx] ?? ''}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={mode === 'vs-bots' ? 'You' : `Player ${idx + 1}`}
                    className="mt-1 min-h-[44px] w-full rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1E1A18] focus:border-[#7C2D36] focus:outline-none"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Configurable House Rules (Unresolved Rules) */}
        <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7]">
          <button
            type="button"
            onClick={() => setShowHouseRules((prev) => !prev)}
            aria-expanded={showHouseRules}
            aria-controls="configurable-house-rules"
            className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1E1A18]"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#7C2D36]" aria-hidden="true" />
              <span>Configurable House Rules (Unresolved Archive Questions)</span>
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
              id="configurable-house-rules"
              className="space-y-3 border-t border-[#DDD4C7] px-4 py-4 text-sm"
            >
              <p className="text-xs leading-relaxed text-[#524943]">
                Because households remember certain edge-case rules differently, these options are
                configurable rather than hard-coded as universal rules.
              </p>

              <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rules.allowDiscardJoker}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, allowDiscardJoker: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#7C2D36]"
                />
                <span>
                  <strong className="font-medium text-[#1E1A18]">
                    Allow discarding Jokers
                  </strong>
                  <span className="block text-xs text-[#524943]">
                    When off, Jokers must stay in your hand or be played unless no other cards
                    remain.
                  </span>
                </span>
              </label>

              <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rules.allowImmediateJokerReuse}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, allowImmediateJokerReuse: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#7C2D36]"
                />
                <span>
                  <strong className="font-medium text-[#1E1A18]">
                    Allow reusing a retrieved Joker on the same turn
                  </strong>
                  <span className="block text-xs text-[#524943]">
                    When off, a Joker retrieved from the table must wait until a later turn.
                  </span>
                </span>
              </label>

              <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rules.allowDiscardPickupTop}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, allowDiscardPickupTop: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#7C2D36]"
                />
                <span>
                  <strong className="font-medium text-[#1E1A18]">
                    Allow drawing the top card from the discard pile
                  </strong>
                  <span className="block text-xs text-[#524943]">
                    On by default: choose either the face-down draw pile or the top face-up
                    discard card at the start of each turn.
                  </span>
                </span>
              </label>

              <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rules.requireFinalDiscard}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, requireFinalDiscard: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#7C2D36]"
                />
                <span>
                  <strong className="font-medium text-[#1E1A18]">
                    Final card must be discarded to win
                  </strong>
                  <span className="block text-xs text-[#524943]">
                    When off, emptying your hand during the Play step wins immediately.
                  </span>
                </span>
              </label>

              <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={rules.allowExtendJokerSets}
                  onChange={(e) =>
                    setRules((r) => ({ ...r, allowExtendJokerSets: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#7C2D36]"
                />
                <span>
                  <strong className="font-medium text-[#1E1A18]">
                    Allow extending sets that contain a Joker
                  </strong>
                  <span className="block text-xs text-[#524943]">
                    When off, sets with a Joker must have their Joker replaced before adding more
                    cards.
                  </span>
                </span>
              </label>
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
          <span>Deal Cards & Start Game</span>
        </button>
      </div>
    </form>
  );
}
