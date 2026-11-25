import { describe, expect, it } from 'vitest';
import {
  addCardsToSet,
  chooseBotNextAction,
  confirmPassDevice,
  createDeck,
  createGame,
  dealHands,
  detectAndApplyVictory,
  discardCard,
  drawCard,
  drawFromDeck,
  drawFromDiscard,
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

describe('Drawing Mechanics: Draw Pile vs. Top Discard Pile', () => {
  it('draws exactly one card from the draw pile and blocks drawing again the same turn', () => {
    const initial = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(10)
    );
    const startingDrawCount = initial.drawPile.length;
    const startingHandCount = initial.players[0].hand.length;

    const firstDraw = drawFromDeck(initial, createDeterministicRng(10));
    expect(firstDraw.ok).toBe(true);
    expect(firstDraw.state.phase).toBe('PLAY');
    expect(firstDraw.state.hasDrawnThisTurn).toBe(true);
    expect(firstDraw.state.lastDrawSource).toBe('draw-pile');
    expect(firstDraw.state.drawPile).toHaveLength(startingDrawCount - 1);
    expect(firstDraw.state.players[0].hand).toHaveLength(startingHandCount + 1);

    // Cannot draw from deck or discard again in the same turn
    const secondDeckDraw = drawFromDeck(firstDraw.state);
    expect(secondDeckDraw.ok).toBe(false);
    expect(secondDeckDraw.error).toMatch(/already drawn/i);

    const secondDiscardDraw = drawFromDiscard(firstDraw.state);
    expect(secondDiscardDraw.ok).toBe(false);
    expect(secondDiscardDraw.error).toMatch(/already drawn/i);
  });

  it('draws only the top card of the discard pile and preserves cards underneath', () => {
    const base = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(22)
    );
    const state: GameState = {
      ...base,
      discardPile: [std(2, 'clubs'), std(4, 'hearts'), std(9, 'spades')],
      phase: 'DRAW',
      hasDrawnThisTurn: false,
    };

    const taken = drawFromDiscard(state);
    expect(taken.ok).toBe(true);
    expect(taken.state.phase).toBe('PLAY');
    expect(taken.state.hasDrawnThisTurn).toBe(true);
    expect(taken.state.lastDrawSource).toBe('discard-pile');
    expect(taken.state.players[0].hand.some((c) => c.id === 'spades-9')).toBe(true);
    expect(taken.state.discardPile.map((c) => c.id)).toEqual(['clubs-2', 'hearts-4']);
  });

  it('rejects drawing from empty piles cleanly without mutating state', () => {
    const base = createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' });
    const emptyState: GameState = {
      ...base,
      drawPile: [],
      discardPile: [],
      phase: 'DRAW',
      hasDrawnThisTurn: false,
    };

    const emptyDiscardResult = drawFromDiscard(emptyState);
    expect(emptyDiscardResult.ok).toBe(false);
    expect(emptyDiscardResult.error).toMatch(/discard pile is empty/i);
    expect(emptyDiscardResult.state).toBe(emptyState);

    const emptyDeckResult = drawFromDeck(emptyState);
    expect(emptyDeckResult.ok).toBe(false);
    expect(emptyDeckResult.error).toMatch(/no cards remain/i);
    expect(emptyDeckResult.state).toBe(emptyState);
  });
});

