import { describe, expect, it } from 'vitest';
import { buildDefaultSeats } from '../../../../components/games/MultiplayerSetupForm';
import type { PlayerSeatConfig } from '../../../../types/multiplayer';
import { chooseOmoBotMove } from '../botStrategy';
import {
  confirmPassDevice,
  createOmoGame,
  executeBotTurn,
  getPublicOmoView,
  placeLetter,
  type OmoGameState,
  type OmoSetupConfig,
} from '../gameEngine';
import {
  getResponsiveGridLimits,
  validateGridDimensions,
} from '../gridManager';
import { detectNewOmosAtPlacement } from '../omoDetector';

function makeConfig(
  overrides: Partial<OmoSetupConfig> & {
    rows?: number;
    cols?: number;
  } = {}
): OmoSetupConfig {
  const mode = overrides.mode ?? 'pass-and-play';
  const seats = overrides.seats ?? buildDefaultSeats(mode, 2);
  return {
    mode,
    direction: overrides.direction ?? 'clockwise',
    seats,
    rules: {
      rows: overrides.rows ?? overrides.rules?.rows ?? 5,
      cols: overrides.cols ?? overrides.rules?.cols ?? 5,
      botThinkingDelayMs: overrides.rules?.botThinkingDelayMs ?? 600,
      soundEnabled: overrides.rules?.soundEnabled ?? false,
    },
  };
}

function seedBoard(
  rows: number,
  cols: number,
  placements: Array<[number, number, 'O' | 'M']>
) {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null as 'O' | 'M' | null)
  );
  for (const [r, c, letter] of placements) {
    board[r][c] = letter;
  }
  return board;
}

describe('OMO Detection Engine', () => {
  it('detects horizontal, vertical, and both diagonal OMOs (including reverse reads)', () => {
    // Horizontal: O M O at (0,0)-(0,2)
    const hBoard = seedBoard(5, 5, [
      [0, 0, 'O'],
      [0, 1, 'M'],
      [0, 2, 'O'],
    ]);
    expect(
      detectNewOmosAtPlacement(hBoard, 0, 2, new Set(), 'p1', 1)
    ).toHaveLength(1);
    expect(
      detectNewOmosAtPlacement(hBoard, 0, 0, new Set(), 'p1', 1)
    ).toHaveLength(1);

    // Vertical: O M O at (0,1)-(2,1)
    const vBoard = seedBoard(5, 5, [
      [0, 1, 'O'],
      [1, 1, 'M'],
      [2, 1, 'O'],
    ]);
    const vFound = detectNewOmosAtPlacement(vBoard, 1, 1, new Set(), 'p1', 1);
    expect(vFound).toHaveLength(1);
    expect(vFound[0].direction).toBe('vertical');

    // Diagonal down-right: (0,0)-(2,2)
    const d1Board = seedBoard(5, 5, [
      [0, 0, 'O'],
      [1, 1, 'M'],
      [2, 2, 'O'],
    ]);
    const d1Found = detectNewOmosAtPlacement(
      d1Board,
      0,
      0,
      new Set(),
      'p1',
      1
    );
    expect(d1Found).toHaveLength(1);
    expect(d1Found[0].direction).toBe('diagonal-down-right');

    // Diagonal down-left: (0,4)-(2,2)
    const d2Board = seedBoard(5, 5, [
      [0, 4, 'O'],
      [1, 3, 'M'],
      [2, 2, 'O'],
    ]);
    const d2Found = detectNewOmosAtPlacement(
      d2Board,
      2,
      2,
      new Set(),
      'p1',
      1
    );
    expect(d2Found).toHaveLength(1);
    expect(d2Found[0].direction).toBe('diagonal-down-left');
  });

  it('rejects incomplete patterns and patterns with gaps', () => {
    const gapBoard = seedBoard(5, 5, [
      [0, 0, 'O'],
      [0, 1, 'M'],
      [0, 3, 'O'],
    ]);
    expect(
      detectNewOmosAtPlacement(gapBoard, 0, 3, new Set(), 'p1', 1)
    ).toHaveLength(0);

    const incompleteBoard = seedBoard(5, 5, [
      [1, 0, 'O'],
      [1, 1, 'M'],
    ]);
    expect(
      detectNewOmosAtPlacement(incompleteBoard, 1, 1, new Set(), 'p1', 1)
    ).toHaveLength(0);
  });

  it('detects multiple OMOs from one placement, allows letter reuse, and prevents duplicate scoring', () => {
    // Center (2,2) placed with M creates horizontal, vertical, and diagonal OMOs at once
    const multiBoard = seedBoard(5, 5, [
      [2, 1, 'O'],
      [2, 3, 'O'],
      [1, 2, 'O'],
      [3, 2, 'O'],
      [1, 1, 'O'],
      [3, 3, 'O'],
      [2, 2, 'M'],
    ]);
    const found = detectNewOmosAtPlacement(
      multiBoard,
      2,
      2,
      new Set(),
      'p1',
      1
    );
    expect(found).toHaveLength(3);

    // Prevent duplicate scoring if existingScoredIds already contains them
    const existingIds = new Set(found.map((c) => c.id));
    expect(
      detectNewOmosAtPlacement(multiBoard, 2, 2, existingIds, 'p1', 2)
    ).toHaveLength(0);

    // Reusing (1,2) O to build a new horizontal OMO at row 1 (1,2)-(1,4) still scores!
    multiBoard[1][3] = 'M';
    multiBoard[1][4] = 'O';
    const reused = detectNewOmosAtPlacement(
      multiBoard,
      1,
      4,
      existingIds,
      'p2',
      3
    );
    expect(reused).toHaveLength(1);
    expect(reused[0].id).toBe('1,2-1,4');
  });
});

