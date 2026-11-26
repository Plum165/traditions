import type { BotDifficulty } from '../../../types/multiplayer';
import { cloneBoard, getEmptyCells } from './gridManager';
import {
  OMO_AXES,
  buildOmoCombinationId,
  countNewOmosForCandidate,
  detectNewOmosAtPlacement,
} from './omoDetector';
import type {
  OmoCellCoord,
  OmoCellValue,
  OmoCombinationId,
  OmoGameState,
  OmoLetter,
} from './types';

export interface OmoBotMove {
  row: number;
  col: number;
  letter: OmoLetter;
  reason: string;
}

const LETTERS: readonly OmoLetter[] = ['O', 'M'];

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

export function findImmediateScoringMoves(
  board: readonly (readonly OmoCellValue[])[],
  scoredIds: ReadonlySet<OmoCombinationId>
): Array<{ row: number; col: number; letter: OmoLetter; count: number }> {
  const emptyCells = getEmptyCells(board);
  const scoringMoves: Array<{
    row: number;
    col: number;
    letter: OmoLetter;
    count: number;
  }> = [];

  for (const { row, col } of emptyCells) {
    for (const letter of LETTERS) {
      const count = countNewOmosForCandidate(board, row, col, letter, scoredIds);
      if (count > 0) {
        scoringMoves.push({ row, col, letter, count });
      }
    }
  }

  return scoringMoves;
}

interface PatternImpact {
  immediateOmos: number;
  createdThreats: number;
  blockedThreats: number;
  openSetups: number;
}

/**
 * Evaluates a candidate placement's immediate scoring, whether it creates
 * 1-move OMO threats for the next player, whether it blocks existing 1-move threats,
 * and how many reusable multi-directional setups it forms.
 */
function analyzeCandidateMove(
  board: OmoCellValue[][],
  row: number,
  col: number,
  letter: OmoLetter,
  scoredIds: ReadonlySet<OmoCombinationId>
): PatternImpact {
  const immediateOmos = countNewOmosForCandidate(
    board,
    row,
    col,
    letter,
    scoredIds
  );

  // Check if the OTHER letter at (row, col) would have scored right now
  // (meaning placing `letter` here occupies a critical cell—still check it doesn't open another)
  const otherLetter: OmoLetter = letter === 'O' ? 'M' : 'O';
  const blockedThreats = countNewOmosForCandidate(
    board,
    row,
    col,
    otherLetter,
    scoredIds
  );

  // Temporarily place `letter` to inspect newly exposed 1-move threats & setups
  board[row][col] = letter;

  let createdThreats = 0;
  let openSetups = 0;

  for (const axis of OMO_AXES) {
    if (letter === 'M') {
      // M at centre: check (-1, +1) pair along axis
      const a = getCell(board, row - axis.dr, col - axis.dc);
      const b = getCell(board, row + axis.dr, col + axis.dc);
      if ((a === 'O' && b === null) || (a === null && b === 'O')) {
        createdThreats += 1;
      } else if (a === null && b === null) {
        openSetups += 1;
      }
    } else {
      // O at either end: check both directions (+1,+2) and (-1,-2)
      for (const sign of [1, -1] as const) {
        const dr = axis.dr * sign;
        const dc = axis.dc * sign;
        const mid = getCell(board, row + dr, col + dc);
        const far = getCell(board, row + dr * 2, col + dc * 2);

        if ((mid === 'M' && far === null) || (mid === null && far === 'O')) {
          createdThreats += 1;
        } else if (mid === null && far === null) {
          openSetups += 1;
        }
      }
    }
  }

  board[row][col] = null;

  return {
    immediateOmos,
    createdThreats,
    blockedThreats,
    openSetups,
  };
}

function centerBias(
  row: number,
  col: number,
  rows: number,
  cols: number
): number {
  const midR = (rows - 1) / 2;
  const midC = (cols - 1) / 2;
  const maxDist = Math.max(1, midR + midC);
  const dist = Math.abs(row - midR) + Math.abs(col - midC);
  return (1 - dist / maxDist) * 2;
}

