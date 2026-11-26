import { describe, expect, it } from 'vitest';
import type { PlayerSeatConfig } from '../../../../types/multiplayer';
import type { CardRank, StandardCard, StandardSuit } from '../../../../types/playingCard';
import {
  DEFAULT_GO_FISH_RULES,
  acknowledgeTurnEnd,
  confirmPassDevice,
  createBotObservation,
  createDeck,
  createGoFishGame,
  dealInitialHands,
  drawCard,
  executeBotTurnStep,
  getAvailableRanks,
  getPublicGoFishView,
  refillEmptyHand,
  resolveRequest,
  selectBotAction,
  shuffleDeck,
  validateRequest,
  type GoFishGameState,
  type GoFishSetupConfig,
} from '../gameEngine';

function card(suit: StandardSuit, rank: CardRank): StandardCard {
  return {
    id: `${suit}-${rank}`,
    kind: 'standard',
    rank,
    suit,
  };
}

function makeSeats(
  types: ('human' | 'bot')[],
  difficulty: 'easy' | 'normal' | 'hard' = 'normal'
): PlayerSeatConfig[] {
  return types.map((type, idx) => ({
    id: `p${idx + 1}`,
    type,
    name: type === 'human' ? `Player ${idx + 1}` : `Bot ${idx + 1}`,
    difficulty,
  }));
}

function makeConfig(
  types: ('human' | 'bot')[],
  overrides: Partial<GoFishSetupConfig> = {}
): GoFishSetupConfig {
  const hasHuman = types.includes('human');
  const hasBot = types.includes('bot');
  const mode =
    overrides.mode ??
    (hasHuman && hasBot
      ? types.filter((t) => t === 'human').length === 1
        ? 'vs-bots'
        : 'mixed'
      : 'pass-and-play');

  return {
    mode,
    direction: overrides.direction ?? 'clockwise',
    seats: overrides.seats ?? makeSeats(types),
    rules: {
      ...DEFAULT_GO_FISH_RULES,
      ...overrides.rules,
    },
  };
}

