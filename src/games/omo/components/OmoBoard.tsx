import type { OmoCellCoord, OmoPublicView } from '../engine/types';

interface OmoBoardProps {
  view: OmoPublicView;
  selectedCell: OmoCellCoord | null;
  interactive: boolean;
  onSelectCell: (coord: OmoCellCoord) => void;
}

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function OmoBoard({
  view,
  selectedCell,
  interactive,
  onSelectCell,
}: OmoBoardProps) {
  const newComboCellKeys = new Set<string>();
  for (const combo of view.lastNewCombinations) {
    for (const c of combo.cells) {
      newComboCellKeys.add(cellKey(c.row, c.col));
    }
  }

  const olderComboCellKeys = new Set<string>();
  const newIds = new Set(view.lastNewCombinations.map((c) => c.id));
  for (const combo of view.scoredCombinations) {
    if (newIds.has(combo.id)) continue;
    for (const c of combo.cells) {
      olderComboCellKeys.add(cellKey(c.row, c.col));
    }
  }

  const lastPlacedKey = view.lastPlacement
    ? cellKey(view.lastPlacement.row, view.lastPlacement.col)
    : null;

  // Comfortable cell sizing >= 44px on all screens; slightly larger for smaller grids
  const cellSizePx =
    view.cols <= 5 && view.rows <= 5
      ? 54
      : view.cols <= 7 && view.rows <= 7
        ? 48
        : 44;

  const gapPx = 5;
  const totalWidth = view.cols * cellSizePx + (view.cols - 1) * gapPx;
  const totalHeight = view.rows * cellSizePx + (view.rows - 1) * gapPx;

  return (
    <div className="rounded-lg border border-[#DDD4C7] bg-[#F4EFE7] p-2.5 sm:p-4">
      <div className="overflow-auto">
        <div
          className="relative mx-auto"
          style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
        >
          {/* SVG connector lines for newly scored OMOs */}
          {view.lastNewCombinations.length > 0 && (
            <svg
              aria-hidden="true"
              width={totalWidth}
              height={totalHeight}
              viewBox={`0 0 ${totalWidth} ${totalHeight}`}
              className="pointer-events-none absolute inset-0 z-10"
            >
              {view.lastNewCombinations.map((combo) => {
                const start = combo.cells[0];
                const end = combo.cells[2];
                const x1 =
                  start.col * (cellSizePx + gapPx) + cellSizePx / 2;
                const y1 =
                  start.row * (cellSizePx + gapPx) + cellSizePx / 2;
                const x2 =
                  end.col * (cellSizePx + gapPx) + cellSizePx / 2;
                const y2 =
                  end.row * (cellSizePx + gapPx) + cellSizePx / 2;

                return (
                  <line
                    key={combo.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#7C2D36"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeOpacity={0.45}
                  />
                );
              })}
            </svg>
          )}

          <div
            role="grid"
            aria-label={`${view.rows} by ${view.cols} OMO board`}
            className="relative z-0 grid"
            style={{
              gridTemplateColumns: `repeat(${view.cols}, ${cellSizePx}px)`,
              gap: `${gapPx}px`,
            }}
          >
            {view.board.map((rowCells, rowIdx) =>
              rowCells.map((value, colIdx) => {
                const key = cellKey(rowIdx, colIdx);
                const isSelected =
                  selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                const isNewComboCell = newComboCellKeys.has(key);
                const isOlderComboCell = olderComboCellKeys.has(key);
                const isLastPlaced = lastPlacedKey === key;
                const isEmpty = value === null;
                const canClick = interactive && isEmpty;

                let cellStyle =
                  'border-[#CFC4B4] bg-[#FAF7F2] text-[#1E1A18] hover:border-[#7C2D36] hover:bg-[#EFE8DC]/70';
                if (!isEmpty) {
                  if (isNewComboCell) {
                    cellStyle =
                      'border-[#7C2D36] bg-[#F7E6E8] text-[#7C2D36] ring-2 ring-[#7C2D36]/55';
                  } else if (isOlderComboCell) {
                    cellStyle =
                      'border-[#C8B08A] bg-[#EFE5D2] text-[#1E1A18]';
                  } else {
                    cellStyle =
                      'border-[#D5C9B8] bg-[#FAF7F2] text-[#1E1A18]';
                  }
                } else if (isSelected) {
                  cellStyle =
                    'border-2 border-[#7C2D36] bg-[#FAF7F2] ring-2 ring-[#7C2D36]/40';
                } else if (!interactive) {
                  cellStyle = 'border-[#DDD4C7] bg-[#FAF7F2]/80 text-[#6B6059]';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    disabled={!canClick}
                    onClick={() => canClick && onSelectCell({ row: rowIdx, col: colIdx })}
                    aria-label={`Row ${rowIdx + 1}, Column ${colIdx + 1}: ${
                      value ? value : isSelected ? 'selected empty cell' : 'empty'
                    }${isNewComboCell ? ', newly scored OMO' : ''}`}
                    aria-selected={isSelected}
                    className={`relative flex items-center justify-center rounded-md border font-serif text-xl font-bold transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C2D36] ${cellStyle} ${
                      canClick ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    style={{
                      width: `${cellSizePx}px`,
                      height: `${cellSizePx}px`,
                    }}
                  >
                    {value ? (
                      <span
                        className={
                          value === 'O' ? 'text-[#7C2D36]' : 'text-[#1E1A18]'
                        }
                      >
                        {value}
                      </span>
                    ) : isSelected ? (
                      <span className="font-mono text-xs font-semibold text-[#7C2D36]">
                        ?
                      </span>
                    ) : null}

                    {/* Marker distinguishing the most recent placement */}
                    {isLastPlaced && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#1E1A18]"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-[#524943]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-[#7C2D36] bg-[#F7E6E8]" />
          <span>Newly scored OMO</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-[#C8B08A] bg-[#EFE5D2]" />
          <span>Previously scored (reusable)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-[#C6B8A6] bg-[#FAF7F2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E1A18]" />
          </span>
          <span>Latest placement</span>
        </span>
      </div>
    </div>
  );
}
