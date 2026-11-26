import type {
  BotDifficulty,
  MultiplayerGameMode,
  PlayDirection,
  PlayerSeatConfig,
} from '../../../types/multiplayer';
import type { StandardCard, StandardSuit } from '../../../types/playingCard';

export type RedOrBlackVariant = 'four-questions' | 'card-collection';

export type AceRanking = 'ace-high' | 'ace-low';

export type QuestionNumber = 1 | 2 | 3 | 4;

export type ColourGuess = 'red' | 'black';
export type HigherLowerGuess = 'higher' | 'lower';
export type InsideOutsideGuess = 'inside' | 'outside';

export type RedOrBlackPrediction =
  | { question: 1; choice: ColourGuess }
  | { question: 2; choice: HigherLowerGuess }
  | { question: 3; choice: InsideOutsideGuess }
  | { question: 4; choice: StandardSuit };

export interface RedOrBlackRulesConfig {
  aceRanking: AceRanking;
  botThinkingDelayMs: number;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface RedOrBlackSetupConfig {
  variant: RedOrBlackVariant;
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  seats: PlayerSeatConfig[];
  rules: RedOrBlackRulesConfig;
}

export interface RedOrBlackPlayer {
  id: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  turnOrder: number;
  collectedCards: StandardCard[];
  cardsCollected: number;
  attempts: number;
  correctAnswers: number;
  completedSequences: number;
}

export interface RevealOutcome {
  id: string;
  turnNumber: number;
  questionNumber: QuestionNumber;
  predictionLabel: string;
  revealedCard: StandardCard;
  correct: boolean;
  answererId: string;
  answererName: string;
  askerId: string;
  askerName: string;
  awardedToPlayerId: string | null;
  awardedToPlayerName: string | null;
  summary: string;
}

export interface RedOrBlackStanding {
  rank: number;
  playerId: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  cardsCollected: number;
  correctAnswers: number;
  completedSequences: number;
  isWinner: boolean;
}

export type RedOrBlackPhase =
  | 'answering'
  | 'bot-thinking'
  | 'reveal-pause'
  | 'passing-device'
  | 'game-over';

export interface RedOrBlackGameState {
  status: 'PLAYING' | 'GAME_OVER';
  phase: RedOrBlackPhase;
  variant: RedOrBlackVariant;
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: RedOrBlackRulesConfig;
  drawPile: StandardCard[];
  spentCards: StandardCard[];
  knownRevealedCards: StandardCard[];
  sequenceCards: StandardCard[];
  currentQuestion: QuestionNumber;
  players: RedOrBlackPlayer[];
  askerIndex: number;
  answererIndex: number;
  lastHumanPlayerId: string | null;
  previousHumanName: string | null;
  pendingRevealAdvance: boolean;
  awaitingPassConfirmation: boolean;
  turnNumber: number;
  lastOutcome: RevealOutcome | null;
  outcomeHistory: RevealOutcome[];
  winnerIds: string[];
  isTie: boolean;
  standings: RedOrBlackStanding[];
  lastActionSummary: string;
}

export interface PublicRedOrBlackPlayer {
  id: string;
  name: string;
  type: 'human' | 'bot';
  difficulty?: BotDifficulty;
  turnOrder: number;
  cardsCollected: number;
  attempts: number;
  correctAnswers: number;
  completedSequences: number;
  isAsker: boolean;
  isAnswerer: boolean;
}

export interface PublicRedOrBlackView {
  status: 'PLAYING' | 'GAME_OVER';
  phase: RedOrBlackPhase;
  variant: RedOrBlackVariant;
  mode: MultiplayerGameMode;
  direction: PlayDirection;
  rules: RedOrBlackRulesConfig;
  drawPileCount: number;
  knownRevealedCount: number;
  knownRevealedCards: StandardCard[];
  sequenceCards: StandardCard[];
  currentQuestion: QuestionNumber;
  players: PublicRedOrBlackPlayer[];
  asker: PublicRedOrBlackPlayer;
  answerer: PublicRedOrBlackPlayer;
  previousHumanName: string | null;
  pendingRevealAdvance: boolean;
  awaitingPassConfirmation: boolean;
  hideBoardForPrivacy: boolean;
  turnNumber: number;
  lastOutcome: RevealOutcome | null;
  outcomeHistory: RevealOutcome[];
  winnerIds: string[];
  isTie: boolean;
  standings: RedOrBlackStanding[];
  lastActionSummary: string;
}

export interface RedOrBlackMoveResult {
  ok: boolean;
  error?: string;
  state: RedOrBlackGameState;
}
