export type StandardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface StandardCard {
  id: string;
  kind: 'standard';
  rank: CardRank;
  suit: StandardSuit;
}

export interface JokerCard {
  id: string;
  kind: 'joker';
  jokerIndex: 1 | 2;
}

export type PlayingCard = StandardCard | JokerCard;

export type SetType = 'matching' | 'run';

export interface TableSet {
  id: string;
  type: SetType;
  cards: PlayingCard[];
  createdByPlayerId: string;
  createdTurn: number;
}

export type PlayerType = 'human' | 'bot';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  hand: PlayingCard[];
}

export type TurnPhase = 'DRAW' | 'PLAY' | 'DISCARD';

export type DrawSource = 'draw-pile' | 'discard-pile';

export type GameMode = 'pass-and-play' | 'vs-bots';

export type StartingHandSize = 7 | 11;

export interface SevensRulesConfig {
  /** Whether a player is allowed to discard a Joker at the end of a turn. */
  allowDiscardJoker: boolean;
  /** Whether a Joker retrieved from the table may be played again on the same turn. */
  allowImmediateJokerReuse: boolean;
  /** Whether players may draw the top card of the discard pile instead of the draw pile. */
  allowDiscardPickupTop: boolean;
  /** Whether the final card must be discarded (false = winning immediately on play or discard). */
  requireFinalDiscard: boolean;
  /** Whether sets containing a Joker can be extended with additional cards. */
  allowExtendJokerSets: boolean;
}

export interface GameSetupConfig {
  playerCount: 2 | 3 | 4;
  handSize: StartingHandSize;
  mode: GameMode;
  playerNames?: string[];
  rules?: Partial<SevensRulesConfig>;
}

export interface PlayerStanding {
  rank: number;
  playerId: string;
  name: string;
  type: PlayerType;
  cardsRemaining: number;
  isWinner: boolean;
}

export type ReplayActionType =
  | 'START'
  | 'DRAW_DECK'
  | 'DRAW_DISCARD'
  | 'PLAY_NEW_SET'
  | 'ADD_TO_SET'
  | 'REPLACE_JOKER'
  | 'DISCARD'
  | 'VICTORY';

export interface ReplayPlayerSnapshot {
  id: string;
  name: string;
  type: PlayerType;
  hand: PlayingCard[];
}

export interface ReplayFrame {
  stepIndex: number;
  turnNumber: number;
  actorId: string | null;
  actorName: string;
  actorType: PlayerType | 'system';
  actionType: ReplayActionType;
  description: string;
  highlightedCardIds: string[];
  players: ReplayPlayerSnapshot[];
  tableSets: TableSet[];
  topDiscard: PlayingCard | null;
  drawPileCount: number;
}

export interface BotFeedEntry {
  id: string;
  turnNumber: number;
  botId: string;
  botName: string;
  actionType: ReplayActionType;
  description: string;
}

export interface GameState {
  status: 'PLAYING' | 'GAME_OVER';
  mode: GameMode;
  handSize: StartingHandSize;
  rules: SevensRulesConfig;
  players: Player[];
  currentPlayerIndex: number;
  phase: TurnPhase;
  drawPile: PlayingCard[];
  discardPile: PlayingCard[];
  tableSets: TableSet[];
  turnNumber: number;
  hasDrawnThisTurn: boolean;
  lastDrawSource: DrawSource | null;
  lastDrawnCardId: string | null;
  hasCreatedNewSetThisTurn: boolean;
  retrievedJokerIdsThisTurn: string[];
  awaitingPassConfirmation: boolean;
  winnerId: string | null;
  winnerType: PlayerType | null;
  standings: PlayerStanding[];
  lastActionSummary: string;
  botTurnFeed: BotFeedEntry[];
  actionLog: string[];
  replayFrames: ReplayFrame[];
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  setType?: SetType;
  orderedCards?: PlayingCard[];
}

export interface MoveResult {
  ok: boolean;
  error?: string;
  state: GameState;
}

export interface PublicPlayerSummary {
  id: string;
  name: string;
  type: PlayerType;
  cardCount: number;
  isCurrentTurn: boolean;
}

export interface PublicTableView {
  status: GameState['status'];
  mode: GameMode;
  phase: TurnPhase;
  turnNumber: number;
  hasDrawnThisTurn: boolean;
  lastDrawSource: DrawSource | null;
  drawnCardId: string | null;
  hasCreatedNewSetThisTurn: boolean;
  awaitingPassConfirmation: boolean;
  currentPlayer: PublicPlayerSummary;
  players: PublicPlayerSummary[];
  visibleHand: PlayingCard[] | null;
  drawPileCount: number;
  topDiscard: PlayingCard | null;
  discardPileCount: number;
  tableSets: TableSet[];
  winner: PublicPlayerSummary | null;
  winnerType: PlayerType | null;
  standings: PlayerStanding[];
  lastActionSummary: string;
  botTurnFeed: BotFeedEntry[];
  actionLog: string[];
  replayFrames: ReplayFrame[] | null;
}
