import type {
  BotDifficulty,
  MultiplayerGameMode,
  PlayDirection,
  PlayerSeatConfig,
} from '../../../types/multiplayer';

export type OmoLetter = 'O' | 'M';

export type OmoCellValue = OmoLetter | null;

export interface OmoCellCoord {
  row: number;
  col: number;
}

export interface OmoGridDimensions {
  rows: number;
  cols: number;
}

export type OmoDeviceTier = 'mobile' | 'tablet' | 'desktop';

export interface OmoResponsiveGridLimits {
  tier: OmoDeviceTier;
  minRows: number;
  minCols: number;
  maxRows: number;
  maxCols: number;
  recommendedPreset: OmoGridDimensions;
  minCellSizePx: number;
}

export type OmoAxisDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-down-right'
  | 'diagonal-down-left';

export type OmoCombinationId = string;

export interface OmoCombination {
  id: OmoCombinationId;
  cells: [OmoCellCoord, OmoCellCoord, OmoCellCoord];
  direction: OmoAxisDirection;
  scoredByPlayerId: string;
  turnScored: number;
}

export interface OmoPlacementRecord {
  moveNumber: number;
  playerId: string;
  playerName: string;
  playerType: 'human' | 'bot';
  row: number;
  col: number;
  letter: OmoLetter;
  newOmoIds: OmoCombinationId[];
  pointsEarned: number;
  earnedBonusTurn: boolean;
  gameEnded: boolean;
}

export interface OmoPlayerState {
  id: string;
  name: string;
  type: 'human' | 'bot';
  difficulty: BotDifficulty;
  score: number;
  omosCreated: number;
  turnsTaken: number;
  bonusTurnsEarned: number;
}

export interface OmoRulesConfig {
  rows: number;
  cols: number;
  botThinkingDelayMs: number;
  soundEnabled: boolean;
}

export interface OmoSetupConfig {
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  seats: PlayerSeatConfig[];
  rules: OmoRulesConfig;
}

export interface OmoStanding {
  rank: number;
  playerId: string;
  name: string;
  type: 'human' | 'bot';
  difficulty: BotDifficulty;
  score: number;
  omosCreated: number;
  turnsTaken: number;
  bonusTurnsEarned: number;
  isWinner: boolean;
}

export type OmoGameStatus = 'PLAYING' | 'GAME_OVER';

export interface OmoGameState {
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: OmoRulesConfig;
  status: OmoGameStatus;
  board: OmoCellValue[][];
  emptyCellsRemaining: number;
  players: OmoPlayerState[];
  currentPlayerIndex: number;
  moveNumber: number;
  isBonusTurn: boolean;
  awaitingPassConfirmation: boolean;
  previousPlayerId: string | null;
  scoredCombinations: OmoCombination[];
  scoredCombinationIds: OmoCombinationId[];
  lastPlacement: OmoPlacementRecord | null;
  lastNewCombinations: OmoCombination[];
  history: OmoPlacementRecord[];
  winnerIds: string[];
  isTie: boolean;
  scoreDifference: number;
  standings: OmoStanding[];
}

export interface OmoPublicView {
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: OmoRulesConfig;
  status: OmoGameStatus;
  board: OmoCellValue[][];
  rows: number;
  cols: number;
  emptyCellsRemaining: number;
  totalCells: number;
  players: OmoPlayerState[];
  currentPlayerIndex: number;
  activePlayer: OmoPlayerState;
  moveNumber: number;
  isBonusTurn: boolean;
  awaitingPassConfirmation: boolean;
  previousPlayerName: string | null;
  scoredCombinations: OmoCombination[];
  lastPlacement: OmoPlacementRecord | null;
  lastNewCombinations: OmoCombination[];
  history: OmoPlacementRecord[];
  winnerIds: string[];
  isTie: boolean;
  scoreDifference: number;
  standings: OmoStanding[];
}

export interface OmoMoveResult {
  ok: boolean;
  error?: string;
  state: OmoGameState;
}
