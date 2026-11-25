import type { CardTexture, StandardCard } from '../../../types/playingCard';

export type PorridgeRuleVariation = 'same-suit' | 'highest-colour';

export type PorridgeGameMode = 'vs-bots' | 'pass-and-play' | 'mixed';

export type PlayDirection = 'clockwise' | 'anticlockwise';

export type AceRankingMode = 'ace-high' | 'ace-low';

export type HighestColourReference = 'first-in-pile' | 'previous-top';

export type PorridgePlayerType = 'human' | 'bot';

export type PorridgeGamePhase =
  | 'waiting-for-player'
  | 'selecting-card'
  | 'revealing-card'
  | 'resolving-rules'
  | 'collecting-pile'
  | 'passing-device'
  | 'bot-thinking'
  | 'game-completed';

export type CircleSlotStatus = 'face-down' | 'selected' | 'removed';

export interface CircleCardSlot {
  positionId: string;
  positionIndex: number;
  card: StandardCard;
  status: CircleSlotStatus;
}

export interface PorridgePlayer {
  id: string;
  name: string;
  type: PorridgePlayerType;
  turnOrder: number;
  collectedCards: StandardCard[];
  cardsCollected: number;
}

export interface PorridgeRulesConfig {
  aceRanking: AceRankingMode;
  highestColourReference: HighestColourReference;
  collectorStartsNextPile: boolean;
}

export interface PorridgeSeatConfig {
  type: PorridgePlayerType;
  name: string;
}

export interface PorridgeSetupConfig {
  mode: PorridgeGameMode;
  variation: PorridgeRuleVariation;
  direction: PlayDirection;
  seats: PorridgeSeatConfig[];
  rules?: Partial<PorridgeRulesConfig>;
}

export interface RuleEvaluationResult {
  shouldCollect: boolean;
  reason: string;
  comparisonCard: StandardCard | null;
}

export interface CollectionEvent {
  id: string;
  turnNumber: number;
  playerId: string;
  playerName: string;
  collectedCount: number;
  triggerCard: StandardCard;
  reason: string;
}

export interface RevealResult {
  turnNumber: number;
  playerId: string;
  playerName: string;
  playerType: PorridgePlayerType;
  positionId: string;
  card: StandardCard;
  collected: boolean;
  collectedCount: number;
  reason: string;
  pileCountAfter: number;
}

export interface PorridgeStanding {
  rank: number;
  playerId: string;
  name: string;
  type: PorridgePlayerType;
  cardsCollected: number;
  isWinner: boolean;
}

export interface PorridgeGameResult {
  winners: PorridgePlayer[];
  winnerIds: string[];
  isTie: boolean;
  lowestCount: number;
  standings: PorridgeStanding[];
}

export interface PorridgeGameState {
  status: 'PLAYING' | 'GAME_OVER';
  phase: PorridgeGamePhase;
  mode: PorridgeGameMode;
  variation: PorridgeRuleVariation;
  direction: PlayDirection;
  rules: PorridgeRulesConfig;
  circle: CircleCardSlot[];
  centralPile: StandardCard[];
  players: PorridgePlayer[];
  currentPlayerIndex: number;
  previousPlayerName: string | null;
  selectedPositionId: string | null;
  pendingTurnAdvance: boolean;
  awaitingPassConfirmation: boolean;
  turnNumber: number;
  lastRevealResult: RevealResult | null;
  collectionHistory: CollectionEvent[];
  winnerIds: string[];
  isTie: boolean;
  standings: PorridgeStanding[];
  lastActionSummary: string;
}

export interface PorridgeMoveResult {
  ok: boolean;
  error?: string;
  state: PorridgeGameState;
}

export interface PublicCircleSlot {
  positionId: string;
  positionIndex: number;
  status: CircleSlotStatus;
  isSelected: boolean;
}

export interface PublicPorridgePlayer {
  id: string;
  name: string;
  type: PorridgePlayerType;
  turnOrder: number;
  cardsCollected: number;
  isCurrentTurn: boolean;
}

export interface PublicPorridgeView {
  status: PorridgeGameState['status'];
  phase: PorridgeGamePhase;
  mode: PorridgeGameMode;
  variation: PorridgeRuleVariation;
  direction: PlayDirection;
  rules: PorridgeRulesConfig;
  hideBoardForPrivacy: boolean;
  awaitingPassConfirmation: boolean;
  pendingTurnAdvance: boolean;
  turnNumber: number;
  remainingCircleCount: number;
  publicCircle: PublicCircleSlot[];
  centralPile: StandardCard[];
  openingPileCard: StandardCard | null;
  topPileCard: StandardCard | null;
  players: PublicPorridgePlayer[];
  currentPlayer: PublicPorridgePlayer;
  previousPlayerName: string | null;
  selectedPositionId: string | null;
  lastRevealResult: RevealResult | null;
  collectionHistory: CollectionEvent[];
  standings: PorridgeStanding[];
  winnerIds: string[];
  isTie: boolean;
  lastActionSummary: string;
}

export type PorridgeCardTexture = CardTexture;