describe('Persistent Victory Detection and Post-Game Locks', () => {
  it('detects human victory, preserves final board state, and blocks subsequent turns', () => {
    const base = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(33)
    );
    const tableSet: TableSet = {
      id: 'set-final',
      type: 'matching',
      cards: [std(7, 'diamonds'), std(7, 'hearts'), std(7, 'clubs')],
      createdByPlayerId: 'player-1',
      createdTurn: 3,
    };
    const state: GameState = {
      ...base,
      phase: 'PLAY',
      hasDrawnThisTurn: true,
      tableSets: [tableSet],
      players: [
        { id: 'player-1', name: 'You', type: 'human', hand: [std(7, 'spades')] },
        {
          id: 'player-2',
          name: 'Bot 1',
          type: 'bot',
          hand: [std(2, 'clubs'), std(9, 'diamonds')],
        },
      ],
    };

    const won = addCardsToSet(state, 'set-final', ['spades-7']);
    expect(won.ok).toBe(true);
    expect(won.state.status).toBe('GAME_OVER');
    expect(won.state.winnerId).toBe('player-1');
    expect(won.state.winnerType).toBe('human');
    expect(won.state.lastActionSummary).toBe('Congratulations! You won Sevens!');
    expect(won.state.standings).toEqual([
      {
        rank: 1,
        playerId: 'player-1',
        name: 'You',
        type: 'human',
        cardsRemaining: 0,
        isWinner: true,
      },
      {
        rank: 2,
        playerId: 'player-2',
        name: 'Bot 1',
        type: 'bot',
        cardsRemaining: 2,
        isWinner: false,
      },
    ]);

    // Final table sets remain preserved in public view
    const publicView = getPublicTableView(won.state);
    expect(publicView.tableSets).toHaveLength(1);
    expect(publicView.tableSets[0].cards).toHaveLength(4);
    expect(publicView.winner?.id).toBe('player-1');

    // Subsequent actions and repeated victory calls are blocked / no-op
    expect(drawFromDeck(won.state).ok).toBe(false);
    expect(drawFromDiscard(won.state).ok).toBe(false);
    expect(discardCard(won.state, 'clubs-2').ok).toBe(false);
    expect(chooseBotNextAction(won.state)).toBeNull();
    expect(detectAndApplyVictory(won.state)).toBe(won.state);
  });

  it('detects bot victory and records bot winner metadata cleanly', () => {
    const base = createGame({ playerCount: 2, handSize: 7, mode: 'vs-bots' });
    const botNearWin: GameState = {
      ...base,
      currentPlayerIndex: 1,
      phase: 'PLAY',
      hasDrawnThisTurn: true,
      players: [
        { id: 'player-1', name: 'You', type: 'human', hand: [std(4, 'spades'), std(9, 'clubs')] },
        { id: 'player-2', name: 'Bot 1', type: 'bot', hand: [std(12, 'hearts')] },
      ],
    };

    const botWon = executeFullBotTurn(botNearWin, createDeterministicRng(50));
    expect(botWon.status).toBe('GAME_OVER');
    expect(botWon.winnerId).toBe('player-2');
    expect(botWon.winnerType).toBe('bot');
    expect(botWon.lastActionSummary).toBe('Game Over! Bot 1 (Bot) has won!');
    expect(botWon.standings[0].isWinner).toBe(true);
    expect(botWon.standings[0].type).toBe('bot');
    expect(chooseBotNextAction(botWon)).toBeNull();
  });
});

describe('Drawn Card Tracking, Bot Move Feed, and Post-Game Replay', () => {
  it('tracks drawnCardId for the active human turn and clears it on play or discard', () => {
    const initial = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(17)
    );
    expect(getPublicTableView(initial).drawnCardId).toBeNull();

    const afterDraw = drawFromDeck(initial, createDeterministicRng(17));
    expect(afterDraw.ok).toBe(true);
    const drawnId = afterDraw.state.lastDrawnCardId;
    expect(drawnId).toBeTruthy();
    expect(getPublicTableView(afterDraw.state).drawnCardId).toBe(drawnId);

    // Discarding the drawn card clears drawnCardId
    const afterDiscard = discardCard(afterDraw.state, drawnId!);
    expect(afterDiscard.ok).toBe(true);
    expect(afterDiscard.state.lastDrawnCardId).toBeNull();
    expect(getPublicTableView(afterDiscard.state).drawnCardId).toBeNull();
  });

  it('hides drawnCardId when Pass-and-Play confirmation is pending', () => {
    const state = createGame(
      { playerCount: 2, handSize: 7, mode: 'pass-and-play' },
      createDeterministicRng(19)
    );
    expect(getPublicTableView(state).drawnCardId).toBeNull();

    const confirmed = confirmPassDevice(state).state;
    const drawn = drawFromDiscard(confirmed);
    expect(drawn.ok).toBe(true);
    expect(getPublicTableView(drawn.state).drawnCardId).toBe(drawn.state.lastDrawnCardId);
  });

  it('records bot moves in botTurnFeed without leaking deck draws and resets on human discard', () => {
    const base = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(23)
    );
    const botTurnState: GameState = {
      ...base,
      currentPlayerIndex: 1,
      phase: 'DRAW',
      players: [
        base.players[0],
        {
          id: 'player-2',
          name: 'Bot 1',
          type: 'bot',
          hand: [
            std(9, 'clubs'),
            std(9, 'diamonds'),
            std(9, 'hearts'),
            std(2, 'spades'),
          ],
        },
      ],
    };

    const afterBot = executeFullBotTurn(botTurnState, createDeterministicRng(23));
    expect(afterBot.botTurnFeed.length).toBeGreaterThanOrEqual(3);
    expect(afterBot.botTurnFeed.map((e) => e.actionType)).toContain('PLAY_NEW_SET');
    expect(afterBot.botTurnFeed.map((e) => e.actionType)).toContain('DISCARD');

    // Deck draws in live bot feed must not reveal the exact drawn card face
    const deckFeedEntry = afterBot.botTurnFeed.find((e) => e.actionType === 'DRAW_DECK');
    if (deckFeedEntry) {
      expect(deckFeedEntry.description).toBe('Bot 1 drew a card from the draw pile.');
    }

    // Human finishes their turn -> botTurnFeed clears cleanly for the next round
    const humanDrawn = drawFromDeck(afterBot, createDeterministicRng(23)).state;
    const humanCard = humanDrawn.players[0].hand.find((c) => c.kind === 'standard')!;
    const afterHumanDiscard = discardCard(humanDrawn, humanCard.id).state;
    expect(afterHumanDiscard.botTurnFeed).toEqual([]);
  });

  it('keeps replayFrames locked during active play and reveals full bot hands once GAME_OVER', () => {
    const base = createGame(
      { playerCount: 2, handSize: 7, mode: 'vs-bots' },
      createDeterministicRng(31)
    );

    // Locked while PLAYING
    expect(getPublicTableView(base).replayFrames).toBeNull();
    expect(base.replayFrames[0].actionType).toBe('START');

    const botNearWin: GameState = {
      ...base,
      currentPlayerIndex: 1,
      phase: 'PLAY',
      hasDrawnThisTurn: true,
      players: [
        { id: 'player-1', name: 'You', type: 'human', hand: [std(4, 'spades'), std(5, 'clubs')] },
        { id: 'player-2', name: 'Bot 1', type: 'bot', hand: [std(12, 'hearts')] },
      ],
    };

    const botWon = executeFullBotTurn(botNearWin, createDeterministicRng(31));
    expect(botWon.status).toBe('GAME_OVER');

    const unlockedView = getPublicTableView(botWon);
    expect(unlockedView.replayFrames).not.toBeNull();
    const frames = unlockedView.replayFrames!;
    expect(frames[frames.length - 1].actionType).toBe('VICTORY');

    // Replay exposes every bot's hand at each step for post-game review
    const botSnapshotInStart = frames[0].players.find((p) => p.type === 'bot');
    expect(botSnapshotInStart?.hand).toHaveLength(7);
  });
});

