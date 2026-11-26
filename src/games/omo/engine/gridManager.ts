import type {
  OmoCellCoord,
  OmoCellValue,
  OmoDeviceTier,
  OmoGridDimensions,
  OmoResponsiveGridLimits,
} from './types';

export const MIN_OMO_GRID_SIZE = 3;
export const ABSOLUTE_MAX_OMO_GRID_SIZE = 20;

export interface OmoGridPreset {
  id: string;
  label: string;
  description: string;
  rows: number;
  cols: number;
}

export const OMO_GRID_PRESETS: readonly OmoGridPreset[] = [
  { id: 'small', label: '5 × 5', description: 'Small', rows: 5, cols: 5 },
  { id: 'medium', label: '7 × 7', description: 'Medium', rows: 7, cols: 7 },
  { id: 'large', label: '9 × 9', description: 'Large', rows: 9, cols: 9 },
  { id: 'xlarge', label: '11 × 11', description: 'Extra Large', rows: 11, cols: 11 },
];

export function clampGridDimension(
  value: number,
  min: number,
  max: number
): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Computes responsive grid dimension limits using both viewport width and
 * usable height so touch targets and performance remain comfortable on every device.
 */
export function getResponsiveGridLimits(
  viewportWidth: number,
  viewportHeight: number
): OmoResponsiveGridLimits {
  const safeWidth = Math.max(320, Math.round(viewportWidth || 1024));
  const safeHeight = Math.max(480, Math.round(viewportHeight || 768));

  let tier: OmoDeviceTier = 'desktop';
  if (safeWidth < 640 || safeHeight < 580) {
    tier = 'mobile';
  } else if (safeWidth < 1024) {
    tier = 'tablet';
  }

  if (tier === 'mobile') {
    const minCellSizePx = 44;
    // Allow modest scrolling for larger mobile boards while capping at comfortable phone limits
    const widthCap = safeWidth < 375 ? 7 : 8;
    const heightCap = safeHeight < 660 ? 7 : 9;
    return {
      tier,
      minRows: MIN_OMO_GRID_SIZE,
      minCols: MIN_OMO_GRID_SIZE,
      maxRows: Math.max(5, Math.min(9, heightCap)),
      maxCols: Math.max(5, Math.min(8, widthCap)),
      recommendedPreset: { rows: 5, cols: 5 },
      minCellSizePx,
    };
  }

  if (tier === 'tablet') {
    const minCellSizePx = 42;
    const widthCap = Math.floor((safeWidth - 96) / minCellSizePx);
    const heightCap = Math.floor((safeHeight - 220) / minCellSizePx);
    return {
      tier,
      minRows: MIN_OMO_GRID_SIZE,
      minCols: MIN_OMO_GRID_SIZE,
      maxRows: clampGridDimension(heightCap, 7, 11),
      maxCols: clampGridDimension(widthCap, 7, 11),
      recommendedPreset: { rows: 7, cols: 7 },
      minCellSizePx,
    };
  }

  const minCellSizePx = 40;
  const usableBoardWidth = Math.min(safeWidth - 360, 760);
  const usableBoardHeight = Math.max(440, safeHeight - 240);
  const widthCap = Math.floor(usableBoardWidth / minCellSizePx);
  const heightCap = Math.floor(usableBoardHeight / minCellSizePx);

  return {
    tier,
    minRows: MIN_OMO_GRID_SIZE,
    minCols: MIN_OMO_GRID_SIZE,
    maxRows: clampGridDimension(heightCap, 9, 14),
    maxCols: clampGridDimension(widthCap, 9, 14),
    recommendedPreset: { rows: 7, cols: 7 },
    minCellSizePx,
  };
}

export interface GridValidationResult {
  valid: boolean;
  error?: string;
}

export function validateGridDimensions(
  rows: number,
  cols: number,
  limits?: OmoResponsiveGridLimits
): GridValidationResult {
  if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
    return { valid: false, error: 'Grid rows and columns must be whole numbers.' };
  }

  const minRows = limits?.minRows ?? MIN_OMO_GRID_SIZE;
  const minCols = limits?.minCols ?? MIN_OMO_GRID_SIZE;
  const maxRows = limits?.maxRows ?? ABSOLUTE_MAX_OMO_GRID_SIZE;
  const maxCols = limits?.maxCols ?? ABSOLUTE_MAX_OMO_GRID_SIZE;

  if (rows < minRows || cols < minCols) {
    return {
      valid: false,
      error: `Grid must be at least ${minRows} × ${minCols} to allow OMO combinations.`,
    };
  }

  if (rows > maxRows || cols > maxCols) {
    return {
      valid: false,
      error: `Grid dimensions exceed this screen's maximum of ${maxRows} rows × ${maxCols} columns.`,
    };
  }

  return { valid: true };
}

export function createEmptyBoard(rows: number, cols: number): OmoCellValue[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
}

export function cloneBoard(board: readonly (readonly OmoCellValue[])[]): OmoCellValue[][] {
  return board.map((row) => [...row]);
}

export function isCellInBounds(
  board: readonly (readonly OmoCellValue[])[],
  row: number,
  col: number
): boolean {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < board.length &&
    col >= 0 &&
    col < (board[0]?.length ?? 0)
  );
}

export function getEmptyCells(
  board: readonly (readonly OmoCellValue[])[]
): OmoCellCoord[] {
  const empty: OmoCellCoord[] = [];
  for (let row = 0; row < board.length; row += 1) {
    const rowCells = board[row];
    for (let col = 0; col < rowCells.length; col += 1) {
      if (rowCells[col] === null) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

export function countEmptyCells(
  board: readonly (readonly OmoCellValue[])[]
): number {
  let count = 0;
  for (let row = 0; row < board.length; row += 1) {
    const rowCells = board[row];
    for (let col = 0; col < rowCells.length; col += 1) {
      if (rowCells[col] === null) {
        count += 1;
      }
    }
  }
  return count;
}
