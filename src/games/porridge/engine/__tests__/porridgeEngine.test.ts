import { describe, expect, it } from 'vitest';
import { selectRandomCardForBot } from '../botStrategy';
import { createCircle, getAvailableCircleSlots } from '../circle';
import { createDeck, shuffleDeck } from '../deck';
import {
  advanceTurn,
  cancelSelection,
  chooseBotCardPosition,
  confirmBotSelection,
  confirmPassDevice,
  confirmSelection,
  createPorridgeGame,
  getPublicPorridgeView,
  runBotTurn,
  selectCard,
} from '../gameEngine';
import {
  getCardColour,
  resolveHighestColourRule,
  resolveSameSuitRule,
} from '../rules';
import { calculateWinner } from '../scoring';
import type { PorridgePlayer, PorridgeSetupConfig } from '../types';
import type { StandardCard } from '../../../../types/playingCard';

function card(rank: StandardCard['rank'], suit: StandardCard['suit']): StandardCard {
  return {
    id: `${suit}-${rank}`,
    kind: 'standard',
    rank,
    suit,
  };
}

function makeSetup(
  overrides: Partial<PorridgeSetupConfig> = {}
): PorridgeSetupConfig {
  return {
    mode: 'vs-bots',
    variation: 'same-suit',
    direction: 'clockwise',
    seats: [
      { type: 'human', name: 'You' },
      { type: 'bot', name: 'Bot 1' },
    ],
    ...overrides,
  };
}