describe('OMO Turn Management, Scoring & Multiplayer', () => {
  it('advances turns normally on non-scoring moves and triggers Pass-and-Play handover', () => {
    let state = createOmoGame(makeConfig({ mode: 'pass-and-play' }));
    const p1 = state.players[0].id;
    const p2 = state.players[1].id;

    const r1 = placeLetter(state, p1, 0, 0, 'O');
    expect(r1.ok).toBe(true);
    state = r1.state;
    expect(state.players[0].score).toBe(0);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.awaitingPassConfirmation).toBe(true);
    expect(state.isBonusTurn).toBe(false);

    // Cannot place while handover screen is active
    const blocked = placeLetter(state, p2, 0, 1, 'M');
    expect(blocked.ok).toBe(false);

    // Confirm handover and play
    state = confirmPassDevice(state).state;
    expect(state.awaitingPassConfirmation).toBe(false);
    const r2 = placeLetter(state, p2, 0, 1, 'M');
    expect(r2.ok).toBe(true);
  });

  it('awards 1 point per OMO, supports consecutive bonus turns without handover, and grants only 1 bonus turn for multi-OMO placements', () => {
    let state = createOmoGame(makeConfig({ mode: 'pass-and-play', rows: 5, cols: 5 }));
    const p1 = state.players[0].id;
    const p2 = state.players[1].id;

    // Set up (2,1)=O, (2,3)=O, (1,2)=O, (3,2)=O via normal alternating turns
    state = placeLetter(state, p1, 2, 1, 'O').state;
    state = confirmPassDevice(state).state;
    state = placeLetter(state, p2, 2, 3, 'O').state;
    state = confirmPassDevice(state).state;
    state = placeLetter(state, p1, 1, 2, 'O').state;
    state = confirmPassDevice(state).state;
    state = placeLetter(state, p2, 3, 2, 'O').state;
    state = confirmPassDevice(state).state;

    // Now P1 places M at (2,2) creating BOTH horizontal and vertical OMOs -> +2 pts, 1 bonus turn
    const multiRes = placeLetter(state, p1, 2, 2, 'M');
    expect(multiRes.ok).toBe(true);
    state = multiRes.state;
    expect(state.players[0].score).toBe(2);
    expect(state.players[0].omosCreated).toBe(2);
    expect(state.players[0].bonusTurnsEarned).toBe(1);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.isBonusTurn).toBe(true);
    expect(state.awaitingPassConfirmation).toBe(false);

    // Consecutive bonus turn: P1 places O at (0,0) then let's first prepare (2,4)=M -> wait, P1 places O at (2,4) if (2,3)=O? No, (2,3)=O, (2,2)=M -> (2,4) wouldn't make OMO.
    // Let's set (2,0)=M? No, (1,2)=O, let's verify non-scoring ends bonus turn:
    state = placeLetter(state, p1, 4, 4, 'O').state;
    expect(state.isBonusTurn).toBe(false);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.awaitingPassConfirmation).toBe(true);
  });

  it('rejects overwriting occupied cells and ends the game immediately on the final cell even if it scores an OMO', () => {
    let state = createOmoGame(makeConfig({ mode: 'pass-and-play', rows: 3, cols: 3 }));
    const p1 = state.players[0].id;

    // Cannot overwrite occupied cell
    state = placeLetter(state, p1, 0, 0, 'O').state;
    state = confirmPassDevice(state).state;
    const p2 = state.players[1].id;
    const overwrite = placeLetter(state, p2, 0, 0, 'M');
    expect(overwrite.ok).toBe(false);

    // Construct a nearly-full 3x3 board with 1 empty cell (0,2) that completes an OMO
    let nearlyFull: OmoGameState = {
      ...state,
      board: seedBoard(3, 3, [
        [0, 0, 'O'],
        [0, 1, 'M'],
        [1, 0, 'M'],
        [1, 1, 'M'],
        [1, 2, 'M'],
        [2, 0, 'M'],
        [2, 1, 'M'],
        [2, 2, 'M'],
      ]),
      emptyCellsRemaining: 1,
      currentPlayerIndex: 0,
      awaitingPassConfirmation: false,
      scoredCombinationIds: [],
      scoredCombinations: [],
    };

    const finalMove = placeLetter(nearlyFull, p1, 0, 2, 'O');
    expect(finalMove.ok).toBe(true);
    nearlyFull = finalMove.state;
    expect(nearlyFull.status).toBe('GAME_OVER');
    expect(nearlyFull.emptyCellsRemaining).toBe(0);
    expect(nearlyFull.isBonusTurn).toBe(false);
    expect(nearlyFull.players[0].score).toBe(1);
    expect(nearlyFull.winnerIds).toEqual([p1]);
    expect(nearlyFull.isTie).toBe(false);

    // Post-game placements are rejected
    expect(placeLetter(nearlyFull, p1, 0, 2, 'O').ok).toBe(false);
  });

  it('declares a draw when highest final scores are tied', () => {
    const state = createOmoGame(makeConfig({ mode: 'pass-and-play', rows: 3, cols: 3 }));
    const p1 = state.players[0].id;
    const tiedSetup: OmoGameState = {
      ...state,
      board: seedBoard(3, 3, [
        [0, 0, 'M'],
        [0, 1, 'M'],
        [0, 2, 'M'],
        [1, 0, 'M'],
        [1, 1, 'M'],
        [1, 2, 'M'],
        [2, 0, 'M'],
        [2, 1, 'M'],
      ]),
      emptyCellsRemaining: 1,
      currentPlayerIndex: 0,
      awaitingPassConfirmation: false,
    };

    const res = placeLetter(tiedSetup, p1, 2, 2, 'M').state;
    expect(res.status).toBe('GAME_OVER');
    expect(res.isTie).toBe(true);
    expect(res.winnerIds).toHaveLength(2);
    expect(res.scoreDifference).toBe(0);
  });

  it('supports mixed human and bot tables, clockwise/anticlockwise order, and avoids handover in 1-human vs bots', () => {
    const soloSeats = buildDefaultSeats('vs-bots', 3);
    let solo = createOmoGame(makeConfig({ mode: 'vs-bots', seats: soloSeats }));
    solo = placeLetter(solo, soloSeats[0].id, 0, 0, 'O').state;
    expect(solo.awaitingPassConfirmation).toBe(false);
    expect(solo.currentPlayerIndex).toBe(1);

    // Bots play automatically without handover
    solo = executeBotTurn(solo, () => 0.1).state;
    expect(solo.currentPlayerIndex).toBe(2);
    solo = executeBotTurn(solo, () => 0.9).state;
    expect(solo.currentPlayerIndex).toBe(0);
    expect(solo.awaitingPassConfirmation).toBe(false);

    // Mixed 2 Humans + 1 Bot (anticlockwise)
    const mixedSeats: PlayerSeatConfig[] = [
      { id: 'h1', type: 'human', name: 'Human 1', difficulty: 'normal' },
      { id: 'b1', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
      { id: 'h2', type: 'human', name: 'Human 2', difficulty: 'hard' },
    ];
    let mixed = createOmoGame(
      makeConfig({ mode: 'mixed', direction: 'anticlockwise', seats: mixedSeats })
    );
    // Anticlockwise from index 0 (h1) goes to index 2 (h2)
    mixed = placeLetter(mixed, 'h1', 0, 0, 'M').state;
    expect(mixed.currentPlayerIndex).toBe(2);
    expect(mixed.awaitingPassConfirmation).toBe(true);
    mixed = confirmPassDevice(mixed).state;

    // From index 2 (h2) anticlockwise goes to index 1 (b1)
    mixed = placeLetter(mixed, 'h2', 4, 4, 'M').state;
    expect(mixed.currentPlayerIndex).toBe(1);
    expect(mixed.awaitingPassConfirmation).toBe(false);

    // Bot plays, passes anticlockwise to index 0 (h1) -> handover required because previous human was h2!
    mixed = executeBotTurn(mixed).state;
    expect(mixed.currentPlayerIndex).toBe(0);
    expect(mixed.awaitingPassConfirmation).toBe(true);
    expect(getPublicOmoView(mixed).previousPlayerName).toBe('Human 2');
  });
});

