import { describe, expect, it } from 'vitest';
import {
  addCardsToSet,
  chooseBotNextAction,
  confirmPassDevice,
  createDeck,
  createGame,
  dealHands,
  discardCard,
  drawCard,
  executeFullBotTurn,
  getPublicTableView,
  playNewSet,
  replaceJokerInSet,
  shuffleDeck,
  validateAddToSet,
  validateConsecutiveRun,
  validateMatchingSet,
  validateNewSet,
  validateReplaceJoker,
} from '../index';
import type { GameState, JokerCard, PlayingCard, StandardCard, TableSet } from '../types';
import { DEFAULT_SEVENS_RULES } from '../gameEngine';

const std = (rank: StandardCard['rank'], suit: StandardCard['suit']): StandardCard => ({
  id: `${suit}-${rank}`,
  kind: 'standard',
  rank,
  suit,
});

const joker = (jokerIndex: 1 | 2): JokerCard => ({
  id: `joker-${jokerIndex}`,
  kind: 'joker',
  jokerIndex,
});

function createDeterministicRng(seed = 42): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('Sevens Deck, Shuffling, and Dealing', () => {
  it('generates a 54-card deck with 52 standard cards and 2 Jokers', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(54);
    expect(deck.filter((c) => c.kind === 'standard')).toHaveLength(52);
    expect(deck.filter((c) => c.kind === 'joker')).toHaveLength(2);
    expect(new Set(deck.map((c) => c.id)).size).toBe(54);
  });

  it('shuffles the deck without losing or duplicating cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck, createDeterministicRng(7));
    expect(shuffled).toHaveLength(54);
    expect(new Set(shuffled.map((c) => c.id)).size).toBe(54);
    expect(shuffled.map((c) => c.id)).not.toEqual(deck.map((c) => c.id));
  });

  it.each([
    [2, 7],
    [2, 11],
    [3, 7],
    [3, 11],
    [4, 7],
    [4, 11],
  ] as const)('deals %i-card hands for %i players accurately', (playerCount, handSize) => {
    const deck = shuffleDeck(createDeck(), createDeterministicRng(99));
    const { hands, remainingDeck } = dealHands(deck, playerCount, handSize);

    expect(hands).toHaveLength(playerCount);
    for (const hand of hands) {
      expect(hand).toHaveLength(handSize);
    }
    expect(remainingDeck).toHaveLength(54 - playerCount * handSize);

    const allDealtIds = new Set([...hands.flat(), ...remainingDeck].map((c) => c.id));
    expect(allDealtIds.size).toBe(54);
  });
});

describe('Set and Run Validation', () => {
  it('validates matching sets of 3 or 4 cards with distinct suits', () => {
    expect(
      validateMatchingSet([std(8, 'diamonds'), std(8, 'hearts'), std(8, 'spades')]).valid
    ).toBe(true);
    expect(
      validateMatchingSet([
        std(3, 'diamonds'),
        std(3, 'hearts'),
        std(3, 'clubs'),
        std(3, 'spades'),
      ]).valid
    ).toBe(true);
  });

  it('validates consecutive runs of same suit including Ace-low and Ace-high', () => {
    expect(
      validateConsecutiveRun([std(3, 'diamonds'), std(4, 'diamonds'), std(5, 'diamonds')]).valid
    ).toBe(true);
    expect(
      validateConsecutiveRun([
        std(7, 'hearts'),
        std(8, 'hearts'),
        std(9, 'hearts'),
        std(10, 'hearts'),
      ]).valid
    ).toBe(true);
    expect(
      validateConsecutiveRun([std(1, 'clubs'), std(2, 'clubs'), std(3, 'clubs')]).valid
    ).toBe(true);
    expect(
      validateConsecutiveRun([std(12, 'spades'), std(13, 'spades'), std(1, 'spades')]).valid
    ).toBe(true);
  });

  it('rejects invalid sets, mixed suits in runs, wrap-arounds, and <3 cards', () => {
    expect(validateNewSet([std(8, 'diamonds'), std(8, 'hearts')]).valid).toBe(false);
    expect(
      validateNewSet([std(3, 'diamonds'), std(4, 'hearts'), std(5, 'diamonds')]).valid
    ).toBe(false);
    expect(
      validateNewSet([std(3, 'diamonds'), std(5, 'diamonds'), std(6, 'diamonds')]).valid
    ).toBe(false);
    expect(
      validateConsecutiveRun([std(13, 'hearts'), std(1, 'hearts'), std(2, 'hearts')]).valid
    ).toBe(false);
  });
});

