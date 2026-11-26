import type { Game } from '../../types/game';

export const sevensGame: Game = {
  id: 'game-sevens',
  slug: 'sevens',
  accessionCode: 'OC-001',
  name: 'Sevens',
  category: 'Card Games',
  secondaryCategories: ['Indoor Games', 'Group Games'],
  shortSummary:
    'A classic 54-card shedding game built around matching sets, consecutive suit runs, and strategic Joker swaps.',
  description:
    'A well-loved card game played around kitchen tables and living rooms, where players draw, build matching sets or consecutive runs, trade out Jokers, and race to clear every card from their hand.',
  coverImage: {
    src: '/src/assets/images/hero_archive_cards_1795614813252.jpg',
    alt: 'A fanned vintage deck of playing cards with two Jokers resting on a sunlit wooden kitchen table next to a teacup',
    caption:
      'Illustrative photograph: A 54-card deck with two Jokers prepared for play. Not an archival family photograph.',
    isIllustrative: true,
  },
  status: 'published',
  featured: true,
  interactiveExperiences: {
    learnPath: '/games/sevens/learn',
    learnLabel: 'Learn to Play',
    playPath: '/games/sevens/play',
    playLabel: 'Play Sevens',
    rulesAnchorId: 'objective',
    rulesLabel: 'Read Full Rules',
  },
  playerCount: '2–4 players (configurable in interactive game; exact traditional limits unconfirmed)',
  equipment: [
    'Standard 52-card playing deck',
    '2 Jokers (54 cards total)',
  ],
  difficulty: 'Easy to learn',
  duration: '15–45 minutes per round',
  objective:
    'Be the first player to get rid of every card in your hand by laying down valid sets on the table and discarding cleanly.',
  setup: [
    {
      type: 'paragraph',
      text: 'Combine a standard 52-card playing deck with 2 Jokers to make a 54-card deck. Shuffle thoroughly and deal the starting hand according to the version your table is playing.',
    },
    {
      type: 'table',
      caption: 'Equipment and starting-hand versions documented so far',
      headers: ['Element', 'Documented Detail', 'Notes'],
      rows: [
        ['Deck size', '54 cards', 'Standard 52-card deck plus 2 Jokers'],
        ['7-Card Version', '7 cards per player', 'Faster rounds and tighter hands'],
        ['11-Card Version', '11 cards per player', 'Longer rounds with larger opening sets'],
      ],
    },
  ],
  sections: [
    {
      id: 'how-to-play',
      title: 'Turn Structure',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Play moves around the table one player at a time. Each turn follows three steps in order:',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Step 1: Draw',
              text: 'Draw exactly one card at the beginning of your turn—choosing either the top face-down card from the draw pile or the top face-up card from the discard pile.',
            },
            {
              title: 'Step 2: Play',
              text: 'Optionally lay down a new valid set (at least three cards), add cards to existing sets on the table, extend consecutive runs, complete matching sets, or replace a Joker.',
            },
            {
              title: 'Step 3: Discard',
              text: 'Discard one card at the end of your turn. Play then passes to the next player.',
            },
          ],
        },
      ],
    },
    {
      id: 'valid-sets',
      title: 'Types of Valid Sets',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Every new set placed onto the table must contain at least three cards. There are two main types of valid sets. Once placed on the table, players can add cards to existing sets as long as the resulting combination remains valid.',
        },
        {
          type: 'card-example',
          title: 'Matching Sets (Three or More of the Same Rank)',
          description:
            'Three or more cards sharing the same rank across different suits. For example: 8♦, 8♥, 8♠ or 3♦, 3♥, 3♣.',
          cards: [
            { rank: '8', suit: 'diamonds', label: '8♦' },
            { rank: '8', suit: 'hearts', label: '8♥' },
            { rank: '8', suit: 'spades', label: '8♠' },
          ],
          caption: 'Fig. 1 — Matching set of Eights using different suits.',
        },
        {
          type: 'card-example',
          title: 'Matching Set Example with Threes',
          description: 'Another valid matching set using three different suits of rank 3.',
          cards: [
            { rank: '3', suit: 'diamonds', label: '3♦' },
            { rank: '3', suit: 'hearts', label: '3♥' },
            { rank: '3', suit: 'clubs', label: '3♣' },
          ],
          caption: 'Fig. 2 — Matching set: 3♦, 3♥, 3♣.',
        },
        {
          type: 'card-example',
          title: 'Consecutive Runs (Same Suit in Sequence)',
          description:
            'Three or more consecutive cards belonging to the same suit. Players may extend either end of an existing run on the table if the sequence stays valid.',
          cards: [
            { rank: '3', suit: 'diamonds', label: '♦3' },
            { rank: '4', suit: 'diamonds', label: '♦4' },
            { rank: '5', suit: 'diamonds', label: '♦5' },
          ],
          caption: 'Fig. 3 — Consecutive Diamond run: ♦3, ♦4, ♦5.',
        },
        {
          type: 'card-example',
          title: 'Extended Consecutive Run Example',
          description:
            'A four-card Heart sequence showing how runs can grow beyond three cards.',
          cards: [
            { rank: '7', suit: 'hearts', label: '♥7' },
            { rank: '8', suit: 'hearts', label: '♥8' },
            { rank: '9', suit: 'hearts', label: '♥9' },
            { rank: '10', suit: 'hearts', label: '♥10' },
          ],
          caption: 'Fig. 4 — Consecutive Heart run: ♥7, ♥8, ♥9, ♥10.',
        },
      ],
    },
    {
      id: 'joker-rules',
      title: 'Jokers & Joker Replacement',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'The deck includes two Jokers. A Joker can act as a substitute for any missing card needed to complete a valid matching set or consecutive run.',
        },
        {
          type: 'card-example',
          title: 'Using a Joker as a Substitute',
          description:
            'Here the Joker completes a four-card matching set of Eights by standing in for 8♣.',
          cards: [
            { rank: '8', suit: 'diamonds', label: '8♦' },
            { rank: '8', suit: 'hearts', label: '8♥' },
            { rank: '8', suit: 'spades', label: '8♠' },
            { rank: 'JOKER', suit: 'joker', label: 'Joker (acting as 8♣)', highlight: true },
          ],
          caption: 'Fig. 5 — Matching set completed with a Joker substitute.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Provide the corresponding actual card',
              text: 'If you hold the specific card that a Joker on the table represents (for example, 8♣ in the set above), you may claim that Joker on your turn.',
            },
            {
              title: 'Place it into the existing set',
              text: 'Put the real card directly into the table set in the Joker’s position.',
            },
            {
              title: 'Retrieve the Joker',
              text: 'Take the Joker from the table into your hand.',
            },
            {
              title: 'Use the retrieved Joker according to table rules',
              text: 'The remaining set on the table must stay valid after the replacement.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Replacement Validity Check',
          text: 'Whenever a Joker is replaced, double-check that the set left on the table is still a valid matching set or consecutive run of at least three cards.',
        },
      ],
    },
    {
      id: 'how-to-win',
      title: 'How to Win',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'The first player to get rid of all cards in their hand wins the round. Because households differ on whether the final card can be played into a set or must be discarded, confirm that detail before dealing.',
        },
      ],
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      verification: 'documented-version',
      blocks: [
        {
          type: 'faq',
          items: [
            {
              question: 'Are the 7-card and 11-card versions different games?',
              answer:
                'No. Both are starting-hand variations of Sevens using the same 54-card deck (52 standard cards plus 2 Jokers) and the same core set-building mechanics.',
            },
            {
              question: 'What is the minimum size for a new set on the table?',
              answer:
                'A newly placed matching set or consecutive run must contain at least three cards.',
            },
            {
              question: 'Why are some edge-case rules listed as needing confirmation?',
              answer:
                'Different families and neighbourhoods play Sevens with slightly different house rules. Rather than guessing or inventing universal rules, this archive records unresolved edge cases openly until contributors confirm how their tables played them.',
            },
          ],
        },
      ],
    },
  ],
  variations: [
    {
      id: 'seven-card-hand',
      name: '7-Card Starting Hand',
      summary: 'Each player is dealt 7 cards at the start of the round.',
      verification: 'documented-version',
      details: [
        'Uses the full 54-card deck (52 cards + 2 Jokers).',
        'Typically produces brisk rounds where players look for early three-card sets.',
      ],
    },
    {
      id: 'eleven-card-hand',
      name: '11-Card Starting Hand',
      summary: 'Each player is dealt 11 cards at the start of the round.',
      verification: 'documented-version',
      details: [
        'Uses the same 54-card deck and set-building rules.',
        'Creates larger opening hands with more room for multi-card runs and Joker swaps.',
      ],
    },
  ],
  unconfirmedQuestions: [
    'Can players discard Jokers?',
    'Can a retrieved Joker be reused immediately?',
    'Can players pick up cards from anywhere in the discard pile or only the top card?',
    'Can the final card be played into a set, or must it be discarded?',
    'What are the exact player-count limits?',
    'Are there restrictions on extending sets containing Jokers?',
  ],
  culturalNotes: [
    {
      title: 'Household Rules & Friendly Arguments',
      text: 'Like many card games passed down around family tables, Sevens rarely lived inside a printed rulebook. Before the first card is dealt, families often compare how they learnt the game—especially how many cards to deal, what happens to the discard pile, and how Jokers can be played.',
      verification: 'community-recollection',
    },
    {
      title: 'Documented Scope',
      text: 'The rules recorded here reflect the initial version supplied for the archive. Additional regional names, scoring traditions, and verified house rules will be added alongside this baseline as community members contribute.',
      verification: 'documented-version',
    },
  ],
  relatedGames: ['porridge', 'red-or-black'],
  lastUpdated: '2026-11-25',
  seo: {
    title: 'Sevens Card Game Rules & Variations – Our Childhood Archive',
    description:
      'Learn how to play Sevens (7-card and 11-card versions) with matching sets, consecutive runs, and Joker replacement rules documented in the Our Childhood archive.',
  },
};
