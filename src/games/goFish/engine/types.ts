import type {
  BotDifficulty,
  MultiplayerGameMode,
  PlayDirection,
  PlayerSeatConfig,
} from '../../../types/multiplayer';
import type { CardRank, StandardCard } from '../../../types/playingCard';

export type GameStatus = 'PLAYING' | 'GAME_OVER';

export type GamePhase =
  | 'waiting-for-player'
  | 'selecting-opponent'
  | 'selecting-rank'
  | 'confirming-request'
  | 'asking-opponent'
  | 'transferring-cards'
  | 'go-fish'
  | 'drawing-card'
  | 'checking-books'
  | 'bot-thinking'
  | 'passing-device'
  | 'reveal-pause'
  | 'game-completed';

export type GoFishDealRule = 'standard' | 'always-five';
export type GoFishEmptyHandRule = 'five-cards' | 'single-card';

export interface GoFishRulesConfig {
  dealRule: GoFishDealRule;
  emptyHandRule: GoFishEmptyHandRule;
  extraTurnOnBook: boolean;
  botThinkingDelayMs: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface GoFishSetupConfig {
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  seats: PlayerSeatConfig[];
  rules: GoFishRulesConfig;
}

export interface CompletedBook {
  rank: CardRank;
  cards: StandardCard[];
  completedOnTurn: number;
}

export interface GoFishPlayer {
  id: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  turnOrder: number;
  hand: StandardCard[];
  books: CompletedBook[];
  isInactiveForAsking: boolean;
}

export interface SuccessfulRequestRecord {
  requesterId: string;
  opponentId: string;
  rank: CardRank;
  cardsTransferred: number;
  turnNumber: number;
}

export interface FailedRequestRecord {
  requesterId: string;
  opponentId: string;
  rank: CardRank;
  turnNumber: number;
}

export interface KnownBookRecord {
  playerId: string;
  rank: CardRank;
  turnNumber: number;
}

export interface PlayerMemory {
  playerId: string;
  successfulRequests: SuccessfulRequestRecord[];
  failedRequests: FailedRequestRecord[];
  knownBookCollections: KnownBookRecord[];
}

export type TurnOutcomeKind =
  | 'transferred'
  | 'go-fish-match'
  | 'go-fish-miss'
  | 'go-fish-empty-pond';

export interface GoFishTurnOutcome {
  id: string;
  turnNumber: number;
  requesterId: string;
  requesterName: string;
  opponentId: string;
  opponentName: string;
  rank: CardRank;
  kind: TurnOutcomeKind;
  cardsTransferred: number;
  transferredCards: StandardCard[];
  drawnCard: StandardCard | null;
  drawnCardPubliclyShown: boolean;
  completedBooks: CardRank[];
  refilledCount: number;
  opponentRefilledCount: number;
  grantsAnotherTurn: boolean;
  publicMessage: string;
  privateMessage: string;
}

export interface GoFishStanding {
  rank: number;
  playerId: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  bookCount: number;
  handCount: number;
  isWinner: boolean;
}

export interface GoFishGameResult {
  winnerIds: string[];
  isTie: boolean;
  isStalemate: boolean;
  standings: GoFishStanding[];
}

export interface GoFishGameState {
  status: GameStatus;
  phase: GamePhase;
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: GoFishRulesConfig;
  players: GoFishPlayer[];
  currentPlayerIndex: number;
  drawPile: StandardCard[];
  turnNumber: number;
  memory: PlayerMemory;
  stalePlayerIds: string[];
  lastHumanPlayerId: string | null;
  previousHumanName: string | null;
  awaitingPassConfirmation: boolean;
  pendingTurnAdvance: boolean;
  newlyDrawnCardId: string | null;
  lastDrawnCardsByPlayer: Record<string, StandardCard[]>;
  lastOutcome: GoFishTurnOutcome | null;
  outcomeHistory: GoFishTurnOutcome[];
  winnerIds: string[];
  isTie: boolean;
  isStalemate: boolean;
  standings: GoFishStanding[];
  lastActionSummary: string;
}

export interface GoFishMoveResult {
  ok: boolean;
  error?: string;
  state: GoFishGameState;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface PublicGoFishPlayerSummary {
  id: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  turnOrder: number;
  handCount: number;
  books: CompletedBook[];
  bookCount: number;
  isInactiveForAsking: boolean;
  isCurrentTurn: boolean;
}

export interface BotObservation {
  botId: string;
  botHand: StandardCard[];
  players: PublicGoFishPlayerSummary[];
  drawPileCount: number;
  turnNumber: number;
  memory: PlayerMemory;
}

export interface BotAction {
  opponentId: string;
  rank: CardRank;
}

export interface PublicGoFishView {
  status: GameStatus;
  phase: GamePhase;
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: GoFishRulesConfig;
  players: PublicGoFishPlayerSummary[];
  currentPlayer: PublicGoFishPlayerSummary;
  visibleHand: StandardCard[] | null;
  availableRanks: CardRank[];
  eligibleOpponents: PublicGoFishPlayerSummary[];
  newlyDrawnCardId: string | null;
  newlyDrawnCardIds: string[];
  lastPickedUpCards: StandardCard[];
  drawPileCount: number;
  totalBooksCompleted: number;
  turnNumber: number;
  awaitingPassConfirmation: boolean;
  pendingTurnAdvance: boolean;
  previousHumanName: string | null;
  lastOutcome: Omit<GoFishTurnOutcome, 'drawnCard' | 'privateMessage'> & {
    drawnCard: StandardCard | null;
    message: string;
  } | null;
  outcomeHistory: {
    id: string;
    turnNumber: number;
    publicMessage: string;
  }[];
  winnerIds: string[];
  isTie: boolean;
  isStalemate: boolean;
  standings: GoFishStanding[];
  lastActionSummary: string;
}