function chooseEasyBotMove(
  board: readonly (readonly OmoCellValue[])[],
  scoredIds: ReadonlySet<OmoCombinationId>,
  rng: () => number
): OmoBotMove {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return { row: 0, col: 0, letter: 'O', reason: 'No empty cells available.' };
  }

  // 30% chance to grab an immediate OMO opportunity if one exists
  if (rng() < 0.3) {
    const scoringMoves = findImmediateScoringMoves(board, scoredIds);
    if (scoringMoves.length > 0) {
      const picked = scoringMoves[Math.floor(rng() * scoringMoves.length)];
      return {
        row: picked.row,
        col: picked.col,
        letter: picked.letter,
        reason: 'Spotted an immediate OMO opportunity.',
      };
    }
  }

  // 70% random legal move
  const cell = emptyCells[Math.floor(rng() * emptyCells.length)];
  const letter: OmoLetter = rng() < 0.5 ? 'O' : 'M';
  return {
    row: cell.row,
    col: cell.col,
    letter,
    reason: 'Placed a letter at random.',
  };
}

function chooseNormalBotMove(
  board: readonly (readonly OmoCellValue[])[],
  scoredIds: ReadonlySet<OmoCombinationId>,
  rng: () => number
): OmoBotMove {
  const scratch = cloneBoard(board);
  const emptyCells = getEmptyCells(scratch);
  const rows = scratch.length;
  const cols = scratch[0]?.length ?? 0;

  let bestScore = -Infinity;
  let bestCandidates: Array<{
    row: number;
    col: number;
    letter: OmoLetter;
    impact: PatternImpact;
  }> = [];

  for (const { row, col } of emptyCells) {
    for (const letter of LETTERS) {
      const impact = analyzeCandidateMove(scratch, row, col, letter, scoredIds);
      let score = 0;

      if (impact.immediateOmos > 0) {
        score += 100 + (impact.immediateOmos - 1) * 35;
        score += impact.openSetups * 4;
      } else {
        score += impact.blockedThreats * 25;
        score -= impact.createdThreats * 45;
        score += Math.min(3, impact.openSetups) * 6;
        score += centerBias(row, col, rows, cols);
      }

      if (score > bestScore + 1e-6) {
        bestScore = score;
        bestCandidates = [{ row, col, letter, impact }];
      } else if (Math.abs(score - bestScore) <= 1e-6) {
        bestCandidates.push({ row, col, letter, impact });
      }
    }
  }

  const chosen = bestCandidates[Math.floor(rng() * bestCandidates.length)];
  let reason = 'Developed board control safely.';
  if (chosen.impact.immediateOmos > 1) {
    reason = `Completed ${chosen.impact.immediateOmos} OMOs in one placement.`;
  } else if (chosen.impact.immediateOmos === 1) {
    reason = 'Completed an immediate OMO for a point and bonus turn.';
  } else if (chosen.impact.blockedThreats > 0) {
    reason = 'Blocked an immediate opponent OMO threat.';
  }

  return {
    row: chosen.row,
    col: chosen.col,
    letter: chosen.letter,
    reason,
  };
}

interface CandidateEval {
  row: number;
  col: number;
  letter: OmoLetter;
  heuristic: number;
  immediateOmos: number;
}

function rankCandidatesForSearch(
  board: OmoCellValue[][],
  scoredIds: ReadonlySet<OmoCombinationId>,
  maxCandidates: number
): CandidateEval[] {
  const emptyCells = getEmptyCells(board);
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const all: CandidateEval[] = [];

  for (const { row, col } of emptyCells) {
    for (const letter of LETTERS) {
      const impact = analyzeCandidateMove(board, row, col, letter, scoredIds);
      let heuristic = 0;
      if (impact.immediateOmos > 0) {
        heuristic +=
          120 * impact.immediateOmos +
          impact.openSetups * 6 -
          impact.createdThreats * 8;
      } else {
        heuristic +=
          impact.blockedThreats * 28 -
          impact.createdThreats * 50 +
          Math.min(4, impact.openSetups) * 6 +
          centerBias(row, col, rows, cols);
      }
      all.push({
        row,
        col,
        letter,
        heuristic,
        immediateOmos: impact.immediateOmos,
      });
    }
  }

  all.sort((a, b) => b.heuristic - a.heuristic);

  // Always preserve all immediate scoring moves plus top strategic moves up to maxCandidates
  const scoring = all.filter((c) => c.immediateOmos > 0);
  const nonScoring = all.filter((c) => c.immediateOmos === 0);
  const combined = [...scoring];
  for (const item of nonScoring) {
    if (combined.length >= maxCandidates) break;
    combined.push(item);
  }
  return combined.length > 0 ? combined : all.slice(0, maxCandidates);
}

