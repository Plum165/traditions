export type MultiplayerGameMode = 'vs-bots' | 'pass-and-play' | 'mixed';

export type BotDifficulty = 'easy' | 'normal' | 'hard';

export type PlayDirection = 'clockwise' | 'anticlockwise';

export interface PlayerSeatConfig {
  id: string;
  type: 'human' | 'bot';
  name: string;
  difficulty: BotDifficulty;
}

export interface SeatValidationResult {
  valid: boolean;
  errors: string[];
  seatErrors: Record<number, string>;
}

export const BOT_DIFFICULTY_LABELS: Record<BotDifficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

export const BOT_DIFFICULTY_DESCRIPTIONS: Record<BotDifficulty, string> = {
  easy: 'Makes random predictions.',
  normal: 'Picks the highest baseline deck probability.',
  hard: 'Tracks every revealed card and updates remaining-deck odds.',
};

export function validateMultiplayerSeats(
  seats: readonly PlayerSeatConfig[]
): SeatValidationResult {
  const errors: string[] = [];
  const seatErrors: Record<number, string> = {};

  if (seats.length < 2 || seats.length > 4) {
    errors.push('Choose between 2 and 4 total players.');
  }

  const humanCount = seats.filter((s) => s.type === 'human').length;
  if (humanCount < 1) {
    errors.push('At least one human player must participate.');
  }

  const seenIds = new Set<string>();
  const seenNames = new Map<string, number>();

  seats.forEach((seat, idx) => {
    if (!seat.id || seenIds.has(seat.id)) {
      errors.push(`Seat ${idx + 1} is missing a unique internal ID.`);
    } else {
      seenIds.add(seat.id);
    }

    const trimmed = seat.name.trim();
    if (!trimmed) {
      seatErrors[idx] = 'Enter a player name.';
      errors.push(`Player ${idx + 1} needs a name before starting.`);
      return;
    }

    const normalized = trimmed.toLowerCase();
    if (seenNames.has(normalized)) {
      const firstIdx = seenNames.get(normalized)!;
      seatErrors[idx] = 'Use a unique name for each player.';
      if (!seatErrors[firstIdx]) {
        seatErrors[firstIdx] = 'Use a unique name for each player.';
      }
      errors.push(`Player names must be unique ("${trimmed}" is repeated).`);
    } else {
      seenNames.set(normalized, idx);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    seatErrors,
  };
}