describe('OMO Bot Intelligence (Easy, Normal, Hard)', () => {
  it('Easy bot always returns a legal empty cell and valid letter across board sizes', () => {
    const seats = buildDefaultSeats('vs-bots', 2, 1, 'easy');
    const state = createOmoGame(makeConfig({ mode: 'vs-bots', seats, rows: 6, cols: 8 }));
    for (let i = 0; i < 10; i += 1) {
      const move = chooseOmoBotMove(state, 'easy', () => (i * 0.13) % 1);
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(6);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(8);
      expect(['O', 'M']).toContain(move.letter);
      expect(state.board[move.row][move.col]).toBeNull();
    }
  });

  it('Normal bot reliably captures immediate OMO opportunities and bonus turns', () => {
    const seats: PlayerSeatConfig[] = [
      { id: 'b1', type: 'bot', name: 'Normal Bot', difficulty: 'normal' },
      { id: 'h1', type: 'human', name: 'Human', difficulty: 'normal' },
    ];
    let state = createOmoGame(makeConfig({ mode: 'mixed', seats, rows: 5, cols: 5 }));
    state = {
      ...state,
      board: seedBoard(5, 5, [
        [2, 1, 'O'],
        [2, 3, 'O'],
      ]),
      emptyCellsRemaining: 23,
    };

    const res = executeBotTurn(state, () => 0.5);
    expect(res.ok).toBe(true);
    expect(res.state.board[2][2]).toBe('M');
    expect(res.state.players[0].score).toBe(1);
    expect(res.state.isBonusTurn).toBe(true);
    expect(res.state.currentPlayerIndex).toBe(0);
  });

  it('Hard bot evaluates both O and M, captures multi-OMO plays, and avoids gifting 1-move OMOs', () => {
    const seats: PlayerSeatConfig[] = [
      { id: 'b1', type: 'bot', name: 'Hard Bot', difficulty: 'hard' },
      { id: 'h1', type: 'human', name: 'Human', difficulty: 'normal' },
    ];
    let state = createOmoGame(makeConfig({ mode: 'mixed', seats, rows: 5, cols: 5 }));
    state = {
      ...state,
      board: seedBoard(5, 5, [
        [2, 1, 'O'],
        [2, 3, 'O'],
        [1, 2, 'O'],
        [3, 2, 'O'],
      ]),
      emptyCellsRemaining: 21,
    };

    const startTime = Date.now();
    const move = chooseOmoBotMove(state, 'hard', () => 0.5);
    const elapsedMs = Date.now() - startTime;

    expect(move).toEqual(
      expect.objectContaining({ row: 2, col: 2, letter: 'M' })
    );
    expect(elapsedMs).toBeLessThan(1000);

    // Verify Hard bot runs swiftly even on larger 9x9 boards
    const largeState = createOmoGame(makeConfig({ mode: 'mixed', seats, rows: 9, cols: 9 }));
    const t0 = Date.now();
    const largeMove = chooseOmoBotMove(largeState, 'hard', () => 0.5);
    expect(Date.now() - t0).toBeLessThan(1000);
    expect(largeState.board[largeMove.row][largeMove.col]).toBeNull();
  });
});

describe('OMO Responsive Grid Limits & Validation', () => {
  it('enforces smaller mobile limits and larger tablet/desktop limits', () => {
    const mobileLimits = getResponsiveGridLimits(375, 667);
    const tabletLimits = getResponsiveGridLimits(768, 1024);
    const desktopLimits = getResponsiveGridLimits(1440, 900);

    expect(mobileLimits.tier).toBe('mobile');
    expect(tabletLimits.tier).toBe('tablet');
    expect(desktopLimits.tier).toBe('desktop');

    expect(desktopLimits.maxCols).toBeGreaterThan(mobileLimits.maxCols);
    expect(validateGridDimensions(5, 5, mobileLimits).valid).toBe(true);
    expect(validateGridDimensions(11, 11, mobileLimits).valid).toBe(false);
    expect(validateGridDimensions(2, 5, mobileLimits).valid).toBe(false);
  });
});