/**
 * Counts how many total distinct 1-move OMO opportunities currently exist on the board.
 */
function countBoardImmediateThreats(
  board: OmoCellValue[][],
  scoredIds: ReadonlySet<OmoCombinationId>
): number {
  let threats = 0;
  const empty = getEmptyCells(board);
  for (const { row, col } of empty) {
    threats += countNewOmosForCandidate(board, row, col, 'O', scoredIds);
    threats += countNewOmosForCandidate(board, row, col, 'M', scoredIds);
  }
  return threats;
}

/**
 * Bonus-turn-aware minimax with alpha-beta pruning.
 * Positive values favor the maximizing bot; negative values favor the next opponent.
 */
function searchBestValue(
  board: OmoCellValue[][],
  scoredIds: Set<OmoCombinationId>,
  emptyCount: number,
  depthRemaining: number,
  bonusChainRemaining: number,
  isMaximizingTurn: boolean,
  scoreDiff: number,
  alpha: number,
  beta: number,
  branchLimit: number
): number {
  if (emptyCount === 0 || (depthRemaining <= 0 && bonusChainRemaining <= 0)) {
    const nextPlayerThreats = countBoardImmediateThreats(board, scoredIds);
    // If the maximizing bot is about to act at leaf, immediate threats help it;
    // if an opponent is about to act at leaf, immediate threats hurt the bot.
    const threatAdjustment = isMaximizingTurn
      ? nextPlayerThreats * 0.45
      : -nextPlayerThreats * 0.85;
    return scoreDiff + threatAdjustment;
  }

  // During a forced bonus-chain cap extension, only inspect scoring moves
  const candidates = rankCandidatesForSearch(
    board,
    scoredIds,
    depthRemaining <= 0 ? 6 : branchLimit
  );
  const effectiveCandidates =
    depthRemaining <= 0
      ? candidates.filter((c) => c.immediateOmos > 0)
      : candidates;

  if (effectiveCandidates.length === 0) {
    const nextPlayerThreats = countBoardImmediateThreats(board, scoredIds);
    const threatAdjustment = isMaximizingTurn
      ? nextPlayerThreats * 0.45
      : -nextPlayerThreats * 0.85;
    return scoreDiff + threatAdjustment;
  }

  let bestValue = isMaximizingTurn ? -Infinity : Infinity;
  let localAlpha = alpha;
  let localBeta = beta;

  for (const cand of effectiveCandidates) {
    board[cand.row][cand.col] = cand.letter;
    const newCombos = detectNewOmosAtPlacement(
      board,
      cand.row,
      cand.col,
      scoredIds,
      'sim',
      0
    );
    for (const combo of newCombos) {
      scoredIds.add(combo.id);
    }

    const points = newCombos.length;
    const nextScoreDiff = isMaximizingTurn
      ? scoreDiff + points
      : scoreDiff - points;

    let value: number;
    if (points > 0 && emptyCount - 1 > 0 && bonusChainRemaining > 0) {
      // Bonus turn: same player continues!
      value = searchBestValue(
        board,
        scoredIds,
        emptyCount - 1,
        depthRemaining,
        bonusChainRemaining - 1,
        isMaximizingTurn,
        nextScoreDiff,
        localAlpha,
        localBeta,
        Math.max(6, Math.floor(branchLimit * 0.75))
      );
    } else {
      // Turn passes to opponent
      value = searchBestValue(
        board,
        scoredIds,
        emptyCount - 1,
        depthRemaining - 1,
        2,
        !isMaximizingTurn,
        nextScoreDiff,
        localAlpha,
        localBeta,
        Math.max(6, Math.floor(branchLimit * 0.75))
      );
    }

    // Undo move
    for (const combo of newCombos) {
      scoredIds.delete(combo.id);
    }
    board[cand.row][cand.col] = null;

    if (isMaximizingTurn) {
      if (value > bestValue) bestValue = value;
      if (bestValue > localAlpha) localAlpha = bestValue;
      if (localBeta <= localAlpha) break;
    } else {
      if (value < bestValue) bestValue = value;
      if (bestValue < localBeta) localBeta = bestValue;
      if (localBeta <= localAlpha) break;
    }
  }

  return bestValue;
}

