import { Bot, User } from 'lucide-react';
import { BOT_DIFFICULTY_LABELS } from '../../../types/multiplayer';
import { formatRankLabel } from '../engine/deck';
import type { PublicGoFishPlayerSummary } from '../engine/types';

interface PlayerStatusProps {
  players: PublicGoFishPlayerSummary[];
  winnerIds: string[];
  isGameOver: boolean;
}

export function PlayerStatus({
  players,
  winnerIds,
  isGameOver,
}: PlayerStatusProps) {
  return (
    <section aria-label="Players and book counts">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {players.map((player) => {
          const isWinner = isGameOver && winnerIds.includes(player.id);
          const statusLabel = isGameOver
            ? isWinner
              ? 'Winner'
              : 'Finished'
            : player.isCurrentTurn
              ? 'Active Turn'
              : player.isInactiveForAsking
                ? 'Waiting (0 cards)'
                : 'Standby';

          return (
            <div
              key={player.id}
              className={`rounded-lg border p-3.5 transition-colors ${
                player.isCurrentTurn && !isGameOver
                  ? 'border-[#7C2D36] bg-[#F4EFE7] ring-1 ring-[#7C2D36]'
                  : isWinner
                    ? 'border-[#7C2D36] bg-[#F4EFE7]'
                    : 'border-[#DDD4C7] bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {player.type === 'bot' ? (
                    <Bot
                      className="h-4 w-4 shrink-0 text-[#6E4411]"
                      aria-hidden="true"
                    />
                  ) : (
                    <User
                      className="h-4 w-4 shrink-0 text-[#7C2D36]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base font-semibold text-[#1E1A18]">
                      {player.name}
                    </p>
                    <p className="text-[11px] text-[#6B6059]">
                      {player.type === 'bot'
                        ? `Bot · ${BOT_DIFFICULTY_LABELS[player.difficulty ?? 'normal']}`
                        : 'Human'}{' '}
                      · {statusLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-[#E6DED2] pt-2.5 text-xs">
                <span className="text-[#524943]">
                  Hand:{' '}
                  <strong className="font-mono font-semibold text-[#1E1A18] tabular-nums">
                    {player.handCount}
                  </strong>{' '}
                  {player.handCount === 1 ? 'card' : 'cards'}
                </span>
                <span className="text-[#524943]">
                  Books:{' '}
                  <strong className="font-mono font-semibold text-[#7C2D36] tabular-nums">
                    {player.bookCount}
                  </strong>
                </span>
              </div>

              <p className="mt-1.5 truncate font-mono text-[11px] text-[#6B6059] tabular-nums">
                {player.books.length > 0
                  ? `Collected: ${player.books
                      .map((b) => formatRankLabel(b.rank))
                      .join(' · ')}`
                  : 'No completed books yet'}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