describe('Porridge (Sekaku) Game Engine', () => {
  describe('Game Setup & 52-Card Circle', () => {
    it('creates a standard 52-card deck with unique IDs and zero Jokers', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
      const uniqueIds = new Set(deck.map((c) => c.id));
      expect(uniqueIds.size).toBe(52);
      expect(deck.every((c) => c.kind === 'standard')).toBe(true);
    });

    it('shuffles the deck without losing or duplicating cards and places all 52 face down', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck, () => 0.37);
      expect(shuffled).toHaveLength(52);
      expect(new Set(shuffled.map((c) => c.id)).size).toBe(52);

      const circle = createCircle(shuffled);
      expect(circle).toHaveLength(52);
      expect(circle.every((slot) => slot.status === 'face-down')).toBe(true);
      expect(getAvailableCircleSlots(circle)).toHaveLength(52);
    });

    it('supports custom turn order placement such as human going second after a bot', () => {
      const state = createPorridgeGame(
        makeSetup({
          seats: [
            { type: 'bot', name: 'Bot 1' },
            { type: 'human', name: 'You' },
            { type: 'bot', name: 'Bot 2' },
          ],
        })
      );

      expect(state.players.map((p) => `${p.turnOrder}:${p.name}:${p.type}`)).toEqual([
        '1:Bot 1:bot',
        '2:You:human',
        '3:Bot 2:bot',
      ]);
      expect(state.phase).toBe('bot-thinking');
      expect(state.players[state.currentPlayerIndex].name).toBe('Bot 1');
    });
  });

  describe('Human Selection & Confirmation Privacy', () => {
    it('keeps selected card hidden until confirmation, allows cancel, and removes confirmed slot permanently', () => {
      const state = createPorridgeGame(makeSetup());
      const firstPos = state.circle[0].positionId;
      const secondPos = state.circle[1].positionId;

      // Select first slot
      const select1 = selectCard(state, firstPos, 'player-1');
      expect(select1.ok).toBe(true);
      expect(select1.state.phase).toBe('confirming-selection');

      // Projected view must NOT expose any unrevealed circle card identity
      const viewBeforeConfirm = getPublicPorridgeView(select1.state);
      expect(viewBeforeConfirm.selectedPositionId).toBe(firstPos);
      expect(
        viewBeforeConfirm.publicCircle.every((slot) => !('card' in slot))
      ).toBe(true);
      expect(viewBeforeConfirm.centralPile).toHaveLength(0);

      // Cancel selection and pick another
      const cancelled = cancelSelection(select1.state);
      expect(cancelled.ok).toBe(true);
      expect(cancelled.state.phase).toBe('selecting-card');
      expect(cancelled.state.selectedPositionId).toBeNull();
      expect(cancelled.state.circle[0].status).toBe('face-down');

      const select2 = selectCard(cancelled.state, secondPos, 'player-1');
      expect(select2.ok).toBe(true);

      // Confirm reveals card once and marks slot removed
      const confirmed = confirmSelection(select2.state);
      expect(confirmed.ok).toBe(true);
      expect(confirmed.state.circle[1].status).toBe('removed');
      expect(confirmed.state.centralPile).toHaveLength(1);
      expect(confirmed.state.pendingTurnAdvance).toBe(true);

      // Cannot select a removed card again
      const afterAdvance = advanceTurn(confirmed.state).state;
      const botDone = advanceTurn(runBotTurn(afterAdvance).state).state;
      const reselectRemoved = selectCard(botDone, secondPos, 'player-1');
      expect(reselectRemoved.ok).toBe(false);
    });

    it('blocks human selection during another player or bot turn', () => {
      const state = createPorridgeGame(
        makeSetup({
          seats: [
            { type: 'bot', name: 'Bot 1' },
            { type: 'human', name: 'You' },
          ],
        })
      );

      const attempt = selectCard(state, state.circle[0].positionId, 'player-2');
      expect(attempt.ok).toBe(false);
    });
  });

  describe('Same-Suit Porridge Rules', () => {
    it('collects only when newly revealed card matches the previous top card suit', () => {
      const sevenHearts = card(7, 'hearts');
      const threeClubs = card(3, 'clubs');
      const kingClubs = card(13, 'clubs');

      expect(resolveSameSuitRule(sevenHearts, null).shouldCollect).toBe(false);
      expect(resolveSameSuitRule(threeClubs, sevenHearts).shouldCollect).toBe(false);

      const matchResult = resolveSameSuitRule(kingClubs, threeClubs);
      expect(matchResult.shouldCollect).toBe(true);
    });

    it('adds entire central pile to collecting player and leaves empty pile for next player', () => {
      let state = createPorridgeGame(
        makeSetup({
          mode: 'pass-and-play',
          variation: 'same-suit',
          seats: [
            { type: 'human', name: 'Player 1' },
            { type: 'human', name: 'Player 2' },
          ],
        })
      );

      // Force predictable circle top cards: 7♥, 3♣, K♣, 2♠
      state = {
        ...state,
        circle: [
          { ...state.circle[0], card: card(7, 'hearts') },
          { ...state.circle[1], card: card(3, 'clubs') },
          { ...state.circle[2], card: card(13, 'clubs') },
          ...state.circle.slice(3),
        ],
      };

      // Turn 1 (Player 1): 7♥ -> starts pile
      state = confirmSelection(
        selectCard(state, state.circle[0].positionId, 'player-1').state
      ).state;
      expect(state.centralPile).toHaveLength(1);
      expect(state.players[0].cardsCollected).toBe(0);

      // Handover to Player 2
      state = confirmPassDevice(advanceTurn(state).state).state;

      // Turn 2 (Player 2): 3♣ -> safe
      state = confirmSelection(
        selectCard(state, state.circle[1].positionId, 'player-2').state
      ).state;
      expect(state.centralPile).toHaveLength(2);
      expect(state.players[1].cardsCollected).toBe(0);

      // Handover back to Player 1
      state = confirmPassDevice(advanceTurn(state).state).state;

      // Turn 3 (Player 1): K♣ -> matches 3♣, collects all 3 cards
      state = confirmSelection(
        selectCard(state, state.circle[2].positionId, 'player-1').state
      ).state;
      expect(state.centralPile).toHaveLength(0);
      expect(state.players[0].cardsCollected).toBe(3);
      expect(state.collectionHistory).toHaveLength(1);
    });
  });

  describe('Highest-Colour Porridge Rules', () => {
    it('groups Red (Hearts/Diamonds) and Black (Clubs/Spades) and enforces rank comparisons with configurable Ace', () => {
      expect(getCardColour('hearts')).toBe('red');
      expect(getCardColour('diamonds')).toBe('red');
      expect(getCardColour('clubs')).toBe('black');
      expect(getCardColour('spades')).toBe('black');

      const fiveHearts = card(5, 'hearts');
      const threeDiamonds = card(3, 'diamonds');
      const eightHearts = card(8, 'hearts');
      const kingSpades = card(13, 'spades');
      const aceDiamonds = card(1, 'diamonds');

      // 3♦ is lower red -> safe
      expect(
        resolveHighestColourRule(threeDiamonds, [fiveHearts]).shouldCollect
      ).toBe(false);

      // 8♥ is higher red than opening 5♥ -> collects
      expect(
        resolveHighestColourRule(eightHearts, [fiveHearts, threeDiamonds]).shouldCollect
      ).toBe(true);

      // K♠ is black -> different colour -> safe
      expect(
        resolveHighestColourRule(kingSpades, [fiveHearts]).shouldCollect
      ).toBe(false);

      // Ace high (default) beats 5♥; Ace low does not
      expect(
        resolveHighestColourRule(aceDiamonds, [fiveHearts], {
          aceRanking: 'ace-high',
          highestColourReference: 'first-in-pile',
        }).shouldCollect
      ).toBe(true);

      expect(
        resolveHighestColourRule(aceDiamonds, [fiveHearts], {
          aceRanking: 'ace-low',
          highestColourReference: 'first-in-pile',
        }).shouldCollect
      ).toBe(false);
    });
  });

  describe('Bots & Mixed Gameplay', () => {
    it('selects randomly from remaining slots, never picks removed slots, and cannot act during human turns', () => {
      const state = createPorridgeGame(
        makeSetup({
          mode: 'mixed',
          seats: [
            { type: 'human', name: 'Player 1' },
            { type: 'bot', name: 'Bot 1' },
            { type: 'human', name: 'Player 2' },
          ],
        })
      );

      // Bot cannot act during human turn
      expect(chooseBotCardPosition(state).ok).toBe(false);

      // Complete human turn -> advance to Bot 1
      const afterHuman = confirmSelection(
        selectCard(state, state.circle[0].positionId, 'player-1').state
      ).state;
      const botTurnState = advanceTurn(afterHuman).state;
      expect(botTurnState.phase).toBe('bot-thinking');

      // Verify selectRandomCardForBot never returns removed position 0
      const botPick = selectRandomCardForBot(botTurnState, () => 0);
      expect(botPick?.positionId).not.toBe(state.circle[0].positionId);

      const botChosen = chooseBotCardPosition(botTurnState, () => 0).state;
      const botConfirmed = confirmBotSelection(botChosen).state;
      expect(botConfirmed.pendingTurnAdvance).toBe(true);

      // Advancing from Bot 1 to Human Player 2 triggers pass-device privacy screen because 2 humans exist
      const beforePlayer2 = advanceTurn(botConfirmed).state;
      expect(beforePlayer2.phase).toBe('passing-device');
      expect(beforePlayer2.awaitingPassConfirmation).toBe(true);

      const privacyView = getPublicPorridgeView(beforePlayer2);
      expect(privacyView.hideBoardForPrivacy).toBe(true);
      expect(privacyView.publicCircle).toHaveLength(0);
      expect(privacyView.centralPile).toHaveLength(0);
      expect(privacyView.lastRevealResult).toBeNull();

      const ready = confirmPassDevice(beforePlayer2).state;
      expect(ready.awaitingPassConfirmation).toBe(false);
      expect(ready.phase).toBe('selecting-card');
    });
  });

  describe('Victory Conditions, Ties & Post-Game Lock', () => {
    it('completes the full 52-card game, awards winner with fewest cards, and locks all further mutations', () => {
      let state = createPorridgeGame(
        makeSetup({
          seats: [
            { type: 'bot', name: 'Bot 1' },
            { type: 'bot', name: 'Bot 2' },
          ],
        }),
        () => 0.42
      );

      let safetyCounter = 0;
      while (state.status === 'PLAYING' && safetyCounter < 100) {
        safetyCounter += 1;
        const turnResult = runBotTurn(state, () => 0);
        expect(turnResult.ok).toBe(true);
        state = turnResult.state;
        if (state.status === 'PLAYING') {
          const adv = advanceTurn(state);
          expect(adv.ok).toBe(true);
          state = adv.state;
        }
      }

      expect(safetyCounter).toBe(52);
      expect(state.status).toBe('GAME_OVER');
      expect(state.phase).toBe('game-completed');
      expect(getAvailableCircleSlots(state.circle)).toHaveLength(0);
      expect(state.winnerIds.length).toBeGreaterThanOrEqual(1);
      expect(state.standings[0].isWinner).toBe(true);

      // Bots and humans are blocked after completion
      expect(runBotTurn(state).ok).toBe(false);
      expect(advanceTurn(state).ok).toBe(false);
    });

    it('detects ties cleanly without inventing extra tie-break rules', () => {
      const players: PorridgePlayer[] = [
        {
          id: 'p1',
          name: 'Player 1',
          type: 'human',
          turnOrder: 1,
          collectedCards: [],
          cardsCollected: 8,
        },
        {
          id: 'p2',
          name: 'Bot 1',
          type: 'bot',
          turnOrder: 2,
          collectedCards: [],
          cardsCollected: 8,
        },
        {
          id: 'p3',
          name: 'Player 2',
          type: 'human',
          turnOrder: 3,
          collectedCards: [],
          cardsCollected: 15,
        },
      ];

      const result = calculateWinner(players);
      expect(result.isTie).toBe(true);
      expect(result.winnerIds).toEqual(['p1', 'p2']);
      expect(result.lowestCount).toBe(8);
      expect(result.standings.map((s) => `${s.playerId}:${s.rank}:${s.isWinner}`)).toEqual([
        'p1:1:true',
        'p2:1:true',
        'p3:3:false',
      ]);
    });
  });
});