describe('Mixed Pass-and-Play with Optional Bots', () => {
  it('supports 2 humans + 1 bot, triggers pass screens for humans, skips pass screen for bots, and never leaks bot hands', () => {
    const initial = createGame(
      {
        playerCount: 3,
        handSize: 7,
        mode: 'pass-and-play',
        playerTypes: ['human', 'human', 'bot'],
        playerNames: ['Amina', 'Zain', 'Bot 1'],
      },
      createDeterministicRng(77)
    );

    expect(initial.players.map((p) => ({ name: p.name, type: p.type }))).toEqual([
      { name: 'Amina', type: 'human' },
      { name: 'Zain', type: 'human' },
      { name: 'Bot 1', type: 'bot' },
    ]);
    expect(initial.awaitingPassConfirmation).toBe(true);
    expect(getPublicTableView(initial).visibleHand).toBeNull();

    // Human 1 (Amina) confirms and completes turn
    const p1Ready = confirmPassDevice(initial).state;
    const p1Draw = drawFromDeck(p1Ready, createDeterministicRng(77)).state;
    const p1Discard = discardCard(p1Draw, p1Draw.players[0].hand[0].id).state;

    // Passes to Human 2 (Zain) with pass confirmation active
    expect(p1Discard.currentPlayerIndex).toBe(1);
    expect(p1Discard.awaitingPassConfirmation).toBe(true);
    expect(getPublicTableView(p1Discard).visibleHand).toBeNull();

    // Human 2 (Zain) confirms and completes turn
    const p2Ready = confirmPassDevice(p1Discard).state;
    const p2Draw = drawFromDeck(p2Ready, createDeterministicRng(77)).state;
    const p2Discard = discardCard(p2Draw, p2Draw.players[1].hand[0].id).state;

    // Advances to Bot 1 WITHOUT awaitingPassConfirmation, and hides Bot 1's hand in public view
    expect(p2Discard.currentPlayerIndex).toBe(2);
    expect(p2Discard.awaitingPassConfirmation).toBe(false);
    expect(getPublicTableView(p2Discard).visibleHand).toBeNull();

    // Bot 1 plays full turn and passes back to Human 1 (Amina) with pass screen + botTurnFeed
    const afterBot = executeFullBotTurn(p2Discard, createDeterministicRng(77));
    expect(afterBot.currentPlayerIndex).toBe(0);
    expect(afterBot.awaitingPassConfirmation).toBe(true);
    expect(afterBot.botTurnFeed.length).toBeGreaterThanOrEqual(2);

    const viewForAminaPass = getPublicTableView(afterBot);
    expect(viewForAminaPass.visibleHand).toBeNull();
    expect(viewForAminaPass.botTurnFeed.length).toBeGreaterThanOrEqual(2);
  });
});