describe('Joker Substitution and Replacement', () => {
  it('allows Jokers to complete matching sets and bridge gaps in runs', () => {
    const matchingWithJoker = validateNewSet([
      std(8, 'diamonds'),
      std(8, 'hearts'),
      std(8, 'spades'),
      joker(1),
    ]);
    expect(matchingWithJoker.valid).toBe(true);
    expect(matchingWithJoker.setType).toBe('matching');

    const runWithGapJoker = validateNewSet([
      std(3, 'diamonds'),
      std(5, 'diamonds'),
      joker(2),
    ]);
    expect(runWithGapJoker.valid).toBe(true);
    expect(runWithGapJoker.setType).toBe('run');
  });

  it('validates legal Joker replacement and rejects illegal replacement', () => {
    const matchingSet: TableSet = {
      id: 'set-1',
      type: 'matching',
      cards: [std(8, 'diamonds'), std(8, 'hearts'), std(8, 'spades'), joker(1)],
      createdByPlayerId: 'player-1',
      createdTurn: 1,
    };

    const legal = validateReplaceJoker(matchingSet, std(8, 'clubs'));
    expect(legal.valid).toBe(true);
    expect(legal.retrievedJoker?.id).toBe('joker-1');

    const illegalWrongRank = validateReplaceJoker(matchingSet, std(9, 'clubs'));
    expect(illegalWrongRank.valid).toBe(false);

    const runSet: TableSet = {
      id: 'set-2',
      type: 'run',
      cards: [std(3, 'diamonds'), joker(2), std(5, 'diamonds')],
      createdByPlayerId: 'player-1',
      createdTurn: 1,
    };

    const legalRunSwap = validateReplaceJoker(runSet, std(4, 'diamonds'));
    expect(legalRunSwap.valid).toBe(true);
    expect(legalRunSwap.retrievedJoker?.id).toBe('joker-2');

    const illegalRunSwap = validateReplaceJoker(runSet, std(6, 'diamonds'));
    expect(illegalRunSwap.valid).toBe(false);
  });

  it('respects configurable Joker reuse and extension toggles', () => {
    const customState: GameState = {
      ...createGame({
        playerCount: 2,
        handSize: 7,
        mode: 'vs-bots',
        rules: { allowImmediateJokerReuse: false, allowExtendJokerSets: false },
      }),
      phase: 'PLAY',
      awaitingPassConfirmation: false,
      players: [
        {
          id: 'player-1',
          name: 'You',
          type: 'human',
          hand: [std(8, 'clubs'), std(9, 'diamonds'), std(9, 'hearts'), std(2, 'spades')],
        },
        {
          id: 'player-2',
          name: 'Bot 1',
          type: 'bot',
          hand: [std(4, 'clubs')],
        },
      ],
      tableSets: [
        {
          id: 'set-1',
          type: 'matching',
          cards: [std(8, 'diamonds'), std(8, 'hearts'), joker(1)],
          createdByPlayerId: 'player-1',
          createdTurn: 1,
        },
      ],
    };

    // Extending a set containing a Joker is blocked when allowExtendJokerSets is false
    expect(
      validateAddToSet(customState.tableSets[0], [std(8, 'clubs')], customState.rules).valid
    ).toBe(false);

    // Replacing the Joker retrieves it, and reusing it immediately is blocked
    const swapped = replaceJokerInSet(customState, 'set-1', 'clubs-8');
    expect(swapped.ok).toBe(true);
    expect(swapped.state.players[0].hand.some((c) => c.id === 'joker-1')).toBe(true);

    const immediateReuse = playNewSet(swapped.state, ['diamonds-9', 'hearts-9', 'joker-1']);
    expect(immediateReuse.ok).toBe(false);
    expect(immediateReuse.error).toMatch(/retrieved Joker/i);
  });
});

