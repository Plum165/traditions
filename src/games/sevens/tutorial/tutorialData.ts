import type { JokerCard, PlayingCard, StandardCard } from '../engine/types';

export interface TutorialQuestion {
  prompt: string;
  options: { id: string; label: string; isCorrect: boolean; explanation: string }[];
}

export interface TutorialLesson {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  exampleTitle?: string;
  exampleCards?: PlayingCard[];
  exampleCaption?: string;
  question?: TutorialQuestion;
  includePracticeLab?: boolean;
}

const c = (rank: StandardCard['rank'], suit: StandardCard['suit']): StandardCard => ({
  id: `tut-${suit}-${rank}`,
  kind: 'standard',
  rank,
  suit,
});

const j = (index: 1 | 2): JokerCard => ({
  id: `tut-joker-${index}`,
  kind: 'joker',
  jokerIndex: index,
});

export const PRACTICE_HAND_CARDS: PlayingCard[] = [
  c(8, 'diamonds'),
  c(8, 'hearts'),
  c(8, 'spades'),
  c(3, 'diamonds'),
  c(4, 'diamonds'),
  c(5, 'diamonds'),
  c(6, 'clubs'),
  j(1),
];

export const TUTORIAL_LESSONS: TutorialLesson[] = [
  {
    id: 'objective',
    number: '01',
    title: 'Introduction & Objective',
    summary: 'Learn what Sevens is all about and how a round is won.',
    paragraphs: [
      'Sevens is a classic family and neighbourhood card game built around reading your hand, spotting combinations, and managing timing.',
      'The objective is simple: be the first player to get rid of every card in your hand by laying down valid sets on the table and discarding cleanly.',
    ],
    question: {
      prompt: 'How do you win a round of Sevens?',
      options: [
        {
          id: 'win-high',
          label: 'Collect the highest total card value in your hand',
          isCorrect: false,
          explanation: 'Not quite—holding cards works against you. You want an empty hand.',
        },
        {
          id: 'win-empty',
          label: 'Be the first player to get rid of every card in your hand',
          isCorrect: true,
          explanation:
            'Correct! Sevens is a shedding game—the first player to clear all cards from their hand wins.',
        },
        {
          id: 'win-jokers',
          label: 'Capture both Jokers in your hand',
          isCorrect: false,
          explanation:
            'Jokers help you build sets, but holding them at the end does not win by itself.',
        },
      ],
    },
  },
  {
    id: 'equipment-setup',
    number: '02',
    title: 'Equipment & Setup',
    summary: 'The 54-card deck and the 7-card vs. 11-card starting hand variations.',
    paragraphs: [
      'Sevens uses one standard 52-card playing deck together with 2 Jokers, making 54 cards in total.',
      'Households commonly play one of two starting-hand variations: the 7-card version (dealing 7 cards each for faster rounds) or the 11-card version (dealing 11 cards each for longer, deeper opening hands). Remaining cards form the draw pile.',
    ],
    exampleTitle: '54-Card Deck Includes 2 Jokers',
    exampleCards: [c(7, 'hearts'), c(7, 'diamonds'), j(1), j(2)],
    exampleCaption: 'Both Jokers stay in the deck alongside the 52 standard cards.',
    question: {
      prompt: 'How many cards are in a complete Sevens deck?',
      options: [
        {
          id: '52',
          label: '52 cards (Jokers removed)',
          isCorrect: false,
          explanation: 'Sevens keeps both Jokers in the deck.',
        },
        {
          id: '54',
          label: '54 cards (52 standard cards + 2 Jokers)',
          isCorrect: true,
          explanation:
            'Correct! All 52 standard cards plus both Jokers are shuffled and dealt.',
        },
      ],
    },
  },
  {
    id: 'matching-sets',
    number: '03',
    title: 'Matching Sets',
    summary: 'Group three or more cards of the same rank using different suits.',
    paragraphs: [
      'A Matching Set consists of three or more cards of the same rank across different suits—for example, 8♦, 8♥, 8♠ or 3♦, 3♥, 3♣.',
      'Once a matching set is placed on the table, any player can add the fourth matching suit later on their turn.',
    ],
    exampleTitle: 'Example Matching Set: 8♦, 8♥, 8♠',
    exampleCards: [c(8, 'diamonds'), c(8, 'hearts'), c(8, 'spades')],
    exampleCaption: 'Same rank (8), three different suits (Diamonds, Hearts, Spades).',
    question: {
      prompt: 'Which combination is a valid Matching Set?',
      options: [
        {
          id: 'match-valid',
          label: '3♦, 3♥, 3♣',
          isCorrect: true,
          explanation: 'Correct! All three cards share rank 3 and have different suits.',
        },
        {
          id: 'match-two',
          label: '8♦, 8♥ (only two cards)',
          isCorrect: false,
          explanation: 'A new set must contain at least three cards.',
        },
        {
          id: 'match-mixed',
          label: '3♦, 4♦, 5♥',
          isCorrect: false,
          explanation: 'Those ranks do not match, and the suits are mixed so it is not a run either.',
        },
      ],
    },
  },
  {
    id: 'consecutive-runs',
    number: '04',
    title: 'Consecutive Runs',
    summary: 'Build three or more consecutive cards of the exact same suit.',
    paragraphs: [
      'A Consecutive Run is three or more cards in direct numerical sequence within the same suit—for example, ♦3, ♦4, ♦5 or ♥7, ♥8, ♥9, ♥10.',
      'Once on the table, players can extend either end of the run (for example, adding ♥6 or ♥J to ♥7, ♥8, ♥9, ♥10) as long as the sequence stays valid.',
    ],
    exampleTitle: 'Example Consecutive Run: ♥7, ♥8, ♥9, ♥10',
    exampleCards: [c(7, 'hearts'), c(8, 'hearts'), c(9, 'hearts'), c(10, 'hearts')],
    exampleCaption: 'Four consecutive ranks (7–10), all belonging to Hearts.',
    question: {
      prompt: 'Why is ♦3, ♥4, ♦5 NOT a valid Consecutive Run?',
      options: [
        {
          id: 'run-suit',
          label: 'Because ♥4 is a different suit from Diamonds',
          isCorrect: true,
          explanation:
            'Correct! Every standard card in a consecutive run must belong to the same suit.',
        },
        {
          id: 'run-count',
          label: 'Because runs need at least four cards',
          isCorrect: false,
          explanation: 'Runs only require three or more consecutive cards of the same suit.',
        },
      ],
    },
  },
  {
    id: 'joker-rules',
    number: '05',
    title: 'Joker Rules & Replacement',
    summary: 'Use Jokers as substitutes—and reclaim them with the real card.',
    paragraphs: [
      'A Joker can stand in for any missing card needed to complete a valid matching set or consecutive run—for example, 8♦, 8♥, 8♠, Joker (where the Joker stands in for 8♣).',
      'If you hold the actual card represented by a Joker already on the table, you can replace it on your turn: place your real card into the set, retrieve the Joker into your hand, and keep the remaining table set valid.',
    ],
    exampleTitle: 'Joker Substitution: 8♦, 8♥, 8♠, Joker',
    exampleCards: [c(8, 'diamonds'), c(8, 'hearts'), c(8, 'spades'), j(1)],
    exampleCaption:
      'A player holding 8♣ can place 8♣ into this set and take Joker 1 into their hand.',
    question: {
      prompt: 'Which card from your hand can legally replace the Joker in ♦3, Joker, ♦5?',
      options: [
        {
          id: 'joker-4d',
          label: '♦4 (4 of Diamonds)',
          isCorrect: true,
          explanation:
            'Correct! Placing ♦4 leaves ♦3, ♦4, ♦5 on the table, keeping the run valid.',
        },
        {
          id: 'joker-6d',
          label: '♦6 (6 of Diamonds)',
          isCorrect: false,
          explanation:
            'Removing the Joker and inserting ♦6 leaves ♦3, ♦5, ♦6—which has a gap at ♦4 and is invalid.',
        },
      ],
    },
  },
  {
    id: 'turn-structure',
    number: '06',
    title: 'Drawing, Playing & Discarding',
    summary: 'Follow the three-step turn rhythm and the one-new-set-per-turn rule.',
    paragraphs: [
      'Every turn follows three steps: (1) Draw one card—either the top face-down card from the Draw Pile or the top face-up card from the Discard Pile (never deeper in the discard pile, and never both piles), (2) Play valid sets or extensions if you wish, and (3) Discard one card to end your turn.',
      'Important rule: during your Play step, you may create at most ONE new set per turn (3+ cards). However, you can still add cards to existing table sets or replace Jokers during the same turn.',
    ],
    question: {
      prompt: 'How many brand-new sets can you lay down in a single turn?',
      options: [
        {
          id: 'one-set',
          label: 'At most one new set per turn (plus adding to existing sets)',
          isCorrect: true,
          explanation:
            'Correct! You can create up to one new set per turn, while still extending existing table sets.',
        },
        {
          id: 'unlimited-sets',
          label: 'As many new sets as you can hold',
          isCorrect: false,
          explanation:
            'Sevens limits players to a maximum of one newly created set per turn.',
        },
      ],
    },
  },
  {
    id: 'practice-lab',
    number: '07',
    title: 'Winning & Interactive Set Practice',
    summary: 'Test combinations live against the Sevens rules engine before playing.',
    paragraphs: [
      'The first player to empty their hand wins! Note that households differ on edge cases like whether the final card can be played into a set or must be discarded—you can configure those house rules before starting a game.',
      'Use the interactive practice hand below to select cards and test which combinations form valid Matching Sets, valid Consecutive Runs, or invalid sets.',
    ],
    includePracticeLab: true,
  },
];
