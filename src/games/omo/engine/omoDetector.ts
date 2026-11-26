import type {
  OmoAxisDirection,
  OmoCellCoord,
  OmoCellValue,
  OmoCombination,
  OmoCombinationId,
  OmoLetter,
} from './types';

interface AxisSpec {
  direction: OmoAxisDirection;
  dr: number;
  dc: number;
}

export const OMO_AXES: readonly AxisSpec[] = [
  { direction: 'horizontal', dr: 0, dc: 1 },
  { direction: 'vertical', dr: 1, dc: 0 },
  { direction: 'diagonal-down-right', dr: 1, dc: 1 },
  { direction: 'diagonal-down-left', dr: 1, dc: -1 },
];

/**
 * Produces a canonical unique ID for a 3-cell OMO combination regardless of
 * whether it is read forward or in reverse along the axis.
 */
export function buildOmoCombinationId(
  first: OmoCellCoord,
  third: OmoCellCoord
): OmoCombinationId {
  const firstComesEarlier =
    first.row < third.row ||
    (first.row === third.row && first.col <= third.col);

  const a = firstComesEarlier ? first : third;
  const b = firstComesEarlier ? third : first;
  return `${a.row},${a.col}-${b.row},${b.col}`;
}

function getCell(
  board: readonly (readonly OmoCellValue[])[],
  row: number,
  col: number
): OmoCellValue | undefined {
  if (row < 0 || row >= board.length) return undefined;
  const rowCells = board[row];
  if (!rowCells || col < 0 || col >= rowCells.length) return undefined;
  return rowCells[col];
}

function normalizeTriplet(
  a: OmoCellCoord,
  mid: OmoCellCoord,
  b: OmoCellCoord
): [OmoCellCoord, OmoCellCoord, OmoCellCoord] {
  const aFirst =
    a.row < b.row || (a.row === b.row && a.col <= b.col);
  return aFirst ? [a, mid, b] : [b, mid, a];
}

/**
 * Inspects only the four straight-line axes intersecting (row, col) to find
 * all newly completed, previously unscored OMO combinations.
 */
export function detectNewOmosAtPlacement(
  board: readonly (readonly OmoCellValue[])[],
  row: number,
  col: number,
  existingScoredIds: ReadonlySet<OmoCombinationId>,
  playerId: string,
  turnNumber: number
): OmoCombination[] {
  const placed = getCell(board, row, col);
  if (placed !== 'O' && placed !== 'M') {
    return [];
  }

  const results: OmoCombination[] = [];
  const seenInMove = new Set<OmoCombinationId>();

  if (placed === 'M') {
    // Placed M must be the centre of O - M - O along one of the 4 axes
    for (const axis of OMO_AXES) {
      const r1 = row - axis.dr;
      const c1 = col - axis.dc;
      const r3 = row + axis.dr;
      const c3 = col + axis.dc;

      if (getCell(board, r1, c1) === 'O' && getCell(board, r3, c3) === 'O') {
        const coord1 = { row: r1, col: c1 };
        const coord2 = { row, col };
        const coord3 = { row: r3, col: c3 };
        const id = buildOmoCombinationId(coord1, coord3);
        if (!existingScoredIds.has(id) && !seenInMove.has(id)) {
          seenInMove.add(id);
          results.push({
            id,
            cells: normalizeTriplet(coord1, coord2, coord3),
            direction: axis.direction,
            scoredByPlayerId: playerId,
            turnScored: turnNumber,
          });
        }
      }
    }
    return results;
  }

  // Placed O can be either end of O - M - O in either direction along each axis
  for (const axis of OMO_AXES) {
    for (const sign of [1, -1] as const) {
      const dr = axis.dr * sign;
      const dc = axis.dc * sign;

      const rMid = row + dr;
      const cMid = col + dc;
      const rEnd = row + dr * 2;
      const cEnd = col + dc * 2;

      if (
        getCell(board, rMid, cMid) === 'M' &&
        getCell(board, rEnd, cEnd) === 'O'
      ) {
        const coordStart = { row, col };
        const coordMid = { row: rMid, col: cMid };
        const coordEnd = { row: rEnd, col: cEnd };
        const id = buildOmoCombinationId(coordStart, coordEnd);
        if (!existingScoredIds.has(id) && !seenInMove.has(id)) {
          seenInMove.add(id);
          results.push({
            id,
            cells: normalizeTriplet(coordStart, coordMid, coordEnd),
            direction: axis.direction,
            scoredByPlayerId: playerId,
            turnScored: turnNumber,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Fast, allocation-minimal helper used by AI heuristics to count how many new OMOs
 * placing `letter` at (row, col) would complete without mutating or cloning the board.
 */
export function countNewOmosForCandidate(
  board: readonly (readonly OmoCellValue[])[],
  row: number,
  col: number,
  letter: OmoLetter,
  existingScoredIds: ReadonlySet<OmoCombinationId>
): number {
  if (getCell(board, row, col) !== null) return 0;

  let count = 0;
  const seen = new Set<OmoCombinationId>();

  if (letter === 'M') {
    for (const axis of OMO_AXES) {
      const r1 = row - axis.dr;
      const c1 = col - axis.dc;
      const r3 = row + axis.dr;
      const c3 = col + axis.dc;
      if (getCell(board, r1, c1) === 'O' && getCell(board, r3, c3) === 'O') {
        const id = buildOmoCombinationId({ row: r1, col: c1 }, { row: r3, col: c3 });
        if (!existingScoredIds.has(id) && !seen.has(id)) {
          seen.add(id);
          count += 1;
        }
      }
    }
    return count;
  }

  for (const axis of OMO_AXES) {
    for (const sign of [1, -1] as const) {
      const dr = axis.dr * sign;
      const dc = axis.dc * sign;
      const rMid = row + dr;
      const cMid = col + dc;
      const rEnd = row + dr * 2;
      const cEnd = col + dc * 2;
      if (getCell(board, rMid, cMid) === 'M' && getCell(board, rEnd, cEnd) === 'O') {
        const id = buildOmoCombinationId({ row, col }, { row: rEnd, col: cEnd });
        if (!existingScoredIds.has(id) && !seen.has(id)) {
          seen.add(id);
          count += 1;
        }
      }
    }
  }

  return count;
}
