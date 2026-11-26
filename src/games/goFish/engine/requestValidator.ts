import type { CardRank } from '../../../types/playingCard';
import type { GoFishGameState, ValidationResult } from './types';

export function validateRequest(
  state: GoFishGameState,
  playerId: string,
  opponentId: string,
  rank: CardRank
): ValidationResult {
  if (state.status !== 'PLAYING') {
    return { valid: false, error: 'The game has already ended.' };
  }
  if (state.awaitingPassConfirmation || state.phase === 'passing-device') {
    return {
      valid: false,
      error: 'Confirm Ready on the pass-device screen before asking.',
    };
  }
  if (state.pendingTurnAdvance || state.phase === 'reveal-pause') {
    return {
      valid: false,
      error: 'Confirm the previous draw result before making another request.',
    };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { valid: false, error: 'It is not this player’s turn.' };
  }
  if (currentPlayer.hand.length === 0) {
    return {
      valid: false,
      error: 'You have no cards in hand to ask for a rank.',
    };
  }

  if (playerId === opponentId) {
    return { valid: false, error: 'You cannot ask yourself for cards.' };
  }

  const opponent = state.players.find((p) => p.id === opponentId);
  if (!opponent) {
    return { valid: false, error: 'Selected opponent was not found.' };
  }
  if (opponent.hand.length === 0 || opponent.isInactiveForAsking) {
    return {
      valid: false,
      error: `${opponent.name} currently has no cards to give.`,
    };
  }

  const holdsRank = currentPlayer.hand.some((card) => card.rank === rank);
  if (!holdsRank) {
    return {
      valid: false,
      error: 'You may only ask for a rank you already hold in your hand.',
    };
  }

  return { valid: true };
}
