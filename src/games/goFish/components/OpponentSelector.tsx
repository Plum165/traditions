import { Bot, User } from 'lucide-react';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import type { PublicGoFishPlayerSummary } from '../engine/types';

interface OpponentSelectorProps {
  opponents: PublicGoFishPlayerSummary[];
  allOtherPlayers: PublicGoFishPlayerSummary[];
  selectedOpponentId: string | null;
  disabled: boolean;
  onSelectOpponent: (opponentId: string) => void;
}

export function OpponentSelector({
  opponents,
  allOtherPlayers,
  selectedOpponentId,
  disabled,
  onSelectOpponent,
}: OpponentSelectorProps) {
  const eligibleIds = new Set(opponents.map((o) => o.id));

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-[#1E1A18]">
        1. Who would you like to ask?
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {allOtherPlayers.map((opp) => {
          const isEligible = eligibleIds.has(opp.id);
          const isSelected = selectedOpponentId === opp.id;

          return (
            <button
              key={opp.id}
              type="button"
              disabled={disabled || !isEligible}
              onClick={() => onSelectOpponent(opp.id)}
              aria-pressed={isSelected}
              className={`flex min-h-[56px] items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                isSelected
                  ? 'border-[#7C2D36] bg-[#7C2D36] text-[#FAF7F2]'
                  : isEligible
                    ? 'border-[#C6B8A6] bg-[#FAF7F2] text-[#1E1A18] hover:bg-[#EFE8DC]'
                    : 'border-[#DDD4C7] bg-[#F4EFE7] text-[#8A7D74] opacity-65 cursor-not-allowed'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                {opp.type === 'bot' ? (
                  <Bot className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{opp.name}</p>
                  <p
                    className={`text-[11px] ${
                      isSelected ? 'text-[#EFE8DC]' : 'text-[#524943]'
                    }`}
                  >
                    {opp.type === 'bot'
                      ? BOT_DIFFICULTY_LABELS[opp.difficulty ?? 'normal']
                      : 'Human'}
                    {' · '}
                    <span className="font-mono tabular-nums">
                      {opp.handCount} {opp.handCount === 1 ? 'card' : 'cards'}
                    </span>
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
