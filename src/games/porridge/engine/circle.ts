import type { StandardCard } from '../../../types/playingCard';
import type { CircleCardSlot } from './types';

/**
 * Places all 52 deck cards face down into stable, individually identifiable circle positions.
 */
export function createCircle(deck: readonly StandardCard[]): CircleCardSlot[] {
  return deck.map((card, index) => ({
    positionId: `pos-${String(index + 1).padStart(2, '0')}`,
    positionIndex: index,
    card,
    status: 'face-down',
  }));
}

/**
 * Returns only remaining face-down slots available for selection.
 */
export function getAvailableCircleSlots(
  circle: readonly CircleCardSlot[]
): CircleCardSlot[] {
  return circle.filter((slot) => slot.status === 'face-down');
}
