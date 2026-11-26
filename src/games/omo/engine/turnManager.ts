import type { PlayDirection } from '../../../types/multiplayer';
import type { OmoGameState } from './types';

export function getNextPlayerIndex(
  currentIndex: number,
  playerCount: number,
  direction: PlayDirection
): number {
  const step = direction === 'clockwise' ? 1 : -1;
  return (currentIndex + step + playerCount) % playerCount;
}

export function shouldRequirePassHandover(
  state: Pick<OmoGameState, 'mode' | 'players'>,
  previousHumanId: string | null,
  nextPlayerIndex: number
): boolean {
  const humanCount = state.players.filter((p) => p.type === 'human').length;
  if (humanCount < 2) return false;
  if (state.mode !== 'pass-and-play' && state.mode !== 'mixed') {
    return false;
  }

  const nextPlayer = state.players[nextPlayerIndex];
  if (!nextPlayer || nextPlayer.type !== 'human') {
    return false;
  }

  if (!previousHumanId) return false;
  return previousHumanId !== nextPlayer.id;
}