describe('Turn Rules, One-New-Set Restriction, Drawing, Discarding, and Winning', () => {
  it('enforces maximum of one new set per turn while permitting additions to existing sets', () => {
    const base = createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' });
    const state: GameState = {
      ...base,
      phase: 'PLAY',
      awaitingPassConfirmation: false,
      players: [
        {
          id: 'player-1',
          name: 'You',
          type: 'human',
          hand: [
            std(8, 'diamonds'),
            std(8, 'hearts'),
            std(8, 'spades'),
            std(3, 'clubs'),
            std(4, 'clubs'),
            std(5, 'clubs'),
            std(8, 'clubs'),
            std(2, 'hearts'),
          ],
        },
        base.players[1],
      ],
    };

    const firstSet = playNewSet(state, ['diamonds-8', 'hearts-8', 'spades-8']);
    expect(firstSet.ok).toBe(true);
    expect(firstSet.state.hasCreatedNewSetThisTurn).toBe(true);

    const secondNewSet = playNewSet(firstSet.state, ['clubs-3', 'clubs-4', 'clubs-5']);
    expect(secondNewSet.ok).toBe(false);
    expect(secondNewSet.error).toMatch(/one new set per turn/i);

    // Adding a card to the existing set on the same turn MUST succeed
    const added = addCardsToSet(
      firstSet.state,
      firstSet.state.tableSets[0].id,
      ['clubs-8']
    );
    expect(added.ok).toBe(true);
    expect(added.state.tableSets[0].cards).toHaveLength(4);
  });

  it('requires draw before discard, rotates turns, and declares winner when hand reaches zero', () => {
    let state = createGame(
      { playerCount: 3, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(12)
    );

    // Cannot discard before drawing
    const earlyDiscard = discardCard(state, state.players[0].hand[0].id);
    expect(earlyDiscard.ok).toBe(false);

    const drawn = drawCard(state, 'draw-pile', createDeterministicRng(12));
    expect(drawn.ok).toBe(true);
    expect(drawn.state.phase).toBe('PLAY');

    const cardToDiscard = drawn.state.players[0].hand[0];
    const discarded = discardCard(drawn.state, cardToDiscard.id);
    expect(discarded.ok).toBe(true);
    expect(discarded.state.currentPlayerIndex).toBe(1);
    expect(discarded.state.phase).toBe('DRAW');

    // Winning condition via final discard
    const nearWinState: GameState = {
      ...discarded.state,
      currentPlayerIndex: 0,
      phase: 'PLAY',
      players: [
        { id: 'player-1', name: 'You', type: 'human', hand: [std(7, 'spades')] },
        discarded.state.players[1],
        discarded.state.players[2],
      ],
    };

    const winMove = discardCard(nearWinState, 'spades-7');
    expect(winMove.ok).toBe(true);
    expect(winMove.state.status).toBe('GAME_OVER');
    expect(winMove.state.winnerId).toBe('player-1');
  });

  it('recycles discard pile cleanly if draw pile is exhausted', () => {
    const state: GameState = {
      ...createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' }),
      drawPile: [],
      discardPile: [std(2, 'clubs'), std(3, 'clubs'), std(9, 'hearts')],
      phase: 'DRAW',
    };

    const drawn = drawCard(state, 'draw-pile', createDeterministicRng(5));
    expect(drawn.ok).toBe(true);
    expect(drawn.state.phase).toBe('PLAY');
    expect(drawn.state.discardPile).toHaveLength(1);
    expect(drawn.state.discardPile[0].id).toBe('hearts-9');
  });
});

describe('Pass and Play Privacy & Game Reset', () => {
  it('hides player hands until Ready confirmation and never leaks opponent hands', () => {
    const state = createGame(
      { playerCount: 2, handSize: 7, mode: 'pass-and-play' },
      createDeterministicRng(3)
    );

    expect(state.awaitingPassConfirmation).toBe(true);
    expect(getPublicTableView(state).visibleHand).toBeNull();

    const confirmed = confirmPassDevice(state);
    expect(confirmed.ok).toBe(true);
    expect(confirmed.state.awaitingPassConfirmation).toBe(false);
    expect(getPublicTableView(confirmed.state).visibleHand).toHaveLength(7);

    const afterDraw = drawCard(confirmed.state, 'draw-pile').state;
    const afterDiscard = discardCard(afterDraw, afterDraw.players[0].hand[0].id).state;

    // Switching to Player 2 MUST immediately hide hands again
    expect(afterDiscard.currentPlayerIndex).toBe(1);
    expect(afterDiscard.awaitingPassConfirmation).toBe(true);
    expect(getPublicTableView(afterDiscard).visibleHand).toBeNull();
  });

  it('resets game state cleanly on new createGame call', () => {
    const fresh = createGame({ playerCount: 4, handSize: 11, mode: 'vs-bots' });
    expect(fresh.status).toBe('PLAYING');
    expect(fresh.tableSets).toHaveLength(0);
    expect(fresh.turnNumber).toBe(1);
    expect(fresh.players).toHaveLength(4);
    expect(fresh.players.every((p) => p.hand.length === 11)).toBe(true);
  });
});

describe('Bot Strategy Priorities and Constraints', () => {
  it('prioritises matching sets over consecutive runs and never creates more than one new set per turn', () => {
    const base = createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' });
    const botTurnState: GameState = {
      ...base,
      currentPlayerIndex: 1,
      phase: 'PLAY',
      awaitingPassConfirmation: false,
      players: [
        base.players[0],
        {
          id: 'player-2',
          name: 'Bot 1',
          type: 'bot',
          hand: [
            // Both a valid matching set AND a valid consecutive run!
            std(8, 'diamonds'),
            std(8, 'hearts'),
            std(8, 'spades'),
            std(3, 'clubs'),
            std(4, 'clubs'),
            std(5, 'clubs'),
            std(13, 'spades'),
          ],
        },
      ],
    };

    const action = chooseBotNextAction(botTurnState);
    expect(action?.type).toBe('PLAY_NEW_SET');
    if (action?.type === 'PLAY_NEW_SET') {
      expect(action.cardIds.sort()).toEqual(['diamonds-8', 'hearts-8', 'spades-8']);
    }

    // Execute entire bot turn and verify ONLY 1 new set was created
    const afterBotTurn = executeFullBotTurn(
      {
        ...botTurnState,
        phase: 'DRAW',
      },
      createDeterministicRng(15)
    );

    expect(afterBotTurn.tableSets).toHaveLength(1);
    expect(afterBotTurn.tableSets[0].type).toBe('matching');
    expect(afterBotTurn.currentPlayerIndex).toBe(0);
  });

  it('bot replaces Jokers, extends existing sets, and discards strategic low-utility card', () => {
    const base = createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' });
    const botState: GameState = {
      ...base,
      currentPlayerIndex: 1,
      phase: 'PLAY',
      hasCreatedNewSetThisTurn: true,
      rules: DEFAULT_SEVENS_RULES,
      tableSets: [
        {
          id: 'set-1',
          type: 'matching',
          cards: [std(6, 'diamonds'), std(6, 'hearts'), std(6, 'spades'), joker(1)],
          createdByPlayerId: 'player-1',
          createdTurn: 1,
        },
      ],
      players: [
        base.players[0],
        {
          id: 'player-2',
          name: 'Bot 1',
          type: 'bot',
          hand: [std(6, 'clubs'), std(10, 'hearts'), std(10, 'spades'), std(2, 'clubs')],
        },
      ],
    };

    const firstAction = chooseBotNextAction(botState);
    expect(firstAction).toEqual({
      type: 'REPLACE_JOKER',
      setId: 'set-1',
      cardId: 'clubs-6',
    });

    const completed = executeFullBotTurn(botState, createDeterministicRng(21));
    // Bot retrieved Joker and kept pair of 10s; isolated 2♣ should be discarded
    expect(completed.discardPile[completed.discardPile.length - 1].id).toBe('clubs-2');
    expect(completed.currentPlayerIndex).toBe(0);
  });
});