function chooseHardBotMove(
  board: readonly (readonly OmoCellValue[])[],
  existingScoredIds: ReadonlySet<OmoCombinationId>,
  rng: () => number
): OmoBotMove {
  const scratch = cloneBoard(board);
  const scoredIds = new Set<OmoCombinationId>(existingScoredIds);
  const emptyCount = getEmptyCells(scratch).length;

  if (emptyCount === 0) {
    return { row: 0, col: 0, letter: 'O', reason: 'No empty cells available.' };
  }

  // Adaptive search depth & candidate pruning so large boards respond instantaneously
  let searchDepth = 2;
  let branchLimit = 10;
  let bonusChainDepth = 2;

  if (emptyCount <= 18) {
    searchDepth = 3;
    branchLimit = 16;
    bonusChainDepth = 3;
  } else if (emptyCount <= 49) {
    searchDepth = 2;
    branchLimit = 14;
    bonusChainDepth = 2;
  }

  const rootCandidates = rankCandidatesForSearch(
    scratch,
    scoredIds,
    branchLimit
  );

  let bestEval = -Infinity;
  let bestMoves: CandidateEval[] = [];

  for (const cand of rootCandidates) {
    scratch[cand.row][cand.col] = cand.letter;
    const newCombos = detectNewOmosAtPlacement(
      scratch,
      cand.row,
      cand.col,
      scoredIds,
      'sim',
      0
    );
    for (const combo of newCombos) {
      scoredIds.add(combo.id);
    }

    const points = newCombos.length;
    let value: number;
    if (points > 0 && emptyCount - 1 > 0) {
      value = searchBestValue(
        scratch,
        scoredIds,
        emptyCount - 1,
        searchDepth - 1,
        bonusChainDepth,
        true,
        points,
        -Infinity,
        Infinity,
        branchLimit
      );
    } else {
      value = searchBestValue(
        scratch,
        scoredIds,
        emptyCount - 1,
        searchDepth - 1,
        2,
        false,
        points,
        -Infinity,
        Infinity,
        branchLimit
      );
    }

    for (const combo of newCombos) {
      scoredIds.delete(combo.id);
    }
    scratch[cand.row][cand.col] = null;

    // Tiny deterministic heuristic tie-break scaled well below 1 point
    const tieAdjustedValue = value + cand.heuristic * 0.0005;

    if (tieAdjustedValue > bestEval + 1e-6) {
      bestEval = tieAdjustedValue;
      bestMoves = [cand];
    } else if (Math.abs(tieAdjustedValue - bestEval) <= 1e-6) {
      bestMoves.push(cand);
    }
  }

  const chosen = bestMoves[Math.floor(rng() * bestMoves.length)];
  let reason = 'Selected optimal strategic placement after lookahead analysis.';
  if (chosen.immediateOmos > 1) {
    reason = `Chained ${chosen.immediateOmos} OMOs with lookahead advantage.`;
  } else if (chosen.immediateOmos === 1) {
    reason = 'Scored an OMO and retained initiative with a bonus turn.';
  }

  return {
    row: chosen.row,
    col: chosen.col,
    letter: chosen.letter,
    reason,
  };
}

export function chooseOmoBotMove(
  state: OmoGameState,
  difficulty: BotDifficulty,
  rng: () => number = Math.random
): OmoBotMove {
  const scoredSet = new Set<OmoCombinationId>(state.scoredCombinationIds);

  if (difficulty === 'easy') {
    return chooseEasyBotMove(state.board, scoredSet, rng);
  }
  if (difficulty === 'normal') {
    return chooseNormalBotMove(state.board, scoredSet, rng);
  }
  return chooseHardBotMove(state.board, scoredSet, rng);
}

// Re-export helper for testing/inspection if needed
export { buildOmoCombinationId };
export type { OmoCellCoord };