function deterministicRng(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Go Fish Engine', () => {
  describe('Deck & Initial Deal', () => {
    it('creates a unique 52-card standard deck without Jokers', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
      expect(deck.every((c) => c.kind === 'standard')).toBe(true);
      const uniqueIds = new Set(deck.map((c) => c.id));
      expect(uniqueIds.size).toBe(52);
    });

    it('deals 7 cards each for 2–3 players and 5 cards each for 4 players', () => {
      const twoPlayer = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(1));
      expect(twoPlayer.players.map((p) => p.hand.length + p.books.length * 4)).toEqual([7, 7]);
      expect(twoPlayer.drawPile.length).toBe(52 - 14);

      const threePlayer = createGoFishGame(
        makeConfig(['human', 'bot', 'bot']),
        deterministicRng(2)
      );
      expect(
        threePlayer.players.map((p) => p.hand.length + p.books.length * 4)
      ).toEqual([7, 7, 7]);
      expect(threePlayer.drawPile.length).toBe(52 - 21);

      const fourPlayer = createGoFishGame(
        makeConfig(['human', 'bot', 'bot', 'bot']),
        deterministicRng(3)
      );
      expect(
        fourPlayer.players.map((p) => p.hand.length + p.books.length * 4)
      ).toEqual([5, 5, 5, 5]);
      expect(fourPlayer.drawPile.length).toBe(52 - 20);
    });

    it('automatically detects a completed book dealt in an opening hand', () => {
      const deck = createDeck();
      // Put all four 7s in the first 7 cards dealt to Player 1
      const fourSevens = deck.filter((c) => c.rank === 7);
      const rest = deck.filter((c) => c.rank !== 7);
      const riggedDeck = [...fourSevens, ...rest.slice(0, 3), ...rest.slice(3)];

      const players = makeSeats(['human', 'bot']).map((s, idx) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        difficulty: s.difficulty,
        turnOrder: idx + 1,
        hand: [],
        books: [],
        isInactiveForAsking: false,
      }));

      const state = dealInitialHands(players, riggedDeck, {
        mode: 'vs-bots',
        direction: 'clockwise',
      });

      expect(state.players[0].books).toHaveLength(1);
      expect(state.players[0].books[0].rank).toBe(7);
      expect(state.players[0].hand).toHaveLength(3);
    });
  });

  describe('Request Validation & Card Transfers', () => {
    it('allows asking only for held ranks and forbids asking oneself', () => {
      const state = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(5));
      const p1 = state.players[0];
      const p2 = state.players[1];
      const heldRanks = getAvailableRanks(state, p1.id);
      const missingRank = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as CardRank[]).find(
        (r) => !heldRanks.includes(r)
      )!;

      expect(validateRequest(state, p1.id, p1.id, heldRanks[0]).valid).toBe(false);
      expect(validateRequest(state, p1.id, p2.id, missingRank).valid).toBe(false);
      expect(validateRequest(state, p1.id, p2.id, heldRanks[0]).valid).toBe(true);
    });

    it('transfers ALL matching cards, forms books automatically, and grants another turn', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(7));
      const customState: GoFishGameState = {
        ...base,
        players: [
          {
            ...base.players[0],
            hand: [card('spades', 7), card('hearts', 7), card('clubs', 3)],
            books: [],
          },
          {
            ...base.players[1],
            hand: [card('diamonds', 7), card('clubs', 7), card('spades', 9)],
            books: [],
          },
        ],
        drawPile: [card('hearts', 2), card('diamonds', 4)],
      };

      const res = resolveRequest(customState, 'p1', 'p2', 7);
      expect(res.ok).toBe(true);
      expect(res.state.players[0].books).toHaveLength(1);
      expect(res.state.players[0].books[0].rank).toBe(7);
      expect(res.state.players[0].hand.map((c) => c.id)).toEqual(['clubs-3']);
      expect(res.state.players[1].hand.map((c) => c.id)).toEqual(['spades-9']);
      expect(res.state.currentPlayerIndex).toBe(0);
      expect(res.state.lastOutcome?.cardsTransferred).toBe(2);
      expect(res.state.lastOutcome?.grantsAnotherTurn).toBe(true);
    });

    it('detects multiple books completed via transfer or refill', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(8));
      // Give p1 three 5s and four 8s ready to extract if checked, or p1 has three 5s and receives the 4th 5,
      // emptying p1's hand and drawing 4 Kings from the pond!
      const customState: GoFishGameState = {
        ...base,
        players: [
          {
            ...base.players[0],
            hand: [card('spades', 5), card('hearts', 5), card('diamonds', 5)],
            books: [],
          },
          {
            ...base.players[1],
            hand: [card('clubs', 5), card('spades', 2)],
            books: [],
          },
        ],
        drawPile: [
          card('spades', 13),
          card('hearts', 13),
          card('diamonds', 13),
          card('clubs', 13),
          card('hearts', 9),
        ],
      };

      const res = resolveRequest(customState, 'p1', 'p2', 5);
      expect(res.ok).toBe(true);
      expect(res.state.players[0].books.map((b) => b.rank)).toEqual([5, 13]);
      expect(res.state.players[0].hand.map((c) => c.id)).toEqual(['hearts-9']);
      expect(res.state.drawPile).toHaveLength(0);
    });
  });

  describe('Go Fish Draw & Empty Hand Rules', () => {
    it('draws 1 card on miss; keeps turn if drawn rank matches requested rank', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(9));
      const customState: GoFishGameState = {
        ...base,
        players: [
          { ...base.players[0], hand: [card('spades', 4), card('hearts', 9)], books: [] },
          { ...base.players[1], hand: [card('clubs', 6), card('diamonds', 8)], books: [] },
        ],
        drawPile: [card('diamonds', 4), card('clubs', 10)],
      };

      const matchRes = resolveRequest(customState, 'p1', 'p2', 4);
      expect(matchRes.ok).toBe(true);
      expect(matchRes.state.lastOutcome?.kind).toBe('go-fish-match');
      expect(matchRes.state.currentPlayerIndex).toBe(0);
      expect(matchRes.state.players[0].hand).toHaveLength(3);
      expect(matchRes.state.drawPile).toHaveLength(1);
    });

    it('ends turn when drawn card differs from requested rank', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(10));
      const customState: GoFishGameState = {
        ...base,
        players: [
          { ...base.players[0], hand: [card('spades', 4), card('hearts', 9)], books: [] },
          { ...base.players[1], hand: [card('clubs', 6), card('diamonds', 8)], books: [] },
        ],
        drawPile: [card('diamonds', 12), card('clubs', 10)],
      };

      const missRes = resolveRequest(customState, 'p1', 'p2', 4);
      expect(missRes.ok).toBe(true);
      expect(missRes.state.lastOutcome?.kind).toBe('go-fish-miss');
      expect(missRes.state.currentPlayerIndex).toBe(1);
      expect(missRes.state.players[0].hand).toHaveLength(3);
      expect(missRes.state.drawPile).toHaveLength(1);
    });

    it('handles empty draw pile safely and refills empty hands up to 5 cards (or remaining pond)', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(11));
      const withSmallPond: GoFishGameState = {
        ...base,
        players: [
          { ...base.players[0], hand: [], books: [] },
          { ...base.players[1], hand: [card('clubs', 6)], books: [] },
        ],
        drawPile: [card('hearts', 2), card('diamonds', 3), card('spades', 8)],
      };

      const refilled = refillEmptyHand(withSmallPond, 'p1');
      expect(refilled.players[0].hand).toHaveLength(3);
      expect(refilled.drawPile).toHaveLength(0);

      // Direct drawCard when pond has cards vs empty
      const afterDraw = drawCard(
        {
          ...base,
          players: [
            { ...base.players[0], hand: [card('spades', 4)], books: [] },
            { ...base.players[1], hand: [card('clubs', 6)], books: [] },
          ],
          drawPile: [card('hearts', 5)],
        },
        'p1'
      );
      expect(afterDraw.players[0].hand).toHaveLength(2);
      expect(afterDraw.drawPile).toHaveLength(0);

      // Failed request when pond is already empty advances turn safely
      const emptyPondState: GoFishGameState = {
        ...base,
        players: [
          { ...base.players[0], hand: [card('spades', 4)], books: [] },
          { ...base.players[1], hand: [card('clubs', 6)], books: [] },
        ],
        drawPile: [],
      };
      const missEmpty = resolveRequest(emptyPondState, 'p1', 'p2', 4);
      expect(missEmpty.ok).toBe(true);
      expect(missEmpty.state.lastOutcome?.kind).toBe('go-fish-empty-pond');
      expect(missEmpty.state.currentPlayerIndex).toBe(1);
    });

    it('marks a player inactive for asking when hand empties and draw pile is empty', () => {
      const base = createGoFishGame(
        makeConfig(['human', 'bot', 'bot']),
        deterministicRng(12)
      );
      const customState: GoFishGameState = {
        ...base,
        players: [
          { ...base.players[0], hand: [card('spades', 7), card('hearts', 7), card('diamonds', 7)], books: [] },
          { ...base.players[1], hand: [card('clubs', 7)], books: [] },
          { ...base.players[2], hand: [card('spades', 9), card('hearts', 10)], books: [] },
        ],
        drawPile: [],
      };

      // p1 takes clubs-7 from p2 -> both p1 and p2 empty out with empty pond!
      const res = resolveRequest(customState, 'p1', 'p2', 7);
      expect(res.ok).toBe(true);
      expect(res.state.players[0].isInactiveForAsking).toBe(true);
      expect(res.state.players[1].isInactiveForAsking).toBe(true);
      expect(res.state.status).toBe('GAME_OVER'); // only p3 has cards and pond is empty -> safe endgame
    });
  });

  describe('Bot Intelligence, Memory & Anti-Cheating', () => {
    it('creates BotObservation without exposing opponent hands or undealt drawPile', () => {
      const state = createGoFishGame(
        makeConfig(['human', 'bot', 'bot'], {
          seats: [
            { id: 'p1', type: 'human', name: 'Player 1', difficulty: 'normal' },
            { id: 'b1', type: 'bot', name: 'Bot 1', difficulty: 'hard' },
            { id: 'b2', type: 'bot', name: 'Bot 2', difficulty: 'normal' },
          ],
        }),
        deterministicRng(20)
      );

      const obs = createBotObservation(state, 'b1') as unknown as Record<string, unknown>;
      expect(obs.drawPile).toBeUndefined();
      expect(obs.drawPileCount).toBe(state.drawPile.length);
      const obsPlayers = obs.players as Record<string, unknown>[];
      expect(obsPlayers.every((p) => p.hand === undefined)).toBe(true);
    });

    it('Normal and Hard bots use public memory to ask opponents known to hold a rank', () => {
      const base = createGoFishGame(
        makeConfig(['human', 'bot', 'bot'], {
          seats: [
            { id: 'p1', type: 'human', name: 'Player 1', difficulty: 'normal' },
            { id: 'b1', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
            { id: 'b2', type: 'bot', name: 'Bot 2', difficulty: 'hard' },
          ],
        }),
        deterministicRng(21)
      );

      // Suppose p1 previously asked b2 for 9s on turn 3 (proving p1 holds 9s),
      // while b2 holds 2s & 9s and p1 has cards. Hard/Normal bot b1 holding 9 & 2 should target p1 for 9s!
      const memoryState: GoFishGameState = {
        ...base,
        currentPlayerIndex: 1,
        turnNumber: 4,
        phase: 'bot-thinking',
        players: [
          { ...base.players[0], hand: [card('spades', 9), card('hearts', 4)], books: [] },
          { ...base.players[1], hand: [card('diamonds', 9), card('clubs', 2)], books: [] },
          { ...base.players[2], hand: [card('clubs', 5), card('hearts', 6)], books: [] },
        ],
        memory: {
          playerId: 'public-table',
          successfulRequests: [],
          failedRequests: [
            { requesterId: 'p1', opponentId: 'b2', rank: 9, turnNumber: 3 },
          ],
          knownBookCollections: [],
        },
      };

      const obsNormal = createBotObservation(memoryState, 'b1');
      const normalAction = selectBotAction(obsNormal, 'normal', deterministicRng(22));
      expect(normalAction).toEqual({ opponentId: 'p1', rank: 9 });

      const hardAction = selectBotAction(obsNormal, 'hard', deterministicRng(23));
      expect(hardAction).toEqual({ opponentId: 'p1', rank: 9 });

      const easyAction = selectBotAction(obsNormal, 'easy', deterministicRng(24));
      expect(['p1', 'b2']).toContain(easyAction.opponentId);
      expect([2, 9]).toContain(easyAction.rank);
    });

    it('bots never act after game completion', () => {
      const state = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(25));
      const finishedState: GoFishGameState = {
        ...state,
        status: 'GAME_OVER',
        phase: 'game-completed',
        currentPlayerIndex: 1,
      };
      const botRes = executeBotTurnStep(finishedState, deterministicRng(26));
      expect(botRes.ok).toBe(false);
    });
  });

  describe('Pass and Play Privacy & Turn Rotation', () => {
    it('hides hands during Pass-and-Play handover and reveals only after Ready', () => {
      const state = createGoFishGame(
        makeConfig(['human', 'human'], { mode: 'pass-and-play' }),
        deterministicRng(30)
      );

      // Force p1 to miss so turn advances to p2
      const rigged: GoFishGameState = {
        ...state,
        players: [
          { ...state.players[0], hand: [card('spades', 2), card('hearts', 3)], books: [] },
          { ...state.players[1], hand: [card('clubs', 4), card('diamonds', 5)], books: [] },
        ],
        drawPile: [card('hearts', 10)],
      };

      const missRes = resolveRequest(rigged, 'p1', 'p2', 2);
      expect(missRes.ok).toBe(true);
      expect(missRes.state.pendingTurnAdvance).toBe(true);

      // Player 1 can see what they drew before handing over
      const prePassView = getPublicGoFishView(missRes.state);
      expect(prePassView.lastOutcome?.drawnCard?.id).toBe('hearts-10');

      const ackRes = acknowledgeTurnEnd(missRes.state);
      expect(ackRes.ok).toBe(true);
      expect(ackRes.state.awaitingPassConfirmation).toBe(true);
      expect(ackRes.state.currentPlayerIndex).toBe(1);

      const hiddenView = getPublicGoFishView(ackRes.state);
      expect(hiddenView.visibleHand).toBeNull();
      expect(hiddenView.lastOutcome?.drawnCard).toBeNull();
      expect(hiddenView.lastOutcome?.message).not.toContain('10');

      const readyRes = confirmPassDevice(ackRes.state);
      expect(readyRes.ok).toBe(true);
      const revealedView = getPublicGoFishView(readyRes.state);
      expect(revealedView.visibleHand?.map((c) => c.id)).toEqual([
        'clubs-4',
        'diamonds-5',
      ]);
    });

    it('supports anticlockwise turn rotation across 3 players', () => {
      const state = createGoFishGame(
        makeConfig(['human', 'bot', 'bot'], { direction: 'anticlockwise' }),
        deterministicRng(31)
      );
      const rigged: GoFishGameState = {
        ...state,
        players: [
          { ...state.players[0], hand: [card('spades', 2)], books: [] },
          { ...state.players[1], hand: [card('clubs', 4)], books: [] },
          { ...state.players[2], hand: [card('diamonds', 5)], books: [] },
        ],
        drawPile: [card('hearts', 10)],
      };

      const res = resolveRequest(rigged, 'p1', 'p2', 2);
      expect(res.ok).toBe(true);
      expect(res.state.currentPlayerIndex).toBe(2); // 0 -> 2 in anticlockwise
    });
  });

  describe('Victory, Ties & Stalemate Detection', () => {
    it('ends the game on all 13 books and detects ties accurately', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(40));
      const allSuits: StandardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
      const makeBook = (rank: CardRank) => ({
        rank,
        cards: allSuits.map((s) => card(s, rank)),
        completedOnTurn: 1,
      });

      const p1Books = ([1, 2, 3, 4, 5, 6] as CardRank[]).map(makeBook);
      const p2Books = ([8, 9, 10, 11, 12, 13] as CardRank[]).map(makeBook);

      const nearEnd: GoFishGameState = {
        ...base,
        players: [
          {
            ...base.players[0],
            hand: [card('spades', 7), card('hearts', 7), card('diamonds', 7)],
            books: p1Books,
          },
          {
            ...base.players[1],
            hand: [card('clubs', 7)],
            books: p2Books,
          },
        ],
        drawPile: [],
      };

      const res = resolveRequest(nearEnd, 'p1', 'p2', 7);
      expect(res.ok).toBe(true);
      expect(res.state.status).toBe('GAME_OVER');
      expect(res.state.winnerIds).toEqual(['p1']);
      expect(res.state.isTie).toBe(false);
      expect(res.state.standings[0].bookCount).toBe(7);

      // Post-game requests must be blocked
      const postGame = resolveRequest(res.state, 'p1', 'p2', 7);
      expect(postGame.ok).toBe(false);
    });

    it('declares a tie when multiple players finish with the highest book count and detects stalemate', () => {
      const base = createGoFishGame(makeConfig(['human', 'bot']), deterministicRng(41));
      const allSuits: StandardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
      const makeBook = (rank: CardRank) => ({
        rank,
        cards: allSuits.map((s) => card(s, rank)),
        completedOnTurn: 1,
      });

      // Stalemate: Pond is empty, each player holds cards the other does not, both hold 5 books each
      const stalemateReady: GoFishGameState = {
        ...base,
        players: [
          {
            ...base.players[0],
            hand: [card('spades', 2), card('hearts', 2)],
            books: ([3, 4, 5, 6, 7] as CardRank[]).map(makeBook),
          },
          {
            ...base.players[1],
            hand: [card('diamonds', 2), card('clubs', 8)],
            books: ([9, 10, 11, 12, 13] as CardRank[]).map(makeBook),
          },
        ],
        drawPile: [],
      };

      // Turn 1: p1 asks p2 for 8? No, p1 holds 2, let's make p1 hold 1 and p2 hold 8 so both miss
      const pureMissState: GoFishGameState = {
        ...stalemateReady,
        players: [
          { ...stalemateReady.players[0], hand: [card('spades', 1)] },
          { ...stalemateReady.players[1], hand: [card('clubs', 8)] },
        ],
      };

      const turn1 = resolveRequest(pureMissState, 'p1', 'p2', 1);
      expect(turn1.ok).toBe(true);
      expect(turn1.state.status).toBe('PLAYING');

      const turn2 = resolveRequest(turn1.state, 'p2', 'p1', 8);
      expect(turn2.ok).toBe(true);
      expect(turn2.state.status).toBe('GAME_OVER');
      expect(turn2.state.isStalemate).toBe(true);
      expect(turn2.state.isTie).toBe(true);
      expect(turn2.state.winnerIds).toEqual(['p1', 'p2']);
    });

    it('shuffled deck preserves all 52 unique cards', () => {
      const shuffled = shuffleDeck(createDeck(), deterministicRng(99));
      expect(shuffled).toHaveLength(52);
      expect(new Set(shuffled.map((c) => c.id)).size).toBe(52);
    });
  });
});
