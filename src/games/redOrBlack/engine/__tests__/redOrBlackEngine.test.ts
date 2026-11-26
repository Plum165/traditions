import { describe, expect, it } from 'vitest';
import { validateMultiplayerSeats } from '../../../../types/multiplayer';
import type { StandardCard } from '../../../../types/playingCard';
import {
  advanceAfterReveal,
  chooseBotPrediction,
  confirmPassDevice,
  createDeck,
  createRedOrBlackGame,
  DEFAULT_RED_OR_BLACK_RULES,
  evaluatePrediction,
  executeBotTurnStep,
  getPublicRedOrBlackView,
  rotateCardCollectionTurn,
  rotateFourQuestionsTurn,
  submitPrediction,
} from '../index';
import type { RedOrBlackSetupConfig } from '../types';

const std = (rank: StandardCard['rank'], suit: StandardCard['suit']): StandardCard => ({
  id: `${suit}-${rank}`,
  kind: 'standard',
  rank,
  suit,
});

function createDeterministicRng(seed = 42): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function makeSetup(
  overrides: Partial<RedOrBlackSetupConfig> = {}
): RedOrBlackSetupConfig {
  return {
    variant: 'four-questions',
    mode: 'vs-bots',
    direction: 'clockwise',
    seats: [
      { id: 'seat-1', type: 'human', name: 'You', difficulty: 'normal' },
      { id: 'seat-2', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
    ],
    rules: { ...DEFAULT_RED_OR_BLACK_RULES },
    ...overrides,
  };
}

describe('Red or Black – Deck & Multiplayer Setup Validation', () => {
  it('generates a standard 52-card deck with unique IDs and zero Jokers', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    expect(deck.every((c) => c.kind === 'standard')).toBe(true);
  });

  it('validates 2–4 players, at least one human, unique IDs, and non-empty unique names', () => {
    expect(
      validateMultiplayerSeats([
        { id: 'a', type: 'bot', name: 'Bot 1', difficulty: 'easy' },
        { id: 'b', type: 'bot', name: 'Bot 2', difficulty: 'hard' },
      ]).valid
    ).toBe(false);

    expect(
      validateMultiplayerSeats([
        { id: 'a', type: 'human', name: '   ', difficulty: 'normal' },
        { id: 'b', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
      ]).valid
    ).toBe(false);

    expect(
      validateMultiplayerSeats([
        { id: 'a', type: 'human', name: 'Ali', difficulty: 'normal' },
        { id: 'a', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
      ]).valid
    ).toBe(false);

    expect(DEFAULT_RED_OR_BLACK_RULES.aceRanking).toBe('ace-low');

    expect(
      validateMultiplayerSeats([
        { id: 'seat-1', type: 'human', name: 'Ali', difficulty: 'normal' },
        { id: 'seat-2', type: 'bot', name: 'Bot 1', difficulty: 'easy' },
        { id: 'seat-3', type: 'human', name: 'Bo', difficulty: 'normal' },
        { id: 'seat-4', type: 'bot', name: 'Bot 2', difficulty: 'hard' },
      ]).valid
    ).toBe(true);
  });
});

describe('Red or Black – Shared Question Validation Engine', () => {
  it('validates Q1 Red/Black, Q2 Higher/Lower, Q3 Inside/Outside boundaries, and Q4 Suit', () => {
    expect(
      evaluatePrediction(
        { question: 1, choice: 'red' },
        std(8, 'hearts'),
        [],
        'ace-high'
      ).correct
    ).toBe(true);

    expect(
      evaluatePrediction(
        { question: 2, choice: 'higher' },
        std(11, 'diamonds'),
        [std(5, 'spades')],
        'ace-high'
      ).correct
    ).toBe(true);

    // Equal rank misses by default
    expect(
      evaluatePrediction(
        { question: 2, choice: 'higher' },
        std(5, 'hearts'),
        [std(5, 'spades')],
        'ace-high'
      ).correct
    ).toBe(false);

    // Ace ranking switches Q2 outcome cleanly
    expect(
      evaluatePrediction(
        { question: 2, choice: 'higher' },
        std(1, 'spades'),
        [std(13, 'hearts')],
        'ace-high'
      ).correct
    ).toBe(true);
    expect(
      evaluatePrediction(
        { question: 2, choice: 'lower' },
        std(1, 'spades'),
        [std(2, 'hearts')],
        'ace-low'
      ).correct
    ).toBe(true);

    // Q3 strictly inside vs outside vs boundary
    const boundaries = [std(4, 'hearts'), std(10, 'clubs')];
    expect(
      evaluatePrediction({ question: 3, choice: 'inside' }, std(7, 'diamonds'), boundaries, 'ace-high')
        .correct
    ).toBe(true);
    expect(
      evaluatePrediction({ question: 3, choice: 'outside' }, std(2, 'spades'), boundaries, 'ace-high')
        .correct
    ).toBe(true);
    expect(
      evaluatePrediction({ question: 3, choice: 'inside' }, std(4, 'spades'), boundaries, 'ace-high')
        .correct
    ).toBe(false);

    // Q4 Suit
    expect(
      evaluatePrediction(
        { question: 4, choice: 'clubs' },
        std(9, 'clubs'),
        [std(4, 'hearts'), std(10, 'clubs'), std(7, 'diamonds')],
        'ace-high'
      ).correct
    ).toBe(true);
  });
});

describe('Red or Black – Turn Management & Variants', () => {
  it('maintains distinct asker and answerer IDs and rotates cleanly for 2, 3, and 4 players', () => {
    const rot3 = rotateFourQuestionsTurn(0, 'clockwise', 3);
    expect(rot3.answererIndex).toBe(1);
    expect(rot3.askerIndex).toBe(0);

    const rot4Anticlockwise = rotateCardCollectionTurn(0, 'anticlockwise', 4);
    expect(rot4Anticlockwise.askerIndex).toBe(3);
    expect(rot4Anticlockwise.answererIndex).toBe(2);
  });

  it('completes Four Questions Challenge on 4 consecutive correct answers and locks post-game mutations', () => {
    const base = createRedOrBlackGame(makeSetup(), createDeterministicRng(7));
    const rigged = {
      ...base,
      drawPile: [
        std(5, 'hearts'), // Q1: Red
        std(10, 'spades'), // Q2: Higher than 5
        std(7, 'diamonds'), // Q3: Inside 5 and 10
        std(12, 'clubs'), // Q4: Clubs
      ],
    };

    const s1 = submitPrediction(rigged, 'seat-1', { question: 1, choice: 'red' }).state;
    expect(s1.currentQuestion).toBe(2);
    const s2 = submitPrediction(s1, 'seat-1', { question: 2, choice: 'higher' }).state;
    expect(s2.currentQuestion).toBe(3);
    const s3 = submitPrediction(s2, 'seat-1', { question: 3, choice: 'inside' }).state;
    expect(s3.currentQuestion).toBe(4);
    const s4 = submitPrediction(s3, 'seat-1', { question: 4, choice: 'clubs' }).state;

    expect(s4.status).toBe('GAME_OVER');
    expect(s4.winnerIds).toEqual(['seat-1']);
    expect(s4.standings[0].isWinner).toBe(true);

    // Post-game actions rejected
    const blocked = submitPrediction(s4, 'seat-1', { question: 1, choice: 'red' });
    expect(blocked.ok).toBe(false);
  });

  it('handles Card Collection House Rule: answerer keeps correct cards at Q1, asker gets missed card and passes deck until exhausted', () => {
    const base = createRedOrBlackGame(
      makeSetup({
        variant: 'card-collection',
        mode: 'mixed',
        seats: [
          { id: 'p1', type: 'human', name: 'Player 1', difficulty: 'normal' },
          { id: 'p2', type: 'bot', name: 'Bot 1', difficulty: 'normal' },
          { id: 'p3', type: 'human', name: 'Player 2', difficulty: 'normal' },
        ],
      }),
      createDeterministicRng(11)
    );

    // Initially: p3 asks, p1 answers
    expect(base.players[base.askerIndex].id).toBe('p3');
    expect(base.players[base.answererIndex].id).toBe('p1');

    const testState = {
      ...base,
      drawPile: [
        std(8, 'hearts'), // p1 guesses Red -> Correct (p1 gets card, stays Q1)
        std(2, 'spades'), // p1 guesses Red -> Wrong (p3 gets card, deck passes p3 -> p1 asks, p2 answers)
        std(9, 'clubs'), // p2 guesses Black -> Correct (p2 gets card, deck exhausted -> GAME_OVER)
      ],
    };

    const afterHit = submitPrediction(testState, 'p1', {
      question: 1,
      choice: 'red',
    }).state;
    expect(afterHit.players[0].cardsCollected).toBe(1);
    expect(afterHit.currentQuestion).toBe(1);
    expect(afterHit.players[afterHit.answererIndex].id).toBe('p1');
    expect(afterHit.pendingRevealAdvance).toBe(false);

    const afterMiss = submitPrediction(afterHit, 'p1', {
      question: 1,
      choice: 'red',
    }).state;
    expect(afterMiss.players[2].cardsCollected).toBe(1); // asker p3 receives missed card
    expect(afterMiss.pendingRevealAdvance).toBe(true);

    const afterPass = advanceAfterReveal(afterMiss).state;
    expect(afterPass.players[afterPass.askerIndex].id).toBe('p1');
    expect(afterPass.players[afterPass.answererIndex].id).toBe('p2');
    // Bot answerer never triggers Pass and Play privacy screen
    expect(afterPass.awaitingPassConfirmation).toBe(false);

    // Bot answers last card correctly -> deck exhausted -> GAME_OVER
    const finished = submitPrediction(afterPass, 'p2', {
      question: 1,
      choice: 'black',
    }).state;
    expect(finished.status).toBe('GAME_OVER');
    expect(finished.isTie).toBe(true); // p1, p2, p3 each have 1 card
    expect(finished.winnerIds.sort()).toEqual(['p1', 'p2', 'p3']);
  });
});

describe('Red or Black – Bot Difficulty & Pass-and-Play Privacy', () => {
  it('supports Easy, Normal, and Hard bots without peeking at unrevealed drawPile cards', () => {
    const rng = createDeterministicRng(5);
    const easyGuess = chooseBotPrediction(
      {
        currentQuestion: 1,
        sequenceCards: [],
        knownRevealedCards: [],
        aceRanking: 'ace-high',
        difficulty: 'easy',
      },
      rng
    );
    expect(['red', 'black']).toContain(easyGuess.choice);

    // Normal bot picks Higher when first card is 2♠ (far more higher cards in 52-card deck)
    const normalQ2 = chooseBotPrediction(
      {
        currentQuestion: 2,
        sequenceCards: [std(2, 'spades')],
        knownRevealedCards: [std(2, 'spades')],
        aceRanking: 'ace-high',
        difficulty: 'normal',
      },
      createDeterministicRng(1)
    );
    expect(normalQ2).toEqual({ question: 2, choice: 'higher' });

    // Hard bot updates remaining-deck probabilities after revealed cards:
    // Reveal 10 Red cards -> remaining deck has 26 Black vs 16 Red -> Hard picks Black!
    const manyReds = [
      std(2, 'hearts'),
      std(3, 'hearts'),
      std(4, 'hearts'),
      std(5, 'hearts'),
      std(6, 'hearts'),
      std(7, 'hearts'),
      std(8, 'hearts'),
      std(9, 'hearts'),
      std(10, 'hearts'),
      std(11, 'hearts'),
    ];
    const hardQ1 = chooseBotPrediction(
      {
        currentQuestion: 1,
        sequenceCards: [],
        knownRevealedCards: manyReds,
        aceRanking: 'ace-high',
        difficulty: 'hard',
      },
      createDeterministicRng(1)
    );
    expect(hardQ1).toEqual({ question: 1, choice: 'black' });

    // Bot step ignores drawPile content before predicting
    const botGame = createRedOrBlackGame(
      makeSetup({
        seats: [
          { id: 'bot-1', type: 'bot', name: 'Bot 1', difficulty: 'hard' },
          { id: 'human-1', type: 'human', name: 'You', difficulty: 'normal' },
        ],
      }),
      createDeterministicRng(19)
    );
    const stepRes = executeBotTurnStep(botGame, createDeterministicRng(19));
    expect(stepRes.ok).toBe(true);
    expect(stepRes.state.lastOutcome?.answererId).toBe('bot-1');
  });

  it('displays Pass and Play handover screen between human players and hides active board until Ready', () => {
    const passGame = createRedOrBlackGame(
      makeSetup({
        mode: 'pass-and-play',
        seats: [
          { id: 'h1', type: 'human', name: 'Player 1', difficulty: 'normal' },
          { id: 'h2', type: 'human', name: 'Player 2', difficulty: 'normal' },
        ],
      }),
      createDeterministicRng(3)
    );

    const rigged = {
      ...passGame,
      drawPile: [std(4, 'spades'), std(9, 'hearts')],
    };

    // Player 1 misses Q1
    const missed = submitPrediction(rigged, 'h1', {
      question: 1,
      choice: 'red',
    }).state;
    expect(missed.pendingRevealAdvance).toBe(true);

    const passing = advanceAfterReveal(missed).state;
    expect(passing.awaitingPassConfirmation).toBe(true);
    expect(passing.phase).toBe('passing-device');

    const hiddenView = getPublicRedOrBlackView(passing);
    expect(hiddenView.hideBoardForPrivacy).toBe(true);
    expect(hiddenView.sequenceCards).toHaveLength(0);
    expect(hiddenView.lastOutcome).toBeNull();

    // Cannot answer before pressing Ready
    expect(
      submitPrediction(passing, 'h2', { question: 1, choice: 'red' }).ok
    ).toBe(false);

    const ready = confirmPassDevice(passing).state;
    expect(ready.awaitingPassConfirmation).toBe(false);
    expect(ready.phase).toBe('answering');
    expect(ready.players[ready.answererIndex].id).toBe('h2');
  });
});
