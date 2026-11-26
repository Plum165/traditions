import { Bot, Sparkles, User } from 'lucide-react';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import type { OmoPublicView } from '../engine/types';

interface OmoScoreboardProps {
  view: OmoPublicView;
}

export function OmoScoreboard({ view }: OmoScoreboardProps) {
  return (
    <section aria-label="Player scoreboard">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-serif text-base font-semibold text-[#1E1A18] sm:text-lg">
          Players & Scores
        </h2>
        <span className="font-mono text-xs text-[#6B6059] capitalize tabular-nums">
          {view.direction}
        </span>
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {view.players.map((player, idx) => {
          const isActive =
            view.status === 'PLAYING' && idx === view.currentPlayerIndex;
          const isWinner =
            view.status === 'GAME_OVER' && view.winnerIds.includes(player.id);

          return (
            <li
              key={player.id}
              aria-current={isActive ? 'step' : undefined}
              className={`rounded-lg border p-3 transition-colors ${
                isActive
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : isWinner
                    ? 'border-[#8A5A19] bg-[#FBF4E7]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-[#6B6059] tabular-nums">
                      #{idx + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E1A18]">
                      {player.type === 'bot' ? (
                        <Bot className="h-3.5 w-3.5 text-[#8A5A19]" aria-hidden="true" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-[#7C2D36]" aria-hidden="true" />
                      )}
                      <span className="truncate">{player.name}</span>
                    </span>
                    {player.type === 'bot' && (
                      <span className="rounded border border-[#E2D3B9] bg-[#FBF4E7] px-1.5 py-0.5 text-[10px] font-medium text-[#6E4411]">
                        {BOT_DIFFICULTY_LABELS[player.difficulty]}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 font-mono text-xs text-[#524943] tabular-nums">
                    {player.omosCreated} {player.omosCreated === 1 ? 'OMO' : 'OMOs'} ·{' '}
                    {player.bonusTurnsEarned} bonus · {player.turnsTaken}{' '}
                    {player.turnsTaken === 1 ? 'move' : 'moves'}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="block font-mono text-lg font-bold text-[#1E1A18] tabular-nums">
                    {player.score}
                  </span>
                  <span className="block text-[10px] font-medium tracking-wider text-[#6B6059] uppercase">
                    {player.score === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              </div>

              {isActive && (
                <div className="mt-2 flex items-center gap-1.5 border-t border-[#E2D6C6] pt-1.5 text-xs font-medium text-[#7C2D36]">
                  {view.isBonusTurn ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Bonus Turn Active</span>
                    </>
                  ) : (
                    <span>
                      {player.type === 'bot' ? 'Bot Thinking...' : 'Current Turn'}
                    </span>
                  )}
                </div>
              )}

              {isWinner && (
                <div className="mt-2 border-t border-[#E6D6BE] pt-1.5 text-xs font-semibold text-[#6E4411]">
                  {view.isTie ? 'Tied Winner' : 'Winner'}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
