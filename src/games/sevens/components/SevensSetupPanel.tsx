import { useState } from 'react';
import { ChevronDown, Play, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_SEVENS_RULES } from '../engine/gameEngine';
import type {
  CardTexture,
  GameMode,
  GameSetupConfig,
  PlayerType,
  SevensRulesConfig,
  StandardCard,
  StartingHandSize,
} from '../engine/types';
import { GameCardTile } from './GameCardTile';

interface SevensSetupPanelProps {
  initialConfig?: GameSetupConfig;
  cardTexture: CardTexture;
  onChangeCardTexture: (texture: CardTexture) => void;
  onStartGame: (config: GameSetupConfig) => void;
}

const PREVIEW_EIGHT_DIAMONDS: StandardCard = {
  id: 'preview-diamonds-8',
  kind: 'standard',
  rank: 8,
  suit: 'diamonds',
};

export function SevensSetupPanel({
  initialConfig,
  cardTexture,
  onChangeCardTexture,
  onStartGame,
}: SevensSetupPanelProps) {
  const initialHumans =
    initialConfig?.playerTypes?.filter((t) => t === 'human').length ??
    (initialConfig?.mode === 'pass-and-play' ? initialConfig.playerCount : 2);
  const initialBots =
    initialConfig?.playerTypes?.filter((t) => t === 'bot').length ??
    (initialConfig?.mode === 'pass-and-play' ? 0 : (initialConfig?.playerCount ?? 2) - 1);

  const [mode, setMode] = useState<GameMode>(initialConfig?.mode ?? 'vs-bots');
  const [vsBotsPlayerCount, setVsBotsPlayerCount] = useState<2 | 3 | 4>(
    initialConfig?.mode === 'vs-bots' ? initialConfig.playerCount : 2
  );
  const [passHumanCount, setPassHumanCount] = useState<2 | 3 | 4>(
    initialHumans >= 2 && initialHumans <= 4 ? (initialHumans as 2 | 3 | 4) : 2
  );
  const [passBotCount, setPassBotCount] = useState<0 | 1 | 2>(
    initialConfig?.mode === 'pass-and-play' && initialBots >= 0 && initialBots <= 2
      ? (Math.min(initialBots, 4 - initialHumans) as 0 | 1 | 2)
      : 0
  );
  const [handSize, setHandSize] = useState<StartingHandSize>(
    initialConfig?.handSize ?? 7
  );
  const [playerNames, setPlayerNames] = useState<string[]>(
    initialConfig?.playerNames ?? ['You', 'Player 2', 'Player 3', 'Player 4']
  );
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [rules, setRules] = useState<SevensRulesConfig>({
    ...DEFAULT_SEVENS_RULES,
    ...initialConfig?.rules,
  });

  const activePlayerTypes: PlayerType[] =
    mode === 'vs-bots'
      ? ['human', ...Array.from({ length: vsBotsPlayerCount - 1 }, () => 'bot' as const)]
      : [
          ...Array.from({ length: passHumanCount }, () => 'human' as const),
          ...Array.from({ length: passBotCount }, () => 'bot' as const),
        ];

  const totalPlayerCount = activePlayerTypes.length as 2 | 3 | 4;
  const maxPassBots = (4 - passHumanCount) as 0 | 1 | 2;

  const handlePassHumanCountChange = (count: 2 | 3 | 4) => {
    setPassHumanCount(count);
    const nextMaxBots = Math.max(0, 4 - count) as 0 | 1 | 2;
    if (passBotCount > nextMaxBots) {
      setPassBotCount(nextMaxBots);
    }
  };

  const handleNameChange = (index: number, value: string) => {
    setPlayerNames((prev) => prev.map((name, i) => (i === index ? value : name)));
  };

  const getDefaultSeatLabel = (index: number, type: PlayerType): string => {
    if (type === 'bot') {
      const botNumber = activePlayerTypes
        .slice(0, index + 1)
        .filter((t) => t === 'bot').length;
      return `Bot ${botNumber}`;
    }
    if (mode === 'vs-bots') {
      return 'You';
    }
    const humanNumber = activePlayerTypes
      .slice(0, index + 1)
      .filter((t) => t === 'human').length;
    return `Player ${humanNumber}`;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const resolvedNames = activePlayerTypes.map((type, idx) => {
      if (type === 'bot') {
        return getDefaultSeatLabel(idx, 'bot');
      }
      const typed = playerNames[idx]?.trim();
      if (typed && !(mode === 'pass-and-play' && idx === 0 && typed === 'You')) {
        return typed;
      }
      return getDefaultSeatLabel(idx, 'human');
    });

    onStartGame({
      playerCount: totalPlayerCount,
      handSize,
      mode,
      playerTypes: activePlayerTypes,
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
          Uses a shuffled 54-card deck (52 standard cards + 2 Jokers). Play solo against bots,
          pass the device with friends, or combine Pass and Play with bot opponents.
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
                Pass and Play (+ Optional Bots)
              </span>
              <span className="mt-1 text-xs text-[#524943]">
                2–4 human players share this device with privacy screens, plus optional bot seats.
              </span>
            </button>
          </div>
        </fieldset>

        {/* Player Count & Starting Hand */}
        {mode === 'vs-bots' ? (
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
                    onClick={() => setVsBotsPlayerCount(count)}
                    aria-pressed={vsBotsPlayerCount === count}
                    className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                      vsBotsPlayerCount === count
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
        ) : (
          <div className="space-y-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-semibold text-[#1E1A18]">
                  Human Players
                </legend>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {([2, 3, 4] as const).map((count) => (
                    <button
                      key={`humans-${count}`}
                      type="button"
                      onClick={() => handlePassHumanCountChange(count)}
                      aria-pressed={passHumanCount === count}
                      className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                        passHumanCount === count
                          ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                          : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                      }`}
                    >
                      {count} Humans
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-[#1E1A18]">
                  Add Bot Opponents
                </legend>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {([0, 1, 2] as const).map((bots) => {
                    const isAllowed = bots <= maxPassBots;
                    return (
                      <button
                        key={`bots-${bots}`}
                        type="button"
                        disabled={!isAllowed}
                        onClick={() => setPassBotCount(bots)}
                        aria-pressed={passBotCount === bots}
                        className={`min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                          passBotCount === bots
                            ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                            : 'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {bots === 0 ? 'No Bots' : `${bots} ${bots === 1 ? 'Bot' : 'Bots'}`}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 sm:items-end">
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

              <p className="rounded-md border border-[#DDD4C7] bg-[#F4EFE7] px-3.5 py-2.5 text-xs text-[#4A413B] tabular-nums">
                Table summary:{' '}
                <strong className="font-semibold text-[#1E1A18]">
                  {totalPlayerCount} total players
                </strong>{' '}
                ({passHumanCount} Humans
                {passBotCount > 0
                  ? ` + ${passBotCount} ${passBotCount === 1 ? 'Bot' : 'Bots'}`
                  : ''}
                )
              </p>
            </div>
          </div>
        )}

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
                  Crisp white playing cards with full pip counts (8♦ shows 8 diamonds) and court
                  frames.
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
                  Warm ivory archive stock with bold corner rank and a single centered suit emblem.
                </span>
              </div>
            </button>
          </div>
        </fieldset>

        {/* Player Names */}
        <div>
          <p className="text-sm font-semibold text-[#1E1A18]">
            {mode === 'vs-bots' ? 'Your Name' : 'Human Player Names'}
          </p>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            {activePlayerTypes.map((type, idx) =>
              type === 'human' ? (
                <div key={`player-name-${idx}`}>
                  <label
                    htmlFor={`setup-player-${idx}`}
                    className="block text-xs font-medium text-[#6B6059]"
                  >
                    {getDefaultSeatLabel(idx, 'human')} (Human)
                  </label>
                  <input
                    id={`setup-player-${idx}`}
                    type="text"
                    maxLength={24}
                    value={
                      mode === 'pass-and-play' && idx === 0 && playerNames[0] === 'You'
                        ? 'Player 1'
                        : playerNames[idx] ?? ''
                    }
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={getDefaultSeatLabel(idx, 'human')}
                    className="mt-1 min-h-[44px] w-full rounded-md border border-[#C6B8A6] bg-[#FAF7F2] px-3 py-2 text-sm text-[#1E1A18] focus:border-[#7C2D36] focus:outline-none"
                  />
                </div>
              ) : mode === 'pass-and-play' ? (
                <div
                  key={`bot-seat-${idx}`}
                  className="flex min-h-[44px] flex-col justify-center rounded-md border border-[#DDD4C7] bg-[#F4EFE7]/70 px-3 py-2"
                >
                  <span className="text-xs font-medium text-[#6B6059]">
                    Seat {idx + 1} (Bot Opponent)
                  </span>
                  <span className="text-sm font-medium text-[#1E1A18]">
                    {getDefaultSeatLabel(idx, 'bot')} — Automated
                  </span>
                </div>
              ) : null
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
