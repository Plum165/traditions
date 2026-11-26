import { validateMultiplayerSeats } from '../../../types/multiplayer';
import { chooseOmoBotMove } from './botStrategy';
import {
  cloneBoard,
  createEmptyBoard,
  isCellInBounds,
  validateGridDimensions,
} from './gridManager';
import { detectNewOmosAtPlacement } from './omoDetector';
import { computeOmoStandings } from './scoring';
import { getNextPlayerIndex, shouldRequirePassHandover } from './turnManager';
import type {
  OmoGameState,
  OmoLetter,
  OmoMoveResult,
  OmoPlacementRecord,
  OmoPlayerState,
  OmoPublicView,
  OmoSetupConfig,
} from './types';

export type {
  OmoAxisDirection,
  OmoCellCoord,
  OmoCellValue,
  OmoCombination,
  OmoCombinationId,
  OmoDeviceTier,
  OmoGameState,
  OmoGameStatus,
  OmoGridDimensions,
  OmoLetter,
  OmoMoveResult,
  OmoPlacementRecord,
  OmoPlayerState,
  OmoPublicView,
  OmoResponsiveGridLimits,
  OmoRulesConfig,
  OmoSetupConfig,
  OmoStanding,
} from './types';

export function createOmoGame(config: OmoSetupConfig): OmoGameState {
  const seatValidation = validateMultiplayerSeats(config.seats);
  if (!seatValidation.valid) {
    throw new Error(seatValidation.errors[0] ?? 'Invalid player setup.');
  }

  const gridValidation = validateGridDimensions(
    config.rules.rows,
    config.rules.cols
  );
  if (!gridValidation.valid) {
    throw new Error(gridValidation.error ?? 'Invalid grid dimensions.');
  }

  const players: OmoPlayerState[] = config.seats.map((seat) => ({
    id: seat.id,
    name: seat.name.trim(),
    type: seat.type,
    difficulty: seat.difficulty,
    score: 0,
    omosCreated: 0,
    turnsTaken: 0,
    bonusTurnsEarned: 0,
  }));

  const totalCells = config.rules.rows * config.rules.cols;
  const initialStandings = computeOmoStandings(players);

  return {
    mode: config.mode,
    direction: config.direction,
    rules: { ...config.rules },
    status: 'PLAYING',
    board: createEmptyBoard(config.rules.rows, config.rules.cols),
    emptyCellsRemaining: totalCells,
    players,
    currentPlayerIndex: 0,
    moveNumber: 0,
    isBonusTurn: false,
    awaitingPassConfirmation: false,
    previousPlayerId: null,
    scoredCombinations: [],
    scoredCombinationIds: [],
    lastPlacement: null,
    lastNewCombinations: [],
    history: [],
    winnerIds: [],
    isTie: false,
    scoreDifference: initialStandings.scoreDifference,
    standings: initialStandings.standings,
  };
}

