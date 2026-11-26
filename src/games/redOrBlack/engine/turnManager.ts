import type { PlayDirection } from '../../../types/multiplayer';

export function stepPlayerIndex(
  currentIndex: number,
  direction: PlayDirection,
  playerCount: number
): number {
  const delta = direction === 'clockwise' ? 1 : -1;
  return (currentIndex + delta + playerCount) % playerCount;
}

export function oppositeDirection(direction: PlayDirection): PlayDirection {
  return direction === 'clockwise' ? 'anticlockwise' : 'clockwise';
}

export interface RoleAssignment {
  askerIndex: number;
  answererIndex: number;
}

export function getInitialRoles(
  direction: PlayDirection,
  playerCount: number
): RoleAssignment {
  const answererIndex = 0;
  const askerIndex = stepPlayerIndex(
    answererIndex,
    oppositeDirection(direction),
    playerCount
  );
  return { askerIndex, answererIndex };
}

export function rotateFourQuestionsTurn(
  currentAnswererIndex: number,
  direction: PlayDirection,
  playerCount: number
): RoleAssignment {
  const nextAnswererIndex = stepPlayerIndex(
    currentAnswererIndex,
    direction,
    playerCount
  );
  const nextAskerIndex = stepPlayerIndex(
    nextAnswererIndex,
    oppositeDirection(direction),
    playerCount
  );
  return {
    askerIndex: nextAskerIndex,
    answererIndex: nextAnswererIndex,
  };
}

export function rotateCardCollectionTurn(
  currentAskerIndex: number,
  direction: PlayDirection,
  playerCount: number
): RoleAssignment {
  const nextAskerIndex = stepPlayerIndex(
    currentAskerIndex,
    direction,
    playerCount
  );
  const nextAnswererIndex = stepPlayerIndex(
    nextAskerIndex,
    direction,
    playerCount
  );
  return {
    askerIndex: nextAskerIndex,
    answererIndex: nextAnswererIndex,
  };
}
