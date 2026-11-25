import { getAvailableCircleSlots } from './circle';
import type { CircleCardSlot, PorridgeGameState } from './types';

/**
 * Selects a remaining face-down circle position uniformly at random.
 * Never inspects hidden card ranks or suits.
 */
export function selectRandomCardForBot(
  state: PorridgeGameState,
  rng: () => number = Math.random
): Pick<CircleCardSlot, 'positionId' | 'positionIndex'> | null {
  if (state.status !== 'PLAYING') {
    return null;
  }

  const available = getAvailableCircleSlots(state.circle);
  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * available.length);
  const chosen = available[index];
  return {
    positionId: chosen.positionId,
    positionIndex: chosen.positionIndex,
  };
}