export function placeLetter(
  state: OmoGameState,
  playerId: string,
  row: number,
  col: number,
  letter: OmoLetter
): OmoMoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'The game has already ended.', state };
  }

  if (state.awaitingPassConfirmation) {
    return {
      ok: false,
      error: 'Pass the device and tap Ready before placing a letter.',
      state,
    };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  if (!activePlayer || activePlayer.id !== playerId) {
    return { ok: false, error: 'It is not this player’s turn.', state };
  }

  if (letter !== 'O' && letter !== 'M') {
    return { ok: false, error: 'Only O or M may be placed.', state };
  }

  if (!isCellInBounds(state.board, row, col)) {
    return { ok: false, error: 'Selected cell is outside the grid.', state };
  }

  if (state.board[row][col] !== null) {
    return {
      ok: false,
      error: 'That cell is already occupied. Choose an empty cell.',
      state,
    };
  }

  const nextBoard = cloneBoard(state.board);
  nextBoard[row][col] = letter;

  const nextMoveNumber = state.moveNumber + 1;
  const nextEmptyCells = state.emptyCellsRemaining - 1;
  const existingSet = new Set(state.scoredCombinationIds);
  const newOmos = detectNewOmosAtPlacement(
    nextBoard,
    row,
    col,
    existingSet,
    activePlayer.id,
    nextMoveNumber
  );

  const pointsEarned = newOmos.length;
  const gridFull = nextEmptyCells === 0;
  // Bonus turn applies only if at least one new OMO was formed AND empty cells remain
  const earnedBonusTurn = pointsEarned > 0 && !gridFull;

  const nextPlayers = state.players.map((player, idx) => {
    if (idx !== state.currentPlayerIndex) return player;
    return {
      ...player,
      score: player.score + pointsEarned,
      omosCreated: player.omosCreated + pointsEarned,
      turnsTaken: player.turnsTaken + 1,
      bonusTurnsEarned: player.bonusTurnsEarned + (earnedBonusTurn ? 1 : 0),
    };
  });

  const placementRecord: OmoPlacementRecord = {
    moveNumber: nextMoveNumber,
    playerId: activePlayer.id,
    playerName: activePlayer.name,
    playerType: activePlayer.type,
    row,
    col,
    letter,
    newOmoIds: newOmos.map((combo) => combo.id),
    pointsEarned,
    earnedBonusTurn,
    gameEnded: gridFull,
  };

  const nextScoredCombinations = [...state.scoredCombinations, ...newOmos];
  const nextScoredIds = [
    ...state.scoredCombinationIds,
    ...newOmos.map((combo) => combo.id),
  ];

  const standingsResolution = computeOmoStandings(nextPlayers);

  if (gridFull) {
    return {
      ok: true,
      state: {
        ...state,
        status: 'GAME_OVER',
        board: nextBoard,
        emptyCellsRemaining: 0,
        players: nextPlayers,
        moveNumber: nextMoveNumber,
        isBonusTurn: false,
        awaitingPassConfirmation: false,
        previousPlayerId: activePlayer.id,
        scoredCombinations: nextScoredCombinations,
        scoredCombinationIds: nextScoredIds,
        lastPlacement: placementRecord,
        lastNewCombinations: newOmos,
        history: [...state.history, placementRecord],
        winnerIds: standingsResolution.winnerIds,
        isTie: standingsResolution.isTie,
        scoreDifference: standingsResolution.scoreDifference,
        standings: standingsResolution.standings,
      },
    };
  }

  if (earnedBonusTurn) {
    // Active player retains turn without triggering a handover screen
    return {
      ok: true,
      state: {
        ...state,
        board: nextBoard,
        emptyCellsRemaining: nextEmptyCells,
        players: nextPlayers,
        moveNumber: nextMoveNumber,
        isBonusTurn: true,
        awaitingPassConfirmation: false,
        previousPlayerId: activePlayer.id,
        scoredCombinations: nextScoredCombinations,
        scoredCombinationIds: nextScoredIds,
        lastPlacement: placementRecord,
        lastNewCombinations: newOmos,
        history: [...state.history, placementRecord],
        scoreDifference: standingsResolution.scoreDifference,
        standings: standingsResolution.standings,
      },
    };
  }

  // Advance to next player
  const nextPlayerIndex = getNextPlayerIndex(
    state.currentPlayerIndex,
    nextPlayers.length,
    state.direction
  );

  // Track last human who interacted so mixed human+bot games show handover
  // when control moves from one human to another human
  const previousHumanId =
    activePlayer.type === 'human'
      ? activePlayer.id
      : state.previousPlayerId;

  const needsHandover = shouldRequirePassHandover(
    { mode: state.mode, players: nextPlayers },
    previousHumanId,
    nextPlayerIndex
  );

  return {
    ok: true,
    state: {
      ...state,
      board: nextBoard,
      emptyCellsRemaining: nextEmptyCells,
      players: nextPlayers,
      currentPlayerIndex: nextPlayerIndex,
      moveNumber: nextMoveNumber,
      isBonusTurn: false,
      awaitingPassConfirmation: needsHandover,
      previousPlayerId:
        activePlayer.type === 'human'
          ? activePlayer.id
          : state.previousPlayerId,
      scoredCombinations: nextScoredCombinations,
      scoredCombinationIds: nextScoredIds,
      lastPlacement: placementRecord,
      lastNewCombinations: newOmos,
      history: [...state.history, placementRecord],
      scoreDifference: standingsResolution.scoreDifference,
      standings: standingsResolution.standings,
    },
  };
}

export function executeBotTurn(
  state: OmoGameState,
  rng: () => number = Math.random
): OmoMoveResult {
  if (state.status !== 'PLAYING') {
    return { ok: false, error: 'The game has already ended.', state };
  }
  if (state.awaitingPassConfirmation) {
    return {
      ok: false,
      error: 'Waiting for human handover confirmation.',
      state,
    };
  }

  const activePlayer = state.players[state.currentPlayerIndex];
  if (!activePlayer || activePlayer.type !== 'bot') {
    return { ok: false, error: 'Active player is not a bot.', state };
  }

  const move = chooseOmoBotMove(state, activePlayer.difficulty, rng);
  return placeLetter(state, activePlayer.id, move.row, move.col, move.letter);
}

export function confirmPassDevice(state: OmoGameState): OmoMoveResult {
  if (!state.awaitingPassConfirmation) {
    return { ok: true, state };
  }
  return {
    ok: true,
    state: {
      ...state,
      awaitingPassConfirmation: false,
    },
  };
}

export function getPublicOmoView(state: OmoGameState): OmoPublicView {
  const rows = state.board.length;
  const cols = state.board[0]?.length ?? 0;
  const previousPlayer = state.previousPlayerId
    ? state.players.find((p) => p.id === state.previousPlayerId) ?? null
    : null;

  return {
    mode: state.mode,
    direction: state.direction,
    rules: state.rules,
    status: state.status,
    board: state.board,
    rows,
    cols,
    emptyCellsRemaining: state.emptyCellsRemaining,
    totalCells: rows * cols,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    activePlayer: state.players[state.currentPlayerIndex],
    moveNumber: state.moveNumber,
    isBonusTurn: state.isBonusTurn,
    awaitingPassConfirmation: state.awaitingPassConfirmation,
    previousPlayerName: previousPlayer?.name ?? null,
    scoredCombinations: state.scoredCombinations,
    lastPlacement: state.lastPlacement,
    lastNewCombinations: state.lastNewCombinations,
    history: state.history,
    winnerIds: state.winnerIds,
    isTie: state.isTie,
    scoreDifference: state.scoreDifference,
    standings: state.standings,
  };
}
