import { validateMultiplayerSeats } from '../../../types/multiplayer';
import type { StandardCard } from '../../../types/playingCard';
import { extractBooksFromPlayer } from './bookManager';
import { createDeck, shuffleDeck, sortHandByRank } from './deck';
import type {
  GoFishDealRule,
  GoFishGameState,
  GoFishPlayer,
  GoFishRulesConfig,
  GoFishSetupConfig,
} from './types';

export const DEFAULT_GO_FISH_RULES: GoFishRulesConfig = {
  dealRule: 'standard',
  emptyHandRule: 'five-cards',
  extraTurnOnBook: false,
  botThinkingDelayMs: 850,
  soundEnabled: true,
  animationsEnabled: true,
};

export function getInitialHandSize(
  playerCount: number,
  dealRule: GoFishDealRule = 'standard'
): number {
  if (dealRule === 'always-five') {
    return 5;
  }
  return playerCount >= 4 ? 5 : 7;
}

export function buildPlayersFromConfig(
  config: GoFishSetupConfig
): GoFishPlayer[] {
  const validation = validateMultiplayerSeats(config.seats);
  if (!validation.valid) {
    throw new Error(validation.errors[0] ?? 'Invalid Go Fish player setup.');
  }

  return config.seats.map((seat, idx) => ({
    id: seat.id,
    name: seat.name.trim(),
    type: seat.type,
    difficulty: seat.type === 'bot' ? seat.difficulty : undefined,
    turnOrder: idx + 1,
    hand: [],
    books: [],
    isInactiveForAsking: false,
  }));
}

export function dealInitialHands(
  players: readonly GoFishPlayer[],
  deck: readonly StandardCard[],
  config: Pick<GoFishSetupConfig, 'mode' | 'direction'> & {
    rules?: Partial<GoFishRulesConfig>;
  }
): GoFishGameState {
  const rules: GoFishRulesConfig = {
    ...DEFAULT_GO_FISH_RULES,
    ...config.rules,
  };

  const handSize = getInitialHandSize(players.length, rules.dealRule);
  const deckCopy = [...deck];
  let cursor = 0;

  const dealtPlayers: GoFishPlayer[] = players.map((player) => {
    const dealtCards = deckCopy.slice(cursor, cursor + handSize);
    cursor += handSize;
    return {
      ...player,
      hand: sortHandByRank(dealtCards),
      books: [],
      isInactiveForAsking: false,
    };
  });

  const drawPile = deckCopy.slice(cursor);
  const knownBookCollections: GoFishGameState['memory']['knownBookCollections'] = [];
  const initialBooksSummary: string[] = [];

  const playersAfterBooks = dealtPlayers.map((player) => {
    const extracted = extractBooksFromPlayer(player, 1);
    for (const rank of extracted.completedRanks) {
      knownBookCollections.push({
        playerId: player.id,
        rank,
        turnNumber: 1,
      });
      initialBooksSummary.push(`${player.name} laid down a starting book.`);
    }
    return extracted.player;
  });

  const firstPlayer = playersAfterBooks[0];
  const initialPhase =
    firstPlayer.type === 'bot' ? 'bot-thinking' : 'waiting-for-player';

  const dealSummary = `${handSize} cards dealt to each of ${players.length} players (${drawPile.length} in the Fish Pond).`;
  const summarySuffix =
    initialBooksSummary.length > 0 ? ` ${initialBooksSummary.join(' ')}` : '';

  return {
    status: 'PLAYING',
    phase: initialPhase,
    mode: config.mode,
    direction: config.direction,
    rules,
    players: playersAfterBooks,
    currentPlayerIndex: 0,
    drawPile,
    turnNumber: 1,
    memory: {
      playerId: 'public-table',
      successfulRequests: [],
      failedRequests: [],
      knownBookCollections,
    },
    stalePlayerIds: [],
    lastHumanPlayerId: firstPlayer.type === 'human' ? firstPlayer.id : null,
    previousHumanName: null,
    awaitingPassConfirmation: false,
    pendingTurnAdvance: false,
    newlyDrawnCardId: null,
    lastOutcome: null,
    outcomeHistory: [],
    winnerIds: [],
    isTie: false,
    isStalemate: false,
    standings: [],
    lastActionSummary: `${dealSummary} ${firstPlayer.name} goes first.${summarySuffix}`,
  };
}

export function createGoFishGame(
  config: GoFishSetupConfig,
  rng: () => number = Math.random
): GoFishGameState {
  const players = buildPlayersFromConfig(config);
  const deck = shuffleDeck(createDeck(), rng);
  return dealInitialHands(players, deck, {
    mode: config.mode,
    direction: config.direction,
    rules: config.rules,
  });
}
