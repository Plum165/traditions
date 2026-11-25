import { Bot, User } from 'lucide-react';
import type { PublicPorridgePlayer } from '../engine/types';

interface PlayerStatusProps {
  players: PublicPorridgePlayer[];
  winnerIds: string[];
  isGameOver: boolean;
  recentCollectorId?: string | null;
  recentCollectedCount?: number;
}

export function PlayerStatus({
  players,
  winnerIds,
  isGameOver,
  recentCollectorId = null,
  recentCollectedCount = 0,
}: PlayerStatusProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2.5 lg:grid-cols-4"
      aria-label="Players and collected card counts"
    >
      {players.map((player) => {
        const isWinner = winnerIds.includes(player.id);
        const justCollected =
          recentCollectorId === player.id && recentCollectedCount > 0;

        return (
          <div
            key={player.id}
            className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-xs transition-colors sm:px-3.5 sm:text-sm ${
              isWinner
                ? 'border-[#7C2D36] bg-[#FAF7F2] ring-2 ring-[#7C2D36]/40'
                : justCollected
                  ? 'border-[#8A5A19] bg-[#FBF4E7] ring-2 ring-[#8A5A19]/40'
                  : player.isCurrentTurn
                    ? 'border-[#7C2D36] bg-[#FAF7F2] ring-1 ring-[#7C2D36]/35'
                    : 'border-[#DDD4C7] bg-[#FAF7F2]/75'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {player.type === 'bot' ? (
                  <Bot className="h-3.5 w-3.5 shrink-0 text-[#6E4411]" aria-hidden="true" />
                ) : (
                  <User className="h-3.5 w-3.5 shrink-0 text-[#7C2D36]" aria-hidden="true" />
                )}
                <p className="truncate font-medium text-[#1E1A18]">{player.name}</p>
              </div>
              <p className="mt-0.5 text-[11px] text-[#6B6059] tabular-nums sm:text-xs">
                Turn #{player.turnOrder} ·{' '}
                {isWinner
                  ? 'Winner'
                  : justCollected
                    ? `+${recentCollectedCount} collected`
                    : player.isCurrentTurn
                      ? 'Active turn'
                      : isGameOver
                        ? 'Finished'
                        : player.type === 'bot'
                          ? 'Bot'
                          : 'Human'}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="block font-mono text-sm font-semibold text-[#1E1A18] tabular-nums">
                {player.cardsCollected}
              </span>
              <span className="block text-[10px] text-[#6B6059]">
                {player.cardsCollected === 1 ? 'card' : 'cards'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
